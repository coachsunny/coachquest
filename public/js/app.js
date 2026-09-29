// ========================================================
// CoachQuest - 核心遊戲狀態與控制器 (App Controller)
// 支援單人挑戰與三大多人連線對決模式 (A: 競速, B: 真人, C: 雙打)
// ========================================================

import { CATEGORIES, BOSSES, getBossById, getBossesByCategory } from './bosses.js';
import { InventoryManager } from './inventory.js';
import { LeaderboardManager } from './leaderboard.js';
import { MultiplayerManager } from './multiplayer.js';
import { LangManager } from './lang.js';

// 全域遊戲狀態
const state = {
  currentCategory: 'work',   // work | parenting | couple | friends
  selectedBoss: null,
  dialogueHistory: [],        // { role: 'user'|'assistant', content: string, innerThought?: string }
  turnCount: 0,
  maxTurns: 8,
  defenseHp: 100,             // 關主心防值 (100 -> 0)
  isBattling: false,
  isWaitingResponse: false,
  showInnerThoughts: true,
  currentEvaluation: null,

  // 多人對戰狀態
  isMultiplayer: false,
  mpMode: null,               // 'pvp_speedrun' | 'human_roleplay' | 'coop_tagteam'
  selectedMpMode: 'pvp_speedrun'
};

// DOM 元素快取字典
let elements = {};

function initElements() {
  elements = {
    // HUD
    hudPlayerName: document.getElementById('hudPlayerName'),
    hudLevel: document.getElementById('hudLevel'),
    hudTitle: document.getElementById('hudTitle'),
    hudCaptures: document.getElementById('hudCaptures'),
    hudExpFill: document.getElementById('hudExpFill'),
    hudExpText: document.getElementById('hudExpText'),
    apiStatusDot: document.getElementById('apiStatusDot'),

    // Views
    viewMap: document.getElementById('viewMap'),
    viewBattle: document.getElementById('viewBattle'),
    viewEvaluation: document.getElementById('viewEvaluation'),

    // Map & Categories
    categoryTabs: document.getElementById('categoryTabs'),
    bossGrid: document.getElementById('bossGrid'),
    mapTitle: document.getElementById('mapTitle'),
    mapSubtitle: document.getElementById('mapSubtitle'),
    mapHeroCaptured: document.getElementById('mapHeroCaptured'),
    mapHeroRate: document.getElementById('mapHeroRate'),

    // Battle Arena
    battleBossAvatar: document.getElementById('battleBossAvatar'),
    battleBossName: document.getElementById('battleBossName'),
    battleBossTitle: document.getElementById('battleBossTitle'),
    battleBossCategory: document.getElementById('battleBossCategory'),
    battleScenarioBrief: document.getElementById('battleScenarioBrief'),
    battleWeaknessPill: document.getElementById('battleWeaknessPill'),
    battleHpFill: document.getElementById('battleHpFill'),
    battleHpText: document.getElementById('battleHpText'),
    battleTurnBadge: document.getElementById('battleTurnBadge'),
    chatViewport: document.getElementById('chatViewport'),
    chatMessages: document.getElementById('chatMessages'),
    typingIndicator: document.getElementById('typingIndicator'),
    messageInput: document.getElementById('messageInput'),
    btnSend: document.getElementById('btnSend'),
    btnHint: document.getElementById('btnHint'),
    btnCapture: document.getElementById('btnCapture'),
    btnRetreat: document.getElementById('btnRetreat'),
    toggleThought: document.getElementById('toggleThought'),

    // 多人外掛對決元素
    opponentLiveBanner: document.getElementById('opponentLiveBanner'),
    oppAvatar: document.getElementById('oppAvatar'),
    oppName: document.getElementById('oppName'),
    oppTurnBadge: document.getElementById('oppTurnBadge'),
    oppHpText: document.getElementById('oppHpText'),
    oppHpFill: document.getElementById('oppHpFill'),

    clientSecretBox: document.getElementById('clientSecretBox'),
    clientSecretContent: document.getElementById('clientSecretContent'),
    secretMotiveText: document.getElementById('secretMotiveText'),
    secretSoftenText: document.getElementById('secretSoftenText'),
    secretSurrenderText: document.getElementById('secretSurrenderText'),
    btnToggleSecret: document.getElementById('btnToggleSecret'),

    coopTurnWrap: document.getElementById('coopTurnWrap'),
    coopTurnPill: document.getElementById('coopTurnPill'),

    // Evaluation View
    evalHeroCard: document.getElementById('evalHeroCard'),
    evalTitle: document.getElementById('evalTitle'),
    evalSubtitle: document.getElementById('evalSubtitle'),
    evalScoreBadge: document.getElementById('evalScoreBadge'),
    evalExpGain: document.getElementById('evalExpGain'),
    evalQuoteBox: document.getElementById('evalQuoteBox'),
    evalWinningReason: document.getElementById('evalWinningReason'),
    evalDimensionsGrid: document.getElementById('evalDimensionsGrid'),
    evalAdviceText: document.getElementById('evalAdviceText'),
    btnEvalContinue: document.getElementById('btnEvalContinue'),
    btnEvalRetry: document.getElementById('btnEvalRetry'),
    btnEvalSubmitBoard: document.getElementById('btnEvalSubmitBoard'),

    // Modals
    modalInventory: document.getElementById('modalInventory'),
    modalLeaderboard: document.getElementById('modalLeaderboard'),
    modalSettings: document.getElementById('modalSettings'),
    modalBossDetail: document.getElementById('modalBossDetail'),
    modalMultiplayer: document.getElementById('modalMultiplayer'),

    // Multiplayer Modal Elements
    tabMpCreate: document.getElementById('tabMpCreate'),
    tabMpJoin: document.getElementById('tabMpJoin'),
    panelMpCreate: document.getElementById('panelMpCreate'),
    panelMpJoin: document.getElementById('panelMpJoin'),
    panelMpWaiting: document.getElementById('panelMpWaiting'),
    selectMpBoss: document.getElementById('selectMpBoss'),
    btnCreateRoomSubmit: document.getElementById('btnCreateRoomSubmit'),
    inputJoinRoomCode: document.getElementById('inputJoinRoomCode'),
    btnJoinRoomSubmit: document.getElementById('btnJoinRoomSubmit'),
    joinErrorMsg: document.getElementById('joinErrorMsg'),
    waitingRoomCode: document.getElementById('waitingRoomCode'),
    waitingModeName: document.getElementById('waitingModeName'),
    waitingBossName: document.getElementById('waitingBossName'),
    p1WaitAvatar: document.getElementById('p1WaitAvatar'),
    p1WaitName: document.getElementById('p1WaitName'),
    p2WaitAvatar: document.getElementById('p2WaitAvatar'),
    p2WaitName: document.getElementById('p2WaitName'),
    p2WaitTag: document.getElementById('p2WaitTag'),
    btnStartMultiplayerMatch: document.getElementById('btnStartMultiplayerMatch'),

    // Inventory Elements
    pokedexGrid: document.getElementById('pokedexGrid'),
    pokedexTabs: document.getElementById('pokedexTabs'),
    invTotalCaptured: document.getElementById('invTotalCaptured'),
    invCompletionRate: document.getElementById('invCompletionRate'),
    invAvgScore: document.getElementById('invAvgScore'),

    // Leaderboard Elements
    leaderboardContent: document.getElementById('leaderboardContent'),

    // Settings
    inputApiKey: document.getElementById('inputApiKey'),
    selectModel: document.getElementById('selectModel'),
    inputNickname: document.getElementById('inputNickname'),
    selectAvatar: document.getElementById('selectAvatar'),
    btnTestApi: document.getElementById('btnTestApi'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),
    apiTestResult: document.getElementById('apiTestResult'),

    // Lang, Onboarding & Backup
    btnToggleLang: document.getElementById('btnToggleLang'),
    langBtnText: document.getElementById('langBtnText'),
    modalOnboarding: document.getElementById('modalOnboarding'),
    inputOnboardNickname: document.getElementById('inputOnboardNickname'),
    selectOnboardAvatar: document.getElementById('selectOnboardAvatar'),
    btnFinishOnboarding: document.getElementById('btnFinishOnboarding'),
    btnExportSave: document.getElementById('btnExportSave'),
    btnPokedexExport: document.getElementById('btnPokedexExport'),
    btnImportSave: document.getElementById('btnImportSave'),
    inputImportFile: document.getElementById('inputImportFile'),
    importResultMsg: document.getElementById('importResultMsg')
  };
}

