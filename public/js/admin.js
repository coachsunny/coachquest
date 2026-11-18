// ========================================================
// CoachQuest 導師督導管理看板前端腳本 (Admin Dashboard)
// ========================================================

const ADMIN_TOKEN_KEY = 'cq_admin_token';
let currentLogs = [];
let viewingLog = null;

// DOM 元素快取
const elements = {
  loginSection: document.getElementById('loginSection'),
  dashboardSection: document.getElementById('dashboardSection'),
  authNavControls: document.getElementById('authNavControls'),
  formAdminLogin: document.getElementById('formAdminLogin'),
  inputAdminUser: document.getElementById('inputAdminUser'),
  inputAdminPass: document.getElementById('inputAdminPass'),
  loginErrorMsg: document.getElementById('loginErrorMsg'),
  btnLogout: document.getElementById('btnLogout'),
  btnRefreshList: document.getElementById('btnRefreshList'),
  btnExportAllJson: document.getElementById('btnExportAllJson'),
  btnClearAllLogs: document.getElementById('btnClearAllLogs'),

  // 頂部頁籤與面板
  tabLogs: document.getElementById('tabLogs'),
  tabSubscriptions: document.getElementById('tabSubscriptions'),
  panelLogs: document.getElementById('panelLogs'),
  panelSubscriptions: document.getElementById('panelSubscriptions'),

  // 統計數值 (對話紀錄)
  statTotalCount: document.getElementById('statTotalCount'),
  statUniqueStudents: document.getElementById('statUniqueStudents'),
  statAvgScore: document.getElementById('statAvgScore'),
  statCapturedRate: document.getElementById('statCapturedRate'),

  // 篩選 (對話紀錄)
  filterSearch: document.getElementById('filterSearch'),
  filterBoss: document.getElementById('filterBoss'),
  filterCaptured: document.getElementById('filterCaptured'),

  // 列表 (對話紀錄)
  logsTableBody: document.getElementById('logsTableBody'),
  logsEmptyState: document.getElementById('logsEmptyState'),

  // 統計數值 (訂閱授權)
  subStatTotal: document.getElementById('subStatTotal'),
  subStatActive: document.getElementById('subStatActive'),
  subStatPermanent: document.getElementById('subStatPermanent'),
  subStatExpiring: document.getElementById('subStatExpiring'),

  // 篩選與工具 (訂閱授權)
  filterSubSearch: document.getElementById('filterSubSearch'),
  filterSubStatus: document.getElementById('filterSubStatus'),
  btnOpenCreateSubModal: document.getElementById('btnOpenCreateSubModal'),
  btnExportSubs: document.getElementById('btnExportSubs'),

  // 列表 (訂閱授權)
  subTableBody: document.getElementById('subTableBody'),
  subEmptyState: document.getElementById('subEmptyState'),

  // 詳情彈窗
  modalLogDetail: document.getElementById('modalLogDetail'),
  modalLogTitle: document.getElementById('modalLogTitle'),
  modalLogContent: document.getElementById('modalLogContent'),
  btnCloseDetailModal: document.getElementById('btnCloseDetailModal'),
  btnCloseDetailModalBottom: document.getElementById('btnCloseDetailModalBottom'),
  btnDownloadDetailMd: document.getElementById('btnDownloadDetailMd'),
  btnDownloadDetailPdf: document.getElementById('btnDownloadDetailPdf'),
  btnCopyDetailText: document.getElementById('btnCopyDetailText'),

  // 訂閱建立彈窗
  modalCreateSub: document.getElementById('modalCreateSub'),
  inputCreateSubCode: document.getElementById('inputCreateSubCode'),
  btnRandomSubCode: document.getElementById('btnRandomSubCode'),
  inputCreateSubName: document.getElementById('inputCreateSubName'),
  selectCreateSubType: document.getElementById('selectCreateSubType'),
  groupCustomDays: document.getElementById('groupCustomDays'),
  inputCreateSubCustomDays: document.getElementById('inputCreateSubCustomDays'),
  btnCloseCreateSubModal: document.getElementById('btnCloseCreateSubModal'),
  btnCancelCreateSub: document.getElementById('btnCancelCreateSub'),
  btnSubmitCreateSub: document.getElementById('btnSubmitCreateSub'),

  // 訂閱延長/修改彈窗
  modalEditSub: document.getElementById('modalEditSub'),
  editSubCodeDisplay: document.getElementById('editSubCodeDisplay'),
  editSubNameDisplay: document.getElementById('editSubNameDisplay'),
  editSubStatusDisplay: document.getElementById('editSubStatusDisplay'),
  inputEditSubName: document.getElementById('inputEditSubName'),
  selectEditSubStatus: document.getElementById('selectEditSubStatus'),
  btnCloseEditSubModal: document.getElementById('btnCloseEditSubModal'),
  btnCancelEditSub: document.getElementById('btnCancelEditSub'),
  btnSubmitEditSub: document.getElementById('btnSubmitEditSub'),

  // KV 橫幅與導引彈窗
  kvWarningBanner: document.getElementById('kvWarningBanner'),
  btnShowKvGuide: document.getElementById('btnShowKvGuide'),
  modalKvGuide: document.getElementById('modalKvGuide'),
  btnCloseKvGuideModal: document.getElementById('btnCloseKvGuideModal'),
  btnCloseKvGuideModalBottom: document.getElementById('btnCloseKvGuideModalBottom'),

  // 匯入學員存檔
  btnImportStudentSave: document.getElementById('btnImportStudentSave'),
  inputAdminImportSave: document.getElementById('inputAdminImportSave')
};

