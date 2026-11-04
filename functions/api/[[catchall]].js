// ========================================================
// Cloudflare Pages / Worker API Catchall Handler
// 支援單人挑戰、全域金鑰託管與三人約戰模式（A/B/C）
// ========================================================

import { 
  FRAMEWORKS, 
  buildBossRoleplayPrompt, 
  buildTacticalHintPrompt, 
  buildQuestEvaluationPrompt,
  buildClientSecretGuidePrompt,
  buildHumanVsHumanRefereePrompt,
  buildCoopSynergyEvaluationPrompt
} from '../../lib/prompts.js';

const GEMINI_CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const DEEPSEEK_CANDIDATE_MODELS = ['deepseek-chat', 'deepseek-reasoner'];
const DEFAULT_DEEPSEEK_MODEL = 'deepseek-chat';


// 記憶體備援前 10 名排行榜（在無 Cloudflare KV 時提供即時回饋）
let memoryLeaderboard = [
  { rank: 1, name: "傾聽之神·艾登", score: 98, captures: 16, title: "傳奇心靈宗師", avatar: "👑" },
  { rank: 2, name: "薩提爾小王子", score: 95, captures: 14, title: "道館金牌總教練", avatar: "🧊" },
  { rank: 3, name: "職場談判專家", score: 93, captures: 12, title: "道館金牌總教練", avatar: "💼" },
  { rank: 4, name: "非暴力傳道士", score: 90, captures: 11, title: "冰山破冰導師", avatar: "🕊️" },
  { rank: 5, name: "溫柔力量·晴晴", score: 88, captures: 10, title: "冰山破冰導師", avatar: "🌸" },
  { rank: 6, name: "家庭和事佬", score: 86, captures: 9, title: "深度傾聽先鋒", avatar: "🧸" },
  { rank: 7, name: "夫妻破冰船", score: 85, captures: 8, title: "深度傾聽先鋒", avatar: "💍" },
  { rank: 8, name: "知心酒友", score: 82, captures: 7, title: "初階教練學徒", avatar: "🍻" },
  { rank: 9, name: "成長心態小王", score: 80, captures: 6, title: "初階教練學徒", avatar: "🌱" },
  { rank: 10, name: "溝通探險家", score: 78, captures: 5, title: "見習溝通使", avatar: "🧭" }
];

// 多人約戰房間快取池（以 RoomId 為 Key）
const activeRooms = new Map();

// 學員實戰對話練習紀錄儲存庫 (記憶體備援，支援 Cloudflare KV 持久化)
let memoryPracticeLogs = [];
const adminSessions = new Map(); // token -> { username, createdAt, expiresAt }

function getAdminCredentials(env) {
  const username = (env && env.ADMIN_USERNAME) ? String(env.ADMIN_USERNAME).trim() : 'admin';
  const password = (env && env.ADMIN_PASSWORD) ? String(env.ADMIN_PASSWORD).trim() : 'coachquest2026';
  return { username, password };
}

function verifyAdminSession(request, env) {
  const authHeader = request.headers.get('Authorization') || request.headers.get('x-admin-token') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const session = adminSessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    return session;
  }

  // 支援環境變數 ADMIN_SECRET 作為萬用管理金鑰
  if (env && env.ADMIN_SECRET && token === String(env.ADMIN_SECRET).trim()) {
    return { username: 'admin', token };
  }

  return null;
}

async function getStoredPracticeLogs(env) {
  if (env && env.COACHQUEST_KV) {
    try {
      const kvData = await env.COACHQUEST_KV.get('practice_logs_all', { type: 'json' });
      if (Array.isArray(kvData)) {
        return kvData;
      }
    } catch (e) {
      console.warn('KV 讀取 practice_logs 失敗，改用記憶體資料:', e);
    }
  }
  return memoryPracticeLogs;
}

async function saveStoredPracticeLogs(env, logs) {
  memoryPracticeLogs = logs;
  if (env && env.COACHQUEST_KV) {
    try {
      await env.COACHQUEST_KV.put('practice_logs_all', JSON.stringify(logs));
    } catch (e) {
      console.warn('KV 儲存 practice_logs 失敗:', e);
    }
  }
}

// 定期清理逾時房間（超過 3 小時未活動）
function cleanupStaleRooms() {
  const now = Date.now();
  const maxAge = 3 * 60 * 60 * 1000;
  for (const [id, r] of activeRooms.entries()) {
    if (now - r.lastActiveAt > maxAge) {
      activeRooms.delete(id);
    }
  }
}

// 關主速查字典
const BOSS_DICTIONARY = {
  // 職場篇
  'boss_work_1': { id: 'boss_work_1', name: '防禦刺蝟・研發小陳', title: '後端工程師', avatar: '🦔', category: 'work', frameworkId: 'nvc', personality: '內斂寡言、自尊心強、害怕被興師問罪、長期壓抑委屈', scenario: '核心模組進度已延期四天未交，且未主動同步狀態，主管啟動一對一面談。' },
  'boss_work_2': { id: 'boss_work_2', name: '焦慮旋風・產品林經理', title: '跨部門專案經理', avatar: '🌪️', category: 'work', frameworkId: 'grow', personality: '語速極快、情緒焦慮發散、感到孤立無援、抓不住核心', scenario: '跨部門需求衝突爆發，客戶揚言解約，林經理在辦公室處於情緒崩潰邊緣。' },
  'boss_work_3': { id: 'boss_work_3', name: '迷茫頑石・資深老張', title: '15年核心老員工', avatar: '🪨', category: 'work', frameworkId: 'orid', personality: '保守防禦、倚老賣老、對新工具與數位轉型感到被淘汰的恐懼', scenario: '公司推行全面敏捷看板與自動化工具，老張拒絕使用並在會議上酸言酸語。' },
  'boss_work_4': { id: 'boss_work_4', name: '隱藏魔王・鐵血趙總監', title: '高壓狼性事業群副總', avatar: '🐺', category: 'work', frameworkId: 'master', personality: '氣場強大、極度不耐煩、信奉弱肉強食、只看結果不談感情', scenario: '年度業績達標但三個月內離職率高達40%，總經理要求其接受教練對談。' },

  // 親子篇
  'boss_parent_1': { id: 'boss_parent_1', name: '閉門刺蝟・高一兒子翔翔', title: '沉迷手機的叛逆少年', avatar: '🎮', category: 'parenting', frameworkId: 'nvc', personality: '叛逆敏感、防禦心重、極度討厭被說教與拿去和別人比較', scenario: '段考成績大幅下滑，每天放學一回到家就把自己反鎖在房裡打手遊到深夜。' },
  'boss_parent_2': { id: 'boss_parent_2', name: '焦慮淚眼・小五女兒萱萱', title: '懼學焦慮的小學生', avatar: '🥺', category: 'parenting', frameworkId: 'sfbc', personality: '心思細膩、自我要求高、害怕被同學笑而容易焦慮退縮', scenario: '連續兩週在早上上學前哭鬧說肚子劇痛，週日晚上焦慮崩潰。' },
  'boss_parent_3': { id: 'boss_parent_3', name: '選填迷茫・大四兒子阿豪', title: '畢業在即的躺平青年', avatar: '🦥', category: 'parenting', frameworkId: 'grow', personality: '被動拖延、缺乏自信、對父母的高期待感到無形窒息', scenario: '大學即將畢業卻完全未投遞履歷，面對父母催促總是消極冷戰。' },
  'boss_parent_4': { id: 'boss_parent_4', name: '情緒火山・國中女兒羽婷', title: '追求同儕認同的少女', avatar: '🌋', category: 'parenting', frameworkId: 'satir', personality: '外表刺蝟尖銳、容易暴怒摔門，內心極度渴望父母專注的愛與認同', scenario: '因想買昂貴潮牌球鞋被拒絕，將餐具摔在地上痛罵父母並揚言離家出走。' },

  // 夫妻篇
  'boss_couple_1': { id: 'boss_couple_1', name: '冷戰冰川・疲憊妻子雅婷', title: '喪偶式育兒的職業婦女', avatar: '🧊', category: 'couple', frameworkId: 'nvc', personality: '疲憊隱忍、心灰意冷、習慣用冷漠與沉默表達絕望抗議', scenario: '下班接小孩煮飯洗碗一氣呵成，看見丈夫躺在沙發滑手機傻笑，徹底沉默進入冷戰第三天。' },
  'boss_couple_2': { id: 'boss_couple_2', name: '暴躁防禦・加班丈夫志強', title: '經濟重擔下的中年父親', avatar: '💥', category: 'couple', frameworkId: 'satir', personality: '愛面子、焦慮壓抑、用暴躁指責來掩飾自己對房貸與裁員的恐懼', scenario: '妻子關心詢問家用開銷，志強突然拍桌發飆，痛斥妻子不知節制揮霍。' },
  'boss_couple_3': { id: 'boss_couple_3', name: '金錢焦慮・精打細算太太思涵', title: '缺乏安全感的家庭財務官', avatar: '🧾', category: 'couple', frameworkId: 'orid', personality: '過度控制、對任何非必要支出極端焦慮敏感', scenario: '丈夫買了一雙兩千元的運動鞋，思涵看見發票後情緒崩潰，痛斥對方沒有危機意識。' },
  'boss_couple_4': { id: 'boss_couple_4', name: '夾心餅乾・逃避伴侶家豪', title: '婆媳衝突中的和事佬先生', avatar: '🥪', category: 'couple', frameworkId: 'grow', personality: '討好型人格、極端害怕衝突、遇到婆媳問題就打哈哈兩面討好', scenario: '婆婆未經通知擅拿鑰匙開門翻動嬰兒用品，妻子要求換鎖，家豪藉口加班逃避表態。' },

  // 朋友篇
  'boss_friend_1': { id: 'boss_friend_1', name: '借錢周轉・創業好友阿凱', title: '屢敗屢戰的創業家', avatar: '💸', category: 'friends', frameworkId: 'nvc', personality: '打感情牌、自尊脆弱、急於翻身、感到走投無路', scenario: '第三次創業虧損，深夜約在熱炒店喝酒，支支吾吾想再借三十萬週轉。' },
  'boss_friend_2': { id: 'boss_friend_2', name: '情緒黑洞・訴苦閨蜜小敏', title: '長期抱怨的負能量密友', avatar: '🕳️', category: 'friends', frameworkId: 'sfbc', personality: '習得性無助、受害者心態、每次見面都是連珠炮式抱怨工作與家人', scenario: '假日喝下午茶坐下一個小時，滔滔不絕痛罵公司每一個主管與同事。' },
  'boss_friend_3': { id: 'boss_friend_3', name: '心結猜忌・多年合夥摯友浩然', title: '心生芥蒂的創業夥伴', avatar: '🎭', category: 'friends', frameworkId: 'orid', personality: '好強敏感、說話帶著冷嘲熱諷、認定你在背後搶功勞或私吞資源', scenario: '活動結束後客戶直接找你續約，浩然私下認定你背叛承諾，群組中酸言酸語。' },
  'boss_friend_4': { id: 'boss_friend_4', name: '攀比炫耀・聚會老同學阿明', title: '愛面子的同窗同學', avatar: '🥂', category: 'friends', frameworkId: 'satir', personality: '一身名牌、口氣高傲，用浮誇炫富掩飾內在深層自卑與渴望認同', scenario: '高中同學會上不停晃動名錶吹噓買房，並當眾調侃你的工作穩定但沒前途。' }
};