// ========================================================
// 初始化主程式
// ========================================================
export function initApp() {
  console.log('🚀 CoachQuest 正在初始化...');
  try {
    initElements();
    bindEvents();

    // 語言偏好初始化 (繁/簡體)
    const currentLang = LangManager.getLang();
    if (elements.langBtnText) {
      elements.langBtnText.textContent = currentLang === 'zh-CN' ? '繁體' : '簡體';
    }
    if (currentLang === 'zh-CN') {
      LangManager.translateDOM(document.body);
    }

    refreshPlayerHud();
    renderCategoryTabs();
    renderBossGrid();
    checkApiStatus();

    // 首次進入時啟動起程註冊設定
    if (!InventoryManager.isOnboarded()) {
      openOnboardingModal();
    }

    console.log('✅ CoachQuest 遊戲核心載入完成！四大道館與多人約戰準備就緒。');
  } catch (err) {
    console.error('❌ CoachQuest 初始化異常:', err);
  }
}

// 綁定所有點擊與操作事件
function bindEvents() {
  // 導航列按鈕
  document.getElementById('btnNavMultiplayer')?.addEventListener('click', () => openMultiplayerModal());
  document.getElementById('btnNavPokedex')?.addEventListener('click', () => openInventoryModal());
  document.getElementById('btnNavLeaderboard')?.addEventListener('click', () => openLeaderboardModal());
  document.getElementById('btnNavSettings')?.addEventListener('click', () => openSettingsModal());
  document.getElementById('playerHud')?.addEventListener('click', () => openSettingsModal());

  // 關閉 Modal 按鈕
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) modal.classList.add('hidden');
    });
  });

  // 點擊彈窗外部遮罩自動關閉
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
      }
    });
  });

  // 對戰中操作
  elements.btnSend?.addEventListener('click', () => handleSendMessage());
  elements.messageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  elements.btnHint?.addEventListener('click', () => handleRequestHint());
  elements.btnCapture?.addEventListener('click', () => handleTriggerEvaluation());
  elements.btnRetreat?.addEventListener('click', () => handleRetreat());
  elements.toggleThought?.addEventListener('change', (e) => {
    state.showInnerThoughts = e.target.checked;
    document.querySelectorAll('.inner-thought-card').forEach(el => {
      el.style.display = state.showInnerThoughts ? 'block' : 'none';
    });
  });

  // 模式 B 秘密指南收合按鈕
  elements.btnToggleSecret?.addEventListener('click', () => {
    const content = elements.clientSecretContent;
    if (content) {
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? 'block' : 'none';
      elements.btnToggleSecret.textContent = isHidden ? '收合' : '展開';
    }
  });

  // 結算畫面按鈕
  elements.btnEvalContinue?.addEventListener('click', () => {
    MultiplayerManager.leaveRoom();
    state.isMultiplayer = false;
    switchView('map');
    refreshPlayerHud();
    renderBossGrid();
  });
  elements.btnEvalRetry?.addEventListener('click', () => {
    if (state.selectedBoss) {
      startBossBattle(state.selectedBoss.id);
    }
  });
  elements.btnEvalSubmitBoard?.addEventListener('click', () => handleSubmitScoreToLeaderboard());

  // 設定儲存
  elements.btnSaveSettings?.addEventListener('click', () => handleSaveSettings());
  elements.btnTestApi?.addEventListener('click', () => handleTestApiKey());

  // 語言繁簡轉換 (OpenCC)
  elements.btnToggleLang?.addEventListener('click', () => handleToggleLanguage());

  // 首次起程註冊
  elements.btnFinishOnboarding?.addEventListener('click', () => handleFinishOnboarding());
  elements.inputOnboardNickname?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleFinishOnboarding();
  });

  // 存檔匯出與還原
  elements.btnExportSave?.addEventListener('click', () => handleExportBackup());
  elements.btnPokedexExport?.addEventListener('click', () => handleExportBackup());
  elements.btnImportSave?.addEventListener('click', () => elements.inputImportFile?.click());
  elements.inputImportFile?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleImportBackupFile(file);
    e.target.value = '';
  });

  // 多人連線事件
  bindMultiplayerEvents();
}

// ========================================================
// 多人約戰大廳控制
// ========================================================
function bindMultiplayerEvents() {
  // 模式選擇切換
  document.querySelectorAll('.mode-select-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.mode-select-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.selectedMpMode = card.getAttribute('data-mode') || 'pvp_speedrun';
    });
  });

  // 頁籤切換：建立房間 / 輸入房號
  elements.tabMpCreate?.addEventListener('click', () => {
    elements.tabMpCreate.classList.add('active');
    elements.tabMpJoin?.classList.remove('active');
    elements.panelMpCreate?.classList.remove('hidden');
    elements.panelMpJoin?.classList.add('hidden');
    elements.panelMpWaiting?.classList.add('hidden');
  });

  elements.tabMpJoin?.addEventListener('click', () => {
    elements.tabMpJoin.classList.add('active');
    elements.tabMpCreate?.classList.remove('active');
    elements.panelMpJoin?.classList.remove('hidden');
    elements.panelMpCreate?.classList.add('hidden');
    elements.panelMpWaiting?.classList.add('hidden');
  });

  // 建立房間提交
  elements.btnCreateRoomSubmit?.addEventListener('click', async () => {
    const player = InventoryManager.getPlayerData();
    const bossId = elements.selectMpBoss?.value || 'boss_work_1';
    const mode = state.selectedMpMode;

    elements.btnCreateRoomSubmit.disabled = true;
    elements.btnCreateRoomSubmit.textContent = '⏳ 正在建立房間...';

    try {
      const res = await MultiplayerManager.createRoom({
        mode,
        bossId,
        playerName: player.nickname,
        playerAvatar: player.avatar,
        userApiKey: getSavedApiKey(),
        userModel: getSavedModel()
      });

      renderWaitingRoom(res.room);
      // 開始輪詢對手加入
      MultiplayerManager.startPolling((updatedRoom) => onMultiplayerRoomUpdate(updatedRoom));
    } catch (err) {
      alert('建立房間失敗: ' + err.message);
    } finally {
      elements.btnCreateRoomSubmit.disabled = false;
      elements.btnCreateRoomSubmit.textContent = '⚔️ 立即建立房間（生成 4 位數房號）';
    }
  });

  // 加入房間提交
  elements.btnJoinRoomSubmit?.addEventListener('click', async () => {
    const roomCode = (elements.inputJoinRoomCode?.value || '').trim();
    if (!roomCode || roomCode.length !== 4) {
      if (elements.joinErrorMsg) elements.joinErrorMsg.textContent = '請輸入正確的 4 位數數字房號！';
      return;
    }

    const player = InventoryManager.getPlayerData();
    elements.btnJoinRoomSubmit.disabled = true;
    elements.btnJoinRoomSubmit.textContent = '⏳ 連線中...';
    if (elements.joinErrorMsg) elements.joinErrorMsg.textContent = '';

    try {
      const res = await MultiplayerManager.joinRoom({
        roomId: roomCode,
        playerName: player.nickname,
        playerAvatar: player.avatar
      });

      renderWaitingRoom(res.room);
      // 開始輪詢等待開戰
      MultiplayerManager.startPolling((updatedRoom) => onMultiplayerRoomUpdate(updatedRoom));
    } catch (err) {
      if (elements.joinErrorMsg) elements.joinErrorMsg.textContent = err.message;
    } finally {
      elements.btnJoinRoomSubmit.disabled = false;
      elements.btnJoinRoomSubmit.textContent = '🚀 加入對戰';
    }
  });

  // 房主點擊開戰
  elements.btnStartMultiplayerMatch?.addEventListener('click', async () => {
    elements.btnStartMultiplayerMatch.disabled = true;
    elements.btnStartMultiplayerMatch.textContent = '🚀 正在啟動道館對決...';
    await MultiplayerManager.startMatch();
  });
}

