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

const CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

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
 * 取得 Gemini API Key（優先使用者本機金鑰，其次環境變數）
 */
function resolveApiKey(reqBody, env) {
  const clientKey = (reqBody && reqBody.userApiKey && typeof reqBody.userApiKey === 'string') 
    ? reqBody.userApiKey.trim() 
    : '';
  if (clientKey) return clientKey;

  if (env && typeof env === 'object') {
    const directKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GEMINI_KEY;
    if (directKey && typeof directKey === 'string' && directKey.trim()) {
      return directKey.trim();
    }
  }

  const globalKey = (typeof globalThis !== 'undefined' && (globalThis.GEMINI_API_KEY || globalThis.GOOGLE_API_KEY))
    || (typeof process !== 'undefined' && (process?.env?.GEMINI_API_KEY || process?.env?.GOOGLE_API_KEY))
    || '';
  return typeof globalKey === 'string' ? globalKey.trim() : '';
}

/**
 * 呼叫 Gemini 官方 REST API (支援多候選模型自動降級備援)
 */
async function callGeminiApi({ apiKey, model, systemPrompt, contents }) {
  if (!apiKey) {
    throw new Error('伺服器與客戶端皆未偵測到 Gemini API Key。請在 .dev.vars、Cloudflare Secrets 或右上角設定中填入金鑰。');
  }

  const requestedModel = model || DEFAULT_MODEL;
  // 建立候選模型順序：指定模型排首位，其餘模型依序備援
  const modelsToTry = [
    requestedModel,
    ...CANDIDATE_MODELS.filter(m => m !== requestedModel)
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
          // 其他如 400 Bad Request、401 Invalid Key 等不可復原錯誤直接拋出
          throw lastError;
        }
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error(`Gemini API (${targetModel}) 未回傳有效文字內容`);
      }

      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      try {
        return JSON.parse(cleanJson);
      } catch (err) {
        const matched = cleanJson.match(/\{[\s\S]*\}/);
        if (matched) {
          return JSON.parse(matched[0]);
        }
        throw new Error('模型未回傳正確的 JSON 格式: ' + rawText.substring(0, 100));
      }
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
      const hasKey = !!resolveApiKey(null, env);
      return new Response(JSON.stringify({
        ok: true,
        game: 'CoachQuest',
        version: '2.5.0',
        hasApiKey: hasKey,
        defaultModel: DEFAULT_MODEL,
        activeRoomsCount: activeRooms.size
      }), { headers: corsHeaders });
    }

    // 2. POST /api/test-key
    if (pathname === '/test-key' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const keyToTest = body.apiKey || resolveApiKey(body, env);
      if (!keyToTest) {
        return new Response(JSON.stringify({ ok: false, error: '請提供要測試的 Gemini API Key' }), { headers: corsHeaders });
      }

      const testResult = await callGeminiApi({
        apiKey: keyToTest,
        model: body.model || DEFAULT_MODEL,
        contents: [{ role: 'user', parts: [{ text: '請回覆純 JSON: {"status": "ready"}' }] }]
      });

      return new Response(JSON.stringify({
        ok: true,
        message: '連線正常！Gemini 運作無誤',
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

      const apiKey = resolveApiKey(body, env);
      const framework = FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;
      const systemPrompt = buildBossRoleplayPrompt(boss, turn, framework);

      const geminiContents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const result = await callGeminiApi({
        apiKey,
        model: userModel,
        systemPrompt,
        contents: geminiContents
      });

      return new Response(JSON.stringify({
        ok: true,
        reply: result.reply || '……',
        innerThought: result.innerThought || ''
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

      const apiKey = resolveApiKey(body, env);
      const framework = FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;
      const systemPrompt = buildTacticalHintPrompt(boss, messages, framework);

      const geminiContents = [
        {
          role: 'user',
          parts: [{ text: `目前對話歷史：\n${JSON.stringify(messages, null, 2)}\n請依據教練心法提供戰術錦囊。` }]
        }
      ];

      const result = await callGeminiApi({
        apiKey,
        model: userModel,
        systemPrompt,
        contents: geminiContents
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

      const apiKey = resolveApiKey(body, env);
      const framework = FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;
      const systemPrompt = buildQuestEvaluationPrompt(boss, messages, framework);

      const geminiContents = [
        {
          role: 'user',
          parts: [{ text: `完整對決對話紀錄：\n${JSON.stringify(messages, null, 2)}\n請客觀評分並判定是否突破 70 分心防收攏標準。` }]
        }
      ];

      const evaluation = await callGeminiApi({
        apiKey,
        model: userModel,
        systemPrompt,
        contents: geminiContents
      });

      const score = Number(evaluation.score) || 0;
      const isCaptured = score >= 70;

      return new Response(JSON.stringify({
        ok: true,
        evaluation: {
          score,
          captured: isCaptured,
          winningReason: evaluation.winningReason || (isCaptured ? '深度同理突破了防備' : '防線尚未完全卸下'),
          bestCoachQuote: evaluation.bestCoachQuote || '你的傾聽給予了對方極大的安全感。',
          dimensions: evaluation.dimensions || { empathy: 75, listening: 75, questioning: 70, reframing: 70, action_drive: 65 },
          advice: evaluation.advice || '持續維持開放好奇的態度進行深入提問。'
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
        const apiKey = resolveApiKey(body, env);
        if (apiKey) {
          try {
            secretGuide = await callGeminiApi({
              apiKey,
              model: userModel,
              systemPrompt: buildClientSecretGuidePrompt(boss),
              contents: [{ role: 'user', parts: [{ text: `請為扮演【${boss.name}】的學員生成秘密角色扮演手冊。` }] }]
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
        const apiKey = resolveApiKey(body, env);
        const framework = FRAMEWORKS[boss.frameworkId] || FRAMEWORKS.nvc;
        const systemPrompt = buildBossRoleplayPrompt(boss, room.player1.turn, framework);

        const geminiContents = room.messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: `${m.authorName}: ${m.content}` }]
        }));

        let bossReply = '……';
        let bossThought = '';
        if (apiKey) {
          try {
            const aiRes = await callGeminiApi({
              apiKey,
              model: userModel,
              systemPrompt,
              contents: geminiContents
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
      const apiKey = resolveApiKey(body, env);
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

        if (apiKey) {
          try {
            evaluation = await callGeminiApi({
              apiKey,
              model: userModel,
              systemPrompt,
              contents: [{ role: 'user', parts: [{ text: `真人對話紀錄：\n${JSON.stringify(room.messages, null, 2)}` }] }]
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

        if (apiKey) {
          try {
            evaluation = await callGeminiApi({
              apiKey,
              model: userModel,
              systemPrompt,
              contents: [{ role: 'user', parts: [{ text: `雙打對話紀錄：\n${JSON.stringify(room.messages, null, 2)}` }] }]
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