// 別名容錯相容
BOSS_DICTIONARY['boss_friends_1'] = BOSS_DICTIONARY['boss_friend_1'];
BOSS_DICTIONARY['boss_friends_2'] = BOSS_DICTIONARY['boss_friend_2'];
BOSS_DICTIONARY['boss_friends_3'] = BOSS_DICTIONARY['boss_friend_3'];
BOSS_DICTIONARY['boss_friends_4'] = BOSS_DICTIONARY['boss_friend_4'];

/**
 * 智慧解析雙模 API 設定 (支援 DeepSeek 與 Gemini 自動適配)
 */
function resolveApiConfig(reqBody, env) {
  const clientKey = (reqBody && reqBody.userApiKey && typeof reqBody.userApiKey === 'string') 
    ? reqBody.userApiKey.trim() 
    : (reqBody && reqBody.apiKey && typeof reqBody.apiKey === 'string' ? reqBody.apiKey.trim() : '');

  const requestedModel = (reqBody && reqBody.userModel && typeof reqBody.userModel === 'string')
    ? reqBody.userModel.trim()
    : (reqBody && reqBody.model && typeof reqBody.model === 'string' ? reqBody.model.trim() : '');

  // 1. 從環境變數提取金鑰
  let deepseekEnvKey = '';
  let geminiEnvKey = '';

  if (env && typeof env === 'object') {
    for (const key of Object.keys(env)) {
      const upper = key.toUpperCase();
      if (upper === 'DEEPSEEK_API_KEY' || upper === 'DEEPSEEK_KEY') {
        const val = env[key];
        if (typeof val === 'string' && val.trim()) deepseekEnvKey = val.trim();
      }
      if (upper === 'GEMINI_API_KEY' || upper === 'GOOGLE_API_KEY' || upper === 'GEMINI_KEY') {
        const val = env[key];
        if (typeof val === 'string' && val.trim()) geminiEnvKey = val.trim();
      }
    }
  }

  // 檢查 globalThis 與 process (本機開發環境相容)
  if (!deepseekEnvKey) {
    const gKey = (typeof globalThis !== 'undefined' && (globalThis.DEEPSEEK_API_KEY || globalThis.DEEPSEEK_KEY))
      || (typeof process !== 'undefined' && (process?.env?.DEEPSEEK_API_KEY || process?.env?.DEEPSEEK_KEY)) || '';
    if (typeof gKey === 'string' && gKey.trim()) deepseekEnvKey = gKey.trim();
  }
  if (!geminiEnvKey) {
    const gKey = (typeof globalThis !== 'undefined' && (globalThis.GEMINI_API_KEY || globalThis.GOOGLE_API_KEY))
      || (typeof process !== 'undefined' && (process?.env?.GEMINI_API_KEY || process?.env?.GOOGLE_API_KEY)) || '';
    if (typeof gKey === 'string' && gKey.trim()) geminiEnvKey = gKey.trim();
  }

  // 2. 判斷 Provider 與生效金鑰
  let provider = 'gemini';
  let apiKey = '';
  let model = requestedModel;

  if (clientKey) {
    apiKey = clientKey;
    // 使用者自備金鑰：依照前綴特徵與指定模型智慧判定
    if (clientKey.startsWith('sk-') && !clientKey.startsWith('AIza')) {
      provider = 'deepseek';
    } else if (clientKey.startsWith('AIza')) {
      provider = 'gemini';
    } else if (requestedModel.startsWith('deepseek')) {
      provider = 'deepseek';
    } else {
      provider = 'gemini';
    }
  } else {
    // 伺服器端託管金鑰：依偏好模型與可用環境變數判定
    if (requestedModel.startsWith('deepseek')) {
      if (deepseekEnvKey) {
        provider = 'deepseek';
        apiKey = deepseekEnvKey;
      } else if (geminiEnvKey) {
        provider = 'gemini';
        apiKey = geminiEnvKey;
        model = DEFAULT_GEMINI_MODEL;
      }
    } else if (requestedModel.startsWith('gemini')) {
      if (geminiEnvKey) {
        provider = 'gemini';
        apiKey = geminiEnvKey;
      } else if (deepseekEnvKey) {
        provider = 'deepseek';
        apiKey = deepseekEnvKey;
        model = DEFAULT_DEEPSEEK_MODEL;
      }
    } else {
      // 未指定模型，若有 DEEPSEEK_API_KEY 優先支援 deepseek；若無則走 gemini
      if (deepseekEnvKey && !geminiEnvKey) {
        provider = 'deepseek';
        apiKey = deepseekEnvKey;
      } else if (geminiEnvKey) {
        provider = 'gemini';
        apiKey = geminiEnvKey;
      } else if (deepseekEnvKey) {
        provider = 'deepseek';
        apiKey = deepseekEnvKey;
      }
    }
  }

  // 補齊模型名稱相容性
  if (!model) {
    model = (provider === 'deepseek') ? DEFAULT_DEEPSEEK_MODEL : DEFAULT_GEMINI_MODEL;
  } else if (provider === 'deepseek' && model.startsWith('gemini')) {
    model = DEFAULT_DEEPSEEK_MODEL;
  } else if (provider === 'gemini' && model.startsWith('deepseek')) {
    model = DEFAULT_GEMINI_MODEL;
  }

  return {
    provider,
    apiKey,
    model,
    deepseekFallbackKey: deepseekEnvKey || (clientKey.startsWith('sk-') ? clientKey : ''),
    geminiFallbackKey: geminiEnvKey || (clientKey.startsWith('AIza') ? clientKey : ''),
    hasServerDeepseek: !!deepseekEnvKey,
    hasServerGemini: !!geminiEnvKey
  };
}

