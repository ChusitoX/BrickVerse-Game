/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

interface PlayerState {
  id: string;
  nickname: string;
  avatarConfig: Record<string, unknown>;
  position: [number, number, number];
  rotationY: number;
  velocity: [number, number, number];
  equippedItem: string;
  emote: string;
  isRagdolling: boolean;
  isGhost: boolean;
  propDisguise: string;
  health: number;
  score: number;
  team: 'red' | 'blue' | 'none';
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

interface SharedScores {
  ctfRed: number;
  ctfBlue: number;
  zombieWave: number;
  zombiesKilled: number;
}

interface WorldDataLike {
  id: string;
  name: string;
  gameMode?: string;
  spawnPoint?: [number, number, number];
  [key: string]: unknown;
}

interface RoomRecord {
  code: string;
  worldData: WorldDataLike;
  players: Map<string, PlayerState>;
  sockets: Map<string, WebSocket>;
  scores: SharedScores;
  chatMessages: ChatMessage[];
  createdAt: number;
}

const rooms = new Map<string, RoomRecord>();

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    if (!rooms.has(code)) return code;
  }
  return `BRK${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36).slice(-4)}`;
}

function broadcastToRoom(room: RoomRecord, payload: unknown, excludePlayerId?: string) {
  const encoded = JSON.stringify(payload);
  room.sockets.forEach((clientWs, pid) => {
    if (excludePlayerId && pid === excludePlayerId) return;
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(encoded);
    }
  });
}

function appendSystemChat(room: RoomRecord, text: string): ChatMessage {
  const msg: ChatMessage = {
    id: generateId('sys'),
    senderId: 'system',
    senderName: 'System',
    text,
    timestamp: Date.now(),
    isSystem: true,
  };
  room.chatMessages.push(msg);
  if (room.chatMessages.length > 50) {
    room.chatMessages.shift();
  }
  return msg;
}

function assignTeam(room: RoomRecord): 'red' | 'blue' | 'none' {
  if (room.worldData.gameMode !== 'paintball_ctf') return 'none';
  let redCount = 0;
  let blueCount = 0;
  room.players.forEach((p) => {
    if (p.team === 'red') redCount++;
    else if (p.team === 'blue') blueCount++;
  });
  return blueCount <= redCount ? 'blue' : 'red';
}

