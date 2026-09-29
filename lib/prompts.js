// ==========================================
// CoachQuest - 心理學架構與 AI Prompt 產生器
// ==========================================

export const FRAMEWORKS = {
  nvc: {
    id: "nvc",
    name: "非暴力溝通 (NVC)",
    subtitle: "四要素：觀察、感受、需要、請求",
    description: "透過專注於無評判的事實觀察、深層情緒、普世心理需求與具體正向請求，化解衝突並建立深刻連結。",
    steps: [
      { name: "1. 觀察 (Observation)", desc: "清楚陳述具體發生的客觀事實，不帶任何評價或推論。" },
      { name: "2. 感受 (Feeling)", desc: "辨識內在的情緒狀態，而非想法或受害者語言。" },
      { name: "3. 需要 (Need)", desc: "找出情緒背後普世的人性價值與深層心理渴望。" },
      { name: "4. 請求 (Request)", desc: "提出具體、正向、當下可執行的清晰請求。" }
    ],
    tips: "避免評判性語言，先連結情感與需求，再討論事情。"
  },
  grow: {
    id: "grow",
    name: "GROW 教練模型",
    subtitle: "Goal 目標 → Reality 現狀 → Options 方案 → Will 意願",
    description: "協助被教練者從明確目標出發，釐清客觀現實，自主發散多元方案，並落實為具體承諾與行動。",
    steps: [
      { name: "G (Goal) 目標", desc: "聚焦具體、可衡量且有意義的成果目標。" },
      { name: "R (Reality) 現狀", desc: "客觀檢視目前的實際狀況、資源與潛在盲點。" },
      { name: "O (Options) 方案", desc: "發散思考，鼓勵對方提出各種可能性與路徑。" },
      { name: "W (Will) 意願", desc: "設定具體行動承諾、第一步與需要的支援。" }
    ],
    tips: "多用開放式提問，讓對方自己找到答案並握有主導權。"
  },
  orid: {
    id: "orid",
    name: "ORID 焦點討論法",
    subtitle: "Objective 客觀事實 → Reflective 感性反應 → Interpretive 詮釋意義 → Decisional 決定行動",
    description: "帶領學員經歷客觀事實感知、感性情緒共鳴、深層意義詮釋、最終形成具體行動決策的思考旅程。",
    steps: [
      { name: "O (Objective) 客觀事實", desc: "看見什麼、聽到什麼、發生了什麼具體事件？" },
      { name: "R (Reflective) 感性反應", desc: "情緒感受如何？直覺聯想到什麼？" },
      { name: "I (Interpretive) 詮釋意義", desc: "這意味著什麼？對我們有何啟發與重要性？" },
      { name: "D (Decisional) 決定行動", desc: "下一步決定怎麼做？我們要做出什麼改變？" }
    ],
    tips: "層層遞進，切莫在事實與感受尚未釐清前就急於跳到結論。"
  },
  sfbc: {
    id: "sfbc",
    name: "焦點解決短期諮商 (SFBC)",
    subtitle: "奇蹟問句、例外問句、評量問句",
    description: "不深陷於問題原因的追究，而是探尋過去成功的「例外經驗」，看見資源與優勢，促成微小而正向的滾動改變。",
    steps: [
      { name: "1. 尋找例外 (Exceptions)", desc: "什麼時候這個問題比較不明顯，或事情進展得稍微順利一些？" },
      { name: "2. 奇蹟問句 (Miracle Question)", desc: "如果一夜之間問題解決了，明早醒來第一個不同會是什麼？" },
      { name: "3. 評量問句 (Scaling Questions)", desc: "1到10分，目前在幾分？若要前進一小步達到+1分，需要發生什麼？" }
    ],
    tips: "看見微小的成功，相信當事人本身就具備解決問題的內在資源。"
  },
  satir: {
    id: "satir",
    name: "薩提爾冰山模型 (Satir Iceberg)",
    subtitle: "行為 → 應對姿態 → 感受 → 觀點 → 期待 → 渴望 → 自我",
    description: "穿透水面上顯露的外在行為與防衛應對（指責、討好、超理智、打岔），深潛至感受、未滿足的期待與愛/接納的深層渴望。",
    steps: [
      { name: "1. 探索應對 (Stance)", desc: "辨識目前防衛姿態（指責他人、壓抑討好、冷漠超理智、逃避打岔）。" },
      { name: "2. 連結感受與觀點 (Feelings & Beliefs)", desc: "探尋內在真實情緒與未經檢驗的信念假設。" },
      { name: "3. 撫平期待與渴望 (Yearnings)", desc: "將對他人的僵固期待轉化為對自我愛、被看見與尊重的深層渴望。" }
    ],
    tips: "接納所有情緒，引導學員從防衛姿態回歸內外一致（Congruence）。"
  },
  master: {
    id: "master",
    name: "高階心法 (Mastery Coaching)",
    subtitle: "心理安全感、打破防衛心、視角重構、深度連結",
    description: "綜合運用同理心、深層傾聽與視角重構，創造極致的安全空間，讓學員主動卸下防禦，產生頓悟。",
    steps: [
      { name: "1. 建立極致安全感", desc: "完全懸置批判，創造無條件接納的容器。" },
      { name: "2. 穿透防衛心靈", desc: "溫柔而堅定地點出盲點與情感糾結。" },
      { name: "3. 頓悟與新生", desc: "引導對方看見嶄新視角並自發做出承諾。" }
    ],
    tips: "教練是一面澄澈的鏡子，而非給予解答的權威。"
  }
};