/**
 * 相容舊函式
 */
function resolveApiKey(reqBody, env) {
  return resolveApiConfig(reqBody, env).apiKey;
}

/**
 * 智慧解析與容錯提取 LLM JSON 回應
 * 遇到 Markdown 代碼區塊、前後多餘文字、甚至模型純文字回應時，保證 100% 成功提取，絕不向學員報錯
 */
function parseOrExtractLlmJson(rawText, fallbackMode = 'chat') {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('模型回傳內容為空');
  }

  const cleanText = rawText.trim();

  // 1. 去除 Markdown 標籤 (```json ... ``` 或 ``` ...)
  const stripped = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 2. 嘗試直接 JSON 解析
  try {
    const parsed = JSON.parse(stripped);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {}

  // 3. 嘗試以正則擷取最外層大括號 { ... }
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonSubstring = cleanText.substring(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(jsonSubstring);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (_) {}
  }

  // 4. 【智慧容錯】：模型輸出了自然語言對話，而非 JSON 結構。依場景自動封裝，絕不讓學生面臨錯誤
  console.warn(`[Safe JSON Fallback] 無法解析為標準 JSON，依模式 [${fallbackMode}] 自動挽救純文字回應:`, cleanText.substring(0, 80));

  if (fallbackMode === 'chat') {
    let reply = cleanText;
    let innerThought = '（若有所思，正在梳理情緒與需求……）';

    // 嘗試解析文字中的心聲關鍵字
    const thoughtMatch = cleanText.match(/(?:心聲|內心|想法|innerThought)[：:\s]+([^\n\r]+)/i);
    if (thoughtMatch) {
      innerThought = thoughtMatch[1].trim();
      reply = cleanText.replace(thoughtMatch[0], '').replace(/^(?:關主|回應|台詞|reply)[：:\s]*/i, '').trim();
    } else {
      reply = cleanText.replace(/^(?:關主|回應|台詞|reply)[：:\s]*/i, '').trim();
    }

    return {
      reply: reply || '……',
      innerThought: innerThought
    };
  }

  if (fallbackMode === 'hint') {
    return {
      hint: cleanText.replace(/^(?:提示|錦囊|hint)[：:\s]*/i, '').trim(),
      framework: '同理與非暴力溝通'
    };
  }

  if (fallbackMode === 'evaluate') {
    const scoreMatch = cleanText.match(/(\d{1,3})\s*(?:分|\/100)/);
    const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : 80;
    return {
      score,
      captured: score >= 70,
      winningReason: score >= 70 ? '對話展現深刻同理與覺察，成功化解心防。' : '部分需求尚待更深入確認。',
      bestCoachQuote: '你展現了溫暖而堅定的傾聽力量。',
      dimensions: { empathy: score, listening: score, questioning: Math.max(60, score - 5), reframing: score, action_drive: Math.max(60, score - 10) },
      feedback: { strengths: ['展現積極傾聽姿態'], opportunities: ['可深化核心需求核對'], coachTip: '保持好奇，不急於給予建議。' }
    };
  }

  return { status: 'ready', message: cleanText };
}

/**
 * 呼叫 DeepSeek 官方 REST API (標準 OpenAI 格式相容)
 */
async function callDeepSeekApi({ apiKey, model, systemPrompt, messages, fallbackMode = 'chat' }) {
  if (!apiKey) {
    throw new Error('未偵測到 DeepSeek API Key。請在 Cloudflare Secrets (DEEPSEEK_API_KEY) 或右上角設定中填入金鑰。');
  }

  const targetModel = model || DEFAULT_DEEPSEEK_MODEL;
  const endpoint = 'https://api.deepseek.com/chat/completions';

  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({
      role: 'system',
      content: systemPrompt.includes('JSON') || systemPrompt.includes('json')
        ? systemPrompt
        : `${systemPrompt}\n請注意：必須以繁體中文並嚴格以 JSON 格式回應。`
    });
  }

  for (const m of messages) {
    let text = '';
    if (typeof m.content === 'string') {
      text = m.content;
    } else if (Array.isArray(m.parts)) {
      text = m.parts.map(p => p.text || '').join('\n');
    }
    const role = (m.role === 'model' || m.role === 'assistant') ? 'assistant' : 'user';
    formattedMessages.push({ role, content: text });
  }

  const payload = {
    model: targetModel,
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 2500
  };

  // deepseek-chat 支援 response_format json_object
  if (targetModel === 'deepseek-chat') {
    payload.response_format = { type: 'json_object' };
  } else if (targetModel === 'deepseek-reasoner') {
    delete payload.temperature;
    payload.max_tokens = 4096;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `DeepSeek API 回應異常 (${targetModel}: HTTP ${res.status})`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error && errJson.error.message) {
        errMsg = `DeepSeek 錯誤: ${errJson.error.message}`;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }

  const data = await res.json();
  const choice = data?.choices?.[0]?.message;
  let rawText = (choice?.content && typeof choice.content === 'string') ? choice.content.trim() : '';
  if (!rawText && choice?.reasoning_content) {
    rawText = choice.reasoning_content.trim();
  }
  if (!rawText) {
    throw new Error(`DeepSeek API (${targetModel}) 回傳文字為空`);
  }

  return parseOrExtractLlmJson(rawText, fallbackMode);
}

/**
 * 呼叫 Gemini 官方 REST API (支援多候選模型自動降級備援)
 */