function openMultiplayerModal() {
  // 填入 16 位關主選項
  if (elements.selectMpBoss) {
    elements.selectMpBoss.innerHTML = BOSSES.map(b => {
      const cat = CATEGORIES.find(c => c.id === b.category);
      return `<option value="${b.id}">${cat ? cat.icon : ''}【${cat ? cat.name : ''}】${b.name} (${b.framework.name})</option>`;
    }).join('');
  }

  // 重置回建立房間面板
  elements.tabMpCreate?.click();
  elements.modalMultiplayer?.classList.remove('hidden');
}

function renderWaitingRoom(room) {
  elements.panelMpCreate?.classList.add('hidden');
  elements.panelMpJoin?.classList.add('hidden');
  elements.panelMpWaiting?.classList.remove('hidden');

  if (elements.waitingRoomCode) elements.waitingRoomCode.textContent = room.roomId;

  const modeNames = {
    pvp_speedrun: '🏃 雙人破心競速賽',
    human_roleplay: '🎭 真人扮演 + AI考官',
    coop_tagteam: '🛡️ 雙人雙打協同戰'
  };
  if (elements.waitingModeName) elements.waitingModeName.textContent = modeNames[room.mode] || room.mode;
  if (elements.waitingBossName) elements.waitingBossName.textContent = room.bossName;

  // 玩家 1
  if (elements.p1WaitAvatar) elements.p1WaitAvatar.textContent = room.player1.avatar;
  if (elements.p1WaitName) elements.p1WaitName.textContent = room.player1.name;

  // 玩家 2
  if (room.player2) {
    if (elements.p2WaitAvatar) {
      elements.p2WaitAvatar.textContent = room.player2.avatar;
      elements.p2WaitAvatar.style.opacity = '1';
    }
    if (elements.p2WaitName) elements.p2WaitName.textContent = room.player2.name;
    if (elements.p2WaitTag) {
      elements.p2WaitTag.textContent = '已就緒';
      elements.p2WaitTag.style.background = '#dcfce7';
      elements.p2WaitTag.style.color = '#15803d';
    }

    if (MultiplayerManager.isHost()) {
      if (elements.btnStartMultiplayerMatch) {
        elements.btnStartMultiplayerMatch.disabled = false;
        elements.btnStartMultiplayerMatch.textContent = '🔥 雙方已就緒，點擊開戰！';
      }
    } else {
      if (elements.btnStartMultiplayerMatch) {
        elements.btnStartMultiplayerMatch.disabled = true;
        elements.btnStartMultiplayerMatch.textContent = '⏳ 等候房主點擊開戰...';
      }
    }
  } else {
    if (elements.p2WaitAvatar) {
      elements.p2WaitAvatar.textContent = '❓';
      elements.p2WaitAvatar.style.opacity = '0.5';
    }
    if (elements.p2WaitName) elements.p2WaitName.textContent = '等候對手輸入房號加入...';
    if (elements.p2WaitTag) {
      elements.p2WaitTag.textContent = '等待中';
      elements.p2WaitTag.style.background = '#e2e8f0';
      elements.p2WaitTag.style.color = '#475569';
    }
    if (elements.btnStartMultiplayerMatch) {
      elements.btnStartMultiplayerMatch.disabled = true;
      elements.btnStartMultiplayerMatch.textContent = '⏳ 等待對手加入房間中...';
    }
  }
}

// 輪詢房間狀態同步
function onMultiplayerRoomUpdate(room) {
  // 1. 若仍在等待室，更新等待室
  if (elements.panelMpWaiting && !elements.panelMpWaiting.classList.contains('hidden')) {
    renderWaitingRoom(room);
  }

  // 2. 若房間狀態已變為開戰 'battling'
  if (room.status === 'battling') {
    if (!state.isBattling) {
      elements.modalMultiplayer?.classList.add('hidden');
      launchMultiplayerBattle(room);
    } else {
      syncLiveMultiplayerBattle(room);
    }
  }

  // 3. 若房間已結算 'finished'
  if (room.status === 'finished') {
    if (room.evaluation && !state.currentEvaluation) {
      state.currentEvaluation = room.evaluation;
      renderEvaluationView(room.evaluation);
    }
  }
}

// 啟動多人戰鬥
function launchMultiplayerBattle(room) {
  state.isMultiplayer = true;
  state.mpMode = room.mode;
  state.selectedBoss = getBossById(room.bossId) || BOSSES[0];
  state.turnCount = 1;
  state.defenseHp = 100;
  state.dialogueHistory = [];
  state.currentEvaluation = null;

  // 設定頂部關主資訊
  if (elements.battleBossAvatar) elements.battleBossAvatar.textContent = room.bossAvatar;
  if (elements.battleBossName) elements.battleBossName.textContent = room.bossName;
  if (elements.battleBossTitle) elements.battleBossTitle.textContent = room.bossTitle;
  if (elements.battleBossCategory) {
    const cat = CATEGORIES.find(c => c.id === room.category);
    elements.battleBossCategory.textContent = cat ? `${cat.icon} ${cat.name}` : '⚔️ 約戰道館';
  }
  if (elements.battleScenarioBrief) elements.battleScenarioBrief.textContent = `情境：${room.scenario}`;

  updateBattleHp(100);
  updateTurnBadge();

  if (elements.chatMessages) {
    elements.chatMessages.innerHTML = '';
  }

  // 根據不同模式配置介面
  elements.opponentLiveBanner?.classList.add('hidden');
  elements.clientSecretBox?.classList.add('hidden');
  elements.coopTurnWrap?.classList.add('hidden');

  if (room.mode === 'pvp_speedrun') {
    // 模式 A: 顯示對手即時血條
    elements.opponentLiveBanner?.classList.remove('hidden');
    const opp = MultiplayerManager.getOpponent();
    if (elements.oppAvatar) elements.oppAvatar.textContent = opp?.avatar || '🧝‍♀️';
    if (elements.oppName) elements.oppName.textContent = opp?.name || '對手';
    if (elements.oppHpText) elements.oppHpText.textContent = '100%';
    if (elements.oppHpFill) elements.oppHpFill.style.width = '100%';

    // 開場白
    const firstMsg = {
      role: 'assistant',
      content: state.selectedBoss.openingStatement || state.selectedBoss.openingDialogue || '……',
      innerThought: state.selectedBoss.firstInnerThought || '（我要看你們誰能說服我……）'
    };
    state.dialogueHistory.push(firstMsg);
    appendMessageToChat(firstMsg);
  } else if (room.mode === 'human_roleplay') {
    // 模式 B: 真人對決
    const myPlayer = MultiplayerManager.getMyPlayer();
    if (myPlayer?.role === 'client' && room.secretGuide) {
      // 關主學員顯示秘密提示
      elements.clientSecretBox?.classList.remove('hidden');
      if (elements.secretMotiveText) elements.secretMotiveText.textContent = room.secretGuide.secretMotive || '';
      if (elements.secretSoftenText) elements.secretSoftenText.textContent = room.secretGuide.softenTrigger || '';
      if (elements.secretSurrenderText) elements.secretSurrenderText.textContent = room.secretGuide.surrenderTrigger || '';
    }

    appendSystemNotice(`🎭 【真人對抗模式】：${room.player1.name} 扮演教練，${room.player2?.name} 扮演關主。AI 考官在旁即時監控！`);
  } else if (room.mode === 'coop_tagteam') {
    // 模式 C: 雙打協同
    elements.coopTurnWrap?.classList.remove('hidden');
    updateCoopTurnBadge(room);

    // 載入房間開場白
    if (room.messages && room.messages.length > 0) {
      room.messages.forEach(m => appendMultiplayerMessage(m));
    }
  }

  switchView('battle');
  elements.messageInput?.focus();
}

