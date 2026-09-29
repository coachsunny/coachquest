// ========================================================
// CoachQuest - 多人約戰連線管理器 (Multiplayer Manager)
// ========================================================

export const MultiplayerManager = {
  currentRoom: null,
  myPlayerId: null,
  pollingTimer: null,
  pollIntervalMs: 1500,

  // 1. 建立房間
  async createRoom({ mode, bossId, playerName, playerAvatar, userApiKey, userModel }) {
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, bossId, playerName, playerAvatar, userApiKey, userModel })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || '無法建立房間');
      }
      this.currentRoom = data.room;
      this.myPlayerId = data.playerId;
      return data;
    } catch (err) {
      console.error('建立約戰房間失敗:', err);
      throw err;
    }
  },

  // 2. 加入房間
  async joinRoom({ roomId, playerName, playerAvatar }) {
    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerName, playerAvatar })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || '無法加入房間');
      }
      this.currentRoom = data.room;
      this.myPlayerId = data.playerId;
      return data;
    } catch (err) {
      console.error('加入約戰房間失敗:', err);
      throw err;
    }
  },

  // 3. 房主發起開始對決
  async startMatch() {
    if (!this.currentRoom) return null;
    return this.sendAction({ actionType: 'start' });
  },

  // 4. 模式 A: 同步個人競速血條進度
  async syncSpeedrun({ defenseHp, turn, score }) {
    if (!this.currentRoom || this.currentRoom.mode !== 'pvp_speedrun') return;
    return this.sendAction({
      actionType: 'sync_speedrun',
      payload: { defenseHp, turn, score }
    });
  },

  // 5. 模式 A: 宣告搶先收攏勝利
  async claimSpeedrunWin(evaluation) {
    if (!this.currentRoom) return;
    return this.sendAction({
      actionType: 'claim_win',
      payload: { evaluation }
    });
  },

  // 6. 模式 B: 真人傳送對話訊息
  async sendHumanMessage(content) {
    if (!this.currentRoom || this.currentRoom.mode !== 'human_roleplay') return;
    return this.sendAction({
      actionType: 'send_message',
      payload: { content }
    });
  },

  // 7. 模式 C: 雙打協同戰送出教練回合
  async sendCoopTurn(content, userApiKey, userModel) {
    if (!this.currentRoom || this.currentRoom.mode !== 'coop_tagteam') return;
    return this.sendAction({
      actionType: 'send_coop_turn',
      payload: { content },
      userApiKey,
      userModel
    });
  },

  // 8. 模式 B 或 C 申請 AI 結算評審
  async evaluateRoom(userApiKey, userModel) {
    if (!this.currentRoom) return null;
    try {
      const res = await fetch('/api/room/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.currentRoom.roomId,
          userApiKey,
          userModel
        })
      });
      const data = await res.json();
      if (data.ok && data.room) {
        this.currentRoom = data.room;
        return data;
      }
    } catch (err) {
      console.error('結算房間失敗:', err);
    }
    return null;
  },

  // 9. 發送房間動作指令
  async sendAction({ actionType, payload = {}, userApiKey, userModel }) {
    if (!this.currentRoom) return null;
    try {
      const res = await fetch('/api/room/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.currentRoom.roomId,
          playerId: this.myPlayerId,
          actionType,
          payload,
          userApiKey,
          userModel
        })
      });
      const data = await res.json();
      if (data.ok && data.room) {
        this.currentRoom = data.room;
        return data.room;
      }
    } catch (err) {
      console.warn('發送動作失敗:', err);
    }
    return null;
  },

  // 10. 啟動即時輪詢狀態同步
  startPolling(onUpdate) {
    this.stopPolling();
    this.pollingTimer = setInterval(async () => {
      if (!this.currentRoom || !this.currentRoom.roomId) return;
      try {
        const url = `/api/room/status?roomId=${this.currentRoom.roomId}&playerId=${this.myPlayerId || ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.room) {
            this.currentRoom = data.room;
            if (typeof onUpdate === 'function') {
              onUpdate(data.room);
            }
          }
        }
      } catch (err) {
        // 輕微網路波動忽略
      }
    }, this.pollIntervalMs);
  },

  // 11. 停止輪詢
  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  },

  // 12. 離開並重設房間狀態
  leaveRoom() {
    this.stopPolling();
    this.currentRoom = null;
    this.myPlayerId = null;
  },

  // 輔助判斷：自己是否為房主
  isHost() {
    return this.currentRoom?.player1?.id === this.myPlayerId;
  },

  // 輔助判斷：取得對手玩家物件
  getOpponent() {
    if (!this.currentRoom) return null;
    if (this.currentRoom.player1?.id === this.myPlayerId) {
      return this.currentRoom.player2;
    }
    return this.currentRoom.player1;
  },

  // 輔助判斷：取得自己的玩家物件
  getMyPlayer() {
    if (!this.currentRoom) return null;
    if (this.currentRoom.player1?.id === this.myPlayerId) {
      return this.currentRoom.player1;
    }
    return this.currentRoom.player2;
  }
};
