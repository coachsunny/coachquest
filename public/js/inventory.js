// ==========================================
// CoachQuest - 百寶箱與冒險者圖鑑管理器
// ==========================================

const STORAGE_KEY = 'coachquest_player_data_v1';

// 教練頭銜與等級門檻
const LEVEL_TITLES = [
  { level: 1, minExp: 0, title: '見習溝通使', badge: '🌱' },
  { level: 2, minExp: 500, title: '初階教練學徒', badge: '🧭' },
  { level: 3, minExp: 1500, title: '深度傾聽先鋒', badge: '👂' },
  { level: 4, minExp: 3000, title: '冰山破冰導師', badge: '🧊' },
  { level: 5, minExp: 5000, title: '道館金牌總教練', badge: '🏆' },
  { level: 6, minExp: 8000, title: '傳奇心靈宗師', badge: '👑' }
];

export const InventoryManager = {
  // 載入玩家資料
  getPlayerData() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (data && typeof data === 'object') {
            return this._sanitize(data);
          }
        }
      }
    } catch (e) {
      console.warn('載入玩家存檔失敗:', e);
    }

    const defaultData = {
      nickname: '教練新手#' + Math.floor(100 + Math.random() * 900),
      avatar: '🧙‍♂️',
      totalExp: 0,
      captures: {}, // bossId -> captureRecord
      createdAt: new Date().toISOString()
    };
    this.savePlayerData(defaultData);
    return defaultData;
  },

  // 確保資料完整性與等級計算
  _sanitize(data) {
    if (!data.captures || typeof data.captures !== 'object') {
      data.captures = {};
    }
    if (!Array.isArray(data.practiceLogs)) {
      data.practiceLogs = [];
    }
    if (typeof data.totalExp !== 'number' || isNaN(data.totalExp)) {
      data.totalExp = 0;
    }
    if (!data.nickname) {
      data.nickname = '教練新手#' + Math.floor(100 + Math.random() * 900);
    }
    if (!data.avatar) {
      data.avatar = '🧙‍♂️';
    }
    return data;
  },

  // 儲存資料到 localStorage
  savePlayerData(data) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.error('儲存玩家存檔失敗:', e);
    }
  },

  // 計算目前等級與稱號
  getPlayerRank(exp) {
    let current = LEVEL_TITLES[0];
    let next = LEVEL_TITLES[1] || null;

    for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
      if (exp >= LEVEL_TITLES[i].minExp) {
        current = LEVEL_TITLES[i];
        next = LEVEL_TITLES[i + 1] || null;
        break;
      }
    }

    let progress = 100;
    if (next) {
      const range = next.minExp - current.minExp;
      const currentProgress = exp - current.minExp;
      progress = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
    }

    return {
      level: current.level,
      title: current.title,
      badge: current.badge,
      currentExp: exp,
      nextExp: next ? next.minExp : exp,
      progressPercent: progress,
      isMaxLevel: !next
    };
  },

  // 更新暱稱
  setNickname(name) {
    const data = this.getPlayerData();
    data.nickname = (name || '').trim().substring(0, 16) || '無名教練';
    this.savePlayerData(data);
    return data;
  },

  // 更新頭像
  setAvatar(avatar) {
    const data = this.getPlayerData();
    data.avatar = avatar || '🧙‍♂️';
    this.savePlayerData(data);
    return data;
  },

  // 記錄戰鬥結果並結算百寶箱收攏與完整對話練習記錄
  recordBattleResult(boss, evaluation, dialogueHistory = []) {
    const data = this.getPlayerData();
    const score = Number(evaluation.score) || 0;
    const isCaptured = score >= 70;

    // 經驗值結算：成功收攏給予高額 EXP，即便未收攏也給予安慰鼓勵獎勵
    const gainedExp = isCaptured ? score * 10 : Math.max(50, score * 3);
    data.totalExp = (data.totalExp || 0) + gainedExp;

    let isFirstCapture = false;
    const cleanDialogue = Array.isArray(dialogueHistory) ? JSON.parse(JSON.stringify(dialogueHistory)) : [];

    if (isCaptured) {
      const existing = data.captures[boss.id];
      if (!existing) {
        isFirstCapture = true;
      }

      data.captures[boss.id] = {
        bossId: boss.id,
        category: boss.category,
        name: boss.name,
        title: boss.title,
        avatar: boss.avatar,
        difficulty: boss.difficulty,
        firstCapturedAt: existing ? existing.firstCapturedAt : new Date().toISOString(),
        lastCapturedAt: new Date().toISOString(),
        highestScore: existing ? Math.max(existing.highestScore, score) : score,
        captureCount: (existing ? existing.captureCount : 0) + 1,
        bestCoachQuote: evaluation.bestCoachQuote || (existing ? existing.bestCoachQuote : ''),
        winningReason: evaluation.winningReason || (existing ? existing.winningReason : ''),
        dimensionScores: evaluation.dimensions || (existing ? existing.dimensionScores : {}),
        turnSuggestions: evaluation.turnSuggestions || (existing ? existing.turnSuggestions : []),
        dialogueHistory: cleanDialogue.length > 0 ? cleanDialogue : (existing?.dialogueHistory || []),
        lastEvaluation: evaluation
      };
    }

    // 永久儲存至對話練習紀錄流水帳 (保留最近 50 筆)
    if (!Array.isArray(data.practiceLogs)) {
      data.practiceLogs = [];
    }

    const logEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      bossId: boss.id,
      bossName: boss.name,
      bossAvatar: boss.avatar,
      bossTitle: boss.title,
      category: boss.category,
      date: new Date().toISOString(),
      score: score,
      isCaptured: isCaptured,
      turns: cleanDialogue.filter(m => m.role === 'user').length,
      bestCoachQuote: evaluation.bestCoachQuote || '',
      winningReason: evaluation.winningReason || '',
      dimensionScores: evaluation.dimensions || {},
      advice: evaluation.advice || '',
      turnSuggestions: evaluation.turnSuggestions || [],
      dialogueHistory: cleanDialogue
    };

    data.practiceLogs.unshift(logEntry);
    if (data.practiceLogs.length > 50) {
      data.practiceLogs = data.practiceLogs.slice(0, 50);
    }

    this.savePlayerData(data);

    const rank = this.getPlayerRank(data.totalExp);

    return {
      isCaptured,
      isFirstCapture,
      gainedExp,
      totalExp: data.totalExp,
      rank,
      totalCapturedCount: Object.keys(data.captures).length,
      logId: logEntry.id
    };
  },

  // 取得歷次對話練習紀錄
  getPracticeLogs() {
    const data = this.getPlayerData();
    return Array.isArray(data.practiceLogs) ? data.practiceLogs : [];
  },

  // 根據 ID 取得單筆對話練習紀錄
  getPracticeLogById(id) {
    const logs = this.getPracticeLogs();
    return logs.find(l => l.id === id) || null;
  },

  // 刪除單筆對話練習紀錄
  deletePracticeLog(id) {
    const data = this.getPlayerData();
    if (Array.isArray(data.practiceLogs)) {
      data.practiceLogs = data.practiceLogs.filter(l => l.id !== id);
      this.savePlayerData(data);
    }
  },

  // 智慧合併雲端歷史練習紀錄（跨裝置還原）
  mergeCloudPracticeLogs(cloudLogs) {
    if (!Array.isArray(cloudLogs) || cloudLogs.length === 0) return 0;
    const data = this.getPlayerData();
    if (!Array.isArray(data.practiceLogs)) data.practiceLogs = [];
    let addedCount = 0;
    for (const cLog of cloudLogs) {
      const exists = data.practiceLogs.some(l => l.id === cLog.id || (l.date === cLog.submittedAt && l.bossId === cLog.bossId));
      if (!exists) {
        data.practiceLogs.push({
          id: cLog.id || ('log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
          bossId: cLog.bossId,
          bossName: cLog.bossName,
          bossAvatar: cLog.bossAvatar,
          bossTitle: cLog.bossTitle,
          category: cLog.category,
          date: cLog.submittedAt || new Date().toISOString(),
          score: cLog.score || 0,
          isCaptured: cLog.isCaptured,
          turns: cLog.turns || (cLog.dialogueHistory?.filter(m => m.role === 'user').length || 1),
          bestCoachQuote: cLog.bestCoachQuote || '',
          winningReason: cLog.winningReason || '',
          dimensionScores: cLog.dimensions || {},
          advice: cLog.advice || '',
          turnSuggestions: cLog.turnSuggestions || [],
          dialogueHistory: cLog.dialogueHistory || []
        });
        addedCount++;
      }
    }
    data.practiceLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (data.practiceLogs.length > 50) {
      data.practiceLogs = data.practiceLogs.slice(0, 50);
    }
    this.savePlayerData(data);
    return addedCount;
  },

  // 判斷關主是否已被收攏
  isBossCaptured(bossId) {
    const data = this.getPlayerData();
    return !!data.captures[bossId];
  },

  // 取得特定關主的百寶箱圖鑑資料
  getCaptureDetail(bossId) {
    const data = this.getPlayerData();
    return data.captures[bossId] || null;
  },

  // 取得統計摘要
  getStatistics(allBosses = []) {
    const data = this.getPlayerData();
    const capturedList = Object.values(data.captures);
    const totalCaptured = capturedList.length;
    const totalAvailable = allBosses.length || 16;
    const rank = this.getPlayerRank(data.totalExp);

    // 分類統計
    const categoryStats = {
      work: 0,
      parenting: 0,
      couple: 0,
      friends: 0
    };

    let totalScoreSum = 0;
    for (const c of capturedList) {
      if (categoryStats[c.category] !== undefined) {
        categoryStats[c.category]++;
      }
      totalScoreSum += (c.highestScore || 0);
    }

    const avgScore = totalCaptured > 0 ? Math.round(totalScoreSum / totalCaptured) : 0;
    const completionRate = Math.round((totalCaptured / totalAvailable) * 100);

    return {
      nickname: data.nickname,
      avatar: data.avatar,
      totalExp: data.totalExp,
      rank,
      totalCaptured,
      totalAvailable,
      completionRate,
      avgScore,
      categoryStats,
      capturedMap: data.captures
    };
  },

  // 檢查是否已完成首次登錄起程設定
  isOnboarded() {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('coachquest_onboarded_v1') === 'true';
      }
    } catch (_) {}
    return false;
  },

  // 標記已完成首次登錄
  setOnboarded(value = true) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('coachquest_onboarded_v1', value ? 'true' : 'false');
      }
    } catch (_) {}
  },

  // 匯出完整存檔備份 (下載 JSON 檔案)
  exportBackup() {
    const data = this.getPlayerData();
    const backupObj = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      playerData: data,
      customApiKey: (typeof localStorage !== 'undefined' && localStorage.getItem('coachquest_custom_api_key')) || '',
      customModel: (typeof localStorage !== 'undefined' && localStorage.getItem('coachquest_custom_model')) || '',
      lang: (typeof localStorage !== 'undefined' && localStorage.getItem('coachquest_lang')) || 'zh-TW'
    };

    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanNick = (data.nickname || 'Coach').replace(/[^\w\u4e00-\u9fa5]/g, '_');
    a.download = `CoachQuest_Save_${cleanNick}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  },

  // 匯入存檔備份 (解析 JSON 並覆蓋復原)
  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('存檔檔案格式錯誤');
      }
      const pData = parsed.playerData || parsed;
      if (!pData || typeof pData !== 'object') {
        throw new Error('找不到合法的玩家存檔資料');
      }

      const sanitized = this._sanitize(pData);
      this.savePlayerData(sanitized);
      this.setOnboarded(true);

      if (parsed.customApiKey && typeof localStorage !== 'undefined') {
        localStorage.setItem('coachquest_custom_api_key', parsed.customApiKey);
      }
      if (parsed.customModel && typeof localStorage !== 'undefined') {
        localStorage.setItem('coachquest_custom_model', parsed.customModel);
      }
      if (parsed.lang && typeof localStorage !== 'undefined') {
        localStorage.setItem('coachquest_lang', parsed.lang);
      }

      return {
        ok: true,
        player: sanitized,
        capturesCount: Object.keys(sanitized.captures || {}).length,
        totalExp: sanitized.totalExp
      };
    } catch (err) {
      return { ok: false, error: err.message || '存檔解析失敗' };
    }
  }
};