// 即時同步對決狀態
function syncLiveMultiplayerBattle(room) {
  if (room.mode === 'pvp_speedrun') {
    // 更新對手血條
    const opp = MultiplayerManager.getOpponent();
    if (opp) {
      if (elements.oppTurnBadge) elements.oppTurnBadge.textContent = `第 ${opp.turn} 回合`;
      if (elements.oppHpText) elements.oppHpText.textContent = `${opp.defenseHp}%`;
      if (elements.oppHpFill) elements.oppHpFill.style.width = `${opp.defenseHp}%`;
    }
  } else if (room.mode === 'human_roleplay' || room.mode === 'coop_tagteam') {
    // 同步共享對話流
    if (room.messages && room.messages.length > state.dialogueHistory.length) {
      const newMessages = room.messages.slice(state.dialogueHistory.length);
      newMessages.forEach(m => {
        state.dialogueHistory.push(m);
        appendMultiplayerMessage(m);
      });
    }

    if (room.mode === 'coop_tagteam') {
      updateCoopTurnBadge(room);
    }
  }
}

function updateCoopTurnBadge(room) {
  if (!elements.coopTurnPill) return;
  const isMyTurn = room.activeTurnPlayerId === MultiplayerManager.myPlayerId;
  const activeName = (room.activeTurnPlayerId === room.player1.id) ? room.player1.name : (room.player2?.name || '隊友');

  if (isMyTurn) {
    elements.coopTurnPill.className = 'coop-turn-pill my-turn';
    elements.coopTurnPill.innerHTML = `👉 <b>輪到你了！</b>請輸入你的引導提問`;
    if (elements.messageInput) elements.messageInput.placeholder = '輪到你出招！輸入教練引導回應...';
    if (elements.btnSend) elements.btnSend.disabled = false;
  } else {
    elements.coopTurnPill.className = 'coop-turn-pill';
    elements.coopTurnPill.innerHTML = `⏳ 隊友 <b>【${escapeHtml(activeName)}】</b> 正在思考出招...`;
    if (elements.messageInput) elements.messageInput.placeholder = `等候隊友 ${activeName} 回合完畢...`;
    if (elements.btnSend) elements.btnSend.disabled = true;
  }
}