// 16 位關主速查字典
const BOSS_LIST = [
  { id: 'boss_work_1', name: '防禦刺蝟・研發小陳', title: '後端工程師' },
  { id: 'boss_work_2', name: '焦慮旋風・產品林經理', title: '跨部門專案經理' },
  { id: 'boss_work_3', name: '迷茫頑石・資深老張', title: '15年核心老員工' },
  { id: 'boss_work_4', name: '隱藏魔王・鐵血趙總監', title: '高壓狼性事業群副總' },

  { id: 'boss_parent_1', name: '閉門刺蝟・高一兒子翔翔', title: '沉迷手機的叛逆少年' },
  { id: 'boss_parent_2', name: '焦慮淚眼・小五女兒萱萱', title: '懼學焦慮的小學生' },
  { id: 'boss_parent_3', name: '選填迷茫・大四兒子阿豪', title: '畢業在即的躺平青年' },
  { id: 'boss_parent_4', name: '情緒火山・國中女兒羽婷', title: '追求同儕認同的少女' },

  { id: 'boss_couple_1', name: '冷戰冰川・疲憊妻子雅婷', title: '喪偶式育兒的職業婦女' },
  { id: 'boss_couple_2', name: '暴躁防禦・加班丈夫志強', title: '經濟重擔下的中年父親' },
  { id: 'boss_couple_3', name: '金錢焦慮・精打細算太太思涵', title: '家庭財務官' },
  { id: 'boss_couple_4', name: '夾心餅乾・逃避伴侶家豪', title: '和事佬先生' },

  { id: 'boss_friend_1', name: '借錢周轉・創業好友阿凱', title: '創業家' },
  { id: 'boss_friend_2', name: '情緒黑洞・訴苦閨蜜小敏', title: '負能量密友' },
  { id: 'boss_friend_3', name: '心結猜忌・多年合夥摯友浩然', title: '創業夥伴' },
  { id: 'boss_friend_4', name: '攀比炫耀・聚會老同學阿明', title: '愛面子同學' }
];

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  initBossOptions();
  bindEvents();
  await checkAuthSession();
});

function initBossOptions() {
  if (!elements.filterBoss) return;
  BOSS_LIST.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = `${b.name} (${b.title})`;
    elements.filterBoss.appendChild(opt);
  });
}

function bindEvents() {
  elements.formAdminLogin?.addEventListener('submit', handleLogin);
  elements.btnLogout?.addEventListener('click', handleLogout);
  elements.btnRefreshList?.addEventListener('click', () => {
    if (elements.tabSubscriptions?.classList.contains('active')) {
      loadSubscriptions();
    } else {
      loadPracticeLogs();
    }
  });
  elements.btnExportAllJson?.addEventListener('click', handleExportAllJson);
  elements.btnClearAllLogs?.addEventListener('click', handleClearAllLogs);

  // 頂部頁籤切換
  elements.tabLogs?.addEventListener('click', () => {
    elements.tabLogs.classList.add('active');
    elements.tabSubscriptions?.classList.remove('active');
    elements.panelLogs?.classList.remove('hidden');
    elements.panelSubscriptions?.classList.add('hidden');
  });

  elements.tabSubscriptions?.addEventListener('click', () => {
    elements.tabSubscriptions.classList.add('active');
    elements.tabLogs?.classList.remove('active');
    elements.panelSubscriptions?.classList.remove('hidden');
    elements.panelLogs?.classList.add('hidden');
    loadSubscriptions();
  });

  // 對話紀錄篩選與搜尋
  let searchTimer = null;
  elements.filterSearch?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadPracticeLogs(), 300);
  });
  elements.filterBoss?.addEventListener('change', () => loadPracticeLogs());
  elements.filterCaptured?.addEventListener('change', () => loadPracticeLogs());

  // 訂閱篩選與搜尋
  let subSearchTimer = null;
  elements.filterSubSearch?.addEventListener('input', () => {
    clearTimeout(subSearchTimer);
    subSearchTimer = setTimeout(() => loadSubscriptions(), 300);
  });
  elements.filterSubStatus?.addEventListener('change', () => loadSubscriptions());

  // 訂閱建立彈窗
  elements.btnOpenCreateSubModal?.addEventListener('click', openCreateSubModal);
  elements.btnCloseCreateSubModal?.addEventListener('click', closeCreateSubModal);
  elements.btnCancelCreateSub?.addEventListener('click', closeCreateSubModal);
  elements.btnRandomSubCode?.addEventListener('click', generateRandomSubCode);
  elements.selectCreateSubType?.addEventListener('change', (e) => {
    if (e.target.value === 'custom_days') {
      elements.groupCustomDays?.classList.remove('hidden');
    } else {
      elements.groupCustomDays?.classList.add('hidden');
    }
  });
  elements.btnSubmitCreateSub?.addEventListener('click', handleCreateSubscription);

  // 訂閱延長/修改彈窗
  elements.btnCloseEditSubModal?.addEventListener('click', closeEditSubModal);
  elements.btnCancelEditSub?.addEventListener('click', closeEditSubModal);
  elements.btnSubmitEditSub?.addEventListener('click', handleEditSubscription);

  // 快速延長按鈕
  document.querySelectorAll('.btn-quick-extend').forEach(btn => {
    btn.addEventListener('click', () => {
      const isPerm = btn.getAttribute('data-perm') === 'true';
      const days = Number(btn.getAttribute('data-days')) || 0;
      applyQuickExtend(days, isPerm);
    });
  });

  // 匯出訂閱名冊
  elements.btnExportSubs?.addEventListener('click', handleExportSubsJson);

  // 詳情彈窗關閉
  elements.btnCloseDetailModal?.addEventListener('click', closeDetailModal);
  elements.btnCloseDetailModalBottom?.addEventListener('click', closeDetailModal);
  elements.modalLogDetail?.addEventListener('click', (e) => {
    if (e.target === elements.modalLogDetail) closeDetailModal();
  });

  // 詳情彈窗內下載與複製
  elements.btnDownloadDetailMd?.addEventListener('click', () => {
    if (viewingLog) downloadLogMarkdown(viewingLog);
  });
  elements.btnDownloadDetailPdf?.addEventListener('click', () => {
    if (viewingLog) exportLogPdf(viewingLog);
  });
  elements.btnCopyDetailText?.addEventListener('click', () => {
    if (viewingLog) copyLogTranscript(viewingLog);
  });

  // KV 教學彈窗
  elements.btnShowKvGuide?.addEventListener('click', () => {
    elements.modalKvGuide?.classList.remove('hidden');
  });
  elements.btnCloseKvGuideModal?.addEventListener('click', () => {
    elements.modalKvGuide?.classList.add('hidden');
  });
  elements.btnCloseKvGuideModalBottom?.addEventListener('click', () => {
    elements.modalKvGuide?.classList.add('hidden');
  });
  elements.modalKvGuide?.addEventListener('click', (e) => {
    if (e.target === elements.modalKvGuide) elements.modalKvGuide.classList.add('hidden');
  });

  // 匯入學員存檔 (.json)
  elements.btnImportStudentSave?.addEventListener('click', () => {
    elements.inputAdminImportSave?.click();
  });
  elements.inputAdminImportSave?.addEventListener('change', handleAdminImportSave);
}

