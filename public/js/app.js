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
  currentViewingBossId: null,
  currentViewingLogId: null,
  currentBattleSessionId: null,
  lastFinishedLogId: null,

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
    btnDownloadChatLive: document.getElementById('btnDownloadChatLive'),
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
    btnEvalDownloadReport: document.getElementById('btnEvalDownloadReport'),
    btnEvalViewVisualReport: document.getElementById('btnEvalViewVisualReport'),
    btnEvalCopyTranscript: document.getElementById('btnEvalCopyTranscript'),
    btnEvalDownloadHtml: document.getElementById('btnEvalDownloadHtml'),
    btnDownloadBossCardReport: document.getElementById('btnDownloadBossCardReport'),

    // Modals
    btnNavPracticeLogs: document.getElementById('btnNavPracticeLogs'),
    navPracticeLogCount: document.getElementById('navPracticeLogCount'),
    modalPracticeLogsList: document.getElementById('modalPracticeLogsList'),
    practiceLogsTotalBadge: document.getElementById('practiceLogsTotalBadge'),
    summaryPracticeTotal: document.getElementById('summaryPracticeTotal'),
    summaryPracticeCaptured: document.getElementById('summaryPracticeCaptured'),
    summaryPracticeAvg: document.getElementById('summaryPracticeAvg'),
    practiceLogsListContainer: document.getElementById('practiceLogsListContainer'),
    btnSyncCloudLogs: document.getElementById('btnSyncCloudLogs'),
    modalInventory: document.getElementById('modalInventory'),
    modalLeaderboard: document.getElementById('modalLeaderboard'),
    modalSettings: document.getElementById('modalSettings'),
    selectTurnMode: document.getElementById('selectTurnMode'),
    modalBossDetail: document.getElementById('modalBossDetail'),
    modalPracticeLogDetail: document.getElementById('modalPracticeLogDetail'),
    practiceLogDetailContent: document.getElementById('practiceLogDetailContent'),
    btnDownloadPracticeLogReport: document.getElementById('btnDownloadPracticeLogReport'),
    btnDownloadPracticeLogHtml: document.getElementById('btnDownloadPracticeLogHtml'),
    btnCopyPracticeLogText: document.getElementById('btnCopyPracticeLogText'),
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
    document.body.dataset.view = 'map';

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
    updatePracticeLogsNavBadge();
    autoSyncLocalPracticeLogsToBackend();

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
  document.getElementById('btnNavPracticeLogs')?.addEventListener('click', () => openPracticeLogsListModal());
  document.getElementById('btnNavPokedex')?.addEventListener('click', () => openInventoryModal());
  document.getElementById('btnNavLeaderboard')?.addEventListener('click', () => openLeaderboardModal());
  document.getElementById('btnNavSettings')?.addEventListener('click', () => openSettingsModal());
  document.getElementById('playerHud')?.addEventListener('click', () => openSettingsModal());
  elements.btnSyncCloudLogs?.addEventListener('click', () => handleSyncCloudLogs());

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
  elements.btnDownloadChatLive?.addEventListener('click', () => handleDownloadLiveChat());
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
  elements.btnEvalViewVisualReport?.addEventListener('click', () => {
    if (state.lastFinishedLogId) {
      openPracticeLogModal(state.lastFinishedLogId);
    } else {
      const logs = InventoryManager.getPracticeLogs();
      if (logs.length > 0) openPracticeLogModal(logs[0].id);
    }
  });
  elements.btnEvalCopyTranscript?.addEventListener('click', () => handleCopyPracticeLogText(state.lastFinishedLogId));
  elements.btnEvalDownloadHtml?.addEventListener('click', () => exportPracticeLogHtml(state.lastFinishedLogId));
  elements.btnEvalDownloadReport?.addEventListener('click', () => handleDownloadReport());
  elements.btnDownloadBossCardReport?.addEventListener('click', () => handleDownloadBossCardReport());
  elements.btnDownloadPracticeLogReport?.addEventListener('click', () => handleDownloadPracticeLogReport());
  elements.btnDownloadPracticeLogHtml?.addEventListener('click', () => exportPracticeLogHtml(state.currentViewingLogId));
  elements.btnCopyPracticeLogText?.addEventListener('click', () => handleCopyPracticeLogText());

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
  state.currentBattleSessionId = 'live_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

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
  document.body.dataset.view = viewName;
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
  state.currentBattleSessionId = 'live_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

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
async function handleSendMessage(overrideText = null) {
  if (state.isWaitingResponse || !state.selectedBoss) return;
  const inputEl = elements.messageInput;
  const userText = (overrideText !== null ? overrideText : (inputEl?.value || '')).trim();
  if (!userText) return;

  if (overrideText === null && inputEl) {
    inputEl.value = '';
    inputEl.style.height = 'auto';
  }

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
  // 防禦：精準檢查畫面上最後一條使用者發言，若尚未獲得關主回覆且內容相同，避免重試時連續堆疊多個重複氣泡
  const allUserRows = Array.from(elements.chatMessages?.querySelectorAll('.message-row.user') || []);
  const allBossRows = Array.from(elements.chatMessages?.querySelectorAll('.message-row.boss') || []);
  const lastUserRow = allUserRows.length > 0 ? allUserRows[allUserRows.length - 1] : null;
  const lastBossRow = allBossRows.length > 0 ? allBossRows[allBossRows.length - 1] : null;

  let isUnansweredLastUser = false;
  if (lastUserRow) {
    if (!lastBossRow) {
      isUnansweredLastUser = true;
    } else {
      isUnansweredLastUser = (lastBossRow.compareDocumentPosition(lastUserRow) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    }
  }

  const lastUserBubbleText = lastUserRow?.querySelector('.message-bubble')?.textContent?.trim() || '';
  const isDuplicateBubble = isUnansweredLastUser && (lastUserBubbleText === userText);

  // 清除畫面上的錯誤重試列
  elements.chatMessages?.querySelectorAll('.system-error-retry-bar').forEach(el => el.remove());

  if (!isDuplicateBubble) {
    // 確保 state.dialogueHistory 不連續堆疊 user 訊息
    while (state.dialogueHistory.length > 0 && state.dialogueHistory[state.dialogueHistory.length - 1].role === 'user') {
      state.dialogueHistory.pop();
    }
    const userMsg = { role: 'user', content: userText };
    state.dialogueHistory.push(userMsg);
    appendMessageToChat(userMsg);
  } else {
    // 若為重試發送，歷史紀錄確保最後一條為該訊息
    while (state.dialogueHistory.length > 0 && state.dialogueHistory[state.dialogueHistory.length - 1].role === 'user') {
      state.dialogueHistory.pop();
    }
    state.dialogueHistory.push({ role: 'user', content: userText });
  }

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

    if (data.fallbackUsed && data.fallbackInfo) {
      console.log('Dual-Engine Fallback activated:', data.fallbackInfo);
      const toEngine = data.fallbackInfo.to === 'gemini' ? 'Google Gemini' : 'DeepSeek';
      showSystemToast(LangManager.t(`⚡ 備援機制：已自動無縫由 ${toEngine} 引擎接手對話，練習不中斷！`), 3500);
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
    syncLivePracticeSession(state.selectedBoss, state.dialogueHistory);

    // 模式 A 同步競速血條至房間
    if (state.isMultiplayer && state.mpMode === 'pvp_speedrun') {
      MultiplayerManager.syncSpeedrun({
        defenseHp: state.defenseHp,
        turn: state.turnCount
      });
    }

    const turnMode = localStorage.getItem('coachquest_turn_mode') || 'free';
    if (turnMode === '8' && state.turnCount > 8) {
      showSystemToast(LangManager.t('已達 8 回合敏捷目標！關主心防已大幅鬆動，隨時可申請結算收攏！'));
    } else if (turnMode === '15' && state.turnCount > 15) {
      showSystemToast(LangManager.t('已達 15 回合深度會談目標！隨時可點擊「申請結算收攏」！'));
    } else if (state.turnCount === 6) {
      showSystemToast(LangManager.t('💡 關主心防已逐步動搖！隨時可點擊右上角「申請結算」，亦可繼續暢聊探索！'), 4500);
    }

  } catch (err) {
    console.error('對戰通訊失敗:', err);
    appendErrorRetryNotice(err.message, userText);
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

function appendErrorRetryNotice(errorMsg, failedText) {
  // 先清理既有的重試卡片，避免畫面上累積多個重複警示
  elements.chatMessages?.querySelectorAll('.system-error-retry-bar').forEach(el => el.remove());

  const row = document.createElement('div');
  row.className = 'system-notice-bar system-error-retry-bar';
  row.style.background = '#fef2f2';
  row.style.border = '1.5px solid #fca5a5';
  row.style.color = '#991b1b';
  row.style.display = 'flex';
  row.style.flexDirection = 'column';
  row.style.alignItems = 'center';
  row.style.gap = '0.5rem';
  row.style.padding = '0.75rem 1rem';
  row.style.margin = '0.65rem auto';
  row.style.borderRadius = '12px';
  row.style.maxWidth = '90%';

  const isBalanceError = errorMsg && (errorMsg.includes('Insufficient Balance') || errorMsg.includes('餘額不足'));
  const currentModel = getSavedModel();
  const isDeepSeekActive = currentModel.startsWith('deepseek');

  const msgSpan = document.createElement('div');
  msgSpan.style.fontSize = '0.85rem';
  msgSpan.style.lineHeight = '1.45';
  msgSpan.style.textAlign = 'center';

  if (isBalanceError) {
    msgSpan.innerHTML = LangManager.t('⚠️ <b>DeepSeek 帳戶餘額不足</b>：建議一鍵切換至免費穩定的 Google Gemini 引擎繼續挑戰！');
  } else {
    msgSpan.textContent = LangManager.t(`⚠️ 連線短暫不穩定：${errorMsg}`);
  }
  row.appendChild(msgSpan);

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '0.6rem';
  btnRow.style.justifyContent = 'center';
  btnRow.style.flexWrap = 'wrap';

  // 1. 一鍵快速切換備援引擎按鈕 (若 DeepSeek 失敗則切換 Gemini，反之亦然)
  const btnFastSwitch = document.createElement('button');
  btnFastSwitch.className = 'btn btn-primary btn-sm';
  btnFastSwitch.style.padding = '0.3rem 0.85rem';
  btnFastSwitch.style.fontSize = '0.82rem';
  btnFastSwitch.style.background = isDeepSeekActive ? '#2563eb' : '#059669';
  btnFastSwitch.textContent = isDeepSeekActive 
    ? LangManager.t('⚡ 一鍵切換 Gemini 引擎並重發') 
    : LangManager.t('⚡ 一鍵切換 DeepSeek 引擎並重發');
  btnFastSwitch.onclick = () => {
    row.remove();
    const newModel = isDeepSeekActive ? 'gemini-3.5-flash-lite' : 'deepseek-chat';
    localStorage.setItem('coachquest_custom_model', newModel);
    if (elements.selectModel) elements.selectModel.value = newModel;
    showSystemToast(LangManager.t(`已切換為 ${newModel} 引擎，立即重發...`));
    handleSendMessage(failedText);
  };
  btnRow.appendChild(btnFastSwitch);

  // 2. 原模型重試發送按鈕
  if (failedText) {
    const btnRetry = document.createElement('button');
    btnRetry.className = 'btn btn-outline btn-sm';
    btnRetry.style.padding = '0.3rem 0.85rem';
    btnRetry.style.fontSize = '0.82rem';
    btnRetry.textContent = LangManager.t('🔄 點擊重試');
    btnRetry.onclick = () => {
      row.remove();
      handleSendMessage(failedText);
    };
    btnRow.appendChild(btnRetry);
  }

  // 3. 詳細設定按鈕
  const btnSettings = document.createElement('button');
  btnSettings.className = 'btn btn-outline btn-sm';
  btnSettings.style.padding = '0.3rem 0.85rem';
  btnSettings.style.fontSize = '0.82rem';
  btnSettings.textContent = LangManager.t('⚙️ 詳細設定');
  btnSettings.onclick = () => {
    openSettingsModal();
  };
  btnRow.appendChild(btnSettings);

  row.appendChild(btnRow);
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
    const mode = localStorage.getItem('coachquest_turn_mode') || 'free';
    if (mode === '8') {
      elements.battleTurnBadge.textContent = LangManager.t(`第 ${state.turnCount} / 8 回合`);
    } else if (mode === '15') {
      elements.battleTurnBadge.textContent = LangManager.t(`第 ${state.turnCount} / 15 回合`);
    } else {
      elements.battleTurnBadge.textContent = LangManager.t(`第 ${state.turnCount} 回合 (不限回數)`);
    }
  }
  if (elements.btnCapture) {
    elements.btnCapture.disabled = state.dialogueHistory.length < 3;
  }
}

// 暫時撤退
function handleRetreat() {
  if (confirm('確定要暫時撤退回到道館地圖嗎？本次練習進度將不予計分。')) {
    if (state.selectedBoss && state.dialogueHistory && state.dialogueHistory.length > 0) {
      syncLivePracticeSession(state.selectedBoss, state.dialogueHistory, false);
    }
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

  const battleResult = InventoryManager.recordBattleResult(boss, evalData, state.dialogueHistory);
  state.lastFinishedLogId = battleResult.logId;
  updatePracticeLogsNavBadge();
  // 自動非同步上傳實戰練習對話與 ICF 分析至後台雲端
  syncPracticeLogToBackend(boss, evalData, state.dialogueHistory, battleResult.logId);

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
// 教練對話復盤報告匯出與下載 (.md)
// ========================================================
function handleDownloadReport() {
  if (!state.selectedBoss || !state.currentEvaluation) {
    alert('目前尚無結算報告可供下載！');
    return;
  }

  const boss = state.selectedBoss;
  const evaluation = state.currentEvaluation;
  const player = InventoryManager.getPlayerData();
  const rank = InventoryManager.getPlayerRank(player.totalExp);
  const score = Number(evaluation.score) || 0;
  const isCaptured = score >= 70;
  const fwName = (boss.framework && boss.framework.name) || boss.weaknessName || '非暴力溝通';
  const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });

  let md = `# 🎮 CoachQuest 教練實戰對話復盤分析報告\n\n`;
  md += `> **生成時間**：${nowStr}\n`;
  md += `> **挑戰模式**：${state.isMultiplayer ? '👥 多人連線約戰' : '⚔️ 單人道館挑戰'}\n\n`;
  md += `---\n\n`;

  md += `## 📋 挑戰概要資訊\n\n`;
  md += `- **教練冒險者**：${player.avatar} **${player.nickname}**（Lv.${rank.level} ${rank.badge} ${rank.title}）\n`;
  md += `- **挑戰關主**：${boss.avatar} **${boss.name}**（${boss.title}）\n`;
  md += `- **情境設定**：${boss.scenario}\n`;
  md += `- **攻心弱點架構**：${fwName}\n`;
  md += `- **綜合挑戰成績**：**${score} 分**（${isCaptured ? '🔴 成功收攏入百寶箱' : '💨 心防尚未完全突破'}）\n\n`;

  md += `---\n\n`;

  md += `## ✨ 核心成效與教練金句\n\n`;
  md += `### 💬 最精彩的教練金句\n`;
  md += `> 「${evaluation.bestCoachQuote || '你的傾聽給予了對方極大的安全感。'}」\n\n`;

  md += `### 🎯 突破防線關鍵復盤\n`;
  md += `${evaluation.winningReason || '成功識別了關主的真實需求，引導出自我反思。'}\n\n`;

  md += `### 💡 專家指導與後續建議\n`;
  md += `${evaluation.advice || '持續維持開放好奇的態度進行深入提問。'}\n\n`;

  md += `---\n\n`;

  md += `## 📊 ICF 教練核心溝通能力五維度分析\n\n`;
  const dims = evaluation.dimensions || { empathy: 75, listening: 75, questioning: 70, reframing: 70, action_drive: 65 };
  md += `| 評估維度 | 得分 | 能力說明 |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **深度同理心** | **${dims.empathy || 75} 分** | 準確感知情緒，懸置批判並創造心理安全容器 |\n`;
  md += `| **有效傾聽** | **${dims.listening || 75} 分** | 聽出話語背後未滿足的普世心理需求與渴望 |\n`;
  md += `| **提問引導** | **${dims.questioning || 70} 分** | 善用開放式強力問句，促發對方自主思索盲點 |\n`;
  md += `| **視角重構** | **${dims.reframing || 70} 分** | 協助跳脫受害者姿態，重構正向多元可能視角 |\n`;
  md += `| **行動激發** | **${dims.action_drive || 65} 分** | 落地承諾，激勵對方自發邁出第一步具體行動 |\n\n`;

  md += `---\n\n`;

  md += `## 📜 完整對決對話實錄與大師級示範 (Dialogue Transcript & Coaching Suggestions)\n\n`;
  const suggMap = getTurnSuggestionsMap(evaluation);
  if (state.dialogueHistory && state.dialogueHistory.length > 0) {
    let roundIndex = 1;
    for (let i = 0; i < state.dialogueHistory.length; i++) {
      const msg = state.dialogueHistory[i];
      if (msg.role === 'user') {
        md += `### 🔹 回合 ${roundIndex} · 教練提問\n`;
        md += `**${player.avatar} ${player.nickname}**：\n> ${msg.content.replace(/\n/g, '\n> ')}\n\n`;
        const sugg = suggMap[roundIndex] || getFallbackSuggestion(msg.content, roundIndex);
        if (sugg && sugg.betterPhrasing) {
          md += `> 💡 **ICF 大師級教練示範問句**：\n> 「${sugg.betterPhrasing.replace(/^「|」$/g, '')}」\n>\n`;
          if (sugg.rationale) {
            md += `> 🎯 **設計心法與原理**：${sugg.rationale}\n\n`;
          } else {
            md += `\n`;
          }
        }
        roundIndex++;
      } else {
        md += `**${boss.avatar} ${boss.name}**：\n${msg.content}\n\n`;
        if (msg.innerThought) {
          md += `*💭 關主潛意識心聲：${msg.innerThought}*\n\n`;
        }
      }
    }
  } else {
    md += `*（無對話歷史記錄）*\n\n`;
  }

  md += `---\n\n`;
  md += `*本報告由 CoachQuest (教練大冒險) 遊戲化培訓系統自動生成 · https://coachquest.coachsunny.workers.dev*\n`;

  downloadMarkdownFile(md, `CoachQuest_教練復盤_${boss.name}_${player.nickname}`);
}

// 下載百寶箱已解鎖關主的心得卡報告 (.md)
function handleDownloadBossCardReport() {
  const bossId = state.currentViewingBossId;
  if (!bossId) return;

  const boss = getBossById(bossId);
  const detail = InventoryManager.getCaptureDetail(bossId);
  if (!boss || !detail) {
    alert('該關主尚未解鎖心得卡！');
    return;
  }

  const player = InventoryManager.getPlayerData();
  const fwName = (boss.framework && boss.framework.name) || boss.weaknessName || '非暴力溝通';

  let md = `# 🎒 CoachQuest 關主教練心得卡與對話實錄 · 【${boss.name}】\n\n`;
  md += `- **收攏教練**：${player.avatar} **${player.nickname}**\n`;
  md += `- **關主身份**：${boss.avatar} ${boss.name} · ${boss.title}\n`;
  md += `- **突破心法**：${fwName}\n`;
  md += `- **歷史最高通關分**：**${detail.highestScore} 分**\n`;
  md += `- **收攏次數**：${detail.captureCount || 1} 次\n`;
  md += `- **首次收攏時間**：${detail.firstCapturedAt ? new Date(detail.firstCapturedAt).toLocaleDateString() : '歷史存檔'}\n\n`;

  md += `---\n\n`;
  md += `## ✨ 破心教練金句\n`;
  md += `> 「${detail.bestCoachQuote || '深刻的同理觸動人心。'}」\n\n`;

  md += `## 🎯 突破防線關鍵復盤\n`;
  md += `${detail.winningReason || '成功識別了關主的真實需求，引導出自我反思。'}\n\n`;

  md += `## 📊 掌握之五大溝通維度得分\n\n`;
  const dims = detail.dimensionScores || {};
  md += `- 深度同理心：**${dims.empathy || 80} 分**\n`;
  md += `- 有效傾聽：**${dims.listening || 80} 分**\n`;
  md += `- 提問引導：**${dims.questioning || 75} 分**\n`;
  md += `- 視角重構：**${dims.reframing || 75} 分**\n`;
  md += `- 行動激發：**${dims.action_drive || 70} 分**\n\n`;

  if (detail.dialogueHistory && detail.dialogueHistory.length > 0) {
    md += `---\n\n## 📜 完整破心對決對話實錄 (Dialogue Transcript)\n\n`;
    let roundIndex = 1;
    for (let i = 0; i < detail.dialogueHistory.length; i++) {
      const msg = detail.dialogueHistory[i];
      if (msg.role === 'user') {
        md += `### 🔹 回合 ${roundIndex} · 教練提問\n`;
        md += `**${player.avatar} ${player.nickname}**：\n> ${msg.content.replace(/\n/g, '\n> ')}\n\n`;
        roundIndex++;
      } else {
        md += `**${boss.avatar} ${boss.name}**：\n${msg.content}\n\n`;
        if (msg.innerThought) {
          md += `*💭 關主潛意識心聲：${msg.innerThought}*\n\n`;
        }
      }
    }
  }

  md += `---\n*CoachQuest 百寶箱圖鑑 · https://coachquest.coachsunny.workers.dev*\n`;

  downloadMarkdownFile(md, `CoachQuest_心得卡與對話實錄_${boss.name}_${player.nickname}`);
}

// 即時下載對決中的對話實錄 (.md)
function handleDownloadLiveChat() {
  if (!state.selectedBoss || !state.dialogueHistory || state.dialogueHistory.length === 0) {
    alert('目前尚無對話記錄，請先與關主進行對話交流！');
    return;
  }

  const boss = state.selectedBoss;
  const player = InventoryManager.getPlayerData();
  const rank = InventoryManager.getPlayerRank(player.totalExp);
  const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
  const fwName = (boss.framework && boss.framework.name) || boss.weaknessName || '非暴力溝通';

  let md = `# 💬 CoachQuest 教練實戰即時對話練習實錄\n\n`;
  md += `> **記錄時間**：${nowStr}\n`;
  md += `> **挑戰模式**：${state.isMultiplayer ? '👥 多人連線約戰' : '⚔️ 單人道館挑戰'}\n`;
  md += `> **教練學員**：${player.avatar} **${player.nickname}**（Lv.${rank.level} ${rank.badge} ${rank.title}）\n`;
  md += `> **對決關主**：${boss.avatar} **${boss.name}**（${boss.title}）\n`;
  md += `> **情境設定**：${boss.scenario}\n`;
  md += `> **攻心架構**：${fwName}\n`;
  md += `> **當前心防生命**：${state.defenseHp}%\n`;
  md += `> **進行回合數**：第 ${state.turnCount} 回合（共 ${state.dialogueHistory.length} 則對話）\n\n`;
  md += `---\n\n`;

  md += `## 📜 完整對決即時對話實錄 (Live Transcript)\n\n`;
  let roundIndex = 1;
  for (let i = 0; i < state.dialogueHistory.length; i++) {
    const msg = state.dialogueHistory[i];
    if (msg.role === 'user') {
      md += `### 🔹 回合 ${roundIndex} · 教練提問\n`;
      md += `**${player.avatar} ${player.nickname}**：\n> ${msg.content.replace(/\n/g, '\n> ')}\n\n`;
      roundIndex++;
    } else {
      md += `**${boss.avatar} ${boss.name}**：\n${msg.content}\n\n`;
      if (msg.innerThought) {
        md += `*💭 關主潛意識心聲：${msg.innerThought}*\n\n`;
      }
    }
  }

  md += `---\n*CoachQuest (教練大冒險) · https://coachquest.coachsunny.workers.dev*\n`;
  downloadMarkdownFile(md, `CoachQuest_即時對話_${boss.name}_${player.nickname}`);
}

// ========================================================
// 輔助函式：提取或合成 ICF 大師級教練每句示範問句與心法
// ========================================================
function getTurnSuggestionsMap(logOrEval) {
  const map = {};
  if (!logOrEval) return map;

  const rawList = Array.isArray(logOrEval.turnSuggestions)
    ? logOrEval.turnSuggestions
    : (logOrEval.evaluation && Array.isArray(logOrEval.evaluation.turnSuggestions)
        ? logOrEval.evaluation.turnSuggestions
        : []);

  rawList.forEach((item, idx) => {
    if (!item) return;
    const turnKey = Number(item.turn) || (idx + 1);
    map[turnKey] = {
      turn: turnKey,
      userOriginal: item.userOriginal || '',
      betterPhrasing: item.betterPhrasing || '',
      rationale: item.rationale || ''
    };
  });

  return map;
}

function getFallbackSuggestion(userContent, turnNum) {
  const text = (userContent || '').trim();
  if (text.includes('為什麼') || text.includes('怎么') || text.includes('為何')) {
    return {
      turn: turnNum,
      betterPhrasing: '「聽到你這麼說，我能感受到這對你非常重要。想邀請你聊聊，當這個情況發生時，你心中最在意或渴望的是什麼？」',
      rationale: 'ICF 提問原則：將質問性質的『為什麼』轉換為中立且安全的『什麼』，引導學員從防衛轉向探索內心最看重的價值。'
    };
  }
  if (!text.includes('？') && !text.includes('?')) {
    return {
      turn: turnNum,
      betterPhrasing: '「我聽見了你在這個過程中的付出與不容易。如果我們退一步來看，這份挑戰背後，你最希望看見什麼樣的轉機？」',
      rationale: 'ICF 傾聽原則：給予肯定並懸置給建議的衝動，透過強有力開放問句，把思維焦點交還給對方自主探索。'
    };
  }
  if (text.length < 10) {
    return {
      turn: turnNum,
      betterPhrasing: '「請多和我說說那種感覺？如果給這個感受一個名字，它會是什麼？」',
      rationale: 'ICF 探索原則：透過隱喻與深入追問，引導當事人具象化內在體驗，創造覺察空間。'
    };
  }
  return {
    turn: turnNum,
    betterPhrasing: '「這是一個很有深度的切入點。除了剛才提到的，還有哪些可能性或未被注意到的盲點，是如果現在被看見會對你帶來最大突破的？」',
    rationale: 'ICF 視角重構：擴大對方的覺察範圍，促使當事人跳脫既有慣性框架，看見更廣闊的潛力空間。'
  };
}

// 匯出純原生自包含之 HTML 報告檔案 (專為手機學員瀏覽體驗設計，無需任何閱讀器即可直接開啟)
function downloadHtmlFile(content, baseName) {
  let downloadTriggered = false;
  try {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = baseName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `${cleanName}_${dateStr}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    downloadTriggered = true;
  } catch (e) {
    console.warn('HTML 原生下載失敗:', e);
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Line|MicroMessenger/i.test(navigator.userAgent);
  if (isMobile) {
    showSystemToast('🌐 手機網頁版報告已匯出！可直接以手機瀏覽器開啟檢視，排版清晰美觀！');
  } else {
    showSystemToast(downloadTriggered ? '🌐 手機網頁版 (.html) 已下載完成！' : '匯出完成');
  }
}

// 下載任一次練習紀錄報告 (.md)
function handleDownloadPracticeLogReport(targetLogId = null) {
  const logId = targetLogId || state.currentViewingLogId || state.lastFinishedLogId;
  let log = logId ? InventoryManager.getPracticeLogById(logId) : null;
  if (!log) {
    const logs = InventoryManager.getPracticeLogs();
    if (logs.length > 0) log = logs[0];
  }
  if (!log) {
    alert('找不到該場練習紀錄！');
    return;
  }

  const player = InventoryManager.getPlayerData();
  const dateStr = new Date(log.date).toLocaleString('zh-TW', { hour12: false });
  const isCaptured = log.isCaptured || (Number(log.score) >= 70);
  const suggMap = getTurnSuggestionsMap(log);

  let md = `# 🎮 CoachQuest 教練實戰對話練習復盤報告\n\n`;
  md += `> **練習時間**：${dateStr}\n`;
  md += `> **關卡對象**：${log.bossAvatar} **${log.bossName}**（${log.bossTitle || ''}）\n`;
  md += `> **教練學員**：${player.avatar} **${player.nickname}**\n`;
  md += `> **綜合評分**：**${log.score} 分**（${isCaptured ? '🔴 成功突破收攏' : '💨 心防尚未突破'}）\n`;
  md += `> **互動回合**：共 ${log.turns || 1} 回合\n\n`;
  md += `---\n\n`;

  if (log.bestCoachQuote) {
    md += `## ✨ 精彩教練金句\n`;
    md += `> 「${log.bestCoachQuote}」\n\n`;
  }

  if (log.winningReason) {
    md += `## 🎯 突破防線關鍵復盤\n`;
    md += `${log.winningReason}\n\n`;
  }

  if (log.advice) {
    md += `## 💡 專家指導與調整建議\n`;
    md += `${log.advice}\n\n`;
  }

  if (log.dimensionScores && Object.keys(log.dimensionScores).length > 0) {
    const dims = log.dimensionScores;
    md += `---\n\n## 📊 ICF 教練核心溝通能力五維度分析\n\n`;
    md += `| 評估維度 | 得分 |\n| :--- | :--- |\n`;
    md += `| 深度同理心 | **${dims.empathy || 75} 分** |\n`;
    md += `| 有效傾聽 | **${dims.listening || 75} 分** |\n`;
    md += `| 提問引導 | **${dims.questioning || 70} 分** |\n`;
    md += `| 視角重構 | **${dims.reframing || 70} 分** |\n`;
    md += `| 行動激發 | **${dims.action_drive || 65} 分** |\n\n`;
  }

  md += `---\n\n## 📜 完整對話練習逐字稿與大師級示範 (Dialogue Transcript & Coaching Suggestions)\n\n`;
  if (log.dialogueHistory && log.dialogueHistory.length > 0) {
    let roundIndex = 1;
    for (let i = 0; i < log.dialogueHistory.length; i++) {
      const msg = log.dialogueHistory[i];
      if (msg.role === 'user') {
        md += `### 🔹 回合 ${roundIndex} · 教練提問\n`;
        md += `**${player.avatar} ${player.nickname}**：\n> ${msg.content.replace(/\n/g, '\n> ')}\n\n`;
        const sugg = suggMap[roundIndex] || getFallbackSuggestion(msg.content, roundIndex);
        if (sugg && sugg.betterPhrasing) {
          md += `> 💡 **ICF 大師級示範問句**：\n> 「${sugg.betterPhrasing.replace(/^「|」$/g, '')}」\n>\n`;
          if (sugg.rationale) {
            md += `> 🎯 **設計心法與原理**：${sugg.rationale}\n\n`;
          } else {
            md += `\n`;
          }
        }
        roundIndex++;
      } else {
        md += `**${log.bossAvatar} ${log.bossName}**：\n${msg.content}\n\n`;
        if (msg.innerThought) {
          md += `*💭 關主潛意識心聲：${msg.innerThought}*\n\n`;
        }
      }
    }
  } else {
    md += `*（無對話歷史記錄）*\n\n`;
  }

  md += `---\n*CoachQuest (教練大冒險) · https://coachquest.coachsunny.workers.dev*\n`;
  downloadMarkdownFile(md, `CoachQuest_練習復盤_${log.bossName}_${player.nickname}`);
}

// 複製當前練習紀錄逐字稿全文至剪貼簿 (專為手機無法下載檔案之學員設計，含大師示範)
function handleCopyPracticeLogText(targetLogId = null) {
  const logId = targetLogId || state.currentViewingLogId || state.lastFinishedLogId;
  let log = logId ? InventoryManager.getPracticeLogById(logId) : null;
  if (!log) {
    const logs = InventoryManager.getPracticeLogs();
    if (logs.length > 0) log = logs[0];
  }
  if (!log) {
    showSystemToast('找不到該筆對話紀錄');
    return;
  }

  const player = InventoryManager.getPlayerData();
  const dateStr = new Date(log.date).toLocaleString('zh-TW', { hour12: false });
  const dims = log.dimensionScores || {};
  const suggMap = getTurnSuggestionsMap(log);

  let text = `【CoachQuest 教練對話實戰練習實錄】\n`;
  text += `學員教練：${player.nickname || '冒險者'} (${player.avatar})\n`;
  text += `對決關主：${log.bossName} (${log.bossTitle || ''})\n`;
  text += `練習時間：${dateStr}\n`;
  text += `綜合評分：${log.score} 分 (${(log.isCaptured || Number(log.score) >= 70) ? '成功收攏' : '心防未破'})\n`;
  text += `互動回合：共 ${log.turns || 1} 回合\n`;
  if (log.bestCoachQuote) text += `\n✨ 破心教練金句：「${log.bestCoachQuote}」\n`;
  if (log.winningReason) text += `🎯 突破關鍵復盤：${log.winningReason}\n`;
  if (log.advice) text += `💡 導師調整建議：${log.advice}\n`;
  text += `\n📊 ICF 五大核心能力維度：\n`;
  text += `- 深度同理：${dims.empathy || 75} 分\n`;
  text += `- 有效傾聽：${dims.listening || 75} 分\n`;
  text += `- 提問引導：${dims.questioning || 70} 分\n`;
  text += `- 視角重構：${dims.reframing || 70} 分\n`;
  text += `- 行動激發：${dims.action_drive || 65} 分\n`;
  text += `\n📜 完整對話逐字稿與大師級示範問句：\n`;

  if (log.dialogueHistory && log.dialogueHistory.length > 0) {
    let round = 1;
    for (const msg of log.dialogueHistory) {
      if (msg.role === 'user') {
        text += `\n[回合 ${round}] 教練：\n${msg.content}\n`;
        const sugg = suggMap[round] || getFallbackSuggestion(msg.content, round);
        if (sugg && sugg.betterPhrasing) {
          text += `  💡 大師示範：${sugg.betterPhrasing}\n`;
          if (sugg.rationale) {
            text += `  🎯 設計心法：${sugg.rationale}\n`;
          }
        }
        round++;
      } else {
        text += `\n[關主] ${log.bossName}：\n${msg.content}\n`;
        if (msg.innerThought) {
          text += `  💭 關主心聲：${msg.innerThought}\n`;
        }
      }
    }
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showSystemToast('📋 逐字稿全文與大師示範已複製到剪貼簿！可直接貼至 LINE、微信或備忘錄！');
    }).catch(() => {
      copyFallbackText(text);
    });
  } else {
    copyFallbackText(text);
  }
}

function copyFallbackText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showSystemToast('📋 逐字稿全文已複製！可直接至通訊軟體貼上！');
  } catch (_) {
    prompt('請複製以下對話逐字稿：', text);
  }
  document.body.removeChild(ta);
}

