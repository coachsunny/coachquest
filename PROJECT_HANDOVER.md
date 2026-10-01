# 🎮 CoachQuest (教練大冒險) - 完整架構規劃、設計與交接手冊
> **專案代號**：CoachQuest  
> **當前版本**：v2.6.0 (Dual-Engine Live)  
> **GitHub 倉庫**：https://github.com/coachsunny/coachquest  
> **Cloudflare 線上網址**：https://coachquest.coachsunny.workers.dev  
> **撰寫日期**：2026-10-01  
> **目標**：供後續對話框、團隊成員或自主 Agent 100% 無縫接手、持續維護與功能擴充。

---

## 1. 專案願景與核心定位

CoachQuest 是一款**遊戲化（Gamified）的寶可夢風格教練實戰對話遊戲**。  
傳統教練培訓對學員而言常有「練習枯燥、不知成效、缺少動力」的痛點。CoachQuest 將教練技術（ICF 八大核心職能、非暴力溝通 NVC、薩提爾冰山、GROW 模型、ORID、SFBC）包裝為**闖關對決、擊破關主心防、收攏至百寶箱（寶可夢圖鑑）、經驗值升等、前 10 排行榜與多人即時約戰**，讓溝通與領導力練習如同玩寶可夢般充滿成就感。

---

## 2. 系統架構與技術棧

```mermaid
graph TD
    Client[學員瀏覽器 / 手機 SPA] -->|靜態資產載入| CFAssets[Cloudflare Static Assets /public]
    Client -->|REST API 呼叫| Worker[Cloudflare Worker /worker.js]
    Worker -->|路由轉發| Router[functions/api/[[catchall]].js]
    Router -->|雙引擎智慧分流| RouterEngine{金鑰特徵/模型選擇}
    RouterEngine -->|sk-... 協定 / deepseek-chat| DeepSeek[DeepSeek REST API OpenAI相容]
    RouterEngine -->|AIza... 協定 / gemini-*| Gemini[Google Gemini API v1beta 多模型降級備援]
    Router -->|房間狀態 / 競速同步 / AI裁判| ActiveRooms[Active Rooms Map快取池]
    Router -->|前10名排行榜持久化| KV[Cloudflare KV / 記憶體備援]
```

### 技術棧一覽
- **執行環境**：Cloudflare Workers (Edge Serverless) + Static Assets
- **AI 雙模驅動引擎 (Dual-Engine LLM)**：
  - **DeepSeek 引擎 (OpenAI 相容協議)**：
    - 首選推薦：`deepseek-chat` (DeepSeek-V3)，高智商、語意同理極度敏銳、性價比極高。
    - 推理模型：`deepseek-reasoner` (DeepSeek-R1)，深度思考鏈演繹。
  - **Google Gemini 引擎 (原生 REST API)**：
    - 快速首選：`gemini-3.5-flash-lite`（平均回應約 900ms）
    - 自動降級備援池：`gemini-3.8-flash` $\to$ `gemini-3.1-flash-lite` $\to$ `gemini-flash-latest` $\to$ `gemini-2.5-flash`
  - **金鑰智慧相容判定**：Key 前綴以 `sk-` 開頭自動走 DeepSeek；以 `AIza` 開頭自動走 Gemini。伺服器端同時支援 `DEEPSEEK_API_KEY` 與 `GEMINI_API_KEY`。
- **前端架構**：原生 ES6+ Modules（零打包依賴、極致輕量、原生速度、移動端 100% 自適應）
- **繁簡轉換模組**：OpenCC 離線包 (`public/js/opencc-bundle.js` + `public/js/lang.js`)
- **本地持久化**：HTML5 LocalStorage + JSON 一鍵匯出 / 匯入備份

---

## 3. 十大核心特色與機制詳解