// 驗證登入狀態
async function checkAuthSession() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) {
    showLoginView();
    return;
  }

  try {
    const res = await fetch('/api/admin/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.ok) {
      showDashboardView();
      await loadPracticeLogs();
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      showLoginView();
    }
  } catch (e) {
    console.error('Session 驗證失敗:', e);
    showLoginView();
  }
}

// 處理登入
async function handleLogin() {
  const username = elements.inputAdminUser.value.trim();
  const password = elements.inputAdminPass.value.trim();
  hideLoginError();

  if (!username || !password) {
    showLoginError('請輸入管理員帳號與密碼');
    return;
  }

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.ok && data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      showDashboardView();
      await loadPracticeLogs();
    } else {
      showLoginError(data.error || '帳號或密碼錯誤！');
    }
  } catch (err) {
    showLoginError('連線異常，請稍後再試');
  }
}

// 登出
function handleLogout() {
  if (confirm('確定要登出管理看板嗎？')) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    showLoginView();
  }
}

function showLoginView() {
  elements.loginSection.classList.remove('hidden');
  elements.dashboardSection.classList.add('hidden');
  elements.authNavControls.classList.add('hidden');
  if (elements.inputAdminPass) elements.inputAdminPass.value = '';
}

function showDashboardView() {
  elements.loginSection.classList.add('hidden');
  elements.dashboardSection.classList.remove('hidden');
  elements.authNavControls.classList.remove('hidden');
}

function showLoginError(msg) {
  if (elements.loginErrorMsg) {
    elements.loginErrorMsg.textContent = msg;
    elements.loginErrorMsg.style.display = 'block';
  }
}

function hideLoginError() {
  if (elements.loginErrorMsg) {
    elements.loginErrorMsg.style.display = 'none';
  }
}