// 匯出自包含且具備優美排版的手機網頁報告 (.html)
function exportPracticeLogHtml(targetLogId = null) {
  const logId = targetLogId || state.currentViewingLogId || state.lastFinishedLogId;
  let log = logId ? InventoryManager.getPracticeLogById(logId) : null;
  if (!log) {
    const logs = InventoryManager.getPracticeLogs();
    if (logs.length > 0) log = logs[0];
  }
  if (!log) {
    showSystemToast('找不到該筆對話紀錄');
    return;
  }

  const player = InventoryManager.getPlayerData();
  const dateStr = new Date(log.date).toLocaleString('zh-TW', { hour12: false });
  const isCaptured = log.isCaptured || (Number(log.score) >= 70);
  const dims = log.dimensionScores || {};
  const suggMap = getTurnSuggestionsMap(log);

  let dialogueHtml = '';
  if (log.dialogueHistory && log.dialogueHistory.length > 0) {
    let roundIndex = 1;
    dialogueHtml = log.dialogueHistory.map(msg => {
      if (msg.role === 'user') {
        const sugg = suggMap[roundIndex] || getFallbackSuggestion(msg.content, roundIndex);
        const itemHtml = `
          <div class="chat-turn user-turn">
            <div class="turn-meta">${escapeHtml(player.avatar || '🧙‍♂️')} <b>${escapeHtml(player.nickname || '學員教練')}</b> · 第 ${roundIndex} 回合</div>
            <div class="turn-bubble user-bubble">${escapeHtml(msg.content)}</div>
            ${sugg ? `
              <div class="suggestion-card">
                <div class="sugg-badge">💡 ICF 大師級示範問句</div>
                <div class="sugg-body">${escapeHtml(sugg.betterPhrasing)}</div>
                ${sugg.rationale ? `<div class="sugg-sub">🎯 <b>設計原理：</b>${escapeHtml(sugg.rationale)}</div>` : ''}
              </div>
            ` : ''}
          </div>
        `;
        roundIndex++;
        return itemHtml;
      } else {
        return `
          <div class="chat-turn boss-turn">
            <div class="turn-meta">${escapeHtml(log.bossAvatar || '👤')} <b>${escapeHtml(log.bossName || '關主')}</b></div>
            <div class="turn-bubble boss-bubble">${escapeHtml(msg.content)}</div>
            ${msg.innerThought ? `<div class="boss-thought">💭 關主心聲：${escapeHtml(msg.innerThought)}</div>` : ''}
          </div>
        `;
      }
    }).join('');
  } else {
    dialogueHtml = '<div style="color:#94a3b8; padding:1rem; text-align:center;">無對話記錄</div>';
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CoachQuest 教練對話實戰復盤報告 · ${escapeHtml(log.bossName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", "Microsoft JhengHei", sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      line-height: 1.6;
      padding: 12px;
    }
    .container {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .header-banner {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%);
      color: #ffffff;
      padding: 1.5rem 1.25rem;
    }
    .badge-status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      background: ${isCaptured ? '#22c55e' : '#f59e0b'};
      color: #ffffff;
      margin-bottom: 0.6rem;
    }
    .header-title {
      font-size: 1.35rem;
      font-weight: 800;
      margin-bottom: 0.3rem;
    }
    .header-meta {
      font-size: 0.85rem;
      opacity: 0.85;
    }
    .stat-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      padding: 1rem 1.25rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      text-align: center;
    }
    .stat-val {
      font-size: 1.2rem;
      font-weight: 800;
      color: #4338ca;
    }
    .stat-lbl {
      font-size: 0.75rem;
      color: #64748b;
    }
    .section {
      padding: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .quote-box {
      background: #fefce8;
      border-left: 4px solid #eab308;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-style: italic;
      color: #854d0e;
      font-weight: 600;
    }
    .text-box {
      background: #f8fafc;
      border-radius: 8px;
      padding: 0.85rem 1rem;
      font-size: 0.9rem;
      color: #334155;
    }
    .dim-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.4rem;
    }
    .dim-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .dim-val {
      font-weight: 700;
      color: #4338ca;
    }
    .chat-turn {
      margin-bottom: 1rem;
    }
    .turn-meta {
      font-size: 0.78rem;
      color: #64748b;
      margin-bottom: 0.25rem;
    }
    .turn-bubble {
      padding: 0.75rem 0.9rem;
      border-radius: 12px;
      font-size: 0.92rem;
      line-height: 1.5;
    }
    .user-bubble {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      color: #064e3b;
    }
    .boss-bubble {
      background: #f8fafc;
      border-left: 4px solid #6366f1;
      color: #1e1b4b;
    }
    .boss-thought {
      display: inline-block;
      margin-top: 0.35rem;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      color: #b45309;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      font-size: 0.78rem;
    }
    .suggestion-card {
      margin-top: 0.45rem;
      background: #fffdf5;
      border: 1px solid #fde68a;
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
    }
    .sugg-badge {
      font-size: 0.76rem;
      font-weight: 700;
      color: #b45309;
      margin-bottom: 0.25rem;
    }
    .sugg-body {
      font-size: 0.88rem;
      font-weight: 600;
      color: #78350f;
      line-height: 1.45;
      margin-bottom: 0.25rem;
    }
    .sugg-sub {
      font-size: 0.78rem;
      color: #92400e;
      line-height: 1.4;
      opacity: 0.9;
    }
    .footer {
      padding: 1.25rem;
      text-align: center;
      font-size: 0.75rem;
      color: #94a3b8;
      background: #f8fafc;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .container { box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-banner">
      <span class="badge-status">${isCaptured ? '🎉 成功收攏突破' : '💨 心防尚未突破'}</span>
      <h1 class="header-title">${escapeHtml(log.bossAvatar || '👤')} ${escapeHtml(log.bossName || '關主')} · ${escapeHtml(log.bossTitle || '')}</h1>
      <div class="header-meta">
        學員教練：${escapeHtml(player.avatar || '🧙‍♂️')} ${escapeHtml(player.nickname || '冒險者')} ｜ 練習時間：${dateStr}
      </div>
    </div>

    <div class="stat-row">
      <div>
        <div class="stat-val">${log.score || 0} 分</div>
        <div class="stat-lbl">綜合評分</div>
      </div>
      <div>
        <div class="stat-val">${log.turns || 1} 回合</div>
        <div class="stat-lbl">對話輪數</div>
      </div>
      <div>
        <div class="stat-val">${isCaptured ? '已通關' : '待精進'}</div>
        <div class="stat-lbl">闖關成果</div>
      </div>
    </div>

    ${log.bestCoachQuote ? `
      <div class="section">
        <div class="section-title">✨ 最精彩的教練金句</div>
        <div class="quote-box">「${escapeHtml(log.bestCoachQuote)}」</div>
      </div>
    ` : ''}

    ${log.winningReason ? `
      <div class="section">
        <div class="section-title">🎯 突破防線關鍵復盤</div>
        <div class="text-box">${escapeHtml(log.winningReason)}</div>
      </div>
    ` : ''}

    ${log.advice ? `
      <div class="section">
        <div class="section-title">💡 專家指導與調整建議</div>
        <div class="text-box">${escapeHtml(log.advice)}</div>
      </div>
    ` : ''}

    <div class="section">
      <div class="section-title">📊 ICF 教練核心溝通五維度分析</div>
      <div class="dim-grid">
        <div class="dim-item"><span>深度同理心</span><span class="dim-val">${dims.empathy || 75} 分</span></div>
        <div class="dim-item"><span>有效傾聽</span><span class="dim-val">${dims.listening || 75} 分</span></div>
        <div class="dim-item"><span>提問引導</span><span class="dim-val">${dims.questioning || 70} 分</span></div>
        <div class="dim-item"><span>視角重構</span><span class="dim-val">${dims.reframing || 70} 分</span></div>
        <div class="dim-item"><span>行動激發</span><span class="dim-val">${dims.action_drive || 65} 分</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📜 完整對決實錄與大師示範問句 (共 ${log.turns || 1} 回合)</div>
      <div class="dialogue-list">
        ${dialogueHtml}
      </div>
    </div>

    <div class="footer">
      CoachQuest (教練大冒險) · 專為教練打造的對話實戰模擬系統<br>
      https://coachquest.coachsunny.workers.dev
    </div>
  </div>
</body>
</html>`;

  downloadHtmlFile(fullHtml, `CoachQuest_復盤報告_${log.bossName}_${player.nickname}`);
}

// 更新導航列紀錄筆數徽章
function updatePracticeLogsNavBadge() {
  const logs = InventoryManager.getPracticeLogs();
  const count = logs ? logs.length : 0;
  if (elements.navPracticeLogCount) {
    elements.navPracticeLogCount.textContent = count;
    elements.navPracticeLogCount.style.display = count > 0 ? 'inline-block' : 'none';
  }
  if (elements.practiceLogsTotalBadge) {
    elements.practiceLogsTotalBadge.textContent = `${count} 筆`;
  }
}

// 開啟學員實戰練習紀錄中心 Modal
function openPracticeLogsListModal() {
  const logs = InventoryManager.getPracticeLogs();
  const total = logs.length;
  const captured = logs.filter(l => l.isCaptured || (Number(l.score) >= 70)).length;
  const avg = total > 0 ? Math.round(logs.reduce((sum, l) => sum + (Number(l.score) || 0), 0) / total) : 0;

  if (elements.practiceLogsTotalBadge) elements.practiceLogsTotalBadge.textContent = `${total} 筆`;
  if (elements.summaryPracticeTotal) elements.summaryPracticeTotal.textContent = total;
  if (elements.summaryPracticeCaptured) elements.summaryPracticeCaptured.textContent = captured;
  if (elements.summaryPracticeAvg) elements.summaryPracticeAvg.textContent = `${avg} 分`;

  renderPracticeLogsListItems(logs);

  elements.modalPracticeLogsList?.classList.remove('hidden');
  if (LangManager.getLang() === 'zh-CN' && elements.modalPracticeLogsList) {
    LangManager.translateDOM(elements.modalPracticeLogsList);
  }
}

// 渲染學員練習紀錄列表項目
function renderPracticeLogsListItems(logs) {
  const container = elements.practiceLogsListContainer;
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: #94a3b8;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📜</div>
        <div style="font-weight: 600; color: #475569; margin-bottom: 0.3rem;">目前尚無練習紀錄</div>
        <p style="font-size: 0.85rem;">前往四大道館選擇關主進行對決，結算後將自動在此留存完整對話與大師示範！</p>
      </div>
    `;
    return;
  }

  container.innerHTML = logs.map(log => {
    const isPassed = log.isCaptured || (Number(log.score) >= 70);
    const dateStr = log.date ? new Date(log.date).toLocaleString('zh-TW', { hour12: false }) : '歷史紀錄';
    const turns = log.turns || (Array.isArray(log.dialogueHistory) ? log.dialogueHistory.filter(m => m.role === 'user').length : 1);
    const score = Number(log.score) || 0;

    return `
      <div class="practice-log-card" data-log-id="${log.id}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.6rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.8rem; line-height:1;">${escapeHtml(log.bossAvatar || '👤')}</span>
            <div>
              <div style="font-weight:700; color:#0f172a; font-size:1rem;">
                ${escapeHtml(log.bossName || '關主')}
                <span style="font-size:0.75rem; color:#64748b; font-weight:normal; margin-left:0.3rem;">${escapeHtml(log.bossTitle || '')}</span>
              </div>
              <div style="font-size:0.75rem; color:#94a3b8;">${dateStr} · 共 ${turns} 回合</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <span style="font-size:1.1rem; font-weight:800; color:${isPassed ? '#16a34a' : '#d97706'};">
              ${score} 分
            </span>
            <span style="font-size:0.72rem; padding:2px 8px; border-radius:99px; font-weight:700; background:${isPassed ? '#dcfce7' : '#fef3c7'}; color:${isPassed ? '#15803d' : '#b45309'};">
              ${isPassed ? '突破收攏' : '心防未破'}
            </span>
          </div>
        </div>

        ${log.bestCoachQuote ? `
          <div style="font-size:0.82rem; color:#475569; background:#f8fafc; border-left:3px solid #6366f1; padding:0.4rem 0.6rem; border-radius:4px; margin-bottom:0.7rem; font-style:italic;">
            「${escapeHtml(log.bestCoachQuote)}」
          </div>
        ` : ''}

        <div style="display:flex; justify-content:flex-end; gap:0.4rem; flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm btn-view-log" data-id="${log.id}" style="font-size:0.78rem; padding:0.3rem 0.65rem;">
            👁️ 在線查看
          </button>
          <button class="btn btn-outline btn-sm btn-copy-log" data-id="${log.id}" style="font-size:0.78rem; padding:0.3rem 0.65rem; border-color:#059669; color:#059669;">
            📋 複製逐字稿
          </button>
          <button class="btn btn-outline btn-sm btn-html-log" data-id="${log.id}" style="font-size:0.78rem; padding:0.3rem 0.65rem; border-color:#2563eb; color:#2563eb;">
            🌐 匯出 HTML
          </button>
          <button class="btn btn-outline btn-sm btn-md-log" data-id="${log.id}" style="font-size:0.78rem; padding:0.3rem 0.65rem; border-color:#64748b; color:#475569;">
            📥 MD
          </button>
        </div>
      </div>
    `;
  }).join('');

  // 綁定卡片按鈕事件
  container.querySelectorAll('.btn-view-log').forEach(b => {
    b.addEventListener('click', () => openPracticeLogModal(b.getAttribute('data-id')));
  });
  container.querySelectorAll('.btn-copy-log').forEach(b => {
    b.addEventListener('click', () => handleCopyPracticeLogText(b.getAttribute('data-id')));
  });
  container.querySelectorAll('.btn-html-log').forEach(b => {
    b.addEventListener('click', () => exportPracticeLogHtml(b.getAttribute('data-id')));
  });
  container.querySelectorAll('.btn-md-log').forEach(b => {
    b.addEventListener('click', () => handleDownloadPracticeLogReport(b.getAttribute('data-id')));
  });
}