function appendMultiplayerMessage(msg) {
  if (!elements.chatMessages) return;

  const isUser = msg.role === 'user';
  const row = document.createElement('div');
  row.className = `message-row ${isUser ? 'user' : 'boss'}`;

  const avatar = msg.authorAvatar || (isUser ? '🧙‍♂️' : '🎯');
  const authorName = msg.authorName || (isUser ? '教練' : '關主');

  let innerThoughtHtml = '';
  if (!isUser && msg.innerThought) {
    const displayStyle = state.showInnerThoughts ? 'block' : 'none';
    innerThoughtHtml = `
      <div class="inner-thought-card" style="display: ${displayStyle}">
        <span class="thought-icon">💭</span>
        <span class="thought-label">關主心聲：</span>
        <span class="thought-text">${escapeHtml(msg.innerThought)}</span>
      </div>
    `;
  }

  row.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content-wrap">
      <div class="message-author">${escapeHtml(authorName)}</div>
      <div class="message-bubble">${escapeHtml(msg.content)}</div>
      ${innerThoughtHtml}
    </div>
  `;

  elements.chatMessages.appendChild(row);
  scrollChatToBottom();
}

// ========================================================
// 畫面切換 (Views Controller)
// ========================================================
function switchView(viewName) {
  elements.viewMap?.classList.remove('active');
  elements.viewBattle?.classList.remove('active');
  elements.viewEvaluation?.classList.remove('active');

  if (viewName === 'map') {
    elements.viewMap?.classList.add('active');
    state.isBattling = false;
  } else if (viewName === 'battle') {
    elements.viewBattle?.classList.add('active');
    state.isBattling = true;
  } else if (viewName === 'evaluation') {
    elements.viewEvaluation?.classList.add('active');
    state.isBattling = false;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================================
// 玩家 HUD 與稱號顯示
// ========================================================
function refreshPlayerHud() {
  const data = InventoryManager.getPlayerData();
  const stats = InventoryManager.getStatistics(BOSSES);
  const rank = stats.rank;

  if (elements.hudPlayerName) elements.hudPlayerName.textContent = `${data.avatar} ${data.nickname}`;
  if (elements.hudLevel) elements.hudLevel.textContent = `Lv.${rank.level}`;
  if (elements.hudTitle) elements.hudTitle.textContent = `${rank.badge} ${LangManager.t(rank.title)}`;
  if (elements.hudCaptures) elements.hudCaptures.innerHTML = `🔴 <b>${stats.totalCaptured}</b> / ${stats.totalAvailable}`;
  
  if (elements.hudExpFill) elements.hudExpFill.style.width = `${rank.progressPercent}%`;
  if (elements.hudExpText) elements.hudExpText.textContent = `${rank.currentExp} / ${rank.isMaxLevel ? 'MAX' : rank.nextExp} EXP`;

  if (elements.mapHeroCaptured) elements.mapHeroCaptured.textContent = `${stats.totalCaptured} / ${stats.totalAvailable}`;
  if (elements.mapHeroRate) elements.mapHeroRate.textContent = `${stats.completionRate}%`;

  if (LangManager.getLang() === 'zh-CN' && elements.playerHud) {
    LangManager.translateDOM(elements.playerHud);
  }
}

// ========================================================
// 場景類別切換 (四大篇章: 職場 / 親子 / 夫妻 / 朋友)
// ========================================================
function renderCategoryTabs() {
  if (!elements.categoryTabs) return;

  elements.categoryTabs.innerHTML = CATEGORIES.map(cat => {
    const isActive = cat.id === state.currentCategory;
    const catBosses = getBossesByCategory(cat.id);
    const capturedInCat = catBosses.filter(b => InventoryManager.isBossCaptured(b.id)).length;

    return `
      <button class="category-tab-btn ${isActive ? 'active' : ''}" data-cat-id="${cat.id}">
        <span class="cat-icon">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
        <span class="category-tab-badge">${capturedInCat}/${catBosses.length}</span>
      </button>
    `;
  }).join('');

  if (LangManager.getLang() === 'zh-CN') {
    LangManager.translateDOM(elements.categoryTabs);
  }

  elements.categoryTabs.querySelectorAll('.category-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-cat-id');
      if (catId && catId !== state.currentCategory) {
        state.currentCategory = catId;
        renderCategoryTabs();
        renderBossGrid();
      }
    });
  });
}

// ========================================================
// 渲染關主地圖 (Boss Grid)
// ========================================================
function renderBossGrid() {
  if (!elements.bossGrid) return;

  const currentCatObj = CATEGORIES.find(c => c.id === state.currentCategory) || CATEGORIES[0];
  if (elements.mapTitle) elements.mapTitle.innerHTML = `${currentCatObj.icon} ${currentCatObj.name} · 道館關卡`;
  if (elements.mapSubtitle) elements.mapSubtitle.textContent = currentCatObj.desc;

  const bosses = getBossesByCategory(state.currentCategory);

  elements.bossGrid.innerHTML = bosses.map(boss => {
    const isCaptured = InventoryManager.isBossCaptured(boss.id);
    const captureData = InventoryManager.getCaptureDetail(boss.id);
    const highestScore = captureData ? captureData.highestScore : null;

    const starCount = typeof boss.difficulty === 'number' ? boss.difficulty : 3;
    const stars = '⭐'.repeat(starCount);
    const fwName = (boss.framework && boss.framework.name) || boss.weaknessName || '非暴力溝通';

    return `
      <div class="boss-card ${isCaptured ? 'captured' : ''}" data-boss-id="${boss.id}">
        <div class="boss-card-header">
          <div class="boss-avatar-box">${boss.avatar}</div>
          <div class="boss-meta">
            <div class="boss-name">${escapeHtml(boss.name)}</div>
            <div class="boss-title">${escapeHtml(boss.title)}</div>
          </div>
        </div>

        <div class="boss-body">
          <div class="boss-scenario-desc">${escapeHtml(boss.scenario)}</div>
          <div class="boss-weakness-bar">
            <span class="weakness-tag">攻心法寶</span>
            <span class="framework-tag">${escapeHtml(fwName)}</span>
          </div>
          <div class="boss-difficulty-row">
            <span class="diff-label">心防難度：</span>
            <span class="diff-stars">${stars}</span>
          </div>
        </div>

        <div class="boss-footer">
          ${isCaptured ? `
            <div class="boss-score-display">
              <span class="pokeball-mini">🔴</span> 最高 ${highestScore} 分
            </div>
            <button class="btn btn-primary btn-sm btn-challenge" data-boss-id="${boss.id}">
              再次切磋
            </button>
          ` : `
            <div class="boss-status-pending">
              <span class="status-dot dot-warn"></span> 尚未收攏
            </div>
            <button class="btn btn-primary btn-sm btn-challenge" data-boss-id="${boss.id}">
              ⚔️ 發起挑戰
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');

  if (LangManager.getLang() === 'zh-CN') {
    LangManager.translateDOM(elements.bossGrid);
    if (elements.mapTitle) LangManager.translateDOM(elements.mapTitle);
    if (elements.mapSubtitle) LangManager.translateDOM(elements.mapSubtitle);
  }

  elements.bossGrid.querySelectorAll('.btn-challenge').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bossId = e.currentTarget.getAttribute('data-boss-id');
      if (bossId) {
        startBossBattle(bossId);
      }
    });
  });

  elements.bossGrid.querySelectorAll('.boss-card').forEach(card => {
    card.addEventListener('click', () => {
      const bossId = card.getAttribute('data-boss-id');
      if (bossId) {
        startBossBattle(bossId);
      }
    });
  });
}

// ========================================================
// 發起單人關主對決 (Start Single Boss Battle)
// ========================================================
export function startBossBattle(bossId) {
  state.isMultiplayer = false;
  const boss = getBossById(bossId);
  if (!boss) return;

  state.selectedBoss = boss;
  state.turnCount = 1;
  state.defenseHp = 100;
  state.dialogueHistory = [];
  state.currentEvaluation = null;

  elements.opponentLiveBanner?.classList.add('hidden');
  elements.clientSecretBox?.classList.add('hidden');
  elements.coopTurnWrap?.classList.add('hidden');

  if (elements.battleBossAvatar) elements.battleBossAvatar.textContent = boss.avatar;
  if (elements.battleBossName) elements.battleBossName.textContent = boss.name;
  if (elements.battleBossTitle) elements.battleBossTitle.textContent = boss.title;
  if (elements.battleBossCategory) {
    const cat = CATEGORIES.find(c => c.id === boss.category);
    elements.battleBossCategory.textContent = cat ? `${cat.icon} ${cat.name}` : '';
  }
  if (elements.battleScenarioBrief) elements.battleScenarioBrief.textContent = `場景：${boss.scenario}`;
  if (elements.battleWeaknessPill) {
    const fwName = (boss.framework && boss.framework.name) || boss.weaknessName || '非暴力溝通';
    elements.battleWeaknessPill.textContent = `心防弱點：${fwName}`;
  }

  updateBattleHp(100);
  updateTurnBadge();

  if (elements.chatMessages) {
    elements.chatMessages.innerHTML = '';
  }

  const firstMsg = {
    role: 'assistant',
    content: boss.openingStatement || boss.openingDialogue || '……你找我？',
    innerThought: boss.firstInnerThought || '（哼，我倒要看看你今天打算怎麼說服我……）'
  };
  state.dialogueHistory.push(firstMsg);
  appendMessageToChat(firstMsg);

  switchView('battle');
  if (elements.messageInput) {
    elements.messageInput.value = '';
    elements.messageInput.focus();
  }
}

// ========================================================
// 對話管理與發送訊息 (支援單人 & 三大約戰模式)
// ========================================================
async function handleSendMessage() {
  if (state.isWaitingResponse || !state.selectedBoss) return;
  const inputEl = elements.messageInput;
  const userText = (inputEl.value || '').trim();
  if (!userText) return;

  inputEl.value = '';
  inputEl.style.height = 'auto';

  // 1. 多人模式 B: 真人對決
  if (state.isMultiplayer && state.mpMode === 'human_roleplay') {
    await MultiplayerManager.sendHumanMessage(userText);
    return;
  }

  // 2. 多人模式 C: 雙打協同戰
  if (state.isMultiplayer && state.mpMode === 'coop_tagteam') {
    state.isWaitingResponse = true;
    setTypingIndicator(true);
    try {
      await MultiplayerManager.sendCoopTurn(userText, getSavedApiKey(), getSavedModel());
    } finally {
      state.isWaitingResponse = false;
      setTypingIndicator(false);
    }
    return;
  }

  // 3. 單人挑戰 或 多人模式 A（雙人競速）
  const userMsg = { role: 'user', content: userText };
  state.dialogueHistory.push(userMsg);
  appendMessageToChat(userMsg);

  state.isWaitingResponse = true;
  setTypingIndicator(true);

  try {
    const userApiKey = getSavedApiKey();
    const userModel = getSavedModel();

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bossId: state.selectedBoss.id,
        messages: state.dialogueHistory.map(m => ({ role: m.role, content: m.content })),
        turn: state.turnCount,
        userApiKey,
        userModel
      })
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || '後端伺服器回應異常');
    }

    const replyText = LangManager.t(data.reply || '……');
    const thoughtText = LangManager.t(data.innerThought || '');

    const bossMsg = {
      role: 'assistant',
      content: replyText,
      innerThought: thoughtText
    };
    state.dialogueHistory.push(bossMsg);
    appendMessageToChat(bossMsg);

    state.turnCount++;
    const damage = Math.floor(10 + Math.random() * 8);
    state.defenseHp = Math.max(15, state.defenseHp - damage);
    updateBattleHp(state.defenseHp);
    updateTurnBadge();

    // 模式 A 同步競速血條至房間
    if (state.isMultiplayer && state.mpMode === 'pvp_speedrun') {
      MultiplayerManager.syncSpeedrun({
        defenseHp: state.defenseHp,
        turn: state.turnCount
      });
    }

    if (state.turnCount > state.maxTurns) {
      showSystemToast(LangManager.t('已達最大回合數！關主心防已大幅鬆動，現在是收攏的最佳時機！'));
    }

  } catch (err) {
    console.error('對戰通訊失敗:', err);
    appendSystemNotice(LangManager.t(`⚠️ 通訊異常: ${err.message}。若為 API 金鑰問題，可點擊右上角「⚙️ 設定」檢查。`));
  } finally {
    state.isWaitingResponse = false;
    setTypingIndicator(false);
  }
}

// 請求戰術錦囊 (Coach Hint)
async function handleRequestHint() {
  if (!state.selectedBoss || state.isWaitingResponse) return;

  elements.btnHint.disabled = true;
  elements.btnHint.textContent = LangManager.t('💡 思考中...');

  try {
    const userApiKey = getSavedApiKey();
    const userModel = getSavedModel();

    const response = await fetch('/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bossId: state.selectedBoss.id,
        messages: state.dialogueHistory.map(m => ({ role: m.role, content: m.content })),
        userApiKey,
        userModel
      })
    });

    const data = await response.json();
    const fwName = (state.selectedBoss.framework && state.selectedBoss.framework.name) || state.selectedBoss.weaknessName || '非暴力溝通';

    if (data.ok && data.hint) {
      appendHintToChat(LangManager.t(data.hint));
    } else {
      appendHintToChat(LangManager.t(`🎯 針對【${state.selectedBoss.name}】，善用「${fwName}」，不要急著給建議，先反應對方的內在感受。`));
    }
  } catch (err) {
    appendHintToChat(LangManager.t(`🎯 戰術錦囊：傾聽對方的未滿足需求，試著提問：「聽起來這件事讓你感到有些……對嗎？」`));
  } finally {
    elements.btnHint.disabled = false;
    elements.btnHint.textContent = LangManager.t('💡 戰術錦囊');
  }
}

// 渲染訊息泡泡
function appendMessageToChat(msg) {
  if (!elements.chatMessages) return;

  const isUser = msg.role === 'user';
  const row = document.createElement('div');
  row.className = `message-row ${isUser ? 'user' : 'boss'}`;

  const avatar = isUser ? (InventoryManager.getPlayerData().avatar || '🧙‍♂️') : state.selectedBoss.avatar;
  const authorName = isUser ? '教練 (你)' : state.selectedBoss.name;

  let innerThoughtHtml = '';
  if (!isUser && msg.innerThought) {
    const displayStyle = state.showInnerThoughts ? 'block' : 'none';
    innerThoughtHtml = `
      <div class="inner-thought-card" style="display: ${displayStyle}">
        <span class="thought-icon">💭</span>
        <span class="thought-label">關主心聲：</span>
        <span class="thought-text">${escapeHtml(msg.innerThought)}</span>
      </div>
    `;
  }

  row.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content-wrap">
      <div class="message-author">${escapeHtml(authorName)}</div>
      <div class="message-bubble">${escapeHtml(msg.content)}</div>
      ${innerThoughtHtml}
    </div>
  `;

  elements.chatMessages.appendChild(row);
  scrollChatToBottom();
}

function appendHintToChat(hintText) {
  const row = document.createElement('div');
  row.className = 'message-row system-hint-row';
  row.innerHTML = `
    <div class="system-hint-bubble">
      <div class="hint-header">💡 戰術錦囊 (Coach Strategy)</div>
      <div class="hint-body">${escapeHtml(hintText)}</div>
    </div>
  `;
  elements.chatMessages?.appendChild(row);
  scrollChatToBottom();
}

function appendSystemNotice(text) {
  const row = document.createElement('div');
  row.className = 'system-notice-bar';
  row.textContent = text;
  elements.chatMessages?.appendChild(row);
  scrollChatToBottom();
}

function scrollChatToBottom() {
  if (elements.chatViewport) {
    elements.chatViewport.scrollTop = elements.chatViewport.scrollHeight;
  }
}

function setTypingIndicator(show) {
  if (elements.typingIndicator) {
    elements.typingIndicator.style.display = show ? 'flex' : 'none';
    if (show) scrollChatToBottom();
  }
}

function updateBattleHp(hp) {
  if (elements.battleHpFill) elements.battleHpFill.style.width = `${hp}%`;
  if (elements.battleHpText) elements.battleHpText.textContent = `${hp}%`;
}

function updateTurnBadge() {
  if (elements.battleTurnBadge) {
    elements.battleTurnBadge.textContent = `第 ${state.turnCount} / ${state.maxTurns} 回合`;
  }
  if (elements.btnCapture) {
    elements.btnCapture.disabled = state.dialogueHistory.length < 3;
  }
}

// 暫時撤退
function handleRetreat() {
  if (confirm('確定要暫時撤退回到道館地圖嗎？本次練習進度將不予計分。')) {
    if (state.isMultiplayer) {
      MultiplayerManager.leaveRoom();
      state.isMultiplayer = false;
    }
    switchView('map');
  }
}

// ========================================================
// 結算與寶可夢收攏判定 (Evaluation & Pokemon Capture)
// ========================================================
async function handleTriggerEvaluation() {
  if (!state.selectedBoss || state.isWaitingResponse) return;

  if (state.dialogueHistory.length < 3) {
    alert('對話回合尚不足，至少進行 2 回合以上的深度互動才能進行評分收攏！');
    return;
  }

  elements.btnCapture.disabled = true;
  elements.btnCapture.textContent = '🌀 拋出教練精靈球...';

  try {
    const userApiKey = getSavedApiKey();
    const userModel = getSavedModel();

    // 多人模式 B 或 C：請求房間 AI 評審
    if (state.isMultiplayer && (state.mpMode === 'human_roleplay' || state.mpMode === 'coop_tagteam')) {
      const res = await MultiplayerManager.evaluateRoom(userApiKey, userModel);
      if (res && res.evaluation) {
        state.currentEvaluation = res.evaluation;
        renderEvaluationView(res.evaluation);
      }
      return;
    }

    // 單人模式 或 模式 A 競速模式
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bossId: state.selectedBoss.id,
        messages: state.dialogueHistory.map(m => ({ role: m.role, content: m.content })),
        userApiKey,
        userModel
      })
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || '評分系統未正常回應');
    }

    state.currentEvaluation = data.evaluation;
    renderEvaluationView(data.evaluation);

    // 模式 A: 達到 70 分宣告競速獲勝！
    if (state.isMultiplayer && state.mpMode === 'pvp_speedrun' && data.evaluation.captured) {
      MultiplayerManager.claimSpeedrunWin(data.evaluation);
      alert('🏆 恭喜！你率先突破關主心防，在競速對決中拔得頭籌！');
    }

  } catch (err) {
    console.error('結算失敗:', err);
    alert(`評分結算失敗: ${err.message}`);
  } finally {
    elements.btnCapture.disabled = false;
    elements.btnCapture.textContent = '⚔️ 申請結算收攏';
  }
}

