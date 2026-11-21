// ========================================================
// CoachQuest - NLP 語言魔力回應術前端控制器 (NLP Manager)
// 包含第一關：傾聽解構關、第二關：破框回應關、第三關：對話實戰關
// 依據 Robert Dilts《語言的魔力》與「維度轉換」核心理論
// ========================================================

window.NlpManager = (function() {
  const state = {
    activeMode: null, // 'listen' | 'response'
    currentQuestion: null,
    currentQuestionIndex: 0,
    sessionExercises: [],
    selectedPatternId: '',
    selectedCategory: 'all',
    patterns: [],
    isSubmitting: false,
    currentReport: null
  };

  // 14 種 NLP 回應術模式 (離線本機快照，與後端同步)
  const DEFAULT_PATTERNS = [
    { id: "intention", name: "意圖 (Intention)", nameZh: "正面意圖", icon: "🎯", summary: "肯定行為背後的正面初衷", formula: "「我非常贊賞並支持你想……的初衷。」" },
    { id: "redefining", name: "重新定義 (Redefining)", nameZh: "重新定義", icon: "🔄", summary: "替換關鍵詞彙，將負面定性轉為發展性特質", formula: "「這不是『……』，而是一種『……』。」" },
    { id: "consequence", name: "後果 (Consequence)", nameZh: "後果評估", icon: "⏳", summary: "引導看見持有該信念的長遠連鎖反應", formula: "「持續抱持這個信念，會讓你付出什麼代價？」" },
    { id: "chunk_down", name: "向下分類 (Chunk Down)", nameZh: "微觀分割", icon: "🔍", summary: "將僵固的大概念拆解為更小、更具體的步驟", formula: "「具體是哪一個微小的環節讓你感到受阻？」" },
    { id: "chunk_up", name: "向上歸類 (Chunk Up)", nameZh: "宏觀通則", icon: "🌌", summary: "歸納至更高層次的生命自然規律", formula: "「放眼長遠生命發展，這體現了什麼自然原則？」" },
    { id: "analogy", name: "比喻 (Analogy)", nameZh: "隱喻比喻", icon: "🌱", summary: "生動比喻繞過理性防禦，直擊頓悟", formula: "「這就像……雖然……但實際上……」" },
    { id: "change_frame_size", name: "改變框架大小 (Change Frame Size)", nameZh: "時空視角", icon: "🔭", summary: "拉長時間或人群維度，縮小眼前問題", formula: "「十年後當你回顧今天這一刻，你會怎麼看待？」" },
    { id: "another_outcome", name: "另一結果 (Another Outcome)", nameZh: "轉移焦點", icon: "🔀", summary: "轉向更核心、更有價值的目標焦點", formula: "「問題或許不在於……而在於我們如何……」" },
    { id: "model_of_the_world", name: "世界觀 (Model of the World)", nameZh: "切換世界觀", icon: "🌍", summary: "從不同角色、長者或專家的視角審視", formula: "「若站在一位智者的立場，他會怎麼看這件事？」" },
    { id: "reality_strategy", name: "現實檢驗 (Reality Strategy)", nameZh: "現實檢驗", icon: "🔎", summary: "追問視聽感官證據，破解憑空猜測", formula: "「具體是看見或聽到了什麼，讓你得出這結論？」" },
    { id: "counter_example", name: "反例 (Counter Example)", nameZh: "打破通則", icon: "⚡", summary: "尋找矛盾反例，打破全稱概括必然性", formula: "「有沒有哪怕一次，在類似情況下結果截然不同？」" },
    { id: "hierarchy_of_criteria", name: "準則層次 (Hierarchy of Criteria)", nameZh: "價值排序", icon: "👑", summary: "引導出更高階、更至關重要的價值觀", formula: "「比起眼前的……在深層次上，難道不是……更重要？」" },
    { id: "apply_to_itself", name: "反擊其身 (Apply to Itself)", nameZh: "自我指涉", icon: "🪞", summary: "將信念邏輯套用回信念本身促發頓悟", formula: "「當你如此絕對地說出這話時，是否也封閉了可能？」" },
    { id: "meta_frame", name: "超越框架 (Meta Frame)", nameZh: "後設框架", icon: "🦅", summary: "審視信念背後的心理防衛機制與成因", formula: "「是什麼經歷，讓你覺得必須用這信念保護自己？」" }
  ];

  // DOM 元素快取
  let dom = {};

  function initElements() {
    dom = {
      modal: document.getElementById('modalNlpArena'),
      btnCloseModal: document.getElementById('btnCloseNlpModal'),
      screenHub: document.getElementById('nlpScreenHub'),
      screenListen: document.getElementById('nlpScreenListen'),
      screenResponse: document.getElementById('nlpScreenResponse'),
      screenReport: document.getElementById('nlpScreenReport'),
      modalPatterns: document.getElementById('modalNlpPatterns'),
      btnClosePatterns: document.getElementById('btnCloseNlpPatterns'),

      // Hub 導航按鈕
      btnStartListen: document.getElementById('btnNlpStartListen'),
      btnStartResponse: document.getElementById('btnNlpStartResponse'),
      btnStartBattle: document.getElementById('btnNlpStartBattle'),
      btnViewPatterns: document.getElementById('btnNlpViewPatterns'),
      btnHubViewPatterns: document.getElementById('btnNlpHubViewPatterns'),

      // 第三關：對話實戰關 elements
      screenDialogue: document.getElementById('nlpScreenDialogue'),
      btnDlgBackHub: document.getElementById('btnNlpDlgBackHub'),
      nlpDlgBossSelect: document.getElementById('nlpDlgBossSelect'),
      nlpDlgDiffSelect: document.getElementById('nlpDlgDiffSelect'),
      btnDlgFinish: document.getElementById('btnNlpDlgFinish'),
      dlgBossAvatar: document.getElementById('nlpDlgBossAvatar'),
      dlgBossName: document.getElementById('nlpDlgBossName'),
      dlgBossTitle: document.getElementById('nlpDlgBossTitle'),
      dlgBossScenario: document.getElementById('nlpDlgBossScenario'),
      dlgStuckHow: document.getElementById('nlpDlgStuckHow'),
      dlgCoreDesire: document.getElementById('nlpDlgCoreDesire'),
      dlgHpText: document.getElementById('nlpDlgHpText'),
      dlgHpBar: document.getElementById('nlpDlgHpBar'),
      dlgChatBox: document.getElementById('nlpDlgChatBox'),
      dlgTacticsBox: document.getElementById('nlpDlgTacticsBox'),
      dlgTacticsList: document.getElementById('nlpDlgTacticsList'),
      btnToggleDlgTactics: document.getElementById('btnToggleNlpDlgTactics'),
      btnCloseDlgTactics: document.getElementById('btnCloseNlpDlgTactics'),
      inputDlg: document.getElementById('inputNlpDialogue'),
      btnDlgSend: document.getElementById('btnNlpDialogueSend'),

      // 傾聽關 elements
      listenCategory: document.getElementById('nlpListenCategory'),
      listenSpeakerAvatar: document.getElementById('nlpListenSpeakerAvatar'),
      listenSpeakerName: document.getElementById('nlpListenSpeakerName'),
      listenCategoryBadge: document.getElementById('nlpListenCategoryBadge'),
      listenStatement: document.getElementById('nlpListenStatement'),
      listenScenario: document.getElementById('nlpListenScenario'),
      listenQuestionIndex: document.getElementById('nlpListenQuestionIndex'),
      inputBelief: document.getElementById('inputNlpBelief'),
      inputEmotion: document.getElementById('inputNlpEmotion'),
      inputNeed: document.getElementById('inputNlpNeed'),
      btnSubmitListen: document.getElementById('btnNlpSubmitListen'),
      listenFeedbackCard: document.getElementById('nlpListenFeedbackCard'),
      listenFeedbackSpeaker: document.getElementById('nlpListenFeedbackSpeaker'),
      listenFeedbackCoach: document.getElementById('nlpListenFeedbackCoach'),
      listenFeedbackScore: document.getElementById('nlpListenFeedbackScore'),
      listenDimensionShiftBox: document.getElementById('nlpListenDimensionShiftBox'),
      btnListenNext: document.getElementById('btnNlpListenNext'),
      btnListenFinish: document.getElementById('btnNlpListenFinish'),
      btnListenBackHub: document.getElementById('btnNlpListenBackHub'),
      btnToggleListenHints: document.getElementById('btnToggleNlpListenHints'),
      listenHintDrawer: document.getElementById('nlpListenHintDrawer'),

      // 回應關 elements
      respCategory: document.getElementById('nlpRespCategory'),
      respSpeakerAvatar: document.getElementById('nlpRespSpeakerAvatar'),
      respSpeakerName: document.getElementById('nlpRespSpeakerName'),
      respCategoryBadge: document.getElementById('nlpRespCategoryBadge'),
      respStatement: document.getElementById('nlpRespStatement'),
      respScenario: document.getElementById('nlpRespScenario'),
      respQuestionIndex: document.getElementById('nlpRespQuestionIndex'),
      respPatternTagsContainer: document.getElementById('nlpRespPatternTagsContainer'),
      inputResponse: document.getElementById('inputNlpResponse'),
      btnSubmitResponse: document.getElementById('btnNlpSubmitResponse'),
      respFeedbackCard: document.getElementById('nlpRespFeedbackCard'),
      respFeedbackScore: document.getElementById('nlpRespFeedbackScore'),
      respIdentifiedPattern: document.getElementById('nlpRespIdentifiedPattern'),
      respFeedbackSpeaker: document.getElementById('nlpRespFeedbackSpeaker'),
      respFeedbackCoach: document.getElementById('nlpRespFeedbackCoach'),
      respMasterDemosBox: document.getElementById('nlpRespMasterDemosBox'),
      btnRespNext: document.getElementById('btnNlpRespNext'),
      btnRespFinish: document.getElementById('btnNlpRespFinish'),
      btnRespBackHub: document.getElementById('btnNlpRespBackHub'),
      btnToggleRespHints: document.getElementById('btnToggleNlpRespHints'),
      respHintDrawer: document.getElementById('nlpRespHintDrawer'),
      respSubHint: document.getElementById('nlpRespSubHint'),
      respExampleHint: document.getElementById('nlpRespExampleHint'),

      // 結算報告 elements
      reportStudentName: document.getElementById('nlpReportStudentName'),
      reportTitle: document.getElementById('nlpReportTitle'),
      reportScore: document.getElementById('nlpReportScore'),
      reportCritique: document.getElementById('nlpReportCritique'),
      reportRadarBars: document.getElementById('nlpReportRadarBars'),
      reportStrengthsList: document.getElementById('nlpReportStrengthsList'),
      reportRecommendationsList: document.getElementById('nlpReportRecommendationsList'),
      reportExercisesList: document.getElementById('nlpReportExercisesList'),
      btnCopyReportMd: document.getElementById('btnNlpCopyReportMd'),
      btnDownloadReportMd: document.getElementById('btnNlpDownloadReportMd'),
      btnReportRestart: document.getElementById('btnNlpReportRestart'),
      btnReportBackHub: document.getElementById('btnNlpReportBackHub'),

      // 圖鑑卡片容器
      patternsGrid: document.getElementById('nlpPatternsGrid')
    };
  }

  // 初始化模組
  function init() {
    initElements();
    state.patterns = DEFAULT_PATTERNS;
    bindEvents();
    renderPatternsGrid();
  }

  function bindEvents() {
    // 關閉專屬區彈窗
    dom.btnCloseModal?.addEventListener('click', closeNlpArena);
    dom.btnClosePatterns?.addEventListener('click', closePatternsModal);

    // Hub 選擇模式
    dom.btnStartListen?.addEventListener('click', () => startPractice('listen'));
    dom.btnStartResponse?.addEventListener('click', () => startPractice('response'));
    dom.btnStartBattle?.addEventListener('click', () => startNlpDialogue());
    dom.btnViewPatterns?.addEventListener('click', openPatternsModal);
    dom.btnHubViewPatterns?.addEventListener('click', openPatternsModal);

    // 第三關：對話實戰關動作
    dom.btnDlgBackHub?.addEventListener('click', showHubScreen);
    dom.btnDlgFinish?.addEventListener('click', finishDialogueAndGenerateReport);
    dom.btnDlgSend?.addEventListener('click', handleNlpDialogueSend);
    dom.inputDlg?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleNlpDialogueSend();
      }
    });
    dom.nlpDlgBossSelect?.addEventListener('change', (e) => {
      startNlpDialogue(e.target.value, dom.nlpDlgDiffSelect?.value || 'normal');
    });
    dom.nlpDlgDiffSelect?.addEventListener('change', (e) => {
      startNlpDialogue(dom.nlpDlgBossSelect?.value || 'boss_work_1', e.target.value);
    });
    dom.btnToggleDlgTactics?.addEventListener('click', toggleDlgTacticsDrawer);
    dom.btnCloseDlgTactics?.addEventListener('click', () => {
      if (dom.dlgTacticsBox) dom.dlgTacticsBox.style.display = 'none';
    });

    // 傾聽關動作
    dom.btnSubmitListen?.addEventListener('click', submitListening);
    dom.btnListenNext?.addEventListener('click', () => loadNextQuestion('listen'));
    dom.btnListenFinish?.addEventListener('click', finishSessionAndGenerateReport);
    dom.btnListenBackHub?.addEventListener('click', showHubScreen);
    dom.listenCategory?.addEventListener('change', (e) => {
      state.selectedCategory = e.target.value;
      loadNextQuestion('listen');
    });

    // 回應關動作
    dom.btnSubmitResponse?.addEventListener('click', submitResponse);
    dom.btnRespNext?.addEventListener('click', () => loadNextQuestion('response'));
    dom.btnRespFinish?.addEventListener('click', finishSessionAndGenerateReport);
    dom.btnRespBackHub?.addEventListener('click', showHubScreen);
    dom.respCategory?.addEventListener('change', (e) => {
      state.selectedCategory = e.target.value;
      loadNextQuestion('response');
    });

    // 提示收合切換
    dom.btnToggleListenHints?.addEventListener('click', () => toggleListenHints());
    dom.btnToggleRespHints?.addEventListener('click', () => toggleRespHints());

    // 結算報告動作
    dom.btnCopyReportMd?.addEventListener('click', copyReportMarkdown);
    dom.btnDownloadReportMd?.addEventListener('click', downloadReportMarkdown);
    dom.btnReportRestart?.addEventListener('click', () => startPractice(state.activeMode || 'listen'));
    dom.btnReportBackHub?.addEventListener('click', showHubScreen);
  }

  // 檢查訂閱授權（未啟用則彈出提示）
  function checkSubscription() {
    const code = getSubCode();
    if (!code) {
      if (typeof window.showSubscriptionModal === 'function') {
        window.showSubscriptionModal('🪄 NLP 語言魔力回應術專區為高級實戰功能，請先啟用有效訂閱授權碼。');
      } else {
        alert('請先啟用教練實戰訂閱授權碼，即可開啟 NLP 回應術專區！');
      }
      return false;
    }

    if (typeof window.isSubscriptionActive === 'function') {
      const active = window.isSubscriptionActive();
      if (!active) {
        if (typeof window.showSubscriptionModal === 'function') {
          window.showSubscriptionModal('🪄 您的訂閱授權已過期，請聯繫教練續期後即可暢玩 NLP 回應術專區。');
        } else {
          alert('您的訂閱授權已過期，請聯繫教練取得有效訂閱授權碼！');
        }
        return false;
      }
    }

    // 檢查授權範圍：若為一般道館權限，提示需要專屬或全部授權
    let sub = null;
    if (typeof window.getSavedSubscription === 'function') {
      sub = window.getSavedSubscription();
    } else {
      try {
        const raw = localStorage.getItem('coachquest_subscription_v1');
        if (raw) sub = JSON.parse(raw);
      } catch (_) {}
    }

    if (sub && sub.scope === 'general') {
      if (typeof window.showSubscriptionModal === 'function') {
        window.showSubscriptionModal('此授權碼為【一般道館權限】，NLP 回應術專區需要【專屬】或【全部】授權碼，請聯繫 Sunny 教練升級。');
      } else {
        alert('此授權碼為【一般道館權限】，NLP 回應術專區需要【專屬】或【全部】授權碼，請聯繫 Sunny 教練升級。');
      }
      return false;
    }
    return true;
  }

  // 取得當前授權碼 (相容 coachquest_subscription_v1 與 coachquest_subscription_code)
  function getSubCode() {
    if (typeof window.getSavedSubscription === 'function') {
      const sub = window.getSavedSubscription();
      if (sub && sub.code) return String(sub.code).trim().toUpperCase();
    }
    try {
      const raw = localStorage.getItem('coachquest_subscription_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.code) return String(parsed.code).trim().toUpperCase();
      }
    } catch (_) {}
    return (localStorage.getItem('coachquest_subscription_code') || '').trim().toUpperCase();
  }

  // 打開專區主彈窗
  function openNlpArena(mode = null) {
    if (!checkSubscription()) return;
    if (!dom.modal) initElements();
    dom.modal?.classList.remove('hidden');

    if (mode === 'listen' || mode === 'response') {
      startPractice(mode);
    } else if (mode === 'dialogue' || mode === 'battle') {
      startNlpDialogue();
    } else {
      showHubScreen();
    }
  }

  function closeNlpArena() {
    dom.modal?.classList.add('hidden');
  }

  function showHubScreen() {
    dom.screenHub?.classList.remove('hidden');
    dom.screenListen?.classList.add('hidden');
    dom.screenResponse?.classList.add('hidden');
    dom.screenDialogue?.classList.add('hidden');
    dom.screenReport?.classList.add('hidden');
  }

  let listenHintsVisible = false;
  function toggleListenHints(forceState) {
    listenHintsVisible = typeof forceState === 'boolean' ? forceState : !listenHintsVisible;
    if (dom.listenHintDrawer) {
      dom.listenHintDrawer.style.display = listenHintsVisible ? 'block' : 'none';
    }
    const screenListen = dom.screenListen || document.getElementById('nlpScreenListen');
    if (screenListen) {
      screenListen.querySelectorAll('.nlp-sub-hint').forEach(el => {
        el.style.display = listenHintsVisible ? 'block' : 'none';
      });
      screenListen.querySelectorAll('.nlp-example-hint').forEach(el => {
        el.style.display = listenHintsVisible ? 'block' : 'none';
      });
    }
    if (dom.btnToggleListenHints) {
      dom.btnToggleListenHints.innerHTML = listenHintsVisible
        ? '✕ 隱藏破題提示'
        : '💡 顯示破題提示與思考指引';
      if (listenHintsVisible) {
        dom.btnToggleListenHints.style.background = '#fef3c7';
        dom.btnToggleListenHints.style.borderColor = '#d97706';
        dom.btnToggleListenHints.style.color = '#92400e';
      } else {
        dom.btnToggleListenHints.style.background = '#fffbeb';
        dom.btnToggleListenHints.style.borderColor = '#f59e0b';
        dom.btnToggleListenHints.style.color = '#b45309';
      }
    }
  }

  let respHintsVisible = false;
  function toggleRespHints(forceState) {
    respHintsVisible = typeof forceState === 'boolean' ? forceState : !respHintsVisible;
    if (dom.respHintDrawer) {
      dom.respHintDrawer.style.display = respHintsVisible ? 'block' : 'none';
    }
    if (dom.respSubHint) {
      dom.respSubHint.style.display = respHintsVisible ? 'block' : 'none';
    }
    if (dom.respExampleHint) {
      dom.respExampleHint.style.display = respHintsVisible ? 'block' : 'none';
    }
    if (dom.btnToggleRespHints) {
      dom.btnToggleRespHints.innerHTML = respHintsVisible
        ? '✕ 隱藏回應指引'
        : '💡 顯示破框思考指引';
      if (respHintsVisible) {
        dom.btnToggleRespHints.style.background = '#f3e8ff';
        dom.btnToggleRespHints.style.borderColor = '#9333ea';
        dom.btnToggleRespHints.style.color = '#581c87';
      } else {
        dom.btnToggleRespHints.style.background = '#faf5ff';
        dom.btnToggleRespHints.style.borderColor = '#a855f7';
        dom.btnToggleRespHints.style.color = '#7e22ce';
      }
    }
  }

  // 開始練習指定關卡
  async function startPractice(mode) {
    if (!checkSubscription()) return;
    state.activeMode = mode;
    state.sessionExercises = [];
    state.currentQuestionIndex = 0;
    state.selectedPatternId = '';

    dom.screenHub?.classList.add('hidden');
    dom.screenDialogue?.classList.add('hidden');
    dom.screenReport?.classList.add('hidden');

    if (mode === 'listen') {
      dom.screenListen?.classList.remove('hidden');
      dom.screenResponse?.classList.add('hidden');
      await loadNextQuestion('listen');
    } else if (mode === 'response') {
      dom.screenResponse?.classList.remove('hidden');
      dom.screenListen?.classList.add('hidden');
      renderPatternTags();
      await loadNextQuestion('response');
    } else if (mode === 'dialogue') {
      startNlpDialogue(state.dialogueBossId || 'boss_work_1', state.dialogueDifficulty || 'normal');
    }
  }

  // 載入下一道題目
  async function loadNextQuestion(mode) {
    const isListen = mode === 'listen';
    const container = isListen ? dom.screenListen : dom.screenResponse;
    const feedbackCard = isListen ? dom.listenFeedbackCard : dom.respFeedbackCard;
    const submitBtn = isListen ? dom.btnSubmitListen : dom.btnSubmitResponse;

    // 清空前次反饋
    feedbackCard?.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = false;

    if (isListen) {
      toggleListenHints(false);
      if (dom.inputBelief) dom.inputBelief.value = '';
      if (dom.inputEmotion) dom.inputEmotion.value = '';
      if (dom.inputNeed) dom.inputNeed.value = '';
      if (dom.listenFeedbackScore) dom.listenFeedbackScore.textContent = '--';
      if (dom.listenDimensionShiftBox) dom.listenDimensionShiftBox.innerHTML = '';
    } else {
      toggleRespHints(false);
      if (dom.inputResponse) dom.inputResponse.value = '';
      if (dom.respFeedbackScore) dom.respFeedbackScore.textContent = '--';
      if (dom.respMasterDemosBox) dom.respMasterDemosBox.innerHTML = '';
      state.selectedPatternId = '';
      updatePatternTagsActive();
    }

    try {
      const category = isListen ? (dom.listenCategory?.value || 'all') : (dom.respCategory?.value || 'all');
      const subCode = getSubCode();
      const res = await fetch('/api/nlp/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-subscription-code': subCode
        },
        body: JSON.stringify({
          category,
          subCode,
          excludeId: state.currentQuestion?.id || null
        })
      });

      const data = await res.json();
      if (!data.ok) {
        if (data.error === 'SUBSCRIPTION_REQUIRED') {
          closeNlpArena();
          if (typeof window.showSubscriptionModal === 'function') {
            window.showSubscriptionModal(data.message || '請先啟用有效訂閱授權碼');
          } else {
            alert(data.message || '請先啟用有效訂閱授權碼');
          }
          return;
        }
        alert('題目載入異常，請重試');
        return;
      }

      state.currentQuestion = data.question;
      state.currentQuestionIndex++;

      // 渲染題目資料
      if (isListen) {
        if (dom.listenSpeakerAvatar) dom.listenSpeakerAvatar.textContent = data.question.avatar || '👤';
        if (dom.listenSpeakerName) dom.listenSpeakerName.textContent = data.question.speaker;
        if (dom.listenCategoryBadge) dom.listenCategoryBadge.textContent = data.question.categoryName;
        if (dom.listenStatement) dom.listenStatement.textContent = `『${data.question.statement}』`;
        if (dom.listenScenario) dom.listenScenario.textContent = data.question.scenario;
        if (dom.listenQuestionIndex) dom.listenQuestionIndex.textContent = `第 ${state.currentQuestionIndex} 題（已累計完成 ${state.sessionExercises.length} 題）`;
      } else {
        if (dom.respSpeakerAvatar) dom.respSpeakerAvatar.textContent = data.question.avatar || '👤';
        if (dom.respSpeakerName) dom.respSpeakerName.textContent = data.question.speaker;
        if (dom.respCategoryBadge) dom.respCategoryBadge.textContent = data.question.categoryName;
        if (dom.respStatement) dom.respStatement.textContent = `『${data.question.statement}』`;
        if (dom.respScenario) dom.respScenario.textContent = data.question.scenario;
        if (dom.respQuestionIndex) dom.respQuestionIndex.textContent = `第 ${state.currentQuestionIndex} 題（已累計完成 ${state.sessionExercises.length} 題）`;
      }
    } catch (err) {
      console.error('NLP 題目載入失敗:', err);
      alert('網路連線不穩定，請重試。');
    }
  }

  // 第一關：送出傾聽解構
  async function submitListening() {
    if (!state.currentQuestion || state.isSubmitting) return;

    const belief = (dom.inputBelief?.value || '').trim();
    const emotion = (dom.inputEmotion?.value || '').trim();
    const need = (dom.inputNeed?.value || '').trim();

    if (!belief && !emotion && !need) {
      alert('請至少填寫一項觀點、情緒或需要分析！');
      return;
    }

    state.isSubmitting = true;
    if (dom.btnSubmitListen) {
      dom.btnSubmitListen.disabled = true;
      dom.btnSubmitListen.textContent = '⏳ AI 大師導師正在深度解析維度轉換……';
    }

    try {
      const subCode = getSubCode();
      const res = await fetch('/api/nlp/listen/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-subscription-code': subCode
        },
        body: JSON.stringify({
          questionId: state.currentQuestion.id,
          userBelief: belief,
          userEmotion: emotion,
          userNeed: need,
          subCode,
          userApiKey: localStorage.getItem('coachquest_custom_api_key') || '',
          userModel: localStorage.getItem('coachquest_custom_model') || ''
        })
      });

      const data = await res.json();
      if (!data.ok) {
        if (data.error === 'SUBSCRIPTION_REQUIRED') {
          closeNlpArena();
          if (typeof window.showSubscriptionModal === 'function') {
            window.showSubscriptionModal(data.message || '請先啟用有效訂閱授權碼');
          } else {
            alert(data.message || '請先啟用有效訂閱授權碼');
          }
          return;
        }
        alert(data.message || '評審失敗，請確認訂閱狀態或 API 設定');
        return;
      }

      const evalResult = data.evaluation;
      renderListeningEvaluation(evalResult, belief, emotion, need);

      // 儲存進當前 Session
      state.sessionExercises.push({
        question: state.currentQuestion,
        userBelief: belief,
        userEmotion: emotion,
        userNeed: need,
        evaluation: evalResult,
        timestamp: new Date().toISOString()
      });

      if (dom.listenQuestionIndex) {
        dom.listenQuestionIndex.textContent = `第 ${state.currentQuestionIndex} 題（已累計完成 ${state.sessionExercises.length} 題）`;
      }
    } catch (err) {
      console.error('傾聽評審提交失敗:', err);
      alert('評審過程發生錯誤，請檢查網路。');
    } finally {
      state.isSubmitting = false;
      if (dom.btnSubmitListen) {
        dom.btnSubmitListen.disabled = false;
        dom.btnSubmitListen.textContent = '🔍 提交傾聽分析・請關主確認';
      }
    }
  }

  // 渲染傾聽關評審反饋（含三欄式「維度轉換」卡片）
  function renderListeningEvaluation(evalResult, userBelief, userEmotion, userNeed) {
    if (!dom.listenFeedbackCard) return;

    dom.listenFeedbackCard.classList.remove('hidden');

    if (dom.listenFeedbackScore) {
      dom.listenFeedbackScore.textContent = `${evalResult.score || 80}分`;
    }

    if (dom.listenFeedbackSpeaker) {
      dom.listenFeedbackSpeaker.innerHTML = `
        <div style="font-weight: 700; color: #b45309; margin-bottom: 0.35rem;">
          ${state.currentQuestion?.avatar || '👤'} ${escapeHtml(state.currentQuestion?.speaker || '關主')}此刻心聲：
        </div>
        <div style="font-style: italic; line-height: 1.6;">
          ${escapeHtml(evalResult.speakerFeedback || '你的傾聽讓我感覺被真正理解了。')}
        </div>
      `;
    }

    if (dom.listenFeedbackCoach) {
      dom.listenFeedbackCoach.innerHTML = `
        <div style="font-weight: 700; color: #1e40af; margin-bottom: 0.35rem;">
          🧭 ICF 傳奇導師深度點評：
        </div>
        <div style="line-height: 1.6;">
          ${escapeHtml(evalResult.coachEvaluation || '學員能敏銳捕捉深層情感，完成度極高。')}
        </div>
      `;
    }

    // 核心維度轉換展示 (Image 1 關鍵理論落地)
    if (dom.listenDimensionShiftBox) {
      const shift = evalResult.dimensionShift || {
        surfaceHow: '困在表層的『單一做法』(反覆受挫)',
        coreDesire: '拉高維度後的『核心渴望』(真正需求)',
        multiChannels: ['建立多元合作方式', '以大局目標為重'],
        takeaway: '方法 (How) 往往是排他的、僵化的；但渴望 (Desire) 卻是包容的、充滿創造力的。'
      };

      const channelsHtml = Array.isArray(shift.multiChannels)
        ? shift.multiChannels.map(c => `<li>✨ ${escapeHtml(c)}</li>`).join('')
        : `<li>✨ ${escapeHtml(shift.multiChannels || '拓展全新選擇')}</li>`;

      dom.listenDimensionShiftBox.innerHTML = `
        <div class="nlp-dimension-shift-card">
          <div class="shift-header">
            <span class="shift-badge">✨ 核心修煉：維度轉換 (Dimension Shift)</span>
            <span class="shift-quote">「方法 (How) 往往是排他的、僵化的；但渴望 (Desire) 卻是包容的、充滿創造力的。」</span>
          </div>

          <div class="shift-grid">
            <div class="shift-col shift-col-how">
              <div class="shift-col-title">困在表層的「單一做法」<br><small>(反覆受挫)</small></div>
              <div class="shift-col-content">${escapeHtml(shift.surfaceHow)}</div>
            </div>

            <div class="shift-arrow">➔</div>

            <div class="shift-col shift-col-desire">
              <div class="shift-col-title">拉高維度後的「核心渴望」<br><small>(真正需求)</small></div>
              <div class="shift-col-content">${escapeHtml(shift.coreDesire)}</div>
            </div>

            <div class="shift-arrow">➔</div>

            <div class="shift-col shift-col-channels">
              <div class="shift-col-title">拓展出的「多元滿足管道」<br><small>(全新可能性)</small></div>
              <div class="shift-col-content">
                <ul class="shift-channel-list">
                  ${channelsHtml}
                </ul>
              </div>
            </div>
          </div>

          <div class="master-insight-row">
            <div class="insight-pill"><b>大師觀點解析：</b>${escapeHtml(evalResult.masterInsight?.belief || '')}</div>
            <div class="insight-pill"><b>大師捕捉情緒：</b>${escapeHtml(evalResult.masterInsight?.emotion || '')}</div>
            <div class="insight-pill"><b>大師透視需要：</b>${escapeHtml(evalResult.masterInsight?.need || '')}</div>
          </div>
        </div>
      `;
    }

    // 平滑滾動至反饋區
    dom.listenFeedbackCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // 第二關：渲染 14 種 NLP 模式選擇標籤
  function renderPatternTags() {
    if (!dom.respPatternTagsContainer) return;
    dom.respPatternTagsContainer.innerHTML = '';

    state.patterns.forEach(p => {
      const tag = document.createElement('button');
      tag.type = 'button';
      tag.className = 'nlp-pattern-tag';
      tag.dataset.id = p.id;
      tag.innerHTML = `${p.icon} ${escapeHtml(p.nameZh)}`;
      tag.title = `${p.name}：${p.summary}`;

      tag.addEventListener('click', () => {
        if (state.selectedPatternId === p.id) {
          state.selectedPatternId = '';
        } else {
          state.selectedPatternId = p.id;
        }
        updatePatternTagsActive();
      });

      dom.respPatternTagsContainer.appendChild(tag);
    });
  }

  function updatePatternTagsActive() {
    if (!dom.respPatternTagsContainer) return;
    const tags = dom.respPatternTagsContainer.querySelectorAll('.nlp-pattern-tag');
    tags.forEach(t => {
      if (t.dataset.id === state.selectedPatternId) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
  }

  // 第二關：送出破框回應
  async function submitResponse() {
    if (!state.currentQuestion || state.isSubmitting) return;

    const responseText = (dom.inputResponse?.value || '').trim();
    if (!responseText) {
      alert('請先輸入你想對關主說的破框回應話語！');
      return;
    }

    state.isSubmitting = true;
    if (dom.btnSubmitResponse) {
      dom.btnSubmitResponse.disabled = true;
      dom.btnSubmitResponse.textContent = '⏳ AI 正在識別 NLP 回應模式與心防鬆動度……';
    }

    try {
      const subCode = getSubCode();
      const res = await fetch('/api/nlp/response/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-subscription-code': subCode
        },
        body: JSON.stringify({
          questionId: state.currentQuestion.id,
          userResponse: responseText,
          targetPatternId: state.selectedPatternId,
          subCode,
          userApiKey: localStorage.getItem('coachquest_custom_api_key') || '',
          userModel: localStorage.getItem('coachquest_custom_model') || ''
        })
      });

      const data = await res.json();
      if (!data.ok) {
        if (data.error === 'SUBSCRIPTION_REQUIRED') {
          closeNlpArena();
          if (typeof window.showSubscriptionModal === 'function') {
            window.showSubscriptionModal(data.message || '請先啟用有效訂閱授權碼');
          } else {
            alert(data.message || '請先啟用有效訂閱授權碼');
          }
          return;
        }
        alert(data.message || '回應評審失敗');
        return;
      }

      const evalResult = data.evaluation;
      renderResponseEvaluation(evalResult, responseText);

      state.sessionExercises.push({
        question: state.currentQuestion,
        userResponse: responseText,
        targetPatternId: state.selectedPatternId,
        evaluation: evalResult,
        timestamp: new Date().toISOString()
      });

      if (dom.respQuestionIndex) {
        dom.respQuestionIndex.textContent = `第 ${state.currentQuestionIndex} 題（已累計完成 ${state.sessionExercises.length} 題）`;
      }
    } catch (err) {
      console.error('破框回應評審失敗:', err);
      alert('評審連線錯誤，請重試。');
    } finally {
      state.isSubmitting = false;
      if (dom.btnSubmitResponse) {
        dom.btnSubmitResponse.disabled = false;
        dom.btnSubmitResponse.textContent = '⚡ 提交破框回應・檢視換框效果';
      }
    }
  }

  // 渲染回應關反饋
  function renderResponseEvaluation(evalResult, userResponse) {
    if (!dom.respFeedbackCard) return;

    dom.respFeedbackCard.classList.remove('hidden');

    if (dom.respFeedbackScore) {
      dom.respFeedbackScore.textContent = `${evalResult.score || 85}分`;
    }

    if (dom.respIdentifiedPattern) {
      dom.respIdentifiedPattern.textContent = `🎯 識別運用模式：${evalResult.identifiedPattern || '正面意圖 / 重新定義'}`;
    }

    if (dom.respFeedbackSpeaker) {
      dom.respFeedbackSpeaker.innerHTML = `
        <div style="font-weight: 700; color: #b45309; margin-bottom: 0.35rem;">
          ${state.currentQuestion?.avatar || '👤'} ${escapeHtml(state.currentQuestion?.speaker || '關主')}心防動搖反應：
        </div>
        <div style="font-style: italic; line-height: 1.6;">
          ${escapeHtml(evalResult.speakerReaction || '你這句話讓我愣了一下，好像真的還有其他可能性……')}
        </div>
      `;
    }

    if (dom.respFeedbackCoach) {
      dom.respFeedbackCoach.innerHTML = `
        <div style="font-weight: 700; color: #1e40af; margin-bottom: 0.35rem;">
          🪄 導師換框心理機制解析：
        </div>
        <div style="line-height: 1.6;">
          ${escapeHtml(evalResult.coachCritique || '回應自然流暢，有效鬆動了排他性的單一做法。')}
        </div>
      `;
    }

    if (dom.respMasterDemosBox) {
      const demos = Array.isArray(evalResult.masterDemonstrations) ? evalResult.masterDemonstrations : [];
      let demosHtml = '';
      demos.forEach((d, idx) => {
        demosHtml += `
          <div class="master-demo-card">
            <div class="demo-tag">大師示範 ${idx + 1}【${escapeHtml(d.patternName || 'NLP 經典模式')}】</div>
            <div class="demo-quote">${escapeHtml(d.demonstration)}</div>
            <div class="demo-rationale">💡 <b>換框機制：</b>${escapeHtml(d.rationale || '')}</div>
          </div>
        `;
      });
      dom.respMasterDemosBox.innerHTML = `
        <h4 style="font-size: 1rem; color: #374151; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
          <span>🌟</span> 雙重 NLP 大師級範例觀摩：
        </h4>
        <div class="master-demos-grid">${demosHtml}</div>
      `;
    }

    dom.respFeedbackCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // 結算練習並生成總結報告
  async function finishSessionAndGenerateReport() {
    if (state.sessionExercises.length === 0) {
      alert('請至少完成 1 道練習題目後再進行結算！');
      return;
    }

    const mode = state.activeMode;
    const isListen = mode === 'listen';
    const finishBtn = isListen ? dom.btnListenFinish : dom.btnRespFinish;

    if (finishBtn) {
      finishBtn.disabled = true;
      finishBtn.textContent = '📊 正在彙整生成大師級修煉報告……';
    }

    try {
      const player = typeof InventoryManager !== 'undefined' ? InventoryManager.getPlayerData() : {};
      const studentName = player.nickname || '學員教練';

      const subCode = getSubCode();
      const res = await fetch('/api/nlp/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-subscription-code': subCode
        },
        body: JSON.stringify({
          mode,
          exercises: state.sessionExercises,
          studentName,
          subCode,
          userApiKey: localStorage.getItem('coachquest_custom_api_key') || '',
          userModel: localStorage.getItem('coachquest_custom_model') || ''
        })
      });

      const data = await res.json();
      if (!data.ok) {
        if (data.error === 'SUBSCRIPTION_REQUIRED') {
          closeNlpArena();
          if (typeof window.showSubscriptionModal === 'function') {
            window.showSubscriptionModal(data.message || '請先啟用有效訂閱授權碼');
          } else {
            alert(data.message || '請先啟用有效訂閱授權碼');
          }
          return;
        }
        alert(data.message || '結算報告生成失敗');
        return;
      }

      state.currentReport = data.report;
      renderMasteryReport(data.report);

      // 同步本地百寶箱練習紀錄
      if (typeof InventoryManager !== 'undefined' && typeof InventoryManager.recordBattleResult === 'function') {
        const dummyBoss = {
          id: `nlp_${mode}`,
          name: `NLP語言魔力・${mode === 'listen' ? '傾聽解構關' : '破框回應關'}`,
          avatar: '🪄',
          title: '語言魔術師修煉場',
          category: 'nlp_mastery'
        };
        const evalData = {
          score: data.report.overallScore,
          winningReason: `【NLP結算】榮獲『${data.report.masteryTitle}』稱號（完成 ${data.report.totalExercises} 題演練）`,
          advice: data.report.summaryCritique,
          dimensions: data.report.radarDimensions
        };
        InventoryManager.recordBattleResult(dummyBoss, evalData, []);
      }

      // 切換至報告畫面
      dom.screenListen?.classList.add('hidden');
      dom.screenResponse?.classList.add('hidden');
      dom.screenReport?.classList.remove('hidden');
      dom.screenReport?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error('結算報告失敗:', err);
      alert('產生結算報告時發生錯誤，請重試。');
    } finally {
      if (finishBtn) {
        finishBtn.disabled = false;
        finishBtn.textContent = '🏁 結算本次練習・生成復盤報告';
      }
    }
  }

  // 渲染結算報告
  function renderMasteryReport(report) {
    if (!dom.screenReport) return;

    if (dom.reportStudentName) dom.reportStudentName.textContent = report.studentName;
    if (dom.reportTitle) dom.reportTitle.textContent = `🎖️ ${report.masteryTitle}`;
    if (dom.reportScore) dom.reportScore.textContent = `${report.overallScore}分`;
    if (dom.reportCritique) dom.reportCritique.textContent = report.summaryCritique;

    // 渲染五維度條
    if (dom.reportRadarBars) {
      const dims = report.radarDimensions || {};
      const isDialogue = report.mode === 'dialogue';
      const dimLabels = isDialogue ? {
        empathyPacing: '同理跟隨力 (Empathy Pacing)',
        intentionCapture: '意圖捕捉力 (Intention Capture)',
        reframingPrecision: '換框精準度 (Reframing Precision)',
        dimensionShift: '維度轉換力 (Dimension Shift)',
        linguisticImpact: '語言影響力 (Linguistic Impact)'
      } : {
        beliefInsight: '觀點洞察力 (Belief Insight)',
        emotionalEmpathy: '情緒共情度 (Emotional Empathy)',
        positiveIntention: '意圖連結度 (Positive Intention)',
        reframingMastery: '換框精妙度 (Reframing Mastery)',
        transformationDrive: '破框轉化力 (Transformation Drive)'
      };

      let barsHtml = '';
      Object.keys(dimLabels).forEach(key => {
        const val = dims[key] || 80;
        barsHtml += `
          <div class="radar-bar-item">
            <div class="radar-bar-header">
              <span>${dimLabels[key]}</span>
              <span style="font-weight: 700; color: #4338ca;">${val}分</span>
            </div>
            <div class="radar-bar-track">
              <div class="radar-bar-fill" style="width: ${val}%;"></div>
            </div>
          </div>
        `;
      });
      dom.reportRadarBars.innerHTML = barsHtml;
    }

    // 渲染亮點
    if (dom.reportStrengthsList) {
      const strengths = Array.isArray(report.highlightStrengths) 
        ? report.highlightStrengths 
        : (Array.isArray(report.strengths) ? report.strengths : []);
      dom.reportStrengthsList.innerHTML = strengths.map(s => `<li>✨ ${escapeHtml(s)}</li>`).join('');
    }

    // 渲染刻意練習指引
    if (dom.reportRecommendationsList) {
      const recs = Array.isArray(report.growthRecommendations) ? report.growthRecommendations : [];
      dom.reportRecommendationsList.innerHTML = recs.map(r => `<li>🎯 ${escapeHtml(r)}</li>`).join('');
    }

    // 渲染逐題/逐回合回顧列表
    if (dom.reportExercisesList) {
      if (report.mode === 'dialogue') {
        const highlights = Array.isArray(report.turnHighlights) && report.turnHighlights.length > 0 
          ? report.turnHighlights 
          : [];
        let dlgHtml = '';
        if (highlights.length > 0) {
          highlights.forEach((h, idx) => {
            dlgHtml += `
              <div class="report-exercise-card" style="margin-bottom:1rem; border-left:4px solid #8b5cf6;">
                <div class="ex-header">
                  <span class="ex-index">第 ${h.turn || idx + 1} 回合精華</span>
                  <span class="ex-speaker">⚔️ 破框換框實戰</span>
                  <span class="ex-score-badge" style="background:#ede9fe; color:#6d28d9;">回合點評</span>
                </div>
                <div class="ex-body" style="display:flex; flex-direction:column; gap:0.5rem;">
                  <div><b>💬 學員回應原句：</b>『${escapeHtml(h.userQuote || '')}』</div>
                  <div style="color:#7c3aed;"><b>🧠 關主心理觸發：</b>${escapeHtml(h.bossReaction || '')}</div>
                  <div class="ex-coach-critique"><b>💡 導師即時點評：</b>${escapeHtml(h.mentorComment || '')}</div>
                  ${h.icfGoldenSentence ? `<div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:8px 12px; border-radius:6px; font-size:0.83rem; color:#065f46;"><b>✨ 大師級示範金句 (ICF Golden Sentence)：</b><br>${escapeHtml(h.icfGoldenSentence)}</div>` : ''}
                </div>
              </div>
            `;
          });
        } else if (Array.isArray(report.dialogueHistory) && report.dialogueHistory.length > 0) {
          dlgHtml += `<div style="background:#f8fafc; padding:1.2rem; border-radius:10px; font-size:0.88rem; line-height:1.75; border:1px solid #e2e8f0;">`;
          report.dialogueHistory.forEach(m => {
            const isUser = m.role === 'user';
            dlgHtml += `
              <div style="margin-bottom:0.75rem; padding-bottom:0.5rem; border-bottom:1px dashed #e2e8f0; color:${isUser ? '#4338ca' : '#0f172a'};">
                <b>${isUser ? '🧙‍♂️ 學員教練' : (report.bossName || '關主')}：</b>
                『${escapeHtml(m.content || '')}』
              </div>`;
          });
          dlgHtml += `</div>`;
        }
        dom.reportExercisesList.innerHTML = dlgHtml;
      } else {
        const exercises = Array.isArray(report.exercises) ? report.exercises : [];
        let exHtml = '';
        exercises.forEach((ex, idx) => {
          const isListen = report.mode === 'listen';
          exHtml += `
            <div class="report-exercise-card">
              <div class="ex-header">
                <span class="ex-index">第 ${idx + 1} 題</span>
                <span class="ex-speaker">${ex.question?.avatar || '👤'} ${escapeHtml(ex.question?.speaker || '')}（${escapeHtml(ex.question?.categoryName || '')}）</span>
                <span class="ex-score-badge">${ex.evaluation?.score || 80}分</span>
              </div>
              <div class="ex-statement">『${escapeHtml(ex.question?.statement || '')}』</div>
              
              <div class="ex-body">
                ${isListen ? `
                  <div class="ex-user-answer">
                    <div><b>學員觀點：</b>${escapeHtml(ex.userBelief || '（未填寫）')}</div>
                    <div><b>學員情緒：</b>${escapeHtml(ex.userEmotion || '（未填寫）')}</div>
                    <div><b>學員渴望：</b>${escapeHtml(ex.userNeed || '（未填寫）')}</div>
                  </div>
                ` : `
                  <div class="ex-user-answer">
                    <div><b>學員破框回應：</b>『${escapeHtml(ex.userResponse || '')}』</div>
                    <div><b>識別模式：</b>${escapeHtml(ex.evaluation?.identifiedPattern || 'NLP 模式')}</div>
                  </div>
                `}
                <div class="ex-coach-critique">
                  <b>💡 導師點評：</b>${escapeHtml(ex.evaluation?.coachEvaluation || ex.evaluation?.coachCritique || '')}
                </div>
              </div>
            </div>
          `;
        });
        dom.reportExercisesList.innerHTML = exHtml;
      }
    }
  }

  // 匯出 Markdown 格式字串
  function buildReportMarkdown() {
    if (!state.currentReport) return '';
    const r = state.currentReport;
    const now = new Date(r.createdAt || Date.now()).toLocaleString('zh-TW');

    let md = `# 🪄 CoachQuest NLP 語言魔力回應術・修煉復盤報告\n\n`;
    md += `**學員教練**：${r.studentName}  \n`;
    md += `**訓練專項**：${r.modeName}  \n`;
    if (r.bossName) md += `**對決關主**：${r.bossName}（${r.difficulty || '普通難度'}）  \n`;
    md += `**榮譽稱號**：${r.masteryTitle}  \n`;
    md += `**綜合得分**：${r.overallScore} 分  \n`;
    md += `**結算時間**：${now}  \n\n`;

    md += `## 🌟 大師導師總結評語\n${r.summaryCritique}\n\n`;

    md += `## 📊 能力五維度分析\n`;
    const dims = r.radarDimensions || {};
    if (r.mode === 'dialogue') {
      md += `- **同理跟隨力**：${dims.empathyPacing || 80}/100\n`;
      md += `- **意圖捕捉力**：${dims.intentionCapture || 80}/100\n`;
      md += `- **換框精準度**：${dims.reframingPrecision || 80}/100\n`;
      md += `- **維度轉換力**：${dims.dimensionShift || 80}/100\n`;
      md += `- **語言影響力**：${dims.linguisticImpact || 80}/100\n\n`;
    } else {
      md += `- **觀點洞察力**：${dims.beliefInsight || 80}/100\n`;
      md += `- **情緒共情度**：${dims.emotionalEmpathy || 80}/100\n`;
      md += `- **意圖連結度**：${dims.positiveIntention || 80}/100\n`;
      md += `- **換框精妙度**：${dims.reframingMastery || 80}/100\n`;
      md += `- **破框轉化力**：${dims.transformationDrive || 80}/100\n\n`;
    }

    const strengths = r.highlightStrengths || r.strengths || [];
    md += `## ✨ 卓越亮點\n`;
    strengths.forEach(s => { md += `- ${s}\n`; });

    md += `\n## 🎯 刻意練習指引\n`;
    (r.growthRecommendations || []).forEach(g => { md += `- ${g}\n`; });

    if (r.mode === 'dialogue') {
      md += `\n## ⚔️ 對話實戰回合亮點與示範金句\n`;
      if (Array.isArray(r.turnHighlights) && r.turnHighlights.length > 0) {
        r.turnHighlights.forEach((h, idx) => {
          md += `### 第 ${h.turn || idx + 1} 回合：\n`;
          md += `- **學員回應**：『${h.userQuote}』\n`;
          md += `- **關主反應**：${h.bossReaction}\n`;
          md += `- **導師點評**：${h.mentorComment}\n`;
          if (h.icfGoldenSentence) {
            md += `- **大師級示範金句**：${h.icfGoldenSentence}\n`;
          }
          md += `\n`;
        });
      } else if (Array.isArray(r.dialogueHistory)) {
        r.dialogueHistory.forEach(m => {
          md += `> **${m.role === 'user' ? '學員教練' : (r.bossName || '關主')}**：『${m.content}』\n\n`;
        });
      }
    } else {
      md += `\n## 🔍 逐題演練與大師解析對照\n`;
      (r.exercises || []).forEach((ex, idx) => {
        md += `### 題目 ${idx + 1}：${ex.question?.speaker}（${ex.question?.categoryName}）\n`;
        md += `> 關主話語：『${ex.question?.statement}』\n\n`;
        if (r.mode === 'listen') {
          md += `- **學員觀點解析**：${ex.userBelief || '（無）'}\n`;
          md += `- **學員情緒解析**：${ex.userEmotion || '（無）'}\n`;
          md += `- **學員渴望解析**：${ex.userNeed || '（無）'}\n`;
        } else {
          md += `- **學員破框回應**：『${ex.userResponse}』\n`;
          md += `- **識別運用模式**：${ex.evaluation?.identifiedPattern || 'NLP 模式'}\n`;
        }
        md += `- **得分**：${ex.evaluation?.score} 分\n`;
        md += `- **導師點評**：${ex.evaluation?.coachEvaluation || ex.evaluation?.coachCritique}\n\n`;
      });
    }

    md += `---\n*CoachQuest 教練大冒險 · NLP 語言魔術師修煉場*\n`;
    return md;
  }

  function copyReportMarkdown() {
    const md = buildReportMarkdown();
    if (!md) return;
    navigator.clipboard.writeText(md).then(() => {
      alert('✅ 已成功將 NLP 修煉報告複製至剪貼簿！');
    }).catch(() => {
      alert('複製失敗，請手動複製。');
    });
  }

  function downloadReportMarkdown() {
    const md = buildReportMarkdown();
    if (!md) return;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NLP實戰報告_${state.currentReport?.studentName || '教練'}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ========================================================
  // 第三關：專屬 NLP 對話實戰演練 (Dedicated NLP Dialogue Arena)
  // 留存在專屬區內，以 NLP 換框術與維度轉換為評核標準，授權碼專屬暢行
  // ========================================================
  const LOCAL_BOSS_PRESETS = [
    {
      id: "boss_work_1",
      name: "防禦刺蝟・研發小陳",
      title: "心力交瘁的資深後端工程師",
      avatar: "🦔",
      categoryName: "職場協作",
      scenario: "核心模組進度已延期四天未交，且未主動同步狀態，主管啟動一對一面談。",
      surfaceHow: "進度延期不敢主動同步，認為說了也是被罵，乾脆被動防禦加班到半夜受罪。",
      coreDesire: "渴望專業技術價值被尊重與看見，渴望工作負荷被客觀理解與獲得合理資源支援。",
      openingStatement: "主管，要怎麼懲處您就直說吧，反正考核表在您手上。規格改了三次、測試環境又一直掛，把時程壓死，我真的沒什麼好辯解的。",
      openingInnerThought: "（每次談話最後還不是興師問罪？隨便你們怎麼評吧，根本沒人管我死活。）",
      recommendedPatterns: ["intent", "consequence", "redefine"]
    },
    {
      id: "boss_work_2",
      name: "焦慮旋風・產品林經理",
      title: "跨部門專案經理",
      avatar: "🌪️",
      categoryName: "職場協作",
      scenario: "大型跨部門專案上線前夕，經理高度焦慮，半夜連發訊息干預所有下屬執行細節。",
      surfaceHow: "事必躬親盯緊每個細節，絕不敢放手給部屬，用高頻審查代替賦能授權。",
      coreDesire: "渴望對成果品質的極致安心感，以及身為專案主責主管的強烈責任感與安全感。",
      openingStatement: "我必須親自盯緊每個細節！要是放手給他們，專案出了大包最後還不是我要扛？我根本不敢閉上眼睛睡覺！",
      openingInnerThought: "（大家都覺得我控制狂，但如果真的搞砸了，被老闆問責的只有我一個人，誰能替我分擔這種恐懼？）",
      recommendedPatterns: ["intent", "outcome", "chunk_up"]
    },
    {
      id: "boss_work_3",
      name: "迷茫頑石・資深老張",
      title: "15年核心業務骨幹",
      avatar: "🪨",
      categoryName: "職場協作",
      scenario: "公司全面推動數位轉型與 AI 協作工具，老張拒絕參與培訓，認為花拳繡腿會毀掉公司口碑。",
      surfaceHow: "固守傳統人脈與舊工作模式，消極抗拒所有新工具，將變革視為對老員工的清算。",
      coreDesire: "渴望自己多年累積的經驗價值被肯定，渴望在時代急劇變革中保留安全感與尊嚴。",
      openingStatement: "我們以前不用這些花俏的AI工具，公司還不是做到了業界前三？現在硬要搞這些，只是把流程弄得更複雜、更容易出錯而已！",
      openingInnerThought: "（說什麼數位轉型，我看就是想把我們這批高薪老員工淘汰掉，但我這十幾年的心血算什麼？）",
      recommendedPatterns: ["redefine", "counter_example", "criteria"]
    },
    {
      id: "boss_work_4",
      name: "玻璃心新人・小雨",
      title: "應屆畢業行銷企劃",
      avatar: "🌧️",
      categoryName: "職場協作",
      scenario: "主管在週會上指出了文案企劃中的數據引用錯誤，小雨認為主管公開否定了她的全部能力。",
      surfaceHow: "將單一工作疏失與自我整個人生價值深度綁定，陷入自責自怨與退縮逃避。",
      coreDesire: "渴望被團隊接納、獲得歸屬感與確定感，確認自己有能力成為有價值的專業人才。",
      openingStatement: "主管，我是不是真的很沒用……連一份文案都寫不好，您改了那麼多，我覺得自己根本不適合這份工作，我只會給大家添麻煩。",
      openingInnerThought: "（好丟臉，大家都在看我笑話，我讀了那麼多年書，怎麼連這點小事都做不好……）",
      recommendedPatterns: ["chunk_down", "meta_frame", "intent"]
    },
    {
      id: "boss_parenting_1",
      name: "閉門刺蝟・高一兒子翔翔",
      title: "沉迷手機的叛逆青少年",
      avatar: "🎮",
      categoryName: "親子教養",
      scenario: "晚上十點房門緊閉，耳機音量開到最大打線上排位賽，對父母敲門叫他讀書極度煩躁。",
      surfaceHow: "用沉迷手遊與大吼拒絕來應對父母的嘮叨，建立絕對的心理與物理隔離。",
      coreDesire: "渴望個人界限與自主權被尊重，渴望在虛擬世界中獲得現實難以得到的成就感與掌控感。",
      openingStatement: "煩不煩啊！你們進門不會敲門嗎？除了問成績和叫我放下手機，你們還會講什麼？我的事不用你們管！",
      openingInnerThought: "（反正我在你們眼裡永遠不夠好，只有在遊戲裡我的隊友才真的需要我、認可我。）",
      recommendedPatterns: ["intent", "world_view", "meta_frame"]
    },
    {
      id: "boss_parenting_2",
      name: "焦慮直升機・全職媽媽淑芬",
      title: "名校升學焦慮症家長",
      avatar: "🚁",
      categoryName: "親子教養",
      scenario: "國三女兒模擬考退步五名，淑芬連夜取消孩子所有的假日休閒，排滿衝刺補習班。",
      surfaceHow: "嚴格控管孩子每分每秒的時間，用瘋狂補習來消解自己內心的升學焦慮。",
      coreDesire: "渴望孩子未來擁有幸福穩固的生活，渴望自己全職奉獻的付出被證明是有價值的。",
      openingStatement: "現在競爭這麼激烈，差一分就差一個志願！如果她現在不吃苦考上頂大，以後在社會上怎麼生存？我這一切還不都是為了她好！",
      openingInnerThought: "（如果女兒考砸了，大家都會說是我這個全職媽媽沒帶好，我這十幾年的心血全完了……）",
      recommendedPatterns: ["consequence", "outcome", "redefine"]
    },
    {
      id: "boss_parenting_3",
      name: "缺席提款機・台商父親志強",
      title: "長期出差的補償型父親",
      avatar: "💼",
      categoryName: "親子教養",
      scenario: "返家想跟讀高中的兒子親近，買了最新款旗艦手機送兒子，兒子卻收下禮物後轉身回房關門。",
      surfaceHow: "用金錢物資來替代真實的陪伴與深層對話，將「給予物資」等同於「盡到了父親全部責任」。",
      coreDesire: "渴望被孩子敬重、愛戴與親近，渴望彌補自己常年不在身邊的深深愧疚感。",
      openingStatement: "我每天在外面拼死拼活賺錢，每個月給家裡匯幾十萬，他要什麼我都買給他，他到底還有什麼不滿意的？為什麼連一聲爸都不想叫我？",
      openingInnerThought: "（我也想多陪他啊，但手停口就停，不賺錢這個家能過得這麼優渥嗎？他怎麼一點都不體諒我？）",
      recommendedPatterns: ["intent", "redefine", "apply_to_self"]
    },
    {
      id: "boss_parenting_4",
      name: "完美主義少女・高三女兒小琳",
      title: "大考重壓下的情緒崩潰學生",
      avatar: "📚",
      categoryName: "親子教養",
      scenario: "模考全校第三名依然崩潰大哭，撕毀考卷，認為沒有拿到榜首就是徹底的恥辱。",
      surfaceHow: "將考試成績與自我存在的價值畫上絕對等號，用極端的自我折磨來換取安全感。",
      coreDesire: "渴望獲得無條件的愛與接納，渴望確定「即使我不完美、即使我偶爾失敗，我依然值得被愛」。",
      openingStatement: "第三名有什麼用？第三名就意味著我還是個失敗者！要是我沒有考上第一志願醫學院，我的人生就全毀了，你們根本不懂！",
      openingInnerThought: "（從小大家都誇我是第一名天才，如果我掉下來了，誰還會在乎我？爸爸媽媽還會愛我嗎？）",
      recommendedPatterns: ["redefine", "criteria", "chunk_up"]
    },
    {
      id: "boss_couple_1",
      name: "冷戰冰川・疲憊妻子雅婷",
      title: "喪偶式育兒的職業婦女",
      avatar: "🧊",
      categoryName: "伴侶親密",
      scenario: "下班接小孩、做晚餐、盯作業到深夜，丈夫下班進門滑手機問『今晚吃什麼』，妻子徹底冷臉。",
      surfaceHow: "用冷漠、嘆氣、拒絕交流與分房睡，來表達自己無法言說的疲憊與失望。",
      coreDesire: "渴望在家庭繁重瑣事中被看見、被疼惜，渴望與伴侶擁有共同承擔的深層連結感。",
      openingStatement: "隨便你怎麼想吧，反正這個家有沒有你都一樣。我已經不想再跟你吵了，吵了八百遍你也不會改，大家各過各的吧。",
      openingInnerThought: "（我真的快累垮了，我不是想要你洗那兩個碗，我是想看到你真的在乎我、真的看見我快撐不下去了……）",
      recommendedPatterns: ["intent", "redefine", "chunk_up"]
    },
    {
      id: "boss_couple_2",
      name: "逃避鴕鳥・沉默丈夫俊傑",
      title: "下班躲在車庫的專案主管",
      avatar: "🦤",
      categoryName: "伴侶親密",
      scenario: "開車到家後熄火坐在車裡滑半小時手機才上樓，一進家門只要妻子一開口抱怨就默默進書房關門。",
      surfaceHow: "用沉默、拖延與物理迴避，逃離家庭中的情緒對立與指責。",
      coreDesire: "渴望一處能徹底卸下壓力、沒有指責與要求的安全避風港，渴望被妻子肯定與欣賞。",
      openingStatement: "一進門就問我這個做沒、那個弄沒……我在公司被老闆電了一整天，回自己家難道連安靜半小時的資格都沒有嗎？",
      openingInnerThought: "（我做什麼在她眼裡都是錯的，既然怎麼做都會被罵，那我不如什麼都不要說、什麼都不要做。）",
      recommendedPatterns: ["intent", "world_view", "outcome"]
    },
    {
      id: "boss_couple_3",
      name: "疑心偵探・安全感缺失女友芳芳",
      title: "高敏感且患得患失的伴侶",
      avatar: "🔍",
      categoryName: "伴侶親密",
      scenario: "男友晚上和同事聚餐半小時未看手機，芳芳連續撥打12通未接電話，並要求開啟視訊證明周圍沒有異性。",
      surfaceHow: "用連環奪命連環call、翻看手機、查定位等高壓控管手段來索取安全感。",
      coreDesire: "渴望在親密關係中感受到被牽掛、被堅定選擇與無可替代的深度連結感。",
      openingStatement: "你剛才為什麼半個小時沒回我訊息？你是不是跟誰在一起？如果你真的在乎我，怎麼可能連花五秒鐘報備都做不到！你根本心裡沒有我！",
      openingInnerThought: "（以前說愛我的人最後都拋棄我了，我好害怕一眨眼你也不要我了，我快被這種恐慌逼瘋了……）",
      recommendedPatterns: ["intent", "counter_example", "meta_frame"]
    },
    {
      id: "boss_couple_4",
      name: "大男人強權・事業型男友阿豪",
      title: "控制型高管伴侶",
      avatar: "🦁",
      categoryName: "伴侶親密",
      scenario: "要求女友辭去目前感興趣的文創工作，必須到自己朋友的科技公司上班，並批評女友沒有大局觀。",
      surfaceHow: "用經濟強勢與霸道安排來主導伴侶的一切決定，不容許對方的獨立意志。",
      coreDesire: "渴望對未來的掌控感，用『保護與規劃』來包裝自己對親密關係不可控的深層恐懼。",
      openingStatement: "我幫你安排好去我朋友公司上班有什麼不好？你那點薪水連房租都不夠，我做這一切都是為了我們的未來好，你為什麼總要跟我唱反調？",
      openingInnerThought: "（她如果越走越遠、認識更多外面的圈子，會不會哪天就覺得我配不上她了？我必須讓她留在我的安全範圍內。）",
      recommendedPatterns: ["intent", "redefine", "apply_to_self"]
    },
    {
      id: "boss_personal_1",
      name: "絕望冒牌者・創業青年家豪",
      title: "陷入冒牌者症候群的科技創辦人",
      avatar: "🎭",
      categoryName: "個人突破",
      scenario: "剛拿下千萬元天使輪融資，下週即將向百位投資人與媒體進行產品發表會，家豪卻整夜失眠、極度恐慌。",
      surfaceHow: "將所有的成功歸因於僥倖與運氣，整天緊繃戒備，害怕自己隨時被拆穿是個騙子。",
      coreDesire: "渴望打從心底接納自己的真實價值，渴望擺脫『必須時刻完美無瑕才配被認可』的窒息重壓。",
      openingStatement: "投資人看錯我了……現在的成績純粹只是走運，我根本沒有能力帶領三十人的團隊。下個月的發布會我一定會徹底搞砸，大家很快就會發現我只是個冒牌貨！",
      openingInnerThought: "（如果大家知道我私底下有多脆弱多無能，一定會徹底唾棄我，我好想現在就找個地洞鑽進去……）",
      recommendedPatterns: ["chunk_down", "counter_example", "criteria"]
    },
    {
      id: "boss_personal_2",
      name: "空巢迷航・全職主婦慧琳",
      title: "孩子離家後失去生活重心的母親",
      avatar: "🕊️",
      categoryName: "個人突破",
      scenario: "小兒子去外地讀大學後，慧琳每天坐在客廳對著空房間發呆流淚，覺得人生後半場已經毫無意義。",
      surfaceHow: "依然試圖透過每日高頻電話過度干預成年孩子的生活，將母職作為唯一的自我價值寄託。",
      coreDesire: "渴望被需要與被珍視，渴望重新找回除了『母親』角色之外的獨立生命意義與自信。",
      openingStatement: "孩子走了，家裡空蕩蕩的……我這二十幾年把所有青春都奉獻給這個家，現在他們不需要我了，我活著還有什麼價值？我什麼都不會了。",
      openingInnerThought: "（鏡子裡的我老了、落伍了，孩子在看更廣闊的世界，而我已經成了被時代拋棄的多餘人……）",
      recommendedPatterns: ["redefine", "outcome", "chunk_up"]
    },
    {
      id: "boss_personal_3",
      name: "困頓中年中階主管・志偉",
      title: "面臨中年失業危機的45歲經理",
      avatar: "🧗‍♂️",
      categoryName: "個人突破",
      scenario: "因外企裁員縮編失去工作，投了上百份高管履歷毫無音訊，面對房貸與孩子學費陷入極度自怨自艾。",
      surfaceHow: "死守過去的頭銜與固定薪資架構，認為年過四十沒人要就是人生已經死局。",
      coreDesire: "渴望重新確認自我的核心競爭力與社會價值，渴望在家庭中維持尊嚴與頂樑柱的支撐感。",
      openingStatement: "到了這個年紀被裁員，誰還要我？年輕人便宜又能熬夜加班，我除了這十幾年做的事什麼都不會，我這輩子真的完了，我沒臉面對老婆孩子。",
      openingInnerThought: "（以前走在公司大家都點頭哈腰，現在坐在人力銀行前我就是個過剩人口，我怎麼會把一手好牌打成這樣……）",
      recommendedPatterns: ["redefine", "counter_example", "model_world"]
    },
    {
      id: "boss_personal_4",
      name: "退休失落・老廠長老劉",
      title: "失去權力光環的退休長者",
      avatar: "👴",
      categoryName: "個人突破",
      scenario: "退休後每天在家巡視挑剔，對兒女的家事安排、孫子的教育指手畫腳，引發全家人敬而遠之。",
      surfaceHow: "用挑毛病、立規矩、重提當年勇來強行刷存在感，試圖維持過去號令全場的權威做法。",
      coreDesire: "渴望依然被家人敬重與重視，渴望在生命晚期依然保持對周遭生活的影響力與被需要的存在感。",
      openingStatement: "現在年輕人根本不懂規矩！我當年管幾千人的大廠，所有人見到我都客客氣氣的，現在在自己家裡，連叫你們吃個飯都沒人聽我的，你們就是嫌我老了沒用了！",
      openingInnerThought: "（人走茶涼啊，走出那扇大門我就什麼都不是了，現在連自己的兒女都拿我當空氣，我真的老得一文不值了嗎？）",
      recommendedPatterns: ["intent", "redefine", "criteria"]
    }
  ];

  function getLocalBossPreset(bossId) {
    return LOCAL_BOSS_PRESETS.find(b => b.id === bossId) || LOCAL_BOSS_PRESETS[0];
  }

  // 開啟第三關：專屬 NLP 對話實戰關
  function startNlpDialogue(bossId = 'boss_work_1', difficulty = 'normal') {
    if (!checkSubscription()) return;
    state.activeMode = 'dialogue';
    state.dialogueBossId = bossId;
    state.dialogueDifficulty = difficulty;
    state.dialogueHistory = [];
    state.dialogueTurnIndex = 1;

    const boss = getLocalBossPreset(bossId);
    state.currentDialogueBoss = boss;

    const maxHp = difficulty === 'normal' ? 60 : (difficulty === 'hard' ? 80 : 100);
    state.dialogueMaxHp = maxHp;
    state.dialogueCurrentHp = maxHp;

    // 更新介面基本資訊
    if (dom.nlpDlgBossSelect) dom.nlpDlgBossSelect.value = bossId;
    if (dom.nlpDlgDiffSelect) dom.nlpDlgDiffSelect.value = difficulty;
    if (dom.dlgBossAvatar) dom.dlgBossAvatar.textContent = boss.avatar;
    if (dom.dlgBossName) dom.dlgBossName.textContent = boss.name;
    if (dom.dlgBossTitle) dom.dlgBossTitle.textContent = boss.title;
    if (dom.dlgBossScenario) dom.dlgBossScenario.textContent = boss.scenario;
    if (dom.dlgStuckHow) dom.dlgStuckHow.textContent = boss.surfaceHow;
    if (dom.dlgCoreDesire) dom.dlgCoreDesire.textContent = boss.coreDesire;

    updateDlgHpBar(maxHp, maxHp);

    // 切換至對話實戰畫面
    dom.screenHub?.classList.add('hidden');
    dom.screenListen?.classList.add('hidden');
    dom.screenResponse?.classList.add('hidden');
    dom.screenReport?.classList.add('hidden');
    dom.screenDialogue?.classList.remove('hidden');

    // 渲染開場白
    renderDialogueOpening(boss);

    // 渲染開場換框錦囊建議
    renderDlgTacticsList(boss.recommendedPatterns || ['intent', 'redefine', 'consequence']);
  }

  function updateDlgHpBar(current, max) {
    if (dom.dlgHpText) dom.dlgHpText.textContent = `${Math.max(0, current)} / ${max} HP`;
    if (dom.dlgHpBar) {
      const pct = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
      dom.dlgHpBar.style.width = `${pct}%`;
      if (pct <= 25) {
        dom.dlgHpBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      } else if (pct <= 60) {
        dom.dlgHpBar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
      } else {
        dom.dlgHpBar.style.background = 'linear-gradient(90deg, #ef4444, #f59e0b)';
      }
    }
  }

  function renderDialogueOpening(boss) {
    if (!dom.dlgChatBox) return;
    dom.dlgChatBox.innerHTML = '';

    let openingDialogue = boss.openingStatement;
    let openingInnerThought = boss.openingInnerThought;
    let openingMood = '眼神迴避，防衛緊繃';

    // 支援同一關主每次練習動態隨機抽取不同心情與起手開場白
    if (typeof window.getBossOpening === 'function' && Array.isArray(window.BOSSES)) {
      const matchBoss = window.BOSSES.find(b => b.id === boss.id);
      if (matchBoss) {
        const op = window.getBossOpening(matchBoss);
        if (op && op.dialogue) {
          openingDialogue = op.dialogue;
          openingInnerThought = op.innerThought || openingInnerThought;
          openingMood = op.mood || openingMood;
        }
      }
    }

    state.dialogueHistory = [
      {
        role: 'assistant',
        speaker: boss.name,
        content: openingDialogue,
        innerThought: openingInnerThought
      }
    ];

    appendBossMessage(boss.name, boss.avatar, openingDialogue, openingInnerThought, openingMood);
  }

  function appendBossMessage(name, avatar, statement, innerThought, mood) {
    if (!dom.dlgChatBox) return;
    const row = document.createElement('div');
    row.className = 'nlp-msg-row boss-row';
    row.innerHTML = `
      <div class="nlp-msg-avatar">${avatar}</div>
      <div class="nlp-msg-body">
        <div style="font-size:0.78rem; font-weight:700; color:#64748b;">${escapeHtml(name)}</div>
        <div class="nlp-bubble nlp-bubble-boss">
          ${mood ? `<div class="nlp-bubble-mood">【神態】${escapeHtml(mood)}</div>` : ''}
          ${innerThought ? `<div class="nlp-bubble-inner-thought">💭 內心OS：${escapeHtml(innerThought)}</div>` : ''}
          <div>${escapeHtml(statement)}</div>
        </div>
      </div>
    `;
    dom.dlgChatBox.appendChild(row);
    dom.dlgChatBox.scrollTop = dom.dlgChatBox.scrollHeight;
  }

  function appendCoachMessage(statement) {
    if (!dom.dlgChatBox) return;
    const row = document.createElement('div');
    row.className = 'nlp-msg-row coach-row';
    row.innerHTML = `
      <div class="nlp-msg-avatar">🧙‍♂️</div>
      <div class="nlp-msg-body" style="align-items: flex-end;">
        <div style="font-size:0.78rem; font-weight:700; color:#64748b;">我（學員教練）</div>
        <div class="nlp-bubble nlp-bubble-coach">
          ${escapeHtml(statement)}
        </div>
      </div>
    `;
    dom.dlgChatBox.appendChild(row);
    dom.dlgChatBox.scrollTop = dom.dlgChatBox.scrollHeight;
  }

  function appendTurnFeedback(turnResult) {
    if (!dom.dlgChatBox) return;
    const card = document.createElement('div');
    card.className = 'nlp-turn-feedback-card';
    const pattern = turnResult.identifiedPattern || {};
    const feedback = turnResult.coachFeedback || {};

    card.innerHTML = `
      <div class="nlp-feedback-top">
        <span class="nlp-pattern-pill">🎯 識別換框：${escapeHtml(pattern.name || '意圖探尋')}</span>
        <span class="nlp-hp-deduction-badge">⚡ 心防 -${turnResult.hpDeduction || 20} HP (評分: ${turnResult.turnScore || 85}分)</span>
      </div>
      <div class="nlp-coach-advice-text">
        <div><b>💡 亮點：</b>${escapeHtml(feedback.strength || '準確體會到對方的正面意圖，有效鬆動抗拒。')}</div>
        ${feedback.nextStepAdvice ? `<div style="margin-top:0.25rem; color:#4338ca;"><b>🧭 下步引導：</b>${escapeHtml(feedback.nextStepAdvice)}</div>` : ''}
      </div>
    `;
    dom.dlgChatBox.appendChild(card);
    dom.dlgChatBox.scrollTop = dom.dlgChatBox.scrollHeight;
  }

  function toggleDlgTacticsDrawer() {
    if (!dom.dlgTacticsBox) return;
    const isHidden = dom.dlgTacticsBox.style.display === 'none';
    dom.dlgTacticsBox.style.display = isHidden ? 'block' : 'none';
  }

  function renderDlgTacticsList(suggestedPatterns) {
    if (!dom.dlgTacticsList) return;
    dom.dlgTacticsList.innerHTML = '';

    const list = Array.isArray(suggestedPatterns) ? suggestedPatterns : ['intent', 'redefine', 'consequence'];
    list.forEach(item => {
      const pId = typeof item === 'string' ? item : (item.id || item.patternId || 'intent');
      const pObj = state.patterns.find(p => p.id === pId) || { nameZh: item.name || '正面意圖', icon: '🪄', formula: '肯定其正面初衷' };
      const hint = typeof item === 'object' && item.hint ? item.hint : pObj.summary;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nlp-tactics-tag';
      btn.innerHTML = `<span>${pObj.icon}</span> <span>${pObj.nameZh}</span>`;
      btn.title = `${pObj.summary}\n示範句型：${pObj.formula}`;
      btn.addEventListener('click', () => {
        if (dom.inputDlg) {
          dom.inputDlg.value = pObj.formula;
          dom.inputDlg.focus();
        }
      });
      dom.dlgTacticsList.appendChild(btn);
    });
  }

  // 發送教練對話回應
  async function handleNlpDialogueSend() {
    const text = (dom.inputDlg?.value || '').trim();
    if (!text) {
      alert('請先輸入你想對關主說的教練話語！');
      dom.inputDlg?.focus();
      return;
    }

    if (dom.btnDlgSend) {
      dom.btnDlgSend.disabled = true;
      dom.btnDlgSend.textContent = '關主體會中...';
    }

    appendCoachMessage(text);
    if (dom.inputDlg) dom.inputDlg.value = '';

    state.dialogueHistory.push({
      role: 'user',
      content: text
    });

    try {
      const res = await fetch('/api/nlp/dialogue/turn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-subscription-code': getSubCode()
        },
        body: JSON.stringify({
          bossId: state.dialogueBossId,
          difficulty: state.dialogueDifficulty,
          dialogueHistory: state.dialogueHistory,
          userMessage: text,
          subCode: getSubCode()
        })
      });

      const data = await res.json();
      if (!data.ok) {
        if (data.error === 'SUBSCRIPTION_REQUIRED') {
          if (typeof window.showSubscriptionModal === 'function') {
            window.showSubscriptionModal(data.message || '請先啟用有效訂閱授權碼');
          } else {
            alert(data.message);
          }
          return;
        }
        alert('發送失敗：' + (data.error || '請稍後重試'));
        return;
      }

      const turn = data.turnResult || {};
      
      // 更新心防
      state.dialogueCurrentHp = Math.max(0, state.dialogueCurrentHp - (Number(turn.hpDeduction) || 20));
      updateDlgHpBar(state.dialogueCurrentHp, state.dialogueMaxHp);

      // 回報評估
      appendTurnFeedback(turn);

      // 檢查心防是否徹底瓦解
      if (state.dialogueCurrentHp === 0) {
        const victoryRow = document.createElement('div');
        victoryRow.style.margin = '1rem 0';
        victoryRow.style.padding = '1rem';
        victoryRow.style.background = 'linear-gradient(135deg, #ecfdf5, #d1fae5)';
        victoryRow.style.border = '2px solid #10b981';
        victoryRow.style.borderRadius = '12px';
        victoryRow.style.textAlign = 'center';
        victoryRow.innerHTML = `
          <div style="font-size:1.8rem; margin-bottom:0.25rem;">🎉 破框大成功！關主心防已徹底瓦解！</div>
          <div style="font-size:0.9rem; color:#065f46; margin-bottom:0.75rem;">你成功運用 NLP 語言回應術將對方的執念轉換為無限可能性，成功將關主收攏入百寶箱！</div>
          <button class="btn btn-primary" id="btnNlpDlgAutoFinish" style="background:#059669; font-weight:800; padding:0.6rem 1.4rem;">
            🏆 立即查看本場實戰復盤報告 ➔
          </button>
        `;
        dom.dlgChatBox?.appendChild(victoryRow);
        dom.dlgChatBox?.scrollTo({ top: dom.dlgChatBox.scrollHeight, behavior: 'smooth' });

        document.getElementById('btnNlpDlgAutoFinish')?.addEventListener('click', finishDialogueAndGenerateReport);
      } else {
        // 關主下前回應
        const boss = state.currentDialogueBoss || getLocalBossPreset(state.dialogueBossId);
        appendBossMessage(boss.name, boss.avatar, turn.bossReply, turn.innerThought, turn.mood);

        state.dialogueHistory.push({
          role: 'assistant',
          speaker: boss.name,
          content: turn.bossReply,
          innerThought: turn.innerThought
        });

        // 更新錦囊推薦
        if (Array.isArray(turn.suggestedNextPatterns) && turn.suggestedNextPatterns.length > 0) {
          renderDlgTacticsList(turn.suggestedNextPatterns);
          if (dom.dlgTacticsBox) dom.dlgTacticsBox.style.display = 'block';
        }
      }
    } catch (err) {
      console.error('對話發送異常:', err);
      alert('網路連線異常，請稍後重試。');
    } finally {
      if (dom.btnDlgSend) {
        dom.btnDlgSend.disabled = false;
        dom.btnDlgSend.textContent = '🚀 發送回應';
      }
      dom.inputDlg?.focus();
    }
  }

  // 結算對話實戰關報告
  async function finishDialogueAndGenerateReport() {
    if (!checkSubscription()) return;
    if (dom.btnDlgFinish) {
      dom.btnDlgFinish.disabled = true;
      dom.btnDlgFinish.textContent = '正在生成復盤報告...';
    }

    try {
      const res = await fetch('/api/nlp/dialogue/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-subscription-code': getSubCode()
        },
        body: JSON.stringify({
          bossId: state.dialogueBossId,
          difficulty: state.dialogueDifficulty,
          dialogueHistory: state.dialogueHistory,
          studentName: getStudentName(),
          subCode: getSubCode()
        })
      });

      const data = await res.json();
      if (!data.ok) {
        if (data.error === 'SUBSCRIPTION_REQUIRED') {
          if (typeof window.showSubscriptionModal === 'function') {
            window.showSubscriptionModal(data.message || '請先啟用有效訂閱授權碼');
          } else {
            alert(data.message);
          }
          return;
        }
        alert('生成報告失敗：' + (data.error || '請重試'));
        return;
      }

      state.currentReport = data.report;
      renderMasteryReport(data.report);

      // 同步本地百寶箱練習紀錄
      if (typeof InventoryManager !== 'undefined' && typeof InventoryManager.recordBattleResult === 'function') {
        const boss = state.currentDialogueBoss || getLocalBossPreset(state.dialogueBossId);
        const evalData = {
          score: data.report.overallScore,
          winningReason: `【NLP對話實戰】榮獲『${data.report.masteryTitle}』稱號（與 ${boss.name} 對決）`,
          advice: data.report.summaryCritique,
          dimensions: data.report.radarDimensions
        };
        InventoryManager.recordBattleResult(boss, evalData, state.dialogueHistory);
      }

      // 切換至報告畫面
      dom.screenDialogue?.classList.add('hidden');
      dom.screenReport?.classList.remove('hidden');
      dom.screenReport?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      console.error('對話結算報告失敗:', e);
      alert('產生結算報告時發生錯誤，請重試。');
    } finally {
      if (dom.btnDlgFinish) {
        dom.btnDlgFinish.disabled = false;
        dom.btnDlgFinish.textContent = '🏁 結算對話報告';
      }
    }
  }

  // 14 模式速查圖鑑彈窗
  function openPatternsModal() {
    if (!dom.modalPatterns) initElements();
    dom.modalPatterns?.classList.remove('hidden');
  }

  function closePatternsModal() {
    dom.modalPatterns?.classList.add('hidden');
  }

  function renderPatternsGrid() {
    if (!dom.patternsGrid) return;
    dom.patternsGrid.innerHTML = '';

    state.patterns.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'nlp-pattern-card';
      card.innerHTML = `
        <div class="pattern-card-header">
          <span class="pattern-icon">${p.icon}</span>
          <div>
            <div class="pattern-name">${idx + 1}. ${escapeHtml(p.nameZh)}</div>
            <div class="pattern-en">${escapeHtml(p.name)}</div>
          </div>
        </div>
        <div class="pattern-summary">${escapeHtml(p.summary)}</div>
        <div class="pattern-formula"><b>句型：</b>${escapeHtml(p.formula)}</div>
      `;
      dom.patternsGrid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    init,
    openNlpArena,
    closeNlpArena,
    startPractice,
    openPatternsModal,
    closePatternsModal
  };
})();

// 當 DOM 載入完成時自動初始化
document.addEventListener('DOMContentLoaded', () => {
  if (window.NlpManager) {
    window.NlpManager.init();
  }
});
