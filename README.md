# 🎮 CoachQuest 教練大冒險

> **寶可夢風格溝通對決 · 百寶箱圖鑑 · 冒險者排行榜**  
> 基於 Cloudflare Workers 全球邊緣運算 + DeepSeek / Google Gemini 雙引擎打造的全新獨立遊戲化教練培訓系統。


---

## 🌟 核心特色

### 1. 🗺️ 四大冒險道館（共 16 位性格關主）
- 💼 **職場篇**：研發小陳（NVC）、產品林經理（GROW）、資深老張（ORID）、鐵血趙總監（高階心法）
- 🧸 **親子篇**：高一翔翔（NVC）、小五萱萱（SFBC）、大四阿豪（GROW）、國中羽婷（薩提爾冰山）
- 💍 **夫妻篇**：冷戰雅婷（NVC）、暴躁志強（薩提爾冰山）、金錢思涵（ORID）、逃避家豪（GROW）
- 🍻 **朋友篇**：借錢阿凱（NVC）、倒垃圾小敏（SFBC）、心結浩然（ORID）、炫耀阿明（薩提爾冰山）

### 2. ⚔️ 寶可夢式破心對決與收攏機制
- **心防生命條（HP Defense）**：關主帶有強烈心理防禦，玩家須運用深度同理、提問引導與心理學心法逐步瓦解防線。
- **💭 偷看關主心聲**：可切換即時查看關主的潛意識真實想法，觀察自己言詞對其心理產生的波動。
- **💡 戰術錦囊**：對話卡關時可召喚教練導師，獲得針對關主攻心弱點的有力提問建議。
- **🔴 70分收攏門檻**：結算成績達 **70分** 即判定穿透心防，觸發寶可夢精靈球收攏動畫，將關主收入個人的「百寶箱」！

### 3. 🎒 我的百寶箱圖鑑儀表板（Treasure Pokédex）
- 統計個人收攏關主數（/16）、圖鑑完成率（%）、平均通關成績。
- 支援四大分類切換與檢視未解鎖關主的剪影與線索。
- **📜 關主心得卡**：收錄破關時玩家最精彩的「教練金句」、攻心關鍵復盤與五大維度（深度同理、有效傾聽、提問引導、視角重構、行動激發）評分。

### 4. 🏆 前 10 名冒險者排行榜（Leaderboard）
- 即時統計全體學員收攏之關主數量與最高得分排行。
- 頒發 🥇 冠軍、🥈 亞軍、🥉 季軍榮譽，並高亮顯示玩家自身排名。
- 支援 Cloudflare KV 持久化存儲或記憶體高可用備援。

### 5. 👥 多人高併發架構
- 採用 **Cloudflare Workers** 無伺服器邊緣運算，全球 300+ 節點毫秒級分流。
- 支援數十人乃至上百人同時在線進行對話練習，彼此狀態獨立，零伺服器瓶頸。

---

## 🚀 本地開發與預覽

### 步驟 1：啟動本機測試伺服器
進入本專案資料夾並執行：
```bash
# 若尚未安裝 wrangler
npm install -g wrangler

# 啟動本機開發伺服器
npx wrangler dev
```
瀏覽器開啟提示的網址（通常為 `http://localhost:8787`）即可體驗完整的溝通對決。

### 步驟 2：設定 AI API Key (DeepSeek 或 Gemini)
- 可在網頁右上角的 **「⚙️ 設定」** 彈窗中輸入個人的 DeepSeek (`sk-...`) 或 Gemini (`AIzaSy...`) API Key 並即時測試連線。
- 亦可在伺服器端配置全域 Secret，對所有學員免配置開箱即用。

---

## 🌐 部署至 Cloudflare Workers

1. **登入 Cloudflare**：
   ```bash
   npx wrangler login
   ```

2. **（選填）綁定全域 API Key 密鑰 (DeepSeek 或 Gemini 皆可)**：
   ```bash
   # 設定 DeepSeek 金鑰
   npx wrangler secret put DEEPSEEK_API_KEY
   # 貼上您的 DeepSeek API Key (sk-...)

   # 或設定 Gemini 金鑰
   npx wrangler secret put GEMINI_API_KEY
   # 貼上您的 Gemini API Key (AIzaSy...)
   ```


3. **（選填）建立 KV 命名空間供持久化排行榜**：
   ```bash
   npx wrangler kv:namespace create COACHQUEST_KV
   # 將輸出的 id 加入 wrangler.toml
   ```

4. **一鍵部署上線**：
   ```bash
   npx wrangler deploy
   ```

---

## 📖 完整設計與交接文檔
- 詳細架構、API 接口規格、多人約戰模式、繁簡轉換、升等數值模型與未來的開發路線圖，請參閱：
  👉 **[PROJECT_HANDOVER.md](./PROJECT_HANDOVER.md)**

---

## 🔒 獨立專案說明
- 本專案完整建置於 `d:\CoachQuest`，具備獨立的前後端與設定檔。
- **原專案 `d:\Coach`（CoachLab）百分之百保持原狀，未做任何修改，確保歷史資產安全無虞。**
