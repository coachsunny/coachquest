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
    dom.btnStartBattle?.addEventListener('click', startNlpBattle);
    dom.btnViewPatterns?.addEventListener('click', openPatternsModal);
    dom.btnHubViewPatterns?.addEventListener('click', openPatternsModal);

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
    dom.screenReport?.classList.add('hidden');
  }

  // 開始練習指定關卡
  async function startPractice(mode) {
    if (!checkSubscription()) return;
    state.activeMode = mode;
    state.sessionExercises = [];
    state.currentQuestionIndex = 0;
    state.selectedPatternId = '';

    dom.screenHub?.classList.add('hidden');
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
      if (dom.inputBelief) dom.inputBelief.value = '';
      if (dom.inputEmotion) dom.inputEmotion.value = '';
      if (dom.inputNeed) dom.inputNeed.value = '';
      if (dom.listenFeedbackScore) dom.listenFeedbackScore.textContent = '--';
      if (dom.listenDimensionShiftBox) dom.listenDimensionShiftBox.innerHTML = '';
    } else {
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
      const dimLabels = {
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
      const strengths = Array.isArray(report.highlightStrengths) ? report.highlightStrengths : [];
      dom.reportStrengthsList.innerHTML = strengths.map(s => `<li>✨ ${escapeHtml(s)}</li>`).join('');
    }

    // 渲染刻意練習指引
    if (dom.reportRecommendationsList) {
      const recs = Array.isArray(report.growthRecommendations) ? report.growthRecommendations : [];
      dom.reportRecommendationsList.innerHTML = recs.map(r => `<li>🎯 ${escapeHtml(r)}</li>`).join('');
    }

    // 渲染逐題回顧列表
    if (dom.reportExercisesList) {
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

  // 匯出 Markdown 格式字串
  function buildReportMarkdown() {
    if (!state.currentReport) return '';
    const r = state.currentReport;
    const now = new Date(r.createdAt || Date.now()).toLocaleString('zh-TW');

    let md = `# 🪄 CoachQuest NLP 語言魔力回應術・修煉復盤報告\n\n`;
    md += `**學員教練**：${r.studentName}  \n`;
    md += `**訓練專項**：${r.modeName}  \n`;
    md += `**榮譽稱號**：${r.masteryTitle}  \n`;
    md += `**綜合得分**：${r.overallScore} 分  \n`;
    md += `**完成題目數**：${r.totalExercises} 題  \n`;
    md += `**結算時間**：${now}  \n\n`;

    md += `## 🌟 大師導師總結評語\n${r.summaryCritique}\n\n`;

    md += `## 📊 能力五維度分析\n`;
    const dims = r.radarDimensions || {};
    md += `- **觀點洞察力**：${dims.beliefInsight || 80}/100\n`;
    md += `- **情緒共情度**：${dims.emotionalEmpathy || 80}/100\n`;
    md += `- **意圖連結度**：${dims.positiveIntention || 80}/100\n`;
    md += `- **換框精妙度**：${dims.reframingMastery || 80}/100\n`;
    md += `- **破框轉化力**：${dims.transformationDrive || 80}/100\n\n`;

    md += `## ✨ 卓越亮點\n`;
    (r.highlightStrengths || []).forEach(s => { md += `- ${s}\n`; });
    md += `\n## 🎯 刻意練習指引\n`;
    (r.growthRecommendations || []).forEach(g => { md += `- ${g}\n`; });
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

    md += `---\n*CoachQuest 教練大冒險・語言魔術師修煉場出品*\n`;
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
    a.download = `NLP修煉報告_${state.currentReport?.studentName}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 第三關：開啟實戰對話關（引導至關主清單並啟動 NLP 戰術錦囊優先模式）
  function startNlpBattle() {
    closeNlpArena();
    if (typeof window.switchView === 'function') {
      window.switchView('map');
      if (typeof window.showSystemToast === 'function') {
        window.showSystemToast('🪄 已啟動 NLP 回應實戰模式：挑選任一位關主開始對決，戰術錦囊將優先推薦 14 種換框術！');
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