// 載入學員紀錄清單
async function loadPracticeLogs() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;

  const search = encodeURIComponent(elements.filterSearch?.value.trim() || '');
  const boss = encodeURIComponent(elements.filterBoss?.value || 'all');
  const captured = encodeURIComponent(elements.filterCaptured?.value || 'all');

  try {
    const res = await fetch(`/api/admin/practice-logs?search=${search}&boss=${boss}&captured=${captured}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (!data.ok) {
      if (res.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        showLoginView();
      }
      return;
    }

    // 檢查是否有綁定 KV 資料庫，未綁定則顯示橫幅提示
    const hasKV = (data.hasKV !== undefined) ? data.hasKV : (data.stats && data.stats.hasKV);
    if (elements.kvWarningBanner) {
      if (hasKV === false) {
        elements.kvWarningBanner.classList.remove('hidden');
      } else {
        elements.kvWarningBanner.classList.add('hidden');
      }
    }

    // 更新統計指標
    if (data.stats) {
      elements.statTotalCount.textContent = data.stats.totalCount || 0;
      elements.statUniqueStudents.textContent = data.stats.uniqueStudents || 0;
      elements.statAvgScore.textContent = (data.stats.avgScore || 0) + '分';
      elements.statCapturedRate.textContent = (data.stats.capturedRate || 0) + '%';
    }

    currentLogs = data.logs || [];
    renderLogsTable(currentLogs);
  } catch (err) {
    console.error('載入紀錄失敗:', err);
  }
}

// 渲染表格
function renderLogsTable(logs) {
  if (!elements.logsTableBody) return;
  elements.logsTableBody.innerHTML = '';

  if (logs.length === 0) {
    elements.logsEmptyState.classList.remove('hidden');
    return;
  }
  elements.logsEmptyState.classList.add('hidden');

  logs.forEach(log => {
    const tr = document.createElement('tr');
    const dateStr = new Date(log.submittedAt || log.date).toLocaleString('zh-TW', { hour12: false });
    const isCaptured = log.isCaptured;
    const badgeClass = isCaptured ? 'badge-win' : 'badge-fail';
    const badgeText = isCaptured ? `🔴 成功收攏 ${log.score}分` : `💨 未收攏 ${log.score}分`;
    const quote = log.bestCoachQuote ? `「${escapeHtml(log.bestCoachQuote)}」` : (log.winningReason || '（暫無金句）');

    tr.innerHTML = `
      <td>
        <div class="student-cell">
          <div class="student-avatar">${log.studentAvatar || '🧙‍♂️'}</div>
          <div>
            <div class="student-name">${escapeHtml(log.studentName || '未命名學員')}</div>
            <div class="student-time">${escapeHtml(log.clientIp || '')}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight: 700;">${log.bossAvatar || '👤'} ${escapeHtml(log.bossName || '關主')}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(log.bossTitle || '')}</div>
      </td>
      <td>
        <span class="score-badge ${badgeClass}">${badgeText}</span>
      </td>
      <td>
        <span style="font-weight: 700;">${log.turns || 1}</span> 回合
      </td>
      <td>
        <div class="quote-preview" title="${escapeHtml(quote)}">${quote}</div>
      </td>
      <td style="font-size: 0.82rem; color: var(--text-muted); white-space: nowrap;">
        ${dateStr}
      </td>
      <td>
        <div class="action-cell">
          <button class="btn btn-outline btn-sm btn-view-detail" data-id="${log.id}">
            👁️ 查閱逐字稿
          </button>
          <button class="btn btn-primary btn-sm btn-download-md" data-id="${log.id}">
            📥 報告
          </button>
          <button class="btn btn-danger btn-sm btn-delete-log" data-id="${log.id}" title="刪除本筆紀錄">
            🗑️
          </button>
        </div>
      </td>
    `;
    elements.logsTableBody.appendChild(tr);
  });

  // 綁定操作按鈕
  elements.logsTableBody.querySelectorAll('.btn-view-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const log = currentLogs.find(l => l.id === id);
      if (log) openDetailModal(log);
    });
  });

  elements.logsTableBody.querySelectorAll('.btn-download-md').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const log = currentLogs.find(l => l.id === id);
      if (log) downloadLogMarkdown(log);
    });
  });

  elements.logsTableBody.querySelectorAll('.btn-delete-log').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('確定要刪除這筆學員練習紀錄嗎？')) {
        await deletePracticeLog(id);
      }
    });
  });
}

// 開啟逐字稿詳情彈窗
function openDetailModal(log) {
  viewingLog = log;
  const dateStr = new Date(log.submittedAt || log.date).toLocaleString('zh-TW', { hour12: false });
  const isCaptured = log.isCaptured;
  const dims = log.dimensions || log.dimensionScores || {};

  elements.modalLogTitle.textContent = `📜 【${log.studentName}】對決【${log.bossName}】對話實錄`;

  let transcriptHtml = '';
  const suggMap = getTurnSuggestionsMap(log);
  if (log.dialogueHistory && log.dialogueHistory.length > 0) {
    let round = 1;
    transcriptHtml = log.dialogueHistory.map(msg => {
      if (msg.role === 'user') {
        const sugg = suggMap[round] || getFallbackSuggestion(msg.content, round);
        const h = `
          <div class="chat-bubble-turn turn-user">
            <div class="turn-role">${log.studentAvatar || '🧙‍♂️'} 教練學員【${escapeHtml(log.studentName)}】（回合 ${round}）</div>
            <div>${escapeHtml(msg.content)}</div>
            ${sugg && sugg.betterPhrasing ? `
              <div class="turn-master-suggestion">
                <div class="sugg-title">💡 ICF 大師級示範問句</div>
                <div class="sugg-phrasing">${escapeHtml(sugg.betterPhrasing)}</div>
                ${sugg.rationale ? `<div class="sugg-rationale">🎯 <b>設計心法：</b>${escapeHtml(sugg.rationale)}</div>` : ''}
              </div>
            ` : ''}
          </div>
        `;
        round++;
        return h;
      } else {
        return `
          <div class="chat-bubble-turn turn-boss">
            <div class="turn-role">${log.bossAvatar || '👤'} 關主【${escapeHtml(log.bossName)}】</div>
            <div>${escapeHtml(msg.content)}</div>
            ${msg.innerThought ? `<div class="turn-thought">💭 關主心聲：${escapeHtml(msg.innerThought)}</div>` : ''}
          </div>
        `;
      }
    }).join('');
  } else {
    transcriptHtml = '<div style="color: var(--text-muted); font-style: italic;">（無逐字稿記錄）</div>';
  }

  elements.modalLogContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 2.2rem;">${log.bossAvatar || '👤'}</span>
        <div>
          <h4 style="font-size: 1.15rem; color: #0f172a;">${escapeHtml(log.bossName)} · ${escapeHtml(log.bossTitle || '')}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted);">
            教練學員：<b>${escapeHtml(log.studentName)}</b> | 練習時間：${dateStr} | 共 ${log.turns || 1} 回合
          </p>
        </div>
      </div>
      <div>
        <span class="score-badge ${isCaptured ? 'badge-win' : 'badge-fail'}" style="font-size: 1rem; padding: 0.35rem 0.85rem;">
          ${isCaptured ? '🔴 成功突破收攏' : '💨 未突破'} ${log.score}分
        </span>
      </div>
    </div>

    ${log.bestCoachQuote ? `
      <div style="margin-bottom: 1rem;">
        <h5 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.3rem;">✨ 破心教練金句</h5>
        <div style="background: #f8fafc; border-left: 4px solid var(--primary); padding: 0.65rem 1rem; font-style: italic; color: #334155;">
          「${escapeHtml(log.bestCoachQuote)}」
        </div>
      </div>
    ` : ''}

    ${log.winningReason ? `
      <div style="margin-bottom: 1rem;">
        <h5 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.3rem;">🎯 突破關鍵復盤</h5>
        <p style="font-size: 0.9rem; line-height: 1.5; color: #334155;">${escapeHtml(log.winningReason)}</p>
      </div>
    ` : ''}

    ${log.advice ? `
      <div style="margin-bottom: 1rem;">
        <h5 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.3rem;">💡 導師建議與優化</h5>
        <p style="font-size: 0.9rem; line-height: 1.5; color: #334155;">${escapeHtml(log.advice)}</p>
      </div>
    ` : ''}

    <div style="margin-bottom: 1.25rem;">
      <h5 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.3rem;">📊 ICF 核心能力五維度分析</h5>
      <div class="dim-grid">
        <div class="dim-badge">深度同理：${dims.empathy || 75}分</div>
        <div class="dim-badge">有效傾聽：${dims.listening || 75}分</div>
        <div class="dim-badge">提問引導：${dims.questioning || 70}分</div>
        <div class="dim-badge">視角重構：${dims.reframing || 70}分</div>
        <div class="dim-badge">行動激發：${dims.action_drive || 65}分</div>
      </div>
    </div>

    <div>
      <h5 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.3rem;">📜 完整對話練習逐字稿 (Transcript)</h5>
      <div class="transcript-box">
        ${transcriptHtml}
      </div>
    </div>
  `;

  elements.modalLogDetail.classList.remove('hidden');
}

function closeDetailModal() {
  elements.modalLogDetail.classList.add('hidden');
  viewingLog = null;
}

// 刪除單筆
async function deletePracticeLog(id) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;

  try {
    const res = await fetch('/api/admin/practice-logs/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.ok) {
      await loadPracticeLogs();
    } else {
      alert(data.error || '刪除失敗');
    }
  } catch (err) {
    alert('操作異常');
  }
}

// 清空全部
async function handleClearAllLogs() {
  const pass = prompt('【警告】此操作將永久清空所有學員實戰對話紀錄！\n若確認清空，請在下方輸入「CLEAR」：');
  if (pass !== 'CLEAR') return;

  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;

  try {
    const res = await fetch('/api/admin/practice-logs/clear', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.ok) {
      alert('所有紀錄已清空！');
      await loadPracticeLogs();
    }
  } catch (err) {
    alert('清空失敗');
  }
}