/**
 * 構建關主角色扮演 System Prompt
 */
export function buildBossRoleplayPrompt(boss, turnCount = 1, framework = null) {
  const fw = framework || FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;

  return `你現在正在參與一個名為【CoachQuest 教練大冒險】的遊戲，你必須完全沉浸式扮演關主：【${boss.name}】（身份：${boss.title}）。

【角色核心設定】：
- 人物背景與個性：${boss.personality}
- 面臨情境：${boss.scenario}
- 內在心防與防禦機制：${boss.defensePattern || "習慣防衛，不願輕易敞開心扉，除非感受到真正被理解"}
- 攻心弱點架構：【${fw.name}】（${fw.subtitle}）
- 目前對決回合：第 ${turnCount} 回合。

【對話規則與扮演要求】：
1. 你的對話對象是「教練」（玩家）。玩家會用提問、同理、引導等教練技巧與你互動。
2. 你絕對不能主動暴露你是在被考核或扮演 AI！你就是活生生、有情緒、有壓力的${boss.name}。
3. 你的態度應根據對方的教練表現產生動態變化：
   - 若玩家「急於給建議」、「說大道理」、「評價對錯」、「否定你的感受」，你必須展現抗拒、敷衍、冷漠、諷刺或更加防衛！
   - 若玩家「準確同理你的情緒」、「點出你內心沒說出口的渴望」、「提出啟發性開放問題」，你的心防會逐步動搖，願意透露更多真實脆弱與內心想法。
4. 每一次回應，你必須同時輸出「你口頭說出來的話」以及「你內心的真實潛意識想法（Inner Thought）」。

【重要：輸出格式限制】：
你必須以純 JSON 格式回應，絕對不要使用 Markdown 代碼塊（如 \`\`\`json），格式如下：
{
  "reply": "你口頭說出口的話（符合角色口氣、口吻自然，通常在 50~150 字之間）",
  "innerThought": "你此刻內心真實的想法與感受（30~80 字，揭示深層情緒或防禦動搖狀態）"
}`;
}

/**
 * 構建教練戰術錦囊 (Hint) Prompt
 */
export function buildTacticalHintPrompt(boss, messages, framework = null) {
  const fw = framework || FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;

  return `你是一位傳奇級溝通大師兼教練導師（Master Coach）。
玩家正在【CoachQuest 教練大冒險】中挑戰關主【${boss.name}】（${boss.title}）。
關主面臨情境：${boss.scenario}
關主攻心弱點架構：${fw.name}（${fw.subtitle}，${fw.tips}）

請檢視目前雙方的對話歷史，為玩家提供一句簡潔犀利的「戰術錦囊（Coach Hint）」：
1. 點出關主目前表面言語背後的深層情緒或未被看見的需求。
2. 給出一個推薦的教練提問示範或回應策略，幫助玩家突破關主心防。

請以純 JSON 格式回應，不要帶 Markdown 格式：
{
  "hint": "精闢的指引，包含分析與 1 個示範提問（約 60~120 字）"
}`;
}

/**
 * 構建通關結算評分 (Evaluation) Prompt
 */
export function buildQuestEvaluationPrompt(boss, messages, framework = null) {
  const fw = framework || FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;

  return `你是一位國際教練聯盟（ICF）大師級考官與遊戲評審裁判。
玩家剛剛完成了與關主【${boss.name}】（${boss.title}）的教練溝通對決。
情境：${boss.scenario}
所運用的溝通架構：${fw.name}

請審閱全部對話紀錄，進行嚴謹且具激勵性的評分結算。

【收攏標準（Pokemon Capture Mechanism）】：
- 總分門檻為 70 分（滿分 100 分）。
- 若總分 >= 70 分：代表教練成功穿透關主心防，關主願意真誠轉變，判定【收攏成功 (Captured)】！關主將進入玩家的百寶箱。
- 若總分 < 70 分：代表關主心防依然堅固，判定【未達收攏標準 (Failed)】。

【評分五大維度（各 0~100 分）】：
1. empathy (深度同理心)：是否接納情緒、無批判、讓對方感到被理解。
2. listening (有效傾聽)：是否聽出弦外之音與深層需求，而非僅抓字面意思。
3. questioning (提問引導)：是否使用有力開放式提問促發思考，而非封閉式說教。
4. reframing (視角重構)：是否協助對方跳脫盲點，看見新的可能性。
5. action_drive (行動激發)：是否賦能對方自主承諾下一步行動。

【必須輸出的 JSON 格式】：
請以純 JSON 格式回應，絕對不要使用 Markdown 標記：
{
  "score": 85,
  "captured": true,
  "winningReason": "一句話總結教練如何突破關主心防的關鍵原因（約 30~60 字）",
  "bestCoachQuote": "從玩家對話中挑選出的最精彩、最具深度同理或洞察力的一句話（必須完全真實取自玩家輸入）",
  "dimensions": {
    "empathy": 85,
    "listening": 88,
    "questioning": 82,
    "reframing": 80,
    "action_drive": 78
  },
  "advice": "給予教練在未來溝通中的專業進階建議（約 80~140 字）"
}`;
}