// 渲染結算畫面與寶可夢收攏
function renderEvaluationView(evalData) {
  const boss = state.selectedBoss;
  const score = Number(evalData.score) || 0;
  const isCaptured = score >= 70;

  const battleResult = InventoryManager.recordBattleResult(boss, evalData);

  switchView('evaluation');

  if (elements.evalHeroCard) {
    elements.evalHeroCard.className = `victory-hero-card ${isCaptured ? 'captured' : 'failed'}`;
  }

  if (elements.evalTitle) {
    elements.evalTitle.innerHTML = isCaptured 
      ? `🎉 成功收攏！【${escapeHtml(boss.name)}】已收攏入百寶箱！` 
      : `💨 關主未突破！心防尚存（得分 ${score} / 70）`;
  }

  if (elements.evalSubtitle) {
    elements.evalSubtitle.textContent = isCaptured
      ? `太棒了！你的傾聽與同理打動了關主，解鎖專屬心得卡片！`
      : `心防未達 70 分門檻。多嘗試反映情感與探索需求，再次切磋必能破關！`;
  }

  if (elements.evalScoreBadge) {
    elements.evalScoreBadge.textContent = `${score}分`;
  }

  if (elements.evalExpGain) {
    elements.evalExpGain.innerHTML = `🌟 獲得 <b>+${battleResult.gainedExp} EXP</b> （${battleResult.rank.badge} ${battleResult.rank.title}）`;
  }

  const bestQuote = LangManager.t(evalData.bestCoachQuote || '你的耐心傾聽讓對話氛圍充滿安全感。');
  const winningReason = LangManager.t(evalData.winningReason || '成功引導對方表達真實需求。');
  const advice = LangManager.t(evalData.advice || '持續練習提問引導，能激發出學員更多自主行動的承諾。');

  if (elements.evalQuoteBox) {
    elements.evalQuoteBox.innerHTML = `
      <div class="quote-header">✨ 本次最精彩的教練金句：</div>
      <div class="quote-text">「${escapeHtml(bestQuote)}」</div>
    `;
  }

  if (elements.evalWinningReason) {
    elements.evalWinningReason.innerHTML = `
      <b>🎯 攻心關鍵復盤：</b>${escapeHtml(winningReason)}
    `;
  }

  if (elements.evalDimensionsGrid) {
    const dims = [
      { key: 'empathy', name: LangManager.t('深度同理心'), val: evalData.dimensions?.empathy || 75 },
      { key: 'listening', name: LangManager.t('有效傾聽'), val: evalData.dimensions?.listening || 70 },
      { key: 'questioning', name: LangManager.t('提問引導'), val: evalData.dimensions?.questioning || 70 },
      { key: 'reframing', name: LangManager.t('視角重構'), val: evalData.dimensions?.reframing || 75 },
      { key: 'action_drive', name: LangManager.t('行動激發'), val: evalData.dimensions?.action_drive || 65 }
    ];

    elements.evalDimensionsGrid.innerHTML = dims.map(d => `
      <div class="dim-item">
        <div class="dim-header">
          <span>${d.name}</span>
          <span class="dim-val">${d.val}分</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${d.val}%;"></div>
        </div>
      </div>
    `).join('');
  }

  if (elements.evalAdviceText) {
    elements.evalAdviceText.textContent = advice;
  }

  if (elements.btnEvalSubmitBoard) {
    elements.btnEvalSubmitBoard.style.display = isCaptured ? 'inline-flex' : 'none';
  }

  if (LangManager.getLang() === 'zh-CN' && elements.viewEvaluation) {
    LangManager.translateDOM(elements.viewEvaluation);
  }
}