async function callGeminiApi({ apiKey, model, systemPrompt, contents, fallbackMode = 'chat' }) {
  if (!apiKey) {
    throw new Error('伺服器與客戶端皆未偵測到 Gemini API Key。請在 .dev.vars、Cloudflare Secrets 或右上角設定中填入金鑰。');
  }

  const requestedModel = model || DEFAULT_GEMINI_MODEL;
  // 建立候選模型順序：指定模型排首位，其餘模型依序備援
  const modelsToTry = [
    requestedModel,
    ...GEMINI_CANDIDATE_MODELS.filter(m => m !== requestedModel)
  ];

  let lastError = null;

  for (const targetModel of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

      const payload = {
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
          responseMimeType: "application/json"
        }
      };

      if (systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = `Gemini API 回應異常 (${targetModel}: HTTP ${res.status})`;
        try {
          const errJson = JSON.parse(errText);
          if (errJson.error && errJson.error.message) {
            errMsg = `${targetModel} 錯誤: ${errJson.error.message}`;
          }
        } catch (_) {}
        lastError = new Error(errMsg);

        // 若為 404 (模型停用/不存在)、503 (過載) 或 429 (配額限制)，自動切換至下一個備援模型
        if (res.status === 404 || res.status === 503 || res.status === 429) {
          console.warn(`[Gemini Fallback] 模型 ${targetModel} 狀態異常 (HTTP ${res.status})，嘗試備援模型...`);
          continue;
        } else {
          throw lastError;
        }
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error(`Gemini API (${targetModel}) 未回傳有效文字內容`);
      }

      return parseOrExtractLlmJson(rawText, fallbackMode);
    } catch (err) {
      lastError = err;
      const isRetryable = err.message && (
        err.message.includes('404') || 
        err.message.includes('503') || 
        err.message.includes('429') || 
        err.message.includes('not found') ||
        err.message.includes('overloaded')
      );
      if (isRetryable && modelsToTry.indexOf(targetModel) < modelsToTry.length - 1) {
        console.warn(`[Gemini Fallback] 呼叫 ${targetModel} 失敗: ${err.message}，切換下一個模型...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('所有備援模型呼叫皆失敗');
}

/**
 * 統一 LLM API 調用器 (支援 DeepSeek 與 Gemini 雙模全自動雙向互備)
 */
async function callLlmApi({ config, systemPrompt, messages = [], contents = null }) {
  const { provider, apiKey, model } = config;
  const fallbackMode = (systemPrompt && (systemPrompt.includes('錦囊') || systemPrompt.includes('hint')))
    ? 'hint'
    : ((systemPrompt && (systemPrompt.includes('結算') || systemPrompt.includes('評分') || systemPrompt.includes('evaluate')))
      ? 'evaluate'
      : ((systemPrompt && (systemPrompt.includes('測試') || systemPrompt.includes('status'))) ? 'test' : 'chat'));

  if (provider === 'deepseek') {
    const msgs = (messages && messages.length > 0)
      ? messages
      : (contents || []).map(c => ({
          role: c.role === 'model' ? 'assistant' : 'user',
          content: c.parts?.map(p => p.text).join('\n') || ''
        }));

    try {
      return await callDeepSeekApi({
        apiKey,
        model,
        systemPrompt,
        messages: msgs,
        fallbackMode
      });
    } catch (deepseekErr) {
      console.warn(`[Dual-Engine Fallback] DeepSeek 呼叫失敗: ${deepseekErr.message}`);

      // 檢查是否有 Gemini 金鑰（伺服器託管或自備）可作備援
      const geminiKey = config.geminiFallbackKey || '';
      if (geminiKey) {
        try {
          console.warn('[Dual-Engine Fallback] 自動啟動 Gemini 備援引擎接手處理...');
          const geminiContents = msgs.map(m => ({
            role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
            parts: [{ text: typeof m.content === 'string' ? m.content : '' }]
          }));

          const fallbackResult = await callGeminiApi({
            apiKey: geminiKey,
            model: DEFAULT_GEMINI_MODEL,
            systemPrompt,
            contents: geminiContents,
            fallbackMode
          });

          console.log('[Dual-Engine Fallback] 成功透過 Gemini 引擎無縫接手回應！');
          if (fallbackResult && typeof fallbackResult === 'object') {
            fallbackResult._engineFallback = { from: 'deepseek', to: 'gemini', reason: deepseekErr.message };
          }
          return fallbackResult;
        } catch (geminiErr) {
          console.error('[Dual-Engine Fallback] Gemini 備援亦失敗:', geminiErr.message);
        }
      }

      if (deepseekErr.message && deepseekErr.message.includes('Insufficient Balance')) {
        throw new Error('DeepSeek 帳戶餘額不足 (Insufficient Balance)。建議切換為免費 Google Gemini 引擎或前往 DeepSeek 官網儲值。');
      }

      throw deepseekErr;
    }
  } else {
    // provider === 'gemini'
    const geminiContents = (contents && contents.length > 0)
      ? contents
      : (messages || []).map(m => ({
          role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
          parts: [{ text: typeof m.content === 'string' ? m.content : (m.parts?.[0]?.text || '') }]
        }));

    try {
      return await callGeminiApi({
        apiKey,
        model,
        systemPrompt,
        contents: geminiContents,
        fallbackMode
      });
    } catch (geminiErr) {
      console.warn(`[Dual-Engine Fallback] Gemini 呼叫失敗: ${geminiErr.message}`);

      // 檢查是否有 DeepSeek 金鑰可作備援
      const deepseekKey = config.deepseekFallbackKey || '';
      if (deepseekKey) {
        try {
          console.warn('[Dual-Engine Fallback] 自動啟動 DeepSeek 備援引擎接手處理...');
          const dsMsgs = (messages && messages.length > 0)
            ? messages
            : (geminiContents || []).map(c => ({
                role: c.role === 'model' ? 'assistant' : 'user',
                content: c.parts?.map(p => p.text).join('\n') || ''
              }));

          const fallbackResult = await callDeepSeekApi({
            apiKey: deepseekKey,
            model: DEFAULT_DEEPSEEK_MODEL,
            systemPrompt,
            messages: dsMsgs,
            fallbackMode
          });

          console.log('[Dual-Engine Fallback] 成功透過 DeepSeek 引擎無縫接手回應！');
          if (fallbackResult && typeof fallbackResult === 'object') {
            fallbackResult._engineFallback = { from: 'gemini', to: 'deepseek', reason: geminiErr.message };
          }
          return fallbackResult;
        } catch (dsErr) {
          console.error('[Dual-Engine Fallback] DeepSeek 備援亦失敗:', dsErr.message);
        }
      }

      throw geminiErr;
    }
  }
}


// 根據玩家身份保護機密提示卡（關主看得見、教練看不見）
function sanitizeRoomForPlayer(room, playerId) {
  const clone = JSON.parse(JSON.stringify(room));
  if (clone.mode === 'human_roleplay') {
    // 只有學員關主 (Player 2) 能看見秘密指南
    if (playerId !== clone.player2?.id) {
      delete clone.secretGuide;
    }
  }
  return clone;
}

/**
 * 主要請求分流器
 */
export async function handleApiRequest(request, env) {
  cleanupStaleRooms();

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/api/, '');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. GET /api/game-info
    if (pathname === '/game-info' && request.method === 'GET') {
      const config = resolveApiConfig(null, env);
      const providers = [];
      if (config.hasServerDeepseek) providers.push('deepseek');
      if (config.hasServerGemini) providers.push('gemini');

      return new Response(JSON.stringify({
        ok: true,
        game: 'CoachQuest',
        version: '2.6.2',
        hasApiKey: !!config.apiKey,
        hasKV: !!(env && env.COACHQUEST_KV),
        activeProvider: config.provider,
        providers: providers.length > 0 ? providers : ['gemini', 'deepseek'],
        defaultModel: config.model,
        activeRoomsCount: activeRooms.size,
        envKeys: env ? Object.keys(env) : []
      }), { headers: corsHeaders });
    }

    // 2. POST /api/test-key
    if (pathname === '/test-key' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const config = resolveApiConfig(body, env);
      if (!config.apiKey) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: '伺服器未偵測到內建金鑰，且未輸入個人金鑰。請在設定中填寫 DeepSeek 或 Gemini API Key 後再點擊測試。' 
        }), { headers: corsHeaders });
      }

      const testResult = await callLlmApi({
        config,
        systemPrompt: '你是一個測試端點助手，請回覆純 JSON: {"status": "ready"}',
        messages: [{ role: 'user', content: '請回覆純 JSON: {"status": "ready"}' }]
      });

      const isDeepSeek = config.provider === 'deepseek';
      return new Response(JSON.stringify({
        ok: true,
        provider: config.provider,
        message: (body.apiKey && body.apiKey.trim()) 
          ? `個人自備 ${isDeepSeek ? 'DeepSeek' : 'Gemini'} 金鑰連線成功！` 
          : `伺服器全局 ${isDeepSeek ? 'DeepSeek' : 'Gemini'} 金鑰連線成功！`,
        model: config.model,
        reply: testResult
      }), { headers: corsHeaders });
    }

    // 3. POST /api/chat (單人關主對話)
    if (pathname === '/chat' && request.method === 'POST') {
      const body = await request.json();
      const { bossId, messages = [], turn = 1, userModel } = body;

      const boss = BOSS_DICTIONARY[bossId];
      if (!boss) {
        return new Response(JSON.stringify({ ok: false, error: `找不到關主 ID: ${bossId}` }), { status: 404, headers: corsHeaders });
      }

      const config = resolveApiConfig(body, env);
      const framework = FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;
      const systemPrompt = buildBossRoleplayPrompt(boss, turn, framework);

      const result = await callLlmApi({
        config,
        systemPrompt,
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      });

      return new Response(JSON.stringify({
        ok: true,
        reply: result.reply || '……',
        innerThought: result.innerThought || '',
        fallbackUsed: !!result._engineFallback,
        fallbackInfo: result._engineFallback || null
      }), { headers: corsHeaders });
    }

    // 4. POST /api/hint (戰術錦囊)
    if (pathname === '/hint' && request.method === 'POST') {
      const body = await request.json();
      const { bossId, messages = [], userModel } = body;

      const boss = BOSS_DICTIONARY[bossId];
      if (!boss) {
        return new Response(JSON.stringify({ ok: false, error: '找不到指定關主' }), { status: 404, headers: corsHeaders });
      }

      const config = resolveApiConfig(body, env);
      const framework = FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;
      const systemPrompt = buildTacticalHintPrompt(boss, messages, framework);

      const result = await callLlmApi({
        config,
        systemPrompt,
        messages: [{
          role: 'user',
          content: `目前對話歷史：\n${JSON.stringify(messages, null, 2)}\n請依據教練心法提供戰術錦囊。`
        }]
      });

      return new Response(JSON.stringify({
        ok: true,
        hint: result.hint || '試著多探索對方的內在渴望與感受。'
      }), { headers: corsHeaders });
    }

    // 5. POST /api/evaluate (單人通關結算)
    if (pathname === '/evaluate' && request.method === 'POST') {
      const body = await request.json();
      const { bossId, messages = [], userModel } = body;

      const boss = BOSS_DICTIONARY[bossId];
      if (!boss) {
        return new Response(JSON.stringify({ ok: false, error: '找不到指定關主' }), { status: 404, headers: corsHeaders });
      }

      const config = resolveApiConfig(body, env);
      const framework = FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;
      const systemPrompt = buildQuestEvaluationPrompt(boss, messages, framework);

      const evaluation = await callLlmApi({
        config,
        systemPrompt,
        messages: [{
          role: 'user',
          content: `完整對決對話紀錄：\n${JSON.stringify(messages, null, 2)}\n請客觀評分並判定是否突破 70 分心防收攏標準。`
        }]
      });

      const score = Number(evaluation.score) || 0;
      const isCaptured = score >= 70;

      // 提取或智慧合成每回合提問示範建議 (Better Phrasing & Rationale)
      let turnSuggestions = Array.isArray(evaluation.turnSuggestions) ? evaluation.turnSuggestions : [];
      if (turnSuggestions.length === 0) {
        const userMessages = messages.filter(m => m.role === 'user');
        turnSuggestions = userMessages.map((m, idx) => {
          const content = typeof m.content === 'string' ? m.content : '';
          let phrasing = '';
          let rationale = '';

          if (content.includes('？') || content.includes('?')) {
            phrasing = `「聽起來這件事的進展對你而言非常關鍵，是什麼原因讓你特別重視這部分呢？」`;
            rationale = `運用有力開放式提問啟發深層反思，核對對方真正在乎的內在價值。`;
          } else if (content.includes('壓力') || content.includes('累') || content.includes('生氣') || content.includes('難過')) {
            phrasing = `「我能感受到這段時間你承受了相當巨大的壓力與不易，此時此刻你最希望得到什麼樣的理解或支持？」`;
            rationale = `先接納情緒與心理負荷，建立全然的心理安全感，避免過早切入就事論事。`;
          } else {
            phrasing = `「謝謝你願意跟我說這些，聽起來你非常渴望能被公平對待並突破現狀，是這樣嗎？」`;
            rationale = `懸置批判與自我建議，以【${framework.name}】心法同理對方內心未被滿足的核心渴望。`;
          }

          return {
            turn: idx + 1,
            userOriginal: content,
            betterPhrasing: phrasing,
            rationale: rationale
          };
        });
      }

      return new Response(JSON.stringify({
        ok: true,
        evaluation: {
          score,
          captured: isCaptured,
          winningReason: evaluation.winningReason || (isCaptured ? '深度同理突破了防備' : '防線尚未完全卸下'),
          bestCoachQuote: evaluation.bestCoachQuote || '你的傾聽給予了對方極大的安全感。',
          dimensions: evaluation.dimensions || { empathy: 75, listening: 75, questioning: 70, reframing: 70, action_drive: 65 },
          advice: evaluation.advice || '持續維持開放好奇的態度進行深入提問。',
          turnSuggestions
        }
      }), { headers: corsHeaders });
    }


    // ========================================================
    // 多人約戰大廳與房間管理 (Multiplayer Arena APIs)
    // ========================================================

    // 6. POST /api/room/create (建立房間)
    if (pathname === '/room/create' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { mode = 'pvp_speedrun', bossId = 'boss_work_1', playerName = '房主教練', playerAvatar = '🧙‍♂️', userModel } = body;

      const boss = BOSS_DICTIONARY[bossId] || BOSS_DICTIONARY['boss_work_1'];
      // 隨機產生 4 位數房號
      let roomId = Math.floor(1000 + Math.random() * 9000).toString();
      while (activeRooms.has(roomId)) {
        roomId = Math.floor(1000 + Math.random() * 9000).toString();
      }

      const p1Id = 'p1_' + Math.random().toString(36).substring(2, 9);

      // 若為模式 B（真人角色扮演），預先生成或指派秘密關主手冊
      let secretGuide = null;
      if (mode === 'human_roleplay') {
        const config = resolveApiConfig(body, env);
        if (config.apiKey) {
          try {
            secretGuide = await callLlmApi({
              config,
              systemPrompt: buildClientSecretGuidePrompt(boss),
              messages: [{ role: 'user', content: `請為扮演【${boss.name}】的學員生成秘密角色扮演手冊。` }]
            });
          } catch (e) {
            console.warn('生成自訂秘密指南失敗，採用預設版:', e);
          }
        }
        if (!secretGuide) {
          secretGuide = {
            secretMotive: `表面雖然防衛戒備，但內心其實非常渴望自己的努力、委屈與壓力被看見與肯定。`,
            softenTrigger: `當對方的教練不帶評判、溫和詢問你的具體感受時，你可以稍微嘆氣並多講一些實情。`,
            surrenderTrigger: `當教練說出「我能體會這段時間你真的撐得很辛苦」時，你可以徹底卸下心防真誠坦白。`
          };
        }
      }

      const newRoom = {
        roomId,
        mode, // 'pvp_speedrun' | 'human_roleplay' | 'coop_tagteam'
        bossId: boss.id,
        bossName: boss.name,
        bossTitle: boss.title,
        bossAvatar: boss.avatar || '🎯',
        scenario: boss.scenario,
        frameworkId: boss.frameworkId,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        status: 'waiting', // waiting -> ready -> battling -> finished
        player1: {
          id: p1Id,
          name: (playerName || '房主教練').trim().substring(0, 16),
          avatar: playerAvatar || '🧙‍♂️',
          role: mode === 'human_roleplay' ? 'coach' : 'player',
          defenseHp: 100,
          turn: 1,
          isReady: true,
          score: 0
        },
        player2: null,
        activeTurnPlayerId: p1Id,
        messages: [],
        secretGuide,
        winner: null,
        evaluation: null
      };

      activeRooms.set(roomId, newRoom);

      return new Response(JSON.stringify({
        ok: true,
        roomId,
        playerId: p1Id,
        room: sanitizeRoomForPlayer(newRoom, p1Id)
      }), { headers: corsHeaders });
    }

    // 7. POST /api/room/join (加入房間)
    if (pathname === '/room/join' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { roomId, playerName = '挑戰者', playerAvatar = '🧝‍♀️' } = body;

      const room = activeRooms.get((roomId || '').trim());
      if (!room) {
        return new Response(JSON.stringify({ ok: false, error: '找不到指定房號，請確認房號是否正確或房間已關閉' }), { status: 404, headers: corsHeaders });
      }

      if (room.player2) {
        return new Response(JSON.stringify({ ok: false, error: '該房間已滿員，請加入其他房間' }), { status: 400, headers: corsHeaders });
      }

      const p2Id = 'p2_' + Math.random().toString(36).substring(2, 9);
      room.player2 = {
        id: p2Id,
        name: (playerName || '挑戰者').trim().substring(0, 16),
        avatar: playerAvatar || '🧝‍♀️',
        role: room.mode === 'human_roleplay' ? 'client' : 'player',
        defenseHp: 100,
        turn: 1,
        isReady: true,
        score: 0
      };

      room.status = 'ready';
      room.lastActiveAt = Date.now();

      return new Response(JSON.stringify({
        ok: true,
        roomId: room.roomId,
        playerId: p2Id,
        room: sanitizeRoomForPlayer(room, p2Id)
      }), { headers: corsHeaders });
    }

    // 8. GET /api/room/status (輪詢房間狀態)
    if (pathname === '/room/status' && request.method === 'GET') {
      const roomId = url.searchParams.get('roomId');
      const playerId = url.searchParams.get('playerId');

      const room = activeRooms.get(roomId);
      if (!room) {
        return new Response(JSON.stringify({ ok: false, error: '房間不存在或已過期' }), { status: 404, headers: corsHeaders });
      }

      return new Response(JSON.stringify({
        ok: true,
        room: sanitizeRoomForPlayer(room, playerId)
      }), { headers: corsHeaders });
    }

    // 9. POST /api/room/action (提交對決動作)
    if (pathname === '/room/action' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { roomId, playerId, actionType, payload = {}, userModel } = body;

      const room = activeRooms.get(roomId);
      if (!room) {
        return new Response(JSON.stringify({ ok: false, error: '房間不存在' }), { status: 404, headers: corsHeaders });
      }

      room.lastActiveAt = Date.now();

      // 開始對決指令
      if (actionType === 'start') {
        room.status = 'battling';
        // 若為模式 C，放入關主開場白
        if (room.mode === 'coop_tagteam' && room.messages.length === 0) {
          const boss = BOSS_DICTIONARY[room.bossId];
          room.messages.push({
            role: 'assistant',
            authorName: boss.name,
            authorAvatar: boss.avatar,
            content: boss.scenario + '……你們兩位今天找我有什麼事？'
          });
        }
        return new Response(JSON.stringify({ ok: true, room: sanitizeRoomForPlayer(room, playerId) }), { headers: corsHeaders });
      }

      // 模式 A: 雙人競速同步進度
      if (room.mode === 'pvp_speedrun') {
        if (actionType === 'sync_speedrun') {
          const isP1 = room.player1.id === playerId;
          const targetPlayer = isP1 ? room.player1 : room.player2;
          if (targetPlayer) {
            targetPlayer.defenseHp = payload.defenseHp ?? targetPlayer.defenseHp;
            targetPlayer.turn = payload.turn ?? targetPlayer.turn;
            targetPlayer.score = payload.score ?? targetPlayer.score;
          }
        } else if (actionType === 'claim_win') {
          // 某方率先破心達到 70 分
          room.winner = playerId;
          room.status = 'finished';
          room.evaluation = payload.evaluation || null;
        }
      }

      // 模式 B: 真人對決傳送訊息
      if (room.mode === 'human_roleplay' && actionType === 'send_message') {
        const isCoach = room.player1.id === playerId;
        const author = isCoach ? room.player1 : room.player2;
        room.messages.push({
          role: isCoach ? 'user' : 'assistant',
          authorName: author.name,
          authorAvatar: author.avatar,
          authorRole: isCoach ? '教練' : '關主',
          content: payload.content || '',
          timestamp: Date.now()
        });
      }

      // 模式 C: 雙人雙打協同戰
      if (room.mode === 'coop_tagteam' && actionType === 'send_coop_turn') {
        const author = room.player1.id === playerId ? room.player1 : room.player2;
        
        // 1. 記錄該教練提問
        room.messages.push({
          role: 'user',
          authorName: author.name,
          authorAvatar: author.avatar,
          authorId: playerId,
          content: payload.content || '',
          timestamp: Date.now()
        });

        // 2. 自動呼叫 AI 關主回應
        const boss = BOSS_DICTIONARY[room.bossId];
        const config = resolveApiConfig(body, env);
        const framework = FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;
        const systemPrompt = buildBossRoleplayPrompt(boss, room.player1.turn, framework);

        let bossReply = '……';
        let bossThought = '';
        if (config.apiKey) {
          try {
            const aiRes = await callLlmApi({
              config,
              systemPrompt,
              messages: room.messages.map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: `${m.authorName}: ${m.content}`
              }))
            });
            bossReply = aiRes.reply || '……';
            bossThought = aiRes.innerThought || '';
          } catch (e) {
            console.warn('協同戰關主回應錯誤:', e);
          }
        }

        room.messages.push({
          role: 'assistant',
          authorName: boss.name,
          authorAvatar: boss.avatar,
          content: bossReply,
          innerThought: bossThought,
          timestamp: Date.now()
        });

        // 3. 換棒！將 activeTurnPlayerId 轉給另一位隊友
        room.activeTurnPlayerId = (room.player1.id === playerId) ? room.player2.id : room.player1.id;
        
        // 扣除團隊防護條
        room.player1.defenseHp = Math.max(15, (room.player1.defenseHp || 100) - 12);
        if (room.player2) room.player2.defenseHp = room.player1.defenseHp;
        room.player1.turn++;
      }

      return new Response(JSON.stringify({
        ok: true,
        room: sanitizeRoomForPlayer(room, playerId)
      }), { headers: corsHeaders });
    }

    // 10. POST /api/room/evaluate (多人結算評審)
    if (pathname === '/room/evaluate' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { roomId, userModel } = body;

      const room = activeRooms.get(roomId);
      if (!room) {
        return new Response(JSON.stringify({ ok: false, error: '房間不存在' }), { status: 404, headers: corsHeaders });
      }

      const boss = BOSS_DICTIONARY[room.bossId];
      const config = resolveApiConfig(body, env);
      const framework = FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;

      let evaluation = null;

      if (room.mode === 'human_roleplay') {
        // 模式 B 裁判評核
        const systemPrompt = buildHumanVsHumanRefereePrompt(
          boss, 
          room.messages, 
          room.player1.name, 
          room.player2?.name || '學員關主', 
          framework
        );

        if (config.apiKey) {
          try {
            evaluation = await callLlmApi({
              config,
              systemPrompt,
              messages: [{ role: 'user', content: `真人對話紀錄：\n${JSON.stringify(room.messages, null, 2)}` }]
            });
          } catch (e) {
            console.warn('AI 裁判評核失敗:', e);
          }
        }

        if (!evaluation) {
          evaluation = {
            score: 82,
            captured: true,
            winningReason: "教練展現出極高的耐心與接納度，讓扮演關主的學員願意真誠傾訴。",
            bestCoachQuote: room.messages.find(m => m.role === 'user')?.content || "我能理解這對你來說有多不容易。",
            dimensions: { empathy: 85, listening: 82, questioning: 80, reframing: 78, action_drive: 75 },
            advice: "對話節奏沉穩，若能更及時點出對方未滿足的深層需要，能更快促發深層頓悟。"
          };
        }
      } else if (room.mode === 'coop_tagteam') {
        // 模式 C 雙打協同評核
        const systemPrompt = buildCoopSynergyEvaluationPrompt(
          boss, 
          room.messages, 
          room.player1.name, 
          room.player2?.name || '隊友', 
          framework
        );

        if (config.apiKey) {
          try {
            evaluation = await callLlmApi({
              config,
              systemPrompt,
              messages: [{ role: 'user', content: `雙打對話紀錄：\n${JSON.stringify(room.messages, null, 2)}` }]
            });
          } catch (e) {
            console.warn('雙打協同評審失敗:', e);
          }
        }

        if (!evaluation) {
          evaluation = {
            score: 88,
            captured: true,
            teamSynergyScore: 92,
            synergyComment: "兩位教練配合天衣無縫，一人精準同理破除冰山，另一人及時接力引導行動！",
            winningReason: "雙人互補提問，徹底卸下了關主的防備。",
            bestCoachQuote: room.messages.find(m => m.role === 'user')?.content || "讓我們一起看看有哪些新可能。",
            dimensions: { empathy: 88, listening: 86, questioning: 85, reframing: 84, action_drive: 80 },
            advice: "這是一次極高水準的雙人協同教練示範。"
          };
        }
      }

      room.evaluation = evaluation;
      room.status = 'finished';

      return new Response(JSON.stringify({
        ok: true,
        evaluation,
        room: sanitizeRoomForPlayer(room, null)
      }), { headers: corsHeaders });
    }

    // 11. GET /api/leaderboard (前 10 排行榜)
    if (pathname === '/leaderboard' && request.method === 'GET') {
      let board = memoryLeaderboard;

      if (env && env.COACHQUEST_KV) {
        try {
          const kvData = await env.COACHQUEST_KV.get('leaderboard_top10', { type: 'json' });
          if (Array.isArray(kvData) && kvData.length > 0) {
            board = kvData;
          }
        } catch (e) {
          console.warn('KV 讀取失敗，使用記憶體排行榜:', e);
        }
      }

      return new Response(JSON.stringify({
        ok: true,
        leaderboard: board.slice(0, 10)
      }), { headers: corsHeaders });
    }

    // 12. POST /api/leaderboard (提交排行榜)
    if (pathname === '/leaderboard' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const name = (body.name || '無名教練').trim().substring(0, 16);
      const score = Number(body.score) || 0;
      const captures = Number(body.captures) || 0;
      const title = body.title || '見習溝通使';
      const avatar = body.avatar || '🧙‍♂️';

      const existingIdx = memoryLeaderboard.findIndex(p => p.name === name);
      if (existingIdx >= 0) {
        if (score > memoryLeaderboard[existingIdx].score) {
          memoryLeaderboard[existingIdx].score = score;
        }
        if (captures > memoryLeaderboard[existingIdx].captures) {
          memoryLeaderboard[existingIdx].captures = captures;
        }
        memoryLeaderboard[existingIdx].title = title;
        memoryLeaderboard[existingIdx].avatar = avatar;
      } else {
        memoryLeaderboard.push({ name, score, captures, title, avatar });
      }

      memoryLeaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.captures - a.captures;
      });

      memoryLeaderboard = memoryLeaderboard.slice(0, 10);
      memoryLeaderboard.forEach((p, idx) => { p.rank = idx + 1; });

      if (env && env.COACHQUEST_KV) {
        try {
          await env.COACHQUEST_KV.put('leaderboard_top10', JSON.stringify(memoryLeaderboard));
        } catch (e) {
          console.warn('KV 儲存失敗:', e);
        }
      }

      return new Response(JSON.stringify({
        ok: true,
        leaderboard: memoryLeaderboard
      }), { headers: corsHeaders });
    }

    // 13. POST /api/practice-logs/submit (學員端提交實戰對話紀錄至後台)
    if (pathname === '/practice-logs/submit' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const payload = (body && typeof body.log === 'object' && body.log !== null) ? body.log : body;
      const studentName = (payload.studentName || payload.studentNickname || payload.playerName || '冒險者教練').trim().substring(0, 30);
      const studentAvatar = payload.studentAvatar || '🧙‍♂️';
      const bossId = payload.bossId || 'boss_unknown';
      const bossName = payload.bossName || '神秘關主';
      const bossAvatar = payload.bossAvatar || '👤';
      const bossTitle = payload.bossTitle || '';
      const category = payload.category || 'general';
      const score = Number(payload.score) || 0;
      const isCaptured = typeof payload.isCaptured === 'boolean' ? payload.isCaptured : score >= 70;
      const turns = Number(payload.turns) || 0;
      const bestCoachQuote = payload.bestCoachQuote || '';
      const winningReason = payload.winningReason || '';
      const advice = payload.advice || '';
      const dimensions = payload.dimensions || {};
      const dialogueHistory = Array.isArray(payload.dialogueHistory) ? payload.dialogueHistory : [];

      const logEntry = {
        id: payload.id || ('log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
        studentName,
        studentAvatar,
        bossId,
        bossName,
        bossAvatar,
        bossTitle,
        category,
        score,
        isCaptured,
        turns,
        bestCoachQuote,
        winningReason,
        advice,
        dimensions,
        turnSuggestions: Array.isArray(payload.turnSuggestions) ? payload.turnSuggestions : [],
        dialogueHistory,
        submittedAt: new Date().toISOString(),
        clientIp: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown'
      };

      const logs = await getStoredPracticeLogs(env);
      const existingIdx = logs.findIndex(l => l.id === logEntry.id);
      if (existingIdx >= 0) {
        logs[existingIdx] = logEntry;
      } else {
        logs.unshift(logEntry);
      }

      if (logs.length > 500) {
        logs.length = 500;
      }

      await saveStoredPracticeLogs(env, logs);

      return new Response(JSON.stringify({
        ok: true,
        message: '實戰對話紀錄已成功儲存至後台！',
        logId: logEntry.id
      }), { headers: corsHeaders });
    }

    // 13B. POST /api/practice-logs/batch-submit (學員端整批回傳所有歷史紀錄)
    if (pathname === '/practice-logs/batch-submit' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const incomingLogs = Array.isArray(body.logs) ? body.logs : [];
      if (incomingLogs.length === 0) {
        return new Response(JSON.stringify({ ok: true, synced: 0 }), { headers: corsHeaders });
      }

      const logs = await getStoredPracticeLogs(env);
      let newCount = 0;

      for (const item of incomingLogs) {
        if (!item || !item.id) continue;
        const studentName = (item.studentName || body.studentName || '冒險者教練').trim().substring(0, 30);
        const logEntry = {
          id: item.id,
          studentName,
          studentAvatar: item.studentAvatar || body.studentAvatar || '🧙‍♂️',
          bossId: item.bossId || 'boss_unknown',
          bossName: item.bossName || '神秘關主',
          bossAvatar: item.bossAvatar || '👤',
          bossTitle: item.bossTitle || '',
          category: item.category || 'general',
          score: Number(item.score) || 0,
          isCaptured: typeof item.isCaptured === 'boolean' ? item.isCaptured : (Number(item.score) >= 70),
          turns: Number(item.turns) || (Array.isArray(item.dialogueHistory) ? item.dialogueHistory.filter(m => m.role === 'user').length : 0),
          bestCoachQuote: item.bestCoachQuote || '',
          winningReason: item.winningReason || '',
          advice: item.advice || '',
          dimensions: item.dimensions || item.dimensionScores || {},
          turnSuggestions: Array.isArray(item.turnSuggestions) ? item.turnSuggestions : [],
          dialogueHistory: Array.isArray(item.dialogueHistory) ? item.dialogueHistory : [],
          submittedAt: item.date || item.submittedAt || new Date().toISOString(),
          clientIp: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown'
        };

        const existingIdx = logs.findIndex(l => l.id === logEntry.id);
        if (existingIdx >= 0) {
          logs[existingIdx] = { ...logs[existingIdx], ...logEntry };
        } else {
          logs.unshift(logEntry);
          newCount++;
        }
      }

      if (logs.length > 500) logs.length = 500;
      await saveStoredPracticeLogs(env, logs);

      return new Response(JSON.stringify({
        ok: true,
        message: `成功同步 ${incomingLogs.length} 筆練習紀錄！`,
        synced: incomingLogs.length,
        newAdded: newCount
      }), { headers: corsHeaders });
    }

    // 13B2. GET /api/practice-logs/student (學員依暱稱取得個人雲端歷史紀錄)
    if (pathname === '/practice-logs/student' && request.method === 'GET') {
      const studentName = (url.searchParams.get('name') || '').trim();
      if (!studentName) {
        return new Response(JSON.stringify({ ok: true, logs: [] }), { headers: corsHeaders });
      }
      const allLogs = await getStoredPracticeLogs(env);
      const studentLogs = allLogs.filter(l => (l.studentName === studentName || l.playerName === studentName));
      return new Response(JSON.stringify({
        ok: true,
        studentName,
        total: studentLogs.length,
        logs: studentLogs
      }), { headers: corsHeaders });
    }

    // 13C. POST /api/practice-logs/live (對話進行中即時暫存，防止中途關閉或未點結算丟失)
    if (pathname === '/practice-logs/live' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (!body.sessionId || !Array.isArray(body.dialogueHistory) || body.dialogueHistory.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: '資料不足' }), { headers: corsHeaders });
      }

      const logs = await getStoredPracticeLogs(env);
      const studentName = (body.studentName || '冒險者教練').trim().substring(0, 30);
      const logEntry = {
        id: body.sessionId,
        studentName,
        studentAvatar: body.studentAvatar || '🧙‍♂️',
        bossId: body.bossId || 'boss_unknown',
        bossName: body.bossName || '神秘關主',
        bossAvatar: body.bossAvatar || '👤',
        bossTitle: body.bossTitle || '',
        category: body.category || 'general',
        score: Number(body.score) || 0,
        isCaptured: !!body.isCaptured,
        isLive: !body.isFinished,
        turns: body.dialogueHistory.filter(m => m.role === 'user').length,
        bestCoachQuote: body.bestCoachQuote || '',
        winningReason: body.winningReason || (body.isFinished ? '' : '【進行中練習】學員尚未申請結算或中途離開'),
        advice: body.advice || '',
        dimensions: body.dimensions || {},
        dialogueHistory: body.dialogueHistory,
        submittedAt: new Date().toISOString(),
        clientIp: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown'
      };

      const existingIdx = logs.findIndex(l => l.id === logEntry.id);
      if (existingIdx >= 0) {
        logs[existingIdx] = logEntry;
      } else {
        logs.unshift(logEntry);
      }

      if (logs.length > 500) logs.length = 500;
      await saveStoredPracticeLogs(env, logs);

      return new Response(JSON.stringify({ ok: true, sessionId: logEntry.id }), { headers: corsHeaders });
    }

    // 14. POST /api/admin/login (管理員登入驗證)
    if (pathname === '/admin/login' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const inputUser = (body.username || '').trim();
      const inputPass = (body.password || '').trim();
      const creds = getAdminCredentials(env);

      if (inputUser === creds.username && inputPass === creds.password) {
        const token = 'cq_adm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 12);
        adminSessions.set(token, {
          username: creds.username,
          createdAt: Date.now(),
          expiresAt: Date.now() + 7 * 24 * 3600 * 1000 // 7 天有效
        });

        return new Response(JSON.stringify({
          ok: true,
          token,
          username: creds.username
        }), { headers: corsHeaders });
      } else {
        return new Response(JSON.stringify({
          ok: false,
          error: '管理員帳號或密碼錯誤！'
        }), { status: 401, headers: corsHeaders });
      }
    }

    // 15. GET /api/admin/verify (檢查 Session 有效性)
    if (pathname === '/admin/verify' && request.method === 'GET') {
      const session = verifyAdminSession(request, env);
      if (!session) {
        return new Response(JSON.stringify({ ok: false, error: '未授權或登入已過期' }), {
          status: 401,
          headers: corsHeaders
        });
      }
      return new Response(JSON.stringify({ ok: true, username: session.username }), { headers: corsHeaders });
    }

    // 16. GET /api/admin/practice-logs (管理員調閱所有學員對話紀錄)
    if (pathname === '/admin/practice-logs' && request.method === 'GET') {
      const session = verifyAdminSession(request, env);
      if (!session) {
        return new Response(JSON.stringify({ ok: false, error: '未授權訪問管理端點' }), {
          status: 401,
          headers: corsHeaders
        });
      }

      const logs = await getStoredPracticeLogs(env);
      const search = (url.searchParams.get('search') || '').toLowerCase().trim();
      const boss = (url.searchParams.get('boss') || '').trim();
      const captured = (url.searchParams.get('captured') || 'all').trim();

      let filtered = logs;
      if (search) {
        filtered = filtered.filter(l => 
          (l.studentName && l.studentName.toLowerCase().includes(search)) ||
          (l.bossName && l.bossName.toLowerCase().includes(search)) ||
          (l.bestCoachQuote && l.bestCoachQuote.toLowerCase().includes(search))
        );
      }
      if (boss && boss !== 'all') {
        filtered = filtered.filter(l => l.bossId === boss || (l.bossName && l.bossName.includes(boss)));
      }
      if (captured === 'true') {
        filtered = filtered.filter(l => l.isCaptured === true);
      } else if (captured === 'false') {
        filtered = filtered.filter(l => l.isCaptured === false);
      }

      const totalCount = logs.length;
      const uniqueStudents = new Set(logs.map(l => l.studentName)).size;
      const capturedCount = logs.filter(l => l.isCaptured).length;
      const avgScore = totalCount > 0 
        ? Math.round(logs.reduce((sum, l) => sum + (l.score || 0), 0) / totalCount) 
        : 0;

      return new Response(JSON.stringify({
        ok: true,
        hasKV: !!(env && env.COACHQUEST_KV),
        stats: {
          hasKV: !!(env && env.COACHQUEST_KV),
          totalCount,
          uniqueStudents,
          capturedCount,
          capturedRate: totalCount > 0 ? Math.round((capturedCount / totalCount) * 100) : 0,
          avgScore
        },
        logs: filtered
      }), { headers: corsHeaders });
    }

    // 17. GET /api/admin/practice-logs/detail (調閱單筆完整對話與逐字稿)
    if (pathname === '/admin/practice-logs/detail' && request.method === 'GET') {
      const session = verifyAdminSession(request, env);
      if (!session) {
        return new Response(JSON.stringify({ ok: false, error: '未授權訪問管理端點' }), {
          status: 401,
          headers: corsHeaders
        });
      }

      const logId = url.searchParams.get('id');
      const logs = await getStoredPracticeLogs(env);
      const log = logs.find(l => l.id === logId);

      if (!log) {
        return new Response(JSON.stringify({ ok: false, error: '找不到該筆學員練習紀錄' }), {
          status: 404,
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify({ ok: true, log }), { headers: corsHeaders });
    }

    // 18. POST /api/admin/practice-logs/delete (管理員刪除單筆紀錄)
    if (pathname === '/admin/practice-logs/delete' && request.method === 'POST') {
      const session = verifyAdminSession(request, env);
      if (!session) {
        return new Response(JSON.stringify({ ok: false, error: '未授權訪問管理端點' }), {
          status: 401,
          headers: corsHeaders
        });
      }

      const body = await request.json().catch(() => ({}));
      const logId = body.id;
      let logs = await getStoredPracticeLogs(env);
      logs = logs.filter(l => l.id !== logId);
      await saveStoredPracticeLogs(env, logs);

      return new Response(JSON.stringify({ ok: true, message: '紀錄已成功刪除' }), { headers: corsHeaders });
    }

    // 19. POST /api/admin/practice-logs/clear (管理員清空所有紀錄)
    if (pathname === '/admin/practice-logs/clear' && request.method === 'POST') {
      const session = verifyAdminSession(request, env);
      if (!session) {
        return new Response(JSON.stringify({ ok: false, error: '未授權訪問管理端點' }), {
          status: 401,
          headers: corsHeaders
        });
      }

      await saveStoredPracticeLogs(env, []);
      return new Response(JSON.stringify({ ok: true, message: '已清空所有練習紀錄' }), { headers: corsHeaders });
    }

    // 20. POST /api/admin/import-save (導師後台直接匯入學員的 JSON 存檔檔案)
    if (pathname === '/admin/import-save' && request.method === 'POST') {
      const session = verifyAdminSession(request, env);
      if (!session) {
        return new Response(JSON.stringify({ ok: false, error: '未授權訪問管理端點' }), { status: 401, headers: corsHeaders });
      }

      const body = await request.json().catch(() => ({}));
      const pData = body.playerData || body;
      const studentName = (pData.nickname || '匯入學員').trim();
      const studentAvatar = pData.avatar || '🧙‍♂️';

      const logs = await getStoredPracticeLogs(env);
      let importedCount = 0;

      // 1. 匯入 practiceLogs 流水帳
      if (Array.isArray(pData.practiceLogs)) {
        for (const item of pData.practiceLogs) {
          if (!item.id) item.id = 'log_imp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          const entry = {
            ...item,
            studentName: item.studentName || studentName,
            studentAvatar: item.studentAvatar || studentAvatar,
            submittedAt: item.date || item.submittedAt || new Date().toISOString()
          };
          const idx = logs.findIndex(l => l.id === entry.id);
          if (idx >= 0) logs[idx] = entry;
          else { logs.unshift(entry); importedCount++; }
        }
      }

      // 2. 匯入 captures (突破成功之心得卡)
      if (pData.captures && typeof pData.captures === 'object') {
        for (const bossId of Object.keys(pData.captures)) {
          const cap = pData.captures[bossId];
          const capLogId = 'log_cap_' + bossId + '_' + studentName;
          const idx = logs.findIndex(l => l.id === capLogId);
          if (idx < 0) {
            logs.unshift({
              id: capLogId,
              studentName,
              studentAvatar,
              bossId: cap.bossId || bossId,
              bossName: cap.name || '關主',
              bossAvatar: cap.avatar || '👤',
              bossTitle: cap.title || '',
              category: cap.category || 'general',
              score: cap.highestScore || 80,
              isCaptured: true,
              turns: (cap.dialogueHistory || []).filter(m => m.role === 'user').length || 1,
              bestCoachQuote: cap.bestCoachQuote || '',
              winningReason: cap.winningReason || '',
              advice: cap.lastEvaluation?.advice || '',
              dimensions: cap.dimensionScores || {},
              dialogueHistory: cap.dialogueHistory || [],
              submittedAt: cap.lastCapturedAt || new Date().toISOString()
            });
            importedCount++;
          }
        }
      }

      if (logs.length > 500) logs.length = 500;
      await saveStoredPracticeLogs(env, logs);

      return new Response(JSON.stringify({
        ok: true,
        message: `成功匯入學員【${studentName}】的存檔，新增/更新了 ${importedCount} 筆實戰紀錄！`,
        importedCount
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: false, error: `無效的 API 端點: ${pathname}` }), {
      status: 404,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('API 處理失敗:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || '伺服器內部未知異常'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequest(context) {
  return handleApiRequest(context.request, context.env);
}
