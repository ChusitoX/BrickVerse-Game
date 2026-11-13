/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AvatarConfig,
  BrickWorldData,
  ChatMessage,
  OnlinePlayerState,
  RoomSessionInfo,
  SharedRoomScores,
} from '../types/game';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export type ServerEvent =
  | { type: 'room:joined'; roomCode: string; playerId: string; worldData: BrickWorldData; players: OnlinePlayerState[]; scores: SharedRoomScores; chatMessages: ChatMessage[] }
  | { type: 'room:error'; message: string }
  | { type: 'player:joined'; player: OnlinePlayerState }
  | { type: 'player:state'; player: OnlinePlayerState }
  | { type: 'player:left'; playerId: string }
  | { type: 'combat:attack'; playerId: string; item: string; origin: [number, number, number]; dir: [number, number, number] }
  | { type: 'combat:hit'; attackerId: string; attackerName: string; targetId: string; damage: number; knockback: [number, number, number]; item: string }
  | { type: 'scores:update'; scores: SharedRoomScores; playerScores: Array<{ id: string; nickname: string; score: number; team: 'red' | 'blue' | 'none' }> }
  | { type: 'chat:message'; message: ChatMessage };

type EventListener = (event: ServerEvent) => void;
type StatusListener = (status: ConnectionStatus) => void;

class MultiplayerClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<EventListener>();
  private statusListeners = new Set<StatusListener>();
  private status: ConnectionStatus = 'disconnected';
  private activeRoomCode: string | null = null;
  private activePlayerId: string | null = null;
  private lastNickname = 'Player';
  private lastAvatarConfig: AvatarConfig | null = null;
  private reconnectTimer: number | null = null;
  private manualDisconnect = false;

  private setStatus(next: ConnectionStatus) {
    this.status = next;
    this.statusListeners.forEach((cb) => cb(next));
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public onEvent(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private getWsUrl(): string {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws`;
  }

  private ensureSocket(): Promise<WebSocket> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.ws);
    }

    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      return new Promise((resolve, reject) => {
        const ws = this.ws!;
        const onOpen = () => {
          cleanup();
          resolve(ws);
        };
        const onErr = () => {
          cleanup();
          reject(new Error('Could not connect to multiplayer server.'));
        };
        const cleanup = () => {
          ws.removeEventListener('open', onOpen);
          ws.removeEventListener('error', onErr);
        };
        ws.addEventListener('open', onOpen);
        ws.addEventListener('error', onErr);
      });
    }

    this.manualDisconnect = false;
    this.setStatus('connecting');

    return new Promise((resolve, reject) => {
      let settled = false;
      const ws = new WebSocket(this.getWsUrl());
      this.ws = ws;

      const timeout = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          ws.close();
          this.setStatus('error');
          reject(new Error('Connection timed out. Multiplayer server may be offline.'));
        }
      }, 6000);

      ws.addEventListener('open', () => {
        window.clearTimeout(timeout);
        this.setStatus('connected');
        if (!settled) {
          settled = true;
          resolve(ws);
        }
      });

      ws.addEventListener('message', (evt) => {
        try {
          const parsed = JSON.parse(String(evt.data)) as ServerEvent;
          if (parsed.type === 'room:joined') {
            this.activeRoomCode = parsed.roomCode;
            this.activePlayerId = parsed.playerId;
          }
          this.listeners.forEach((cb) => cb(parsed));
        } catch {
          // ignore malformed messages
        }
      });

      ws.addEventListener('error', () => {
        window.clearTimeout(timeout);
        if (!settled) {
          settled = true;
          this.setStatus('error');
          reject(new Error('Unable to reach multiplayer server.'));
        }
      });

      ws.addEventListener('close', () => {
        window.clearTimeout(timeout);
        if (this.ws === ws) {
          this.ws = null;
        }
        if (!this.manualDisconnect && this.activeRoomCode) {
          this.setStatus('reconnecting');
          this.scheduleReconnect();
        } else {
          this.setStatus('disconnected');
        }
      });
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer !== null || this.manualDisconnect || !this.activeRoomCode) return;
    this.reconnectTimer = window.setTimeout(async () => {
      this.reconnectTimer = null;
      if (this.manualDisconnect || !this.activeRoomCode) return;
      try {
        const ws = await this.ensureSocket();
        ws.send(
          JSON.stringify({
            type: 'room:join',
            roomCode: this.activeRoomCode,
            reconnectPlayerId: this.activePlayerId,
            nickname: this.lastNickname,
            avatarConfig: this.lastAvatarConfig || {},
          })
        );
      } catch {
        if (!this.manualDisconnect && this.activeRoomCode) {
          this.scheduleReconnect();
        }
      }
    }, 2000);
  }

  public async createRoom(
    worldData: BrickWorldData,
    nickname: string,
    avatarConfig: AvatarConfig
  ): Promise<RoomSessionInfo> {
    this.lastNickname = nickname;
    this.lastAvatarConfig = avatarConfig;
    const ws = await this.ensureSocket();

    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        unsub();
        reject(new Error('Timed out waiting for room creation.'));
      }, 6000);

      const unsub = this.onEvent((evt) => {
        if (evt.type === 'room:joined') {
          window.clearTimeout(timeout);
          unsub();
          resolve({
            roomCode: evt.roomCode,
            playerId: evt.playerId,
            worldData: evt.worldData,
            players: evt.players,
            scores: evt.scores,
            chatMessages: evt.chatMessages,
          });
        } else if (evt.type === 'room:error') {
          window.clearTimeout(timeout);
          unsub();
          reject(new Error(evt.message));
        }
      });

      ws.send(
        JSON.stringify({
          type: 'room:create',
          worldData,
          nickname,
          avatarConfig,
        })
      );
    });
  }

  public async joinRoom(
    roomCode: string,
    nickname: string,
    avatarConfig: AvatarConfig
  ): Promise<RoomSessionInfo> {
    this.lastNickname = nickname;
    this.lastAvatarConfig = avatarConfig;
    const cleaned = roomCode.trim().toUpperCase();
    if (!cleaned || cleaned.length < 4) {
      throw new Error('Please enter a valid 6-character friend room code.');
    }

    const ws = await this.ensureSocket();

    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        unsub();
        reject(new Error('Timed out waiting to join room.'));
      }, 6000);

      const unsub = this.onEvent((evt) => {
        if (evt.type === 'room:joined') {
          window.clearTimeout(timeout);
          unsub();
          resolve({
            roomCode: evt.roomCode,
            playerId: evt.playerId,
            worldData: evt.worldData,
            players: evt.players,
            scores: evt.scores,
            chatMessages: evt.chatMessages,
          });
        } else if (evt.type === 'room:error') {
          window.clearTimeout(timeout);
          unsub();
          reject(new Error(evt.message));
        }
      });

      ws.send(
        JSON.stringify({
          type: 'room:join',
          roomCode: cleaned,
          nickname,
          avatarConfig,
        })
      );
    });
  }

  private send(payload: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  public sendPlayerState(state: {
    position: [number, number, number];
    rotationY: number;
    velocity: [number, number, number];
    equippedItem: string;
    emote: string;
    isRagdolling: boolean;
    isGhost: boolean;
    propDisguise: string;
    health: number;
  }) {
    this.send({ type: 'player:state', ...state });
  }

  public sendAttack(item: string, origin: [number, number, number], dir: [number, number, number]) {
    this.send({ type: 'combat:attack', item, origin, dir });
  }

  public sendHit(targetId: string, damage: number, knockback: [number, number, number], item: string) {
    this.send({ type: 'combat:hit', targetId, damage, knockback, item });
  }

  public sendScoreEvent(event: 'ctf_capture' | 'zombie_kill' | 'point', extra?: { team?: 'red' | 'blue'; amount?: number; announcement?: string }) {
    this.send({ type: 'score:event', event, ...extra });
  }

  public sendChat(text: string) {
    this.send({ type: 'chat:send', text });
  }

  public leaveRoom() {
    this.manualDisconnect = true;
    this.activeRoomCode = null;
    this.activePlayerId = null;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'room:leave' }));
      }
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }
}

export const multiplayerClient = new MultiplayerClient();