// 匯出全部 JSON
function handleExportAllJson() {
  if (currentLogs.length === 0) {
    alert('目前尚無任何學員紀錄可供匯出');
    return;
  }

  const exportObj = {
    exportedAt: new Date().toISOString(),
    totalCount: currentLogs.length,
    records: currentLogs
  };

  const jsonStr = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CoachQuest_全體學員紀錄_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========================================================
// ICF 建議金句與示範輔助函數 (與學員端完全一致)
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

// 下載個別 Markdown
function downloadLogMarkdown(log) {
  const dateStr = new Date(log.submittedAt || log.date).toLocaleString('zh-TW', { hour12: false });
  const isCaptured = log.isCaptured;
  const dims = log.dimensions || log.dimensionScores || {};
  const suggMap = getTurnSuggestionsMap(log);

  let md = `# 🎮 CoachQuest 教練實戰對話練習督導復盤報告\n\n`;
  md += `> **練習時間**：${dateStr}\n`;
  md += `> **學員教練**：${log.studentAvatar || '🧙‍♂️'} **${log.studentName}**\n`;
  md += `> **挑戰關主**：${log.bossAvatar || '👤'} **${log.bossName}**（${log.bossTitle || ''}）\n`;
  md += `> **綜合評分**：**${log.score} 分**（${isCaptured ? '🔴 成功突破收攏' : '💨 心防尚未突破'}）\n`;
  md += `> **互動回合**：共 ${log.turns || 1} 回合\n\n`;
  md += `---\n\n`;

  if (log.bestCoachQuote) {
    md += `## ✨ 破心教練金句\n`;
    md += `> 「${log.bestCoachQuote}」\n\n`;
  }
  if (log.winningReason) {
    md += `## 🎯 突破防線關鍵復盤\n`;
    md += `${log.winningReason}\n\n`;
  }
  if (log.advice) {
    md += `## 💡 導師指導與調整建議\n`;
    md += `${log.advice}\n\n`;
  }

  md += `## 📊 ICF 教練核心溝通能力五維度分析\n\n`;
  md += `| 評估維度 | 得分 |\n| :--- | :--- |\n`;
  md += `| 深度同理心 | **${dims.empathy || 75} 分** |\n`;
  md += `| 有效傾聽 | **${dims.listening || 75} 分** |\n`;
  md += `| 提問引導 | **${dims.questioning || 70} 分** |\n`;
  md += `| 視角重構 | **${dims.reframing || 70} 分** |\n`;
  md += `| 行動激發 | **${dims.action_drive || 65} 分** |\n\n`;

  md += `---\n\n## 📜 完整對話逐字稿實錄 (Transcript)\n\n`;
  if (log.dialogueHistory && log.dialogueHistory.length > 0) {
    let round = 1;
    for (const msg of log.dialogueHistory) {
      if (msg.role === 'user') {
        md += `### 🔹 回合 ${round} · 教練發言\n`;
        md += `**${log.studentAvatar || '🧙‍♂️'} ${log.studentName}**：\n> ${msg.content.replace(/\n/g, '\n> ')}\n\n`;
        const sugg = suggMap[round] || getFallbackSuggestion(msg.content, round);
        if (sugg && sugg.betterPhrasing) {
          md += `> 💡 **ICF 大師級示範問句**：\n> 「${sugg.betterPhrasing.replace(/^「|」$/g, '')}」\n>\n`;
          if (sugg.rationale) {
            md += `> 🎯 **設計心法與原理**：${sugg.rationale}\n\n`;
          } else {
            md += `\n`;
          }
        }
        round++;
      } else {
        md += `**${log.bossAvatar || '👤'} ${log.bossName}**：\n${msg.content}\n\n`;
        if (msg.innerThought) {
          md += `*💭 關主潛意識心聲：${msg.innerThought}*\n\n`;
        }
      }
    }
  } else {
    md += `*（無逐字稿記錄）*\n\n`;
  }

  md += `---\n*CoachQuest 導師督導管理後台 · https://coachquest.coachsunny.workers.dev/admin*\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanName = (log.studentName || '學員').replace(/[^\w\u4e00-\u9fa5]/g, '_');
  const cleanBoss = (log.bossName || '關主').replace(/[^\w\u4e00-\u9fa5]/g, '_');
  a.download = `CoachQuest_復盤_${cleanName}_${cleanBoss}_${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 複製全文 (含 ICF 大師示範)
function copyLogTranscript(log) {
  const dateStr = new Date(log.submittedAt || log.date).toLocaleString('zh-TW', { hour12: false });
  const suggMap = getTurnSuggestionsMap(log);
  let text = `【CoachQuest 導師督導復盤逐字稿】\n`;
  text += `學員：${log.studentName}\n關主：${log.bossName} (${log.bossTitle || ''})\n時間：${dateStr}\n成績：${log.score}分 (${log.isCaptured ? '成功收攏' : '未收攏'})\n`;
  if (log.bestCoachQuote) text += `金句：「${log.bestCoachQuote}」\n`;
  if (log.winningReason) text += `突破分析：${log.winningReason}\n`;
  if (log.advice) text += `導師建議：${log.advice}\n`;
  text += `\n--- 逐字稿與 ICF 大師示範 ---\n`;

  let round = 1;
  (log.dialogueHistory || []).forEach((m) => {
    if (m.role === 'user') {
      text += `\n[回合 ${round}] 教練 ${log.studentName}：\n${m.content}\n`;
      const sugg = suggMap[round] || getFallbackSuggestion(m.content, round);
      if (sugg && sugg.betterPhrasing) {
        text += `  💡 大師示範：${sugg.betterPhrasing}\n`;
        if (sugg.rationale) {
          text += `  🎯 設計心法：${sugg.rationale}\n`;
        }
      }
      round++;
    } else {
      text += `\n[關主] ${log.bossName}：\n${m.content}\n`;
      if (m.innerThought) text += `  💭 關主心聲：${m.innerThought}\n`;
    }
  });

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 逐字稿全文與大師示範已複製到剪貼簿！');
    });
  } else {
    prompt('請複製以下內容：', text);
  }
}