function removePlayerFromRoom(roomCode: string, playerId: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const leaving = room.players.get(playerId);
  room.players.delete(playerId);
  room.sockets.delete(playerId);

  if (leaving) {
    const sysMsg = appendSystemChat(room, `${leaving.nickname} left the room.`);
    broadcastToRoom(room, { type: 'player:left', playerId });
    broadcastToRoom(room, { type: 'chat:message', message: sysMsg });
  }

  if (room.players.size === 0) {
    rooms.delete(roomCode);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, activeRooms: rooms.size });
  });

  app.get('/api/rooms/:code', (req, res) => {
    const code = String(req.params.code || '').trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      res.status(404).json({ exists: false });
      return;
    }
    res.json({
      exists: true,
      code: room.code,
      worldName: room.worldData.name,
      gameMode: room.worldData.gameMode || 'sandbox',
      playerCount: room.players.size,
    });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const urlPath = request.url ? request.url.split('?')[0] : '';
    if (urlPath === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomCode: string | null = null;
    let currentPlayerId: string | null = null;
    let isAlive = true;

    ws.on('pong', () => {
      isAlive = true;
    });

    const pingTimer = setInterval(() => {
      if (!isAlive) {
        ws.terminate();
        return;
      }
      isAlive = false;
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 25000);

    ws.on('message', (raw) => {
      let data: Record<string, any>;
      try {
        data = JSON.parse(String(raw));
      } catch {
        return;
      }

      const type = String(data.type || '');

      if (type === 'room:create') {
        if (currentRoomCode && currentPlayerId) {
          removePlayerFromRoom(currentRoomCode, currentPlayerId);
        }

        const worldData = data.worldData as WorldDataLike | undefined;
        if (!worldData || !worldData.id) {
          ws.send(JSON.stringify({ type: 'room:error', message: 'Invalid world blueprint.' }));
          return;
        }

        const code = generateRoomCode();
        const playerId = generateId('plr');
        const nickname = String(data.nickname || 'Player').trim().slice(0, 18) || 'Player';
        const spawn = Array.isArray(worldData.spawnPoint) ? worldData.spawnPoint : [0, 3, 0];

        const room: RoomRecord = {
          code,
          worldData,
          players: new Map(),
          sockets: new Map(),
          scores: {
            ctfRed: 0,
            ctfBlue: 0,
            zombieWave: 1,
            zombiesKilled: 0,
          },
          chatMessages: [],
          createdAt: Date.now(),
        };

        const team = assignTeam(room);
        const playerState: PlayerState = {
          id: playerId,
          nickname,
          avatarConfig: (data.avatarConfig as Record<string, unknown>) || {},
          position: [Number(spawn[0]) || 0, Number(spawn[1]) || 3, Number(spawn[2]) || 0],
          rotationY: 0,
          velocity: [0, 0, 0],
          equippedItem: worldData.gameMode === 'sword' ? 'sword' : 'none',
          emote: 'none',
          isRagdolling: worldData.gameMode === 'ragdoll',
          isGhost: false,
          propDisguise: 'none',
          health: 100,
          score: 0,
          team,
        };

        room.players.set(playerId, playerState);
        room.sockets.set(playerId, ws);
        appendSystemChat(room, `${nickname} created room ${code}. Share the code to invite friends!`);
        rooms.set(code, room);

        currentRoomCode = code;
        currentPlayerId = playerId;

        ws.send(
          JSON.stringify({
            type: 'room:joined',
            roomCode: code,
            playerId,
            worldData: room.worldData,
            players: Array.from(room.players.values()),
            scores: room.scores,
            chatMessages: room.chatMessages,
          })
        );
        return;
      }

      if (type === 'room:join') {
        const code = String(data.roomCode || '').trim().toUpperCase();
        const room = rooms.get(code);

        if (!room) {
          ws.send(
            JSON.stringify({
              type: 'room:error',
              message: `Room "${code}" was not found. Double-check the invite code or ask your friend to host.`,
            })
          );
          return;
        }

        if (room.players.size >= 16) {
          ws.send(
            JSON.stringify({
              type: 'room:error',
              message: `Room "${code}" is currently full (16/16 players).`,
            })
          );
          return;
        }

        if (currentRoomCode && currentPlayerId) {
          removePlayerFromRoom(currentRoomCode, currentPlayerId);
        }

        const playerId =
          typeof data.reconnectPlayerId === 'string' && data.reconnectPlayerId.startsWith('plr_')
            ? data.reconnectPlayerId
            : generateId('plr');
        const nickname = String(data.nickname || 'Player').trim().slice(0, 18) || 'Player';
        const spawn = Array.isArray(room.worldData.spawnPoint) ? room.worldData.spawnPoint : [0, 3, 0];
        const existing = room.players.get(playerId);

        const playerState: PlayerState = existing
          ? {
              ...existing,
              nickname,
              avatarConfig: (data.avatarConfig as Record<string, unknown>) || existing.avatarConfig,
            }
          : {
              id: playerId,
              nickname,
              avatarConfig: (data.avatarConfig as Record<string, unknown>) || {},
              position: [Number(spawn[0]) || 0, Number(spawn[1]) || 3, Number(spawn[2]) || 0],
              rotationY: 0,
              velocity: [0, 0, 0],
              equippedItem: room.worldData.gameMode === 'sword' ? 'sword' : 'none',
              emote: 'none',
              isRagdolling: room.worldData.gameMode === 'ragdoll',
              isGhost: false,
              propDisguise: 'none',
              health: 100,
              score: 0,
              team: assignTeam(room),
            };

        room.players.set(playerId, playerState);
        room.sockets.set(playerId, ws);

        currentRoomCode = code;
        currentPlayerId = playerId;

        const sysMsg = appendSystemChat(room, `${nickname} joined the room!`);

        ws.send(
          JSON.stringify({
            type: 'room:joined',
            roomCode: code,
            playerId,
            worldData: room.worldData,
            players: Array.from(room.players.values()),
            scores: room.scores,
            chatMessages: room.chatMessages,
          })
        );

        broadcastToRoom(room, { type: 'player:joined', player: playerState }, playerId);
        broadcastToRoom(room, { type: 'chat:message', message: sysMsg }, playerId);
        return;
      }

      if (!currentRoomCode || !currentPlayerId) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;
      const sender = room.players.get(currentPlayerId);
      if (!sender) return;

      if (type === 'player:state') {
        if (Array.isArray(data.position) && data.position.length === 3) {
          sender.position = [Number(data.position[0]) || 0, Number(data.position[1]) || 0, Number(data.position[2]) || 0];
        }
        if (typeof data.rotationY === 'number') sender.rotationY = data.rotationY;
        if (Array.isArray(data.velocity) && data.velocity.length === 3) {
          sender.velocity = [Number(data.velocity[0]) || 0, Number(data.velocity[1]) || 0, Number(data.velocity[2]) || 0];
        }
        if (typeof data.equippedItem === 'string') sender.equippedItem = data.equippedItem;
        if (typeof data.emote === 'string') sender.emote = data.emote;
        if (typeof data.isRagdolling === 'boolean') sender.isRagdolling = data.isRagdolling;
        if (typeof data.isGhost === 'boolean') sender.isGhost = data.isGhost;
        if (typeof data.propDisguise === 'string') sender.propDisguise = data.propDisguise;
        if (typeof data.health === 'number') sender.health = Math.max(0, Math.min(100, data.health));

        broadcastToRoom(
          room,
          {
            type: 'player:state',
            player: sender,
          },
          currentPlayerId
        );
        return;
      }

      if (type === 'combat:attack') {
        broadcastToRoom(
          room,
          {
            type: 'combat:attack',
            playerId: currentPlayerId,
            item: String(data.item || 'none'),
            origin: Array.isArray(data.origin) ? data.origin : sender.position,
            dir: Array.isArray(data.dir) ? data.dir : [0, 0, 1],
          },
          currentPlayerId
        );
        return;
      }

      if (type === 'combat:hit') {
        const targetId = String(data.targetId || '');
        const target = room.players.get(targetId);
        if (!target || targetId === currentPlayerId) return;

        const dmg = Math.max(1, Math.min(100, Number(data.damage) || 20));
        target.health = Math.max(0, target.health - dmg);

        broadcastToRoom(room, {
          type: 'combat:hit',
          attackerId: currentPlayerId,
          attackerName: sender.nickname,
          targetId,
          damage: dmg,
          knockback: Array.isArray(data.knockback) ? data.knockback : [0, 8, 0],
          item: String(data.item || 'sword'),
        });

        if (target.health <= 0) {
          sender.score += 1;
          target.health = 100;
          const sysMsg = appendSystemChat(room, `${sender.nickname} tagged ${target.nickname}!`);
          broadcastToRoom(room, {
            type: 'scores:update',
            scores: room.scores,
            playerScores: Array.from(room.players.values()).map((p) => ({
              id: p.id,
              nickname: p.nickname,
              score: p.score,
              team: p.team,
            })),
          });
          broadcastToRoom(room, { type: 'chat:message', message: sysMsg });
        }
        return;
      }

      if (type === 'score:event') {
        const eventName = String(data.event || '');
        if (eventName === 'ctf_capture') {
          const team = data.team === 'red' ? 'red' : 'blue';
          if (team === 'red') room.scores.ctfRed += 1;
          else room.scores.ctfBlue += 1;
          sender.score += 1;
          const sysMsg = appendSystemChat(room, `${sender.nickname} captured the flag for ${team.toUpperCase()}!`);
          broadcastToRoom(room, { type: 'chat:message', message: sysMsg });
        } else if (eventName === 'zombie_kill') {
          room.scores.zombiesKilled += 1;
          sender.score += 1;
          if (room.scores.zombiesKilled % 6 === 0) {
            room.scores.zombieWave += 1;
            const sysMsg = appendSystemChat(room, `WAVE ${room.scores.zombieWave} INCOMING!`);
            broadcastToRoom(room, { type: 'chat:message', message: sysMsg });
          }
        } else if (eventName === 'point') {
          sender.score += Number(data.amount) || 1;
          if (typeof data.announcement === 'string' && data.announcement.trim()) {
            const sysMsg = appendSystemChat(room, data.announcement.trim().slice(0, 140));
            broadcastToRoom(room, { type: 'chat:message', message: sysMsg });
          }
        }

        broadcastToRoom(room, {
          type: 'scores:update',
          scores: room.scores,
          playerScores: Array.from(room.players.values()).map((p) => ({
            id: p.id,
            nickname: p.nickname,
            score: p.score,
            team: p.team,
          })),
        });
        return;
      }

      if (type === 'chat:send') {
        const text = String(data.text || '').trim().slice(0, 160);
        if (!text) return;
        const msg: ChatMessage = {
          id: generateId('msg'),
          senderId: currentPlayerId,
          senderName: sender.nickname,
          text,
          timestamp: Date.now(),
        };
        room.chatMessages.push(msg);
        if (room.chatMessages.length > 50) {
          room.chatMessages.shift();
        }
        broadcastToRoom(room, { type: 'chat:message', message: msg });
        return;
      }

      if (type === 'room:leave') {
        removePlayerFromRoom(currentRoomCode, currentPlayerId);
        currentRoomCode = null;
        currentPlayerId = null;
      }
    });

    ws.on('close', () => {
      clearInterval(pingTimer);
      if (currentRoomCode && currentPlayerId) {
        removePlayerFromRoom(currentRoomCode, currentPlayerId);
        currentRoomCode = null;
        currentPlayerId = null;
      }
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`BrickVerse server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