### ① 冒險者首次啟程儀式 (Onboarding)
- **自選代稱與頭像**：首次進入時彈出歡迎註冊彈窗，學員可自訂教練代稱（例如：Sunny教練、傾聽大師），並挑選 7 種代表形象頭像（🧙‍♂️ 溝通魔法師、🧝‍♀️ 心靈精靈、🧑‍💼 專業職場教練、🦸‍♂️ 破冰超人、🌸 溫柔傾聽者、🦊 敏銳洞察狐、🦁 勇氣領航獅）。
- **隨時可改**：點擊左上角 HUD 或右上角設定即可隨時修改。
- **全站同步**：代稱即時聯動顯示於 HUD、戰鬥對話抬頭、百寶箱心得卡、排行榜以及多人約戰房間。

### ② 成績永續保存承諾與存檔備份／還原 (Save & Backup)
- **自動存檔**：16 位關主的攻心歷史、最高得分、收攏圖鑑、教練金句、ICF 五維雷達分數與累積 EXP，自動保存在瀏覽器 LocalStorage。
- **跨裝置備份還原**：在「設定」與「百寶箱」底部提供：
  - `📤 匯出存檔備份`：下載 `CoachQuest_Save_<代稱>_<日期>.json`。
  - `📥 匯入存檔備份`：一鍵上傳 JSON 復原，換手機或換電腦絕不丟失。

### ③ 四大道館篇章與 16 位性格關主
每個道館皆包含 4 位性格特質鮮明、有特定心理防衛機制的關主：
1. **💼 職場道館**：
   - `boss_work_1` 防禦刺蝟・研發小陳（NVC 非暴力溝通）
   - `boss_work_2` 焦慮旋風・產品林經理（GROW 模型）
   - `boss_work_3` 迷茫頑石・資深老張（ORID 焦點討論法）
   - `boss_work_4` 隱藏魔王・鐵血趙總監（高階整合心法）
2. **🧸 親子道館**：
   - `boss_parent_1` 閉門刺蝟・高一兒子翔翔（NVC）
   - `boss_parent_2` 焦慮淚眼・小五女兒萱萱（SFBC 焦點解決）
   - `boss_parent_3` 選填迷茫・大四兒子阿豪（GROW）
   - `boss_parent_4` 情緒火山・國中女兒羽婷（薩提爾冰山）
3. **💍 夫妻道館**：
   - `boss_couple_1` 冷戰冰川・疲憊妻子雅婷（NVC）
   - `boss_couple_2` 暴躁防禦・加班丈夫志強（薩提爾冰山）
   - `boss_couple_3` 金錢焦慮・精打細算太太思涵（ORID）
   - `boss_couple_4` 夾心餅乾・逃避伴侶家豪（GROW）
4. **🍻 朋友道館**：
   - `boss_friend_1` 借錢周轉・創業好友阿凱（NVC）
   - `boss_friend_2` 情緒黑洞・訴苦閨蜜小敏（SFBC）
   - `boss_friend_3` 心結猜忌・多年合夥摯友浩然（ORID）
   - `boss_friend_4` 攀比炫耀・聚會老同學阿明（薩提爾冰山）

### ④ 寶可夢式心防破除與 70 分收攏機制
- **心防生命條（HP Defense 100% $\to$ 0%）**：隨著有效同理與引導提問，關主心防逐步瓦解。
- **💭 偷看關主心聲**：可切換開關，即時顯示關主當下的潛意識真實獨白。
- **💡 戰術錦囊**：卡關時召喚導師，依關主弱點心法給出破冰建議。
- **🔴 70分收攏判定**：對話達到指定深度時申請結算，$\ge 70$ 分觸發精靈球收攏動畫，正式收攏至百寶箱！

### ⑤ 百寶箱圖鑑儀表板 (Treasure Pokédex)
- 統計已收攏數（/16）、圖鑑完成率（%）、平均通關分。
- **📜 關主心得卡**：收錄通關時最精彩的「教練金句」、攻心復盤與 ICF 五維溝通能力雷達條（深度同理、有效傾聽、提問引導、視角重構、行動激發）。