// 匯出/列印 PDF 報告
function exportLogPdf(log) {
  const dateStr = new Date(log.submittedAt || log.date).toLocaleString('zh-TW', { hour12: false });
  const isCaptured = log.isCaptured;
  const dims = log.dimensions || log.dimensionScores || {};
  const suggMap = getTurnSuggestionsMap(log);

  let roundsHtml = '';
  if (log.dialogueHistory && log.dialogueHistory.length > 0) {
    let round = 1;
    for (const msg of log.dialogueHistory) {
      if (msg.role === 'user') {
        const sugg = suggMap[round] || getFallbackSuggestion(msg.content, round);
        roundsHtml += `
          <div style="page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; padding: 12px; background: #ffffff;">
            <div style="font-weight: 700; color: #0284c7; font-size: 13px; margin-bottom: 4px;">
              ${log.studentAvatar || '🧙‍♂️'} 教練學員【${escapeHtml(log.studentName)}】（回合 ${round}）
            </div>
            <div style="background: #f0fdf4; border-left: 3px solid #22c55e; padding: 8px 12px; border-radius: 4px; font-size: 13px; color: #1e293b; margin-bottom: 8px;">
              ${escapeHtml(msg.content)}
            </div>
            ${sugg && sugg.betterPhrasing ? `
              <div style="background: #fffdf5; border: 1px solid #fde68a; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 8px 10px; font-size: 12px;">
                <div style="color: #b45309; font-weight: 700; margin-bottom: 4px;">💡 ICF 大師級示範問句</div>
                <div style="color: #78350f; font-weight: 600; line-height: 1.45; margin-bottom: 4px;">${escapeHtml(sugg.betterPhrasing)}</div>
                ${sugg.rationale ? `<div style="color: #92400e; font-size: 11.5px; line-height: 1.4;">🎯 <b>設計心法：</b>${escapeHtml(sugg.rationale)}</div>` : ''}
              </div>
            ` : ''}
          </div>
        `;
        round++;
      } else {
        roundsHtml += `
          <div style="page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; padding: 12px; background: #f8fafc;">
            <div style="font-weight: 700; color: #4f46e5; font-size: 13px; margin-bottom: 4px;">
              ${log.bossAvatar || '👤'} 關主【${escapeHtml(log.bossName)}】
            </div>
            <div style="background: #ffffff; border-left: 3px solid #6366f1; padding: 8px 12px; border-radius: 4px; font-size: 13px; color: #1e293b; margin-bottom: 6px;">
              ${escapeHtml(msg.content)}
            </div>
            ${msg.innerThought ? `
              <div style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #b45309; font-style: italic;">
                💭 關主心聲：${escapeHtml(msg.innerThought)}
              </div>
            ` : ''}
          </div>
        `;
      }
    }
  }

  const printHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>CoachQuest 練習復盤報告 - ${escapeHtml(log.studentName)}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft YaHei", sans-serif; color: #1e293b; line-height: 1.5; padding: 0; margin: 0; }
    .header { background: #1e293b; color: white; padding: 18px 20px; border-radius: 10px; margin-bottom: 18px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; background: ${isCaptured ? '#10b981' : '#ef4444'}; color: white; }
    .dim-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .dim-table th, .dim-table td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12.5px; text-align: left; }
    .dim-table th { background: #f1f5f9; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 15px; padding: 10px; background: #e0e7ff; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 13px; color: #3730a3;">💡 提示：點擊右側按鈕即可開啟瀏覽器列印視窗，請在目的地選擇「另存為 PDF」。</span>
    <button onclick="window.print()" style="padding: 6px 14px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">🖨️ 立即列印 / 存為 PDF</button>
  </div>
  <div class="header">
    <h2 style="margin: 0 0 6px 0; font-size: 20px;">🎮 CoachQuest 教練實戰對話練習督導復盤報告</h2>
    <div style="font-size: 12.5px; color: #cbd5e1;">
      學員教練：<b>${escapeHtml(log.studentName)}</b> | 挑戰關主：<b>${escapeHtml(log.bossName)}</b> | 練習時間：${dateStr} | 
      <span class="badge">${isCaptured ? '🔴 成功突破收攏' : '💨 心防尚未突破'} ${log.score}分</span>
    </div>
  </div>
  ${log.bestCoachQuote ? `
    <div style="margin-bottom: 14px;">
      <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #64748b;">✨ 破心教練金句</h4>
      <div style="background: #fdf4ff; border-left: 4px solid #c026d3; padding: 8px 12px; font-style: italic; color: #701a75; font-size: 13px; border-radius: 4px;">
        「${escapeHtml(log.bestCoachQuote)}」
      </div>
    </div>
  ` : ''}
  ${log.winningReason ? `
    <div style="margin-bottom: 14px;">
      <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #64748b;">🎯 突破防線關鍵復盤</h4>
      <p style="margin: 0; font-size: 12.5px; color: #334155; line-height: 1.5;">${escapeHtml(log.winningReason)}</p>
    </div>
  ` : ''}
  ${log.advice ? `
    <div style="margin-bottom: 14px;">
      <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #64748b;">💡 導師指導與調整建議</h4>
      <p style="margin: 0; font-size: 12.5px; color: #334155; line-height: 1.5;">${escapeHtml(log.advice)}</p>
    </div>
  ` : ''}
  <div style="margin-bottom: 14px;">
    <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">📊 ICF 教練核心溝通能力五維度分析</h4>
    <table class="dim-table">
      <tr>
        <th>深度同理心</th>
        <th>有效傾聽</th>
        <th>提問引導</th>
        <th>視角重構</th>
        <th>行動激發</th>
      </tr>
      <tr>
        <td><b>${dims.empathy || 75} 分</b></td>
        <td><b>${dims.listening || 75} 分</b></td>
        <td><b>${dims.questioning || 70} 分</b></td>
        <td><b>${dims.reframing || 70} 分</b></td>
        <td><b>${dims.action_drive || 65} 分</b></td>
      </tr>
    </table>
  </div>
  <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">
    📜 完整對話逐字稿與 ICF 大師級示範 (Transcript & Coaching Suggestions)
  </h4>
  <div>
    ${roundsHtml}
  </div>
  <div style="margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px;">
    CoachQuest 導師督導管理後台 · 國際教練聯盟 (ICF) 核心能力覆盤系統 · https://coachquest.coachsunny.workers.dev
  </div>
</body>
</html>`;

  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(printHtml);
    printWin.document.close();
    setTimeout(() => {
      printWin.focus();
      printWin.print();
    }, 500);
  } else {
    const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CoachQuest_復盤報告_${log.studentName}_${log.bossName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('📄 報告已生成！因瀏覽器攔截開窗，已自動為您下載 HTML 報告檔，開啟後按 Ctrl+P 即可直接存為 PDF！');
  }
}

// 處理管理員匯入學員存檔 (.json)
async function handleAdminImportSave(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    const res = await fetch('/api/admin/import-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(parsed)
    });

    const data = await res.json();
    if (data.ok) {
      alert(`🎉 ${data.message}`);
      await loadPracticeLogs();
    } else {
      alert(`❌ 匯入失敗: ${data.error || '存檔內容無法解析'}`);
    }
  } catch (err) {
    alert(`❌ 讀取存檔檔案失敗: ${err.message}`);
  } finally {
    if (elements.inputAdminImportSave) elements.inputAdminImportSave.value = '';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ========================================================
// 訂閱授權碼管理 (Subscription Management Logic)
// ========================================================

let currentSubscriptions = [];
let editingSubscription = null;

// 載入訂閱授權碼清單
async function loadSubscriptions() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;

  const search = encodeURIComponent(elements.filterSubSearch?.value.trim() || '');
  const status = encodeURIComponent(elements.filterSubStatus?.value || 'all');

  try {
    const res = await fetch(`/api/admin/subscriptions?search=${search}&status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (!data.ok) {
      if (res.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        showLoginView();
      }
      return;
    }

    // 更新統計指標
    if (data.stats) {
      if (elements.subStatTotal) elements.subStatTotal.textContent = data.stats.totalCount || 0;
      if (elements.subStatActive) elements.subStatActive.textContent = data.stats.activeCount || 0;
      if (elements.subStatPermanent) elements.subStatPermanent.textContent = data.stats.permanentCount || 0;
      if (elements.subStatExpiring) elements.subStatExpiring.textContent = data.stats.expiringCount || 0;
    }

    currentSubscriptions = data.codes || [];
    renderSubscriptionsTable(currentSubscriptions);
  } catch (err) {
    console.error('載入訂閱碼失敗:', err);
  }
}