// 學員主動自雲端拉取歷史紀錄並合併至本地
async function handleSyncCloudLogs() {
  const player = InventoryManager.getPlayerData();
  const nickname = (player && player.nickname) ? player.nickname.trim() : '';
  if (!nickname) {
    showSystemToast('請先於設定中設置您的學員教練稱號！');
    return;
  }

  if (elements.btnSyncCloudLogs) {
    elements.btnSyncCloudLogs.disabled = true;
    elements.btnSyncCloudLogs.textContent = '⏳ 同步中...';
  }

  try {
    const res = await fetch(`/api/practice-logs/student?name=${encodeURIComponent(nickname)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.ok && Array.isArray(data.logs)) {
      InventoryManager.mergeCloudPracticeLogs(data.logs);
      updatePracticeLogsNavBadge();
      const currentLogs = InventoryManager.getPracticeLogs();
      renderPracticeLogsListItems(currentLogs);
      showSystemToast(`☁️ 雲端同步完成！成功載入 ${data.logs.length} 筆歷史實戰紀錄。`);
    } else {
      showSystemToast('雲端目前尚無更早的實戰紀錄。');
    }
  } catch (err) {
    console.warn('雲端同步失敗:', err);
    showSystemToast('雲端同步提醒：暫時無法連線至雲端紀錄庫。');
  } finally {
    if (elements.btnSyncCloudLogs) {
      elements.btnSyncCloudLogs.disabled = false;
      elements.btnSyncCloudLogs.textContent = '☁️ 同步雲端歷史紀錄';
    }
  }
}

// 自動將實戰練習紀錄非同步同步至雲端後台
async function syncPracticeLogToBackend(boss, evalData, dialogueHistory, logId) {
  try {
    const player = InventoryManager.getPlayerData();
    const cleanDialogue = Array.isArray(dialogueHistory) ? JSON.parse(JSON.stringify(dialogueHistory)) : [];
    const payload = {
      id: logId,
      studentName: player.nickname || '冒險者教練',
      studentAvatar: player.avatar || '🧙‍♂️',
      bossId: boss.id,
      bossName: boss.name,
      bossAvatar: boss.avatar,
      bossTitle: boss.title,
      category: boss.category,
      score: Number(evalData.score) || 0,
      isCaptured: Number(evalData.score) >= 70,
      turns: cleanDialogue.filter(m => m.role === 'user').length,
      bestCoachQuote: evalData.bestCoachQuote || '',
      winningReason: evalData.winningReason || '',
      advice: evalData.advice || '',
      dimensions: evalData.dimensions || {},
      dialogueHistory: cleanDialogue,
      turnSuggestions: Array.isArray(evalData.turnSuggestions) ? evalData.turnSuggestions : []
    };

    const res = await fetch('/api/practice-logs/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log('✅ 實戰練習紀錄已成功留存於雲端後台！');
      return true;
    }
  } catch (err) {
    console.warn('雲端備援同步提醒 (離線或暫時無法連線):', err);
  }
  return false;
}

// 進行中實戰對話每回合即時自動同步至後台 (防中途關閉或離線未結算)
async function syncLivePracticeSession(boss, dialogueHistory, isFinished = false) {
  if (!boss || !Array.isArray(dialogueHistory) || dialogueHistory.length === 0) return;
  try {
    const player = InventoryManager.getPlayerData();
    const cleanDialogue = JSON.parse(JSON.stringify(dialogueHistory));
    if (!state.currentBattleSessionId) {
      state.currentBattleSessionId = 'live_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }

    const payload = {
      sessionId: state.currentBattleSessionId,
      studentName: player.nickname || '冒險者教練',
      studentAvatar: player.avatar || '🧙‍♂️',
      bossId: boss.id,
      bossName: boss.name,
      bossAvatar: boss.avatar,
      bossTitle: boss.title,
      category: boss.category,
      score: isFinished ? (state.currentEvaluation?.score || 0) : 0,
      isCaptured: isFinished ? (Number(state.currentEvaluation?.score) >= 70) : false,
      isFinished: isFinished,
      turns: cleanDialogue.filter(m => m.role === 'user').length,
      dialogueHistory: cleanDialogue
    };

    fetch('/api/practice-logs/live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (_) {}
}

// 開啟應用或恢復連線時，自動批次補傳本地未同步之歷史紀錄
async function autoSyncLocalPracticeLogsToBackend() {
  try {
    const logs = InventoryManager.getPracticeLogs();
    const player = InventoryManager.getPlayerData();
    if (!logs || logs.length === 0) return;

    fetch('/api/practice-logs/batch-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: player.nickname || '冒險者教練',
        studentAvatar: player.avatar || '🧙‍♂️',
        logs: logs
      })
    }).then(r => r.json()).then(data => {
      if (data.ok) {
        console.log(`☁️ 雲端背景已自動同步 ${data.synced || logs.length} 筆實戰紀錄`);
      }
    }).catch(err => {
      console.warn('雲端背景同步未就緒:', err);
    });
  } catch (_) {}
}

function downloadMarkdownFile(content, baseName) {
  let downloadTriggered = false;
  try {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = baseName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `${cleanName}_${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    downloadTriggered = true;
  } catch (e) {
    console.warn('瀏覽器原生下載失敗:', e);
  }

  // 手機環境 (iOS/Android/LINE/WeChat) 自動同步複製至剪貼簿作為安全備援
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Line|MicroMessenger/i.test(navigator.userAgent);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(content).then(() => {
      if (isMobile) {
        showSystemToast('📥 報告已嘗試下載！若手機阻擋存檔，全文已為您同步複製到剪貼簿，可直接至 LINE 貼上！');
      } else {
        showSystemToast('📥 報告已下載完成！(全文已同步複製至剪貼簿)');
      }
    }).catch(() => {
      showSystemToast(downloadTriggered ? '📥 報告已下載完成！' : '手機若無法下載，請使用「複製逐字稿」按鈕！');
    });
  } else {
    showSystemToast(downloadTriggered ? '📥 報告已下載完成！' : '手機若無法下載，請使用「複製逐字稿」按鈕！');
  }
}

// ========================================================
// 百寶箱圖鑑儀表板 (Treasure Box / Pokédex Modal)
// ========================================================
export function openInventoryModal() {
  const stats = InventoryManager.getStatistics(BOSSES);
  const practiceLogs = InventoryManager.getPracticeLogs();

  if (elements.invTotalCaptured) elements.invTotalCaptured.textContent = `${stats.totalCaptured} / ${stats.totalAvailable}`;
  if (elements.invCompletionRate) elements.invCompletionRate.textContent = `${stats.completionRate}%`;
  if (elements.invAvgScore) elements.invAvgScore.textContent = `${stats.avgScore}分`;

  renderPokedexCards('all');

  if (elements.pokedexTabs) {
    const tabs = [
      { id: 'all', name: '全部關主' },
      ...CATEGORIES.map(c => ({ id: c.id, name: `${c.icon} ${c.name}` })),
      { id: 'practice_logs', name: `📋 對話練習紀錄 (${practiceLogs.length})` }
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
        if (cat === 'practice_logs') {
          renderPracticeLogs();
        } else {
          renderPokedexCards(cat);
        }
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

// 渲染歷次對話練習流水帳紀錄
function renderPracticeLogs() {
  if (!elements.pokedexGrid) return;

  const logs = InventoryManager.getPracticeLogs();

  if (logs.length === 0) {
    elements.pokedexGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center; color: #64748b;">
        <div style="font-size: 3rem; margin-bottom: 0.8rem;">📝</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: #334155; margin-bottom: 0.4rem;">尚無對話練習紀錄</div>
        <div style="font-size: 0.9rem;">選擇任一位關主開始實戰對話，完成後對話細節與分析將自動保留於此！</div>
      </div>
    `;
    return;
  }

  elements.pokedexGrid.innerHTML = `
    <div class="practice-log-list" style="grid-column: 1 / -1;">
      ${logs.map(log => {
        const dateStr = new Date(log.date).toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const isCaptured = log.isCaptured;
        const scoreClass = isCaptured ? 'win' : 'retry';
        const scoreBadge = isCaptured ? '🔴 成功收攏' : '💨 未收攏';
        const previewQuote = log.bestCoachQuote ? `「${escapeHtml(log.bestCoachQuote)}」` : (log.winningReason ? escapeHtml(log.winningReason) : '對話練習已完成');

        return `
          <div class="practice-log-card" data-log-id="${log.id}">
            <div class="practice-log-header">
              <div class="practice-log-boss">
                <div class="practice-log-avatar">${log.bossAvatar || '👤'}</div>
                <div>
                  <div class="practice-log-name">${escapeHtml(log.bossName || '關主')} · ${escapeHtml(log.bossTitle || '')}</div>
                  <div class="practice-log-sub">${dateStr} · 共 ${log.turns || 1} 回合互動</div>
                </div>
              </div>
              <div class="practice-log-meta">
                <span class="practice-score-chip ${scoreClass}">${scoreBadge} ${log.score}分</span>
              </div>
            </div>
            <div class="practice-log-quote">
              ${previewQuote}
            </div>
            <div class="practice-log-actions">
              <button class="btn btn-outline btn-sm btn-view-log" data-log-id="${log.id}">
                👁️ 查閱完整對話細節
              </button>
              <button class="btn btn-primary btn-sm btn-download-log" data-log-id="${log.id}">
                📥 下載本場報告 (.md)
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  if (LangManager.getLang() === 'zh-CN') {
    LangManager.translateDOM(elements.pokedexGrid);
  }

  // 綁定查閱事件
  elements.pokedexGrid.querySelectorAll('.btn-view-log').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const logId = e.currentTarget.getAttribute('data-log-id');
      openPracticeLogModal(logId);
    });
  });

  // 綁定下載事件
  elements.pokedexGrid.querySelectorAll('.btn-download-log').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const logId = e.currentTarget.getAttribute('data-log-id');
      state.currentViewingLogId = logId;
      handleDownloadPracticeLogReport();
    });
  });
}

// 彈窗查閱單次對話練習詳細紀錄與完整對話逐字稿
function openPracticeLogModal(logId) {
  state.currentViewingLogId = logId;
  const log = InventoryManager.getPracticeLogById(logId);
  if (!log) {
    showSystemToast('找不到該筆對話紀錄');
    return;
  }

  const player = InventoryManager.getPlayerData();
  const dateStr = new Date(log.date).toLocaleString('zh-TW', { hour12: false });
  const isCaptured = log.isCaptured || (Number(log.score) >= 70);
  const dims = log.dimensionScores || {};
  const suggMap = getTurnSuggestionsMap(log);

  let dialogueHtml = '';
  if (log.dialogueHistory && log.dialogueHistory.length > 0) {
    let roundIndex = 1;
    dialogueHtml = log.dialogueHistory.map(msg => {
      if (msg.role === 'user') {
        const sugg = suggMap[roundIndex] || getFallbackSuggestion(msg.content, roundIndex);
        const turnHtml = `
          <div class="modal-chat-turn user-turn">
            <div class="modal-chat-role">${escapeHtml(player.avatar || '🧙‍♂️')} ${escapeHtml(player.nickname || '學員教練')}（第 ${roundIndex} 回合）</div>
            <div class="modal-chat-text">${escapeHtml(msg.content)}</div>
            ${sugg ? `
              <div class="turn-master-suggestion">
                <div class="sugg-title">💡 ICF 大師級示範問句</div>
                <div class="sugg-phrasing">${escapeHtml(sugg.betterPhrasing)}</div>
                ${sugg.rationale ? `<div class="sugg-rationale">🎯 <b>設計心法：</b>${escapeHtml(sugg.rationale)}</div>` : ''}
              </div>
            ` : ''}
          </div>
        `;
        roundIndex++;
        return turnHtml;
      } else {
        return `
          <div class="modal-chat-turn boss-turn">
            <div class="modal-chat-role">${escapeHtml(log.bossAvatar || '👤')} ${escapeHtml(log.bossName || '關主')}</div>
            <div class="modal-chat-text">${escapeHtml(msg.content)}</div>
            ${msg.innerThought ? `<div class="modal-chat-thought">💭 關主心聲：${escapeHtml(msg.innerThought)}</div>` : ''}
          </div>
        `;
      }
    }).join('');
  } else {
    dialogueHtml = '<div style="color: #94a3b8; font-style: italic; padding: 1rem;">無逐字稿記錄</div>';
  }

  if (elements.practiceLogDetailContent) {
    elements.practiceLogDetailContent.innerHTML = `
      <div class="treasure-card-unlock">
        <div class="card-hero-row">
          <div class="card-avatar">${log.bossAvatar || '👤'}</div>
          <div>
            <h3>${escapeHtml(log.bossName || '關主')} · ${escapeHtml(log.bossTitle || '')}</h3>
            <p class="card-sub">
              練習時間：${dateStr} | 評分：<strong>${log.score} 分</strong> 
              (${isCaptured ? '🔴 成功收攏' : '💨 心防尚未突破'})
            </p>
          </div>
        </div>

        ${log.bestCoachQuote ? `
          <div class="card-section">
            <h4>✨ 你的破心教練金句</h4>
            <blockquote class="card-quote">「${escapeHtml(log.bestCoachQuote)}」</blockquote>
          </div>
        ` : ''}

        ${log.winningReason ? `
          <div class="card-section">
            <h4>🎯 突破防線關鍵復盤</h4>
            <p>${escapeHtml(log.winningReason)}</p>
          </div>
        ` : ''}

        ${log.advice ? `
          <div class="card-section">
            <h4>💡 導師建議與優化方向</h4>
            <p>${escapeHtml(log.advice)}</p>
          </div>
        ` : ''}

        <div class="card-section">
          <h4>📊 ICF 五大核心維度分析</h4>
          <div class="dimension-grid">
            <div class="dim-item"><span>深度同理：${dims.empathy || 75}分</span></div>
            <div class="dim-item"><span>有效傾聽：${dims.listening || 75}分</span></div>
            <div class="dim-item"><span>提問引導：${dims.questioning || 70}分</span></div>
            <div class="dim-item"><span>視角重構：${dims.reframing || 70}分</span></div>
            <div class="dim-item"><span>行動激發：${dims.action_drive || 65}分</span></div>
          </div>
        </div>

        <div class="card-section">
          <h4>📜 完整對話練習實錄逐字稿 (共 ${log.turns || 1} 回合)</h4>
          <div class="modal-chat-transcript">
            ${dialogueHtml}
          </div>
        </div>
      </div>
    `;
  }

  elements.modalPracticeLogDetail?.classList.remove('hidden');
  if (LangManager.getLang() === 'zh-CN' && elements.modalPracticeLogDetail) {
    LangManager.translateDOM(elements.modalPracticeLogDetail);
  }
}

function openBossDetailModal(bossId) {
  state.currentViewingBossId = bossId;
  const boss = getBossById(bossId);
  const detail = InventoryManager.getCaptureDetail(bossId);
  if (!boss || !detail) return;

  const player = InventoryManager.getPlayerData();
  const contentEl = document.getElementById('bossDetailContent');
  const fwName = (boss.framework && boss.framework.name) || boss.weaknessName || '非暴力溝通';

  let transcriptHtml = '';
  if (detail.dialogueHistory && detail.dialogueHistory.length > 0) {
    let roundIndex = 1;
    transcriptHtml = `
      <div class="card-section">
        <h4>📜 破心收攏對話實錄 (共 ${detail.dialogueHistory.filter(m => m.role === 'user').length} 回合)</h4>
        <div class="modal-chat-transcript" style="max-height: 320px; overflow-y: auto; padding-right: 0.5rem;">
          ${detail.dialogueHistory.map(msg => {
            if (msg.role === 'user') {
              const html = `
                <div class="modal-chat-turn user-turn">
                  <div class="modal-chat-role">${player.avatar} ${player.nickname}（第 ${roundIndex} 回合）</div>
                  <div class="modal-chat-text">${escapeHtml(msg.content)}</div>
                </div>
              `;
              roundIndex++;
              return html;
            } else {
              return `
                <div class="modal-chat-turn boss-turn">
                  <div class="modal-chat-role">${boss.avatar} ${escapeHtml(boss.name)}</div>
                  <div class="modal-chat-text">${escapeHtml(msg.content)}</div>
                  ${msg.innerThought ? `<div class="modal-chat-thought">💭 關主心聲：${escapeHtml(msg.innerThought)}</div>` : ''}
                </div>
              `;
            }
          }).join('')}
        </div>
      </div>
    `;
  }

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

        ${transcriptHtml}
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
  if (elements.selectTurnMode) elements.selectTurnMode.value = localStorage.getItem('coachquest_turn_mode') || 'free';
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
  const newTurnMode = elements.selectTurnMode?.value;

  if (newName) InventoryManager.setNickname(newName);
  if (newAvatar) InventoryManager.setAvatar(newAvatar);
  if (newKey !== undefined) localStorage.setItem('coachquest_custom_api_key', newKey.trim());
  if (newModel) localStorage.setItem('coachquest_custom_model', newModel);
  if (newTurnMode) localStorage.setItem('coachquest_turn_mode', newTurnMode);

  refreshPlayerHud();
  checkApiStatus();
  updateTurnBadge();
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
      resultEl.textContent = `✅ 連線成功！${data.message || 'AI 引擎運作無誤'}`;
      resultEl.style.color = '#10b981';
      if (elements.apiStatusDot) {
        elements.apiStatusDot.className = 'status-dot dot-ok';
      }
    } else {
      const isBalance = data.error && (data.error.includes('Insufficient Balance') || data.error.includes('餘額不足'));
      if (isBalance) {
        resultEl.innerHTML = `
          <div style="margin-top:0.35rem; line-height: 1.45;">
            <span style="color:#ef4444; font-weight:600;">❌ 連線失敗：DeepSeek 帳戶餘額不足</span><br>
            <span style="font-size:0.8rem; color:#64748b;">（伺服器已內建 Google Gemini 金鑰，免儲值即可免費暢玩）</span><br>
            <button type="button" class="btn btn-sm btn-primary" style="margin-top:0.35rem; font-size:0.78rem; padding:0.25rem 0.65rem;" id="btnQuickSwitchGemini">
              ⚡ 一鍵切換為 Google Gemini 免費引擎並測試
            </button>
          </div>
        `;
        document.getElementById('btnQuickSwitchGemini')?.addEventListener('click', () => {
          if (elements.selectModel) elements.selectModel.value = 'gemini-3.5-flash-lite';
          if (elements.inputApiKey && elements.inputApiKey.value.startsWith('sk-')) {
            elements.inputApiKey.value = '';
          }
          localStorage.setItem('coachquest_custom_model', 'gemini-3.5-flash-lite');
          handleTestApiKey();
        });
      } else {
        resultEl.textContent = `❌ 連線失敗：${data.error || '請檢查金鑰'}`;
        resultEl.style.color = '#ef4444';
      }
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
  if (saved) return saved;
  const key = getSavedApiKey();
  if (key && key.startsWith('sk-') && !key.startsWith('AIza')) {
    return 'deepseek-chat';
  }
  return 'deepseek-chat';
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