### ⑥ 等級與稱號成長系統
- 獲得經驗值（成功收攏給予高額 EXP，未達標亦有安慰獎勵）。
- 6 級教練頭銜階梯：
  - Lv.1 🌱 見習溝通使 (0 EXP)
  - Lv.2 🧭 初階教練學徒 (500 EXP)
  - Lv.3 👂 深度傾聽先鋒 (1,500 EXP)
  - Lv.4 🧊 冰山破冰導師 (3,000 EXP)
  - Lv.5 🏆 道館金牌總教練 (5,000 EXP)
  - Lv.6 👑 傳奇心靈宗師 (8,000 EXP)

### ⑦ 前 10 名冒險者排行榜 (Leaderboard)
- 即時統計全體學員收攏之關主數量與最高得分。
- 支援 Cloudflare KV 持久化或記憶體高可用備援。

### ⑧ 三大多人約戰模式 (Multiplayer Arena)
- **🏃 模式 A（雙人破心競速賽, PvP Speedrun）**：雙方挑戰同一關主，每 1.5 秒輪詢同步對手即時血條與回合數，先達成 70 分收攏者贏得勝利。
- **🎭 模式 B（真人扮演 + AI考官, Human 1v1）**：學員 A 扮教練、學員 B 扮關主。系統透過 `sanitizeRoomForPlayer` 保護機密提示卡，關主學員獨家享有「隱藏動機、軟化點、投降條件」攻略卡；AI 擔任裁判即時監控打分。
- **🛡️ 模式 C（雙人雙打協同戰, Co-op Tag-Team）**：雙人輪流接力提問高難度大魔王，結算團隊默契度與總分。

### ⑨ OpenCC 繁簡雙向全站即時互轉
- 頂部導航列常駐 `🌐 簡體 / 繁體` 按鈕。
- 採用離線 `opencc-bundle.js` + `lang.js`，無須網路請求即可在 10 毫秒內遞迴轉換整頁 DOM 文字、placeholder、關主描述與 AI 回話。
- 支援使用者偏好記憶與瀏覽器語系自動適應。

### ⑩ 全域免填金鑰託管 (Zero-Setup Key)
- 透過 Cloudflare Secret `DEEPSEEK_API_KEY` 或 `GEMINI_API_KEY` 在伺服器端統一託管，學員與玩家開箱即用，免填任何 API Key。
- 支援雙模並存：若同時設定兩把 Key，系統支援自適應分流或前端下拉選單自由指定；若僅設定其中一把，系統自動以可用引擎為主。同時保留個人自備金鑰覆蓋機制。

---

## 4. 專案目錄結構

```
d:\CoachQuest\
├── .dev.vars                  # 本機開發環境變數 (含測試用 GEMINI_API_KEY，已被 gitignore)
├── .gitignore                 # 忽略 .dev.vars, node_modules/, .wrangler/
├── wrangler.toml              # Cloudflare Workers 設定檔 (main = "worker.js", assets = "./public")
├── worker.js                  # Cloudflare 入口點 (轉發 /api/* 並提供靜態資源)
├── package.json               # 專案資訊
├── README.md                  # 專案首頁說明文件
├── PROJECT_HANDOVER.md        # 本交接文件
│
├── functions/
│   └── api/
│       └── [[catchall]].js    # Cloudflare API 核心路由 (所有 /api/* 端點實作與多模型降級)
│
├── lib/
│   └── prompts.js             # 關主角色扮演、錦囊、評分、Mode B 攻略卡、Mode B 裁判、Mode C 評分 Prompts
│
└── public/                    # 前端靜態資源
    ├── index.html             # 單頁應用程式 SPA 主視圖與所有 Modals
    ├── css/
    │   └── quest-theme.css    # 遊戲主題樣式 (寶可夢風格、HUD、血條、卡片、約戰大廳、RWD)
    └── js/
        ├── opencc-bundle.js   # OpenCC 繁簡轉換離線完整包 (490KB)
        ├── lang.js            # 語言切換控制器 (t 函式、translateDOM、toggleLang)
        ├── bosses.js          # 16 位關主資料庫、四大道館分類、攻心弱點
        ├── inventory.js       # 百寶箱圖鑑、等級計算、LocalStorage 永續存檔、JSON 匯出/匯入
        ├── leaderboard.js     # 前 10 名排行榜前端管理器
        ├── multiplayer.js     # 多人約戰核心邏輯 (輪詢、競速同步、回合輪替、秘密卡隔離)
        └── app.js             # 主狀態機與事件調度中心
```