// 渲染訂閱表格
function renderSubscriptionsTable(subs) {
  if (!elements.subTableBody) return;
  elements.subTableBody.innerHTML = '';

  if (subs.length === 0) {
    elements.subEmptyState?.classList.remove('hidden');
    return;
  }
  elements.subEmptyState?.classList.add('hidden');

  const now = Date.now();
  const sevenDays = 7 * 86400000;

  subs.forEach(s => {
    const tr = document.createElement('tr');

    const isPerm = s.type === 'permanent';
    const isExpired = !isPerm && s.expireAt && new Date(s.expireAt).getTime() < now;
    const isExpiring = !isPerm && s.expireAt && !isExpired && (new Date(s.expireAt).getTime() - now <= sevenDays);
    const isDisabled = s.status === 'disabled';

    let statusBadge = '<span class="badge badge-success">🟢 生效中</span>';
    if (isDisabled) {
      statusBadge = '<span class="badge" style="background:#f1f5f9; color:#64748b;">⚪ 已停用</span>';
    } else if (isExpired) {
      statusBadge = '<span class="badge badge-danger">🔴 已過期</span>';
    } else if (isExpiring) {
      statusBadge = '<span class="badge badge-warning">⏳ 即將到期</span>';
    } else if (isPerm) {
      statusBadge = '<span class="badge badge-permanent">👑 永久有效</span>';
    }

    let expireDesc = '終身永久';
    if (!isPerm && s.expireAt) {
      const expDate = new Date(s.expireAt);
      const daysLeft = Math.max(0, Math.ceil((expDate.getTime() - now) / 86400000));
      const dateStr = expDate.toLocaleDateString('zh-TW');
      expireDesc = isExpired
        ? `<span style="color:#dc2626; font-weight:700;">已於 ${dateStr} 到期</span>`
        : `<span>${dateStr} (剩餘 <b>${daysLeft}</b> 天)</span>`;
    }

    const typeDesc = isPerm 
      ? '<span style="font-weight:700; color:#d97706;">👑 永久 VIP</span>' 
      : '<span style="color:#475569;">⏳ 限期體驗</span>';

    const lastUsedStr = s.lastUsedAt 
      ? new Date(s.lastUsedAt).toLocaleString('zh-TW', { hour12: false }) 
      : '尚未開始練習';

    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:0.4rem;">
          <span class="sub-code-badge">${escapeHtml(s.code)}</span>
          <button class="btn btn-outline btn-sm btn-copy-sub" data-code="${escapeHtml(s.code)}" title="一鍵複製授權碼" style="padding:2px 6px; font-size:0.75rem;">📋</button>
        </div>
      </td>
      <td>
        <div style="font-weight:700; color:#0f172a;">${escapeHtml(s.name || '學員教練')}</div>
        <div style="font-size:0.75rem; color:#94a3b8;">建立於 ${new Date(s.createdAt).toLocaleDateString('zh-TW')}</div>
      </td>
      <td>${typeDesc}</td>
      <td>${expireDesc}</td>
      <td>${statusBadge}</td>
      <td>
        <div style="font-size:0.85rem;">已使用 <b>${s.useCount || 0}</b> 次</div>
        <div style="font-size:0.72rem; color:#94a3b8;">最後於：${lastUsedStr}</div>
      </td>
      <td>
        <div style="display:flex; gap:0.35rem; align-items:center; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm btn-edit-sub" data-code="${escapeHtml(s.code)}" style="border-color:#6366f1; color:#4338ca; font-weight:700;">
            ⏳ 延長/修改
          </button>
          <button class="btn btn-outline btn-sm btn-toggle-sub" data-code="${escapeHtml(s.code)}" data-status="${s.status || 'active'}">
            ${isDisabled ? '🟢 啟用' : '⏸️ 停用'}
          </button>
          <button class="btn btn-danger btn-sm btn-delete-sub" data-code="${escapeHtml(s.code)}" title="刪除此授權碼">
            🗑️
          </button>
        </div>
      </td>
    `;

    elements.subTableBody.appendChild(tr);
  });

  // 綁定操作按鈕
  elements.subTableBody.querySelectorAll('.btn-copy-sub').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      copyToClipboard(code, `📋 授權碼【${code}】已複製到剪貼簿！`);
    });
  });

  elements.subTableBody.querySelectorAll('.btn-edit-sub').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      openEditSubModal(code);
    });
  });

  elements.subTableBody.querySelectorAll('.btn-toggle-sub').forEach(btn => {
    btn.addEventListener('click', async () => {
      const code = btn.getAttribute('data-code');
      const current = btn.getAttribute('data-status');
      const target = current === 'disabled' ? 'active' : 'disabled';
      await updateSubscriptionStatus(code, target);
    });
  });

  elements.subTableBody.querySelectorAll('.btn-delete-sub').forEach(btn => {
    btn.addEventListener('click', async () => {
      const code = btn.getAttribute('data-code');
      if (confirm(`確定要永久刪除訂閱授權碼【${code}】嗎？刪除後持有人將無法再進行道館對決！`)) {
        await deleteSubscriptionCode(code);
      }
    });
  });
}

function generateRandomSubCode() {
  const r1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const r2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  if (elements.inputCreateSubCode) {
    elements.inputCreateSubCode.value = `CQ-${r1}-${r2}`;
  }
}

function openCreateSubModal() {
  generateRandomSubCode();
  if (elements.inputCreateSubName) elements.inputCreateSubName.value = '';
  if (elements.selectCreateSubType) elements.selectCreateSubType.value = 'days_30';
  elements.groupCustomDays?.classList.add('hidden');
  elements.modalCreateSub?.classList.remove('hidden');
}

function closeCreateSubModal() {
  elements.modalCreateSub?.classList.add('hidden');
}

async function handleCreateSubscription() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;

  const code = (elements.inputCreateSubCode?.value || '').trim().toUpperCase();
  const name = (elements.inputCreateSubName?.value || '').trim();
  const typeVal = elements.selectCreateSubType?.value || 'days_30';

  if (!name) {
    alert('請填寫學員名稱或備註資訊！');
    elements.inputCreateSubName?.focus();
    return;
  }

  let type = 'days';
  let days = 30;

  if (typeVal === 'permanent') {
    type = 'permanent';
  } else if (typeVal === 'days_30') {
    days = 30;
  } else if (typeVal === 'days_90') {
    days = 90;
  } else if (typeVal === 'days_180') {
    days = 180;
  } else if (typeVal === 'days_365') {
    days = 365;
  } else if (typeVal === 'custom_days') {
    days = Math.max(1, Number(elements.inputCreateSubCustomDays?.value) || 30);
  }

  try {
    const res = await fetch('/api/admin/subscriptions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code, name, type, days })
    });
    const data = await res.json();
    if (data.ok) {
      alert(`🎉 ${data.message}`);
      closeCreateSubModal();
      await loadSubscriptions();
    } else {
      alert(`❌ 建立失敗: ${data.error}`);
    }
  } catch (err) {
    alert('連線異常，請稍後再試');
  }
}

function openEditSubModal(code) {
  const sub = currentSubscriptions.find(s => s.code === code);
  if (!sub) return;
  editingSubscription = sub;

  if (elements.editSubCodeDisplay) elements.editSubCodeDisplay.textContent = sub.code;
  if (elements.editSubNameDisplay) elements.editSubNameDisplay.textContent = sub.name || '學員教練';
  if (elements.editSubStatusDisplay) {
    const isPerm = sub.type === 'permanent';
    const isExpired = !isPerm && sub.expireAt && new Date(sub.expireAt).getTime() < Date.now();
    elements.editSubStatusDisplay.innerHTML = sub.status === 'disabled' 
      ? '<span style="color:#64748b;">已停用</span>' 
      : (isExpired ? '<span style="color:#dc2626;">已過期</span>' : (isPerm ? '<span style="color:#d97706;">永久有效</span>' : '生效中'));
  }

  if (elements.inputEditSubName) elements.inputEditSubName.value = sub.name || '';
  if (elements.selectEditSubStatus) elements.selectEditSubStatus.value = sub.status || 'active';

  elements.modalEditSub?.classList.remove('hidden');
}

function closeEditSubModal() {
  elements.modalEditSub?.classList.add('hidden');
  editingSubscription = null;
}

async function applyQuickExtend(days, isPerm) {
  if (!editingSubscription) return;
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;

  const payload = {
    code: editingSubscription.code,
    setPermanent: isPerm,
    extendDays: isPerm ? null : days
  };

  try {
    const res = await fetch('/api/admin/subscriptions/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.ok) {
      alert(`🎉 ${isPerm ? '已成功將該訂閱碼調整為【永久有效】！' : `已成功為該訂閱碼延長 ${days} 天效期！`}`);
      closeEditSubModal();
      await loadSubscriptions();
    } else {
      alert(`❌ 操作失敗: ${data.error}`);
    }
  } catch (e) {
    alert('連線異常，請稍後再試');
  }
}

async function handleEditSubscription() {
  if (!editingSubscription) return;
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;

  const name = (elements.inputEditSubName?.value || '').trim();
  const status = elements.selectEditSubStatus?.value || 'active';

  try {
    const res = await fetch('/api/admin/subscriptions/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code: editingSubscription.code, name, status })
    });
    const data = await res.json();
    if (data.ok) {
      alert('🎉 訂閱設定已成功儲存！');
      closeEditSubModal();
      await loadSubscriptions();
    } else {
      alert(`❌ 儲存失敗: ${data.error}`);
    }
  } catch (e) {
    alert('連線異常，請稍後再試');
  }
}

async function updateSubscriptionStatus(code, status) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;

  try {
    const res = await fetch('/api/admin/subscriptions/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code, status })
    });
    const data = await res.json();
    if (data.ok) {
      await loadSubscriptions();
    } else {
      alert(`❌ 切換失敗: ${data.error}`);
    }
  } catch (e) {
    alert('連線異常，請稍後再試');
  }
}

async function deleteSubscriptionCode(code) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;

  try {
    const res = await fetch('/api/admin/subscriptions/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (data.ok) {
      await loadSubscriptions();
    } else {
      alert(`❌ 刪除失敗: ${data.error}`);
    }
  } catch (e) {
    alert('連線異常，請稍後再試');
  }
}

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert(successMsg || '已複製到剪貼簿！');
    });
  } else {
    prompt('請複製以下文字：', text);
  }
}

function handleExportSubsJson() {
  if (!currentSubscriptions || currentSubscriptions.length === 0) {
    alert('目前尚無任何訂閱授權碼可供匯出');
    return;
  }
  const jsonStr = JSON.stringify(currentSubscriptions, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CoachQuest_訂閱名冊_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