// 提交成績至排行榜
async function handleSubmitScoreToLeaderboard() {
  if (!state.currentEvaluation || !elements.btnEvalSubmitBoard) return;

  const player = InventoryManager.getPlayerData();
  const stats = InventoryManager.getStatistics(BOSSES);

  elements.btnEvalSubmitBoard.disabled = true;
  elements.btnEvalSubmitBoard.textContent = '🚀 正在上傳至排行榜...';

  try {
    await LeaderboardManager.submit({
      name: player.nickname,
      score: state.currentEvaluation.score,
      captures: stats.totalCaptured,
      title: stats.rank.title,
      avatar: player.avatar
    });

    alert('🎉 成績已成功登錄至前 10 名冒險者排行榜！');
    elements.btnEvalSubmitBoard.textContent = '✅ 已成功上榜';
    openLeaderboardModal();
  } catch (e) {
    alert('上榜失敗，請稍候再試。');
    elements.btnEvalSubmitBoard.disabled = false;
    elements.btnEvalSubmitBoard.textContent = '🏆 登錄排行榜';
  }
}

// ========================================================
// 百寶箱圖鑑儀表板 (Treasure Box / Pokédex Modal)
// ========================================================
export function openInventoryModal() {
  const stats = InventoryManager.getStatistics(BOSSES);

  if (elements.invTotalCaptured) elements.invTotalCaptured.textContent = `${stats.totalCaptured} / ${stats.totalAvailable}`;
  if (elements.invCompletionRate) elements.invCompletionRate.textContent = `${stats.completionRate}%`;
  if (elements.invAvgScore) elements.invAvgScore.textContent = `${stats.avgScore}分`;

  renderPokedexCards('all');

  if (elements.pokedexTabs) {
    const tabs = [
      { id: 'all', name: '全部關主' },
      ...CATEGORIES.map(c => ({ id: c.id, name: `${c.icon} ${c.name}` }))
    ];

    elements.pokedexTabs.innerHTML = tabs.map(t => `
      <button class="tool-btn pokedex-tab-btn ${t.id === 'all' ? 'active' : ''}" data-cat="${t.id}">
        ${t.name}
      </button>
    `).join('');

    elements.pokedexTabs.querySelectorAll('.pokedex-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        elements.pokedexTabs.querySelectorAll('.pokedex-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const cat = e.currentTarget.getAttribute('data-cat');
        renderPokedexCards(cat);
      });
    });
  }

  elements.modalInventory?.classList.remove('hidden');
  if (LangManager.getLang() === 'zh-CN') {
    LangManager.translateDOM(elements.modalInventory);
  }
}

function renderPokedexCards(categoryFilter = 'all') {
  if (!elements.pokedexGrid) return;

  const filteredBosses = categoryFilter === 'all' 
    ? BOSSES 
    : BOSSES.filter(b => b.category === categoryFilter);

  elements.pokedexGrid.innerHTML = filteredBosses.map(boss => {
    const isCaptured = InventoryManager.isBossCaptured(boss.id);
    const detail = InventoryManager.getCaptureDetail(boss.id);

    if (isCaptured && detail) {
      return `
        <div class="pokedex-card unlocked" data-boss-id="${boss.id}">
          <div class="unlock-header">
            <span class="pokeball-mini">🔴</span>
            <span class="score-chip">${detail.highestScore}分</span>
          </div>
          <div class="unlock-avatar">${boss.avatar}</div>
          <div class="unlock-info">
            <div class="boss-name">${escapeHtml(boss.name)}</div>
            <div class="boss-title">${escapeHtml(boss.title)}</div>
          </div>
          <div class="pokedex-quote">
            「${escapeHtml(detail.bestCoachQuote || '暫無收錄金句')}」
          </div>
          <button class="btn btn-outline btn-sm btn-view-boss-card" data-boss-id="${boss.id}">
            📜 檢視心得卡
          </button>
        </div>
      `;
    } else {
      return `
        <div class="pokedex-card locked">
          <div class="unlock-header">
            <span class="status-dot dot-warn"></span>
            <span class="locked-label">未解鎖</span>
          </div>
          <div class="unlock-avatar pokedex-silhouette">${boss.avatar}</div>
          <div class="unlock-info">
            <div class="boss-name">???</div>
            <div class="boss-title">${escapeHtml(boss.title)}</div>
          </div>
          <div class="locked-hint">挑戰得分達 70 分即可收攏至百寶箱</div>
        </div>
      `;
    }
  }).join('');

  if (LangManager.getLang() === 'zh-CN') {
    LangManager.translateDOM(elements.pokedexGrid);
  }

  elements.pokedexGrid.querySelectorAll('.btn-view-boss-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bossId = e.currentTarget.getAttribute('data-boss-id');
      openBossDetailModal(bossId);
    });
  });
}

function openBossDetailModal(bossId) {
  const boss = getBossById(bossId);
  const detail = InventoryManager.getCaptureDetail(bossId);
  if (!boss || !detail) return;

  const contentEl = document.getElementById('bossDetailContent');
  const fwName = (boss.framework && boss.framework.name) || boss.weaknessName || '非暴力溝通';

  if (contentEl) {
    contentEl.innerHTML = `
      <div class="treasure-card-unlock">
        <div class="card-hero-row">
          <div class="card-avatar">${boss.avatar}</div>
          <div>
            <h3>${escapeHtml(boss.name)} · ${escapeHtml(boss.title)}</h3>
            <p class="card-sub">${escapeHtml(fwName)} | 突破最高得分：${detail.highestScore} 分</p>
          </div>
        </div>

        <div class="card-section">
          <h4>✨ 你的破心教練金句</h4>
          <blockquote class="card-quote">「${escapeHtml(detail.bestCoachQuote || '深刻的同理觸動人心。')}」</blockquote>
        </div>

        <div class="card-section">
          <h4>🎯 突破防線復盤</h4>
          <p>${escapeHtml(detail.winningReason || '成功識別了關主的真實需求，引導出自我反思。')}</p>
        </div>

        <div class="card-section">
          <h4>📊 掌握之五大溝通維度</h4>
          <div class="dimension-grid">
            <div class="dim-item"><span>深度同理：${detail.dimensionScores?.empathy || 80}分</span></div>
            <div class="dim-item"><span>有效傾聽：${detail.dimensionScores?.listening || 80}分</span></div>
            <div class="dim-item"><span>提問引導：${detail.dimensionScores?.questioning || 75}分</span></div>
            <div class="dim-item"><span>視角重構：${detail.dimensionScores?.reframing || 75}分</span></div>
            <div class="dim-item"><span>行動激發：${detail.dimensionScores?.action_drive || 70}分</span></div>
          </div>
        </div>
      </div>
    `;
  }
  elements.modalBossDetail?.classList.remove('hidden');
  if (LangManager.getLang() === 'zh-CN' && elements.modalBossDetail) {
    LangManager.translateDOM(elements.modalBossDetail);
  }
}