---

## 5. 後端 API 端點規格清單

| 方法 | 路徑 | 說明 | 參數範例 |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/game-info` | 取得遊戲版本、伺服器金鑰狀態與活動房間數 | 無 |
| `POST` | `/api/test-key` | 測試個人金鑰或伺服器金鑰連線能力 | `{ apiKey?, model? }` |
| `POST` | `/api/chat` | 單人模式關主 AI 角色扮演對話 | `{ bossId, messages, turn, userApiKey?, userModel? }` |
| `POST` | `/api/hint` | 戰術錦囊教練建議 | `{ bossId, messages, userApiKey?, userModel? }` |
| `POST` | `/api/evaluate` | 單人 / 模式 A 結算與 70 分收攏判定 | `{ bossId, messages, userApiKey?, userModel? }` |
| `GET` | `/api/leaderboard` | 取得全服前 10 名排行榜 | 無 |
| `POST` | `/api/leaderboard` | 登錄玩家通關成績至排行榜 | `{ name, score, captures, title, avatar }` |
| `POST` | `/api/room/create` | 建立多人對戰房間 (4位英數房號) | `{ hostPlayer, mode, bossId }` |
| `POST` | `/api/room/join` | 玩家 2 加入指定房號 | `{ roomId, guestPlayer }` |
| `GET` | `/api/room/status` | 輪詢房間狀態與對手即時血條 | `?roomId=XXXX&playerId=YYYY` |
| `POST` | `/api/room/action` | 多人對戰動作 (開戰 / 競速同步 / 真人訊息 / 雙打出招) | `{ roomId, playerId, action, payload }` |
| `POST` | `/api/room/evaluate` | Mode B (AI考官裁決) / Mode C (雙打協同評分) | `{ roomId, userApiKey?, userModel? }` |

---

## 6. 維護、本地測試與發布指南

### ① 本地啟動開發
```powershell
cd d:\CoachQuest
npx.cmd wrangler dev --port 8787
```
打開瀏覽器訪問 `http://localhost:8787`。

### ② 線上自動持續部署 (CI/CD)
本專案已連結 GitHub 與 Cloudflare Workers Builds：
```powershell
cd d:\CoachQuest
git add .
git commit -m "feat: your update message"
git push origin main
```
Cloudflare Workers Builds 偵測到 `main` 分支 push 後，將在 **20-40 秒內自動拉取並發布上線**！

### ③ Cloudflare 環境變數維護提醒
- **全域金鑰設定**：在 Cloudflare Dashboard $\to$ `Workers & Pages` $\to$ `coachquest` $\to$ `Settings` $\to$ `Variables and secrets`。
- **支援名稱**：
  - `DEEPSEEK_API_KEY`：填入 DeepSeek API 金鑰 (`sk-...`)
  - `GEMINI_API_KEY`：填入 Google Gemini API 金鑰 (`AIzaSy...`)
- **重要**：必須將金鑰設為 **「加密密鑰 (Secret)」**，絕不可設為明文「變數 (Variable)」，因為公開倉庫的 `wrangler.toml` 未聲明 `[vars]`，每次 Git 自動部署會清除明文變數，但會**百分之百保留加密密鑰**！

---

## 7. 後續 Agent 可優先擴充的 Roadmap

1. **語音即時教練對決**：整合 Google Gemini Live API，支援即時語音對話與聲調情緒辨識。
2. **道館徽章成就系統**：通關單一道館 4 位關主獲得「職場金牌道館徽章」、「親子冰山破冰徽章」。
3. **班級房間群組碼**：支援講師開設班級賽事，過濾出專屬班級學員的封閉排行榜。
4. **AI 關主自適應難度**：根據學員連續幾輪提問品質，動態調節關主心防鬆動幅度。
