// ==========================================
// CoachQuest - 前 10 名排行榜系統 (Leaderboard)
// ==========================================

export const LeaderboardManager = {
  // 從後端 API 取得全體前 10 名排行榜
  async fetch() {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.leaderboard)) {
          return data.leaderboard;
        }
      }
    } catch (e) {
      console.warn('無法連線取得線上排行榜，啟用本地備援資料:', e);
    }

    // 備援排行榜假資料（確保初次離線或無 KV 時依然有生動的遊戲氛圍）
    return this._getFallbackBoard();
  },

  // 提交本次通關成績至排行榜
  async submit({ name, score, captures, title, avatar }) {
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (name || '無名教練').trim().substring(0, 16),
          score: Number(score) || 0,
          captures: Number(captures) || 0,
          title: title || '見習溝通使',
          avatar: avatar || '🧙‍♂️'
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.leaderboard || null;
      }
    } catch (e) {
      console.warn('提交排行榜分數失敗:', e);
    }
    return null;
  },

  // 預設示範榜單
  _getFallbackBoard() {
    return [
      { rank: 1, name: "傾聽之神·艾登", score: 98, captures: 16, title: "傳奇心靈宗師", avatar: "👑", badge: "🥇" },
      { rank: 2, name: "薩提爾小王子", score: 95, captures: 14, title: "道館金牌總教練", avatar: "🧊", badge: "🥈" },
      { rank: 3, name: "職場談判專家", score: 93, captures: 12, title: "道館金牌總教練", avatar: "💼", badge: "🥉" },
      { rank: 4, name: "非暴力傳道士", score: 90, captures: 11, title: "冰山破冰導師", avatar: "🕊️", badge: "4" },
      { rank: 5, name: "溫柔力量·晴晴", score: 88, captures: 10, title: "冰山破冰導師", avatar: "🌸", badge: "5" },
      { rank: 6, name: "家庭和事佬", score: 86, captures: 9, title: "深度傾聽先鋒", avatar: "🧸", badge: "6" },
      { rank: 7, name: "夫妻破冰船", score: 85, captures: 8, title: "深度傾聽先鋒", avatar: "💍", badge: "7" },
      { rank: 8, name: "知心酒友", score: 82, captures: 7, title: "初階教練學徒", avatar: "🍻", badge: "8" },
      { rank: 9, name: "成長心態小王", score: 80, captures: 6, title: "初階教練學徒", avatar: "🌱", badge: "9" },
      { rank: 10, name: "溝通探險家", score: 78, captures: 5, title: "見習溝通使", avatar: "🧭", badge: "10" }
    ];
  },

  // 渲染排行榜 HTML
  renderList(players, currentNickname = '') {
    if (!players || players.length === 0) {
      return '<div class="empty-state">尚無排行紀錄，成為第一位上榜的教練吧！</div>';
    }

    return players.map((p, idx) => {
      const rankNum = idx + 1;
      let rankBadge = `${rankNum}`;
      let rankClass = 'rank-normal';

      if (rankNum === 1) {
        rankBadge = '🥇 冠軍';
        rankClass = 'rank-gold';
      } else if (rankNum === 2) {
        rankBadge = '🥈 亞軍';
        rankClass = 'rank-silver';
      } else if (rankNum === 3) {
        rankBadge = '🥉 季軍';
        rankClass = 'rank-bronze';
      }

      const isCurrent = currentNickname && (p.name === currentNickname);
      const highlightClass = isCurrent ? 'leaderboard-row-self' : '';

      return `
        <div class="leaderboard-item ${rankClass} ${highlightClass}">
          <div class="leaderboard-rank">${rankBadge}</div>
          <div class="leaderboard-avatar">${p.avatar || '🧙‍♂️'}</div>
          <div class="leaderboard-info">
            <div class="leaderboard-name">
              <span>${this._escapeHtml(p.name)}</span>
              ${isCurrent ? '<span class="self-tag">你</span>' : ''}
            </div>
            <div class="leaderboard-title">${this._escapeHtml(p.title || '教練冒險家')}</div>
          </div>
          <div class="leaderboard-stats">
            <div class="leaderboard-captures">
              <span class="pokeball-mini">🔴</span> ${p.captures || 0} 隻收攏
            </div>
            <div class="leaderboard-score">
              ${p.score || 0}<span class="score-unit">分</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  _escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};