// ========================================================
// 前 10 名排行榜 (Leaderboard Modal)
// ========================================================
export async function openLeaderboardModal() {
  if (elements.leaderboardContent) {
    elements.leaderboardContent.innerHTML = '<div class="loading-state">載入全體冒險者排行榜中...</div>';
  }
  elements.modalLeaderboard?.classList.remove('hidden');

  const board = await LeaderboardManager.fetch();
  const currentNick = InventoryManager.getPlayerData().nickname;

  if (elements.leaderboardContent) {
    elements.leaderboardContent.innerHTML = LeaderboardManager.renderList(board, currentNick);
    if (LangManager.getLang() === 'zh-CN') {
      LangManager.translateDOM(elements.leaderboardContent);
    }
  }
}

// ========================================================
// 設定與 API 金鑰管理
// ========================================================
function openSettingsModal() {
  const player = InventoryManager.getPlayerData();
  if (elements.inputNickname) elements.inputNickname.value = player.nickname;
  if (elements.selectAvatar) elements.selectAvatar.value = player.avatar || '🧙‍♂️';
  if (elements.inputApiKey) elements.inputApiKey.value = getSavedApiKey();
  if (elements.selectModel) elements.selectModel.value = getSavedModel();
  if (elements.apiTestResult) elements.apiTestResult.textContent = '';
  if (elements.importResultMsg) elements.importResultMsg.textContent = '';

  elements.modalSettings?.classList.remove('hidden');
  if (LangManager.getLang() === 'zh-CN' && elements.modalSettings) {
    LangManager.translateDOM(elements.modalSettings);
  }
}

function handleSaveSettings() {
  const newName = elements.inputNickname?.value;
  const newAvatar = elements.selectAvatar?.value;
  const newKey = elements.inputApiKey?.value;
  const newModel = elements.selectModel?.value;

  if (newName) InventoryManager.setNickname(newName);
  if (newAvatar) InventoryManager.setAvatar(newAvatar);
  if (newKey !== undefined) localStorage.setItem('coachquest_custom_api_key', newKey.trim());
  if (newModel) localStorage.setItem('coachquest_custom_model', newModel);

  refreshPlayerHud();
  checkApiStatus();
  elements.modalSettings?.classList.add('hidden');
  alert('設定已成功儲存！');
}

async function handleTestApiKey() {
  const testKey = elements.inputApiKey?.value.trim();
  const selectedModel = elements.selectModel?.value || getSavedModel();
  const resultEl = elements.apiTestResult;
  if (!resultEl) return;

  resultEl.textContent = '🔄 測試連線中...';
  resultEl.style.color = '#4f46e5';

  try {
    const res = await fetch('/api/test-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: testKey, model: selectedModel })
    });
    const data = await res.json();
    if (data.ok) {
      resultEl.textContent = `✅ 連線成功！${data.message || 'Gemini 運作無誤'}`;
      resultEl.style.color = '#10b981';
      if (elements.apiStatusDot) {
        elements.apiStatusDot.className = 'status-dot dot-ok';
      }
    } else {
      resultEl.textContent = `❌ 連線失敗：${data.error || '請檢查金鑰'}`;
      resultEl.style.color = '#ef4444';
    }
  } catch (err) {
    resultEl.textContent = `❌ 連線錯誤: ${err.message}`;
    resultEl.style.color = '#ef4444';
  }
}

// ========================================================
// 首次起程註冊與語言繁簡切換控制器
// ========================================================
function openOnboardingModal() {
  const player = InventoryManager.getPlayerData();
  if (elements.inputOnboardNickname) {
    elements.inputOnboardNickname.value = (player.nickname && !player.nickname.startsWith('教練新手#')) 
      ? player.nickname 
      : '';
  }
  if (elements.selectOnboardAvatar) {
    elements.selectOnboardAvatar.value = player.avatar || '🧙‍♂️';
  }
  elements.modalOnboarding?.classList.remove('hidden');
  if (LangManager.getLang() === 'zh-CN') {
    LangManager.translateDOM(elements.modalOnboarding);
  }
  setTimeout(() => elements.inputOnboardNickname?.focus(), 150);
}

function handleFinishOnboarding() {
  const name = (elements.inputOnboardNickname?.value || '').trim();
  const avatar = elements.selectOnboardAvatar?.value || '🧙‍♂️';
  if (!name) {
    alert(LangManager.t('請輸入您的冒險者教練代稱！'));
    elements.inputOnboardNickname?.focus();
    return;
  }

  InventoryManager.setNickname(name);
  InventoryManager.setAvatar(avatar);
  InventoryManager.setOnboarded(true);
  elements.modalOnboarding?.classList.add('hidden');
  refreshPlayerHud();
  showSystemToast(LangManager.t(`歡迎，【${name}】教練！四大溝通道館已為您開啟！`));
}

function handleToggleLanguage() {
  const newLang = LangManager.toggleLang();
  if (elements.langBtnText) {
    elements.langBtnText.textContent = newLang === 'zh-CN' ? '繁體' : '簡體';
  }
  refreshPlayerHud();
  renderCategoryTabs();
  renderBossGrid();
  showSystemToast(newLang === 'zh-CN' ? '已切换至简体中文（OpenCC）' : '已切換至繁體中文（OpenCC）');
}

function handleExportBackup() {
  InventoryManager.exportBackup();
  showSystemToast(LangManager.t('✅ 存檔備份已下載完成！'));
}

function handleImportBackupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const res = InventoryManager.importBackup(e.target.result);
    if (res.ok) {
      refreshPlayerHud();
      renderCategoryTabs();
      renderBossGrid();
      if (elements.importResultMsg) {
        elements.importResultMsg.textContent = LangManager.t(`✅ 成功還原存檔！已收攏 ${res.capturesCount} 位關主！`);
        elements.importResultMsg.style.color = '#10b981';
      }
      alert(LangManager.t(`🎉 存檔還原成功！\n冒險者：${res.player.avatar} ${res.player.nickname}\n已收攏關主：${res.capturesCount} 位\n累積經驗值：${res.totalExp} EXP`));
    } else {
      if (elements.importResultMsg) {
        elements.importResultMsg.textContent = LangManager.t(`❌ 還原失敗：${res.error}`);
        elements.importResultMsg.style.color = '#ef4444';
      }
      alert(LangManager.t(`還原失敗: ${res.error}`));
    }
  };
  reader.readAsText(file, 'utf-8');
}

async function checkApiStatus() {
  try {
    const res = await fetch('/api/game-info');
    const data = await res.json();
    if (elements.apiStatusDot) {
      if (data.hasApiKey || getSavedApiKey()) {
        elements.apiStatusDot.className = 'status-dot dot-ok';
      } else {
        elements.apiStatusDot.className = 'status-dot dot-warn';
      }
    }
  } catch (e) {
    if (elements.apiStatusDot) elements.apiStatusDot.className = 'status-dot dot-warn';
  }
}

function getSavedApiKey() {
  return localStorage.getItem('coachquest_custom_api_key') || '';
}

function getSavedModel() {
  const saved = localStorage.getItem('coachquest_custom_model');
  if (!saved || saved.includes('2.5')) {
    return 'gemini-3.5-flash-lite';
  }
  return saved;
}

function showSystemToast(msg) {
  appendSystemNotice(`🔔 提示: ${msg}`);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 確保不論頁面處於何種載入狀態，均能立即可靠啟動
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initApp());
} else {
  initApp();
}