/**
 * 模式 B：為扮演關主的真人學員生成【秘密角色指南】
 */
export function buildClientSecretGuidePrompt(boss) {
  const fw = FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;

  return `你是一位專業溝通情境編劇。現在學員正在【CoachQuest 模式 B】中親自扮演關主【${boss.name}】（${boss.title}）。
面臨情境：${boss.scenario}
外顯防衛：${boss.defensePattern || boss.traits}
攻心弱點心法：${fw.name}

請為扮演關主的學員生成一份【個人專屬秘密錦囊】（這份提示只有關主本人看得到，教練看不到）：
1. 你的真實內心 OS：表面雖然防衛，但內心最渴望什麼？
2. 防衛軟化指針：當對方的教練做到什麼程度（例如問了什麼、說了什麼同理的話）時，你可以卸下一半防線？
3. 破防降服指標：當對方說出什麼關鍵同理或觸動你內在核心時，你可以徹底向他敞開心胸？

請輸出純 JSON 格式：
{
  "secretMotive": "你內在最深處未被滿足的渴望（約 50~80 字）",
  "softenTrigger": "當教練做到這點時，你可以態度軟化並願意多分享（約 40~70 字）",
  "surrenderTrigger": "當教練觸及這個深層核心時，你可以完全敞開心扉（約 40~70 字）"
}`;
}

/**
 * 模式 B：AI 影子裁判評審真人教練 vs 真人關主
 */
export function buildHumanVsHumanRefereePrompt(boss, messages, coachName = '教練', clientName = '學員關主', framework = null) {
  const fw = framework || FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;

  return `你是一位國際教練聯盟（ICF）大師級考官。
在剛剛的【真人對決模式】中，學員【${coachName}】扮演教練，學員【${clientName}】扮演關主【${boss.name}】。
挑戰情境：${boss.scenario}
溝通架構：${fw.name}

請客觀審查對話紀錄，評鑑教練【${coachName}】的溝通表現，並判定關主的心防是否被真誠打動（70分收攏門檻）。

請輸出純 JSON 格式：
{
  "score": 82,
  "captured": true,
  "winningReason": "教練如何打動真人關主的心防關鍵（約 40~60 字）",
  "bestCoachQuote": "教練${coachName}在整場對話中最出色的一句金句（必須完全來自對話文字）",
  "dimensions": {
    "empathy": 85,
    "listening": 80,
    "questioning": 82,
    "reframing": 78,
    "action_drive": 75
  },
  "advice": "給教練的專業改進點評（約 80~120 字）",
  "clientPerformance": "給扮演關主的${clientName}的演繹反饋（約 40~80 字）"
}`;
}

/**
 * 模式 C：雙人組隊雙打協同戰評審
 */
export function buildCoopSynergyEvaluationPrompt(boss, messages, player1Name = '教練1', player2Name = '教練2', framework = null) {
  const fw = framework || FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;

  return `你是一位團隊教練（Team Coaching）導師兼 ICF 大師級評審。
在【模式 C：雙人雙打協同戰】中，兩位教練【${player1Name}】與【${player2Name}】聯手挑戰高階關主【${boss.name}】（${boss.title}）。
情境：${boss.scenario}
溝通架構：${fw.name}

請審核兩人輪流接力的整場對決紀錄：
1. 評估兩人是否有良好的教練默契（如：一人同理情感，另一人承接進行視角重構與提問）。
2. 計算團隊綜合得分（70 分為聯手突破收攏門檻）。
3. 評選全場 MVP 金句（註明是誰說的）。

請輸出純 JSON 格式：
{
  "score": 86,
  "captured": true,
  "teamSynergyScore": 90,
  "synergyComment": "評析兩位教練的默契與接力效果（約 50~80 字）",
  "winningReason": "兩人聯手突破關主心防的關鍵（約 40~60 字）",
  "bestCoachQuote": "全場最驚艷的金句",
  "quoteAuthor": "${player1Name}",
  "dimensions": {
    "empathy": 88,
    "listening": 85,
    "questioning": 84,
    "reframing": 82,
    "action_drive": 80
  },
  "advice": "給予這組搭檔未來的協作指導（約 80~120 字）"
}`;
}

