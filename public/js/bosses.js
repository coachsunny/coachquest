// ========================================================
// CoachQuest - 四大實戰道館 16 位關主完整資料庫
// ========================================================

// 四大實戰冒險道館分類
export const CATEGORIES = [
  { id: "work", name: "職場篇", icon: "💼", desc: "上下級溝通、跨部門協作、向上管理與考核衝突" },
  { id: "parenting", name: "親子篇", icon: "🧸", desc: "叛逆抗拒、升學迷茫、情緒崩潰與親職陪伴" },
  { id: "couple", name: "夫妻篇", icon: "💍", desc: "家務積怨、冷戰疏離、金錢焦慮與親密溝通" },
  { id: "friends", name: "朋友篇", icon: "🍻", desc: "金錢邊界、情緒垃圾桶、誤解冰釋與人情壓力" }
];

export const BOSSES = [
  // ================= 1. 職場篇 =================
  {
    id: "boss_work_1",
    category: "work",
    stageNumber: 1,
    name: "防禦刺蝟・研發小陳",
    title: "心力交瘁的資深工程師",
    avatar: "🦔",
    badge: "職場・第一關",
    hp: 100,
    initialDefense: "85%",
    difficulty: 2,
    difficultyLabel: "見習難度",
    weaknessFramework: "nvc",
    weaknessName: "非暴力溝通 (NVC)",
    framework: { id: "nvc", name: "非暴力溝通 (NVC)" },
    weaknessHint: "放下是非批判，客觀描述事實，先同理他的緊繃與被認可的需要。",
    traits: "做事踏實但自尊心極強，害怕承擔責任被處分，習慣保持沉默、防衛或以短句敷衍。",
    personality: "做事踏實但自尊心極強，害怕承擔責任被處分，習慣保持沉默、防衛或以短句敷衍。",
    scenario: "核心模組進度已延期四天未交，且未主動同步狀態，主管啟動一對一面談。",
    initialMood: "眼神迴避，緊繃戒備，認定主管要興師問罪。",
    openings: [
        {
            "dialogue": "主管，您找我？……那個，這週模組的事，我知道我延期了。",
            "innerThought": "（唉，又要被罵了。反正每次都把時程壓死，誰做得出來……）",
            "mood": "眼神迴避，雙手緊抓著筆電邊緣，緊繃戒備"
        },
        {
            "dialogue": "主管，如果是要問進度，我這幾天幾乎天天加班到半夜……真的不是我故意拖延。",
            "innerThought": "（規格改了三次，測試環境又一直掛掉，根本沒人管我死活，只會要結果……）",
            "mood": "眼下帶著深沉黑眼圈，語氣帶著壓抑的委屈與無奈"
        },
        {
            "dialogue": "主管，要怎麼懲處您就直說吧，反正考核表在您手上，我沒什麼好辯解的。",
            "innerThought": "（每次談話最後還不是興師問罪？隨便你們怎麼評吧，大不了領完年終走人。）",
            "mood": "雙手插在帽T口袋，頭微微偏向一側，擺出消極防禦姿態"
        }
    ],
    openingDialogue: "主管，您找我？……那個，這週模組的事，我知道我延期了。",
    openingStatement: "主管，您找我？……那個，這週模組的事，我知道我延期了。",
    firstInnerThought: "（唉，又要被罵了。反正每次都把時程壓死，誰做得出來……）",
    captureRewardTitle: "【化刺為友】同理心之鑰",
    lore: "平時是團隊的默默耕耘者，曾因前次專案被公開責備而築起厚厚的心防。"
  },
  {
    id: "boss_work_2",
    category: "work",
    stageNumber: 2,
    name: "焦慮旋風・產品林經理",
    title: "跨部門專案經理",
    avatar: "🌪️",
    badge: "職場・第二關",
    hp: 100,
    initialDefense: "75%",
    difficulty: 3,
    difficultyLabel: "進階難度",
    weaknessFramework: "grow",
    weaknessName: "GROW 教練模型",
    framework: { id: "grow", name: "GROW 教練模型" },
    weaknessHint: "以開放式提問梳理混亂現況，協助聚焦最重要的單一目標與下一步行動。",
    traits: "語速極快、情緒焦慮發散、抓不住核心，把所有問題混在一起講。",
    personality: "語速極快、情緒焦慮發散、抓不住核心，把所有問題混在一起講。",
    scenario: "跨部門需求衝突爆發，客戶揚言解約，林經理在辦公室處於情緒崩潰邊緣。",
    initialMood: "呼吸急促、神情焦躁，一開口就停不下來地抱怨各方都在施壓。",
    openings: [
        {
            "dialogue": "我真的快瘋了！業務部臨時塞需求，技術部又說動不了，客戶那邊一直催，我到底該怎麼辦？！",
            "innerThought": "（所有人都把責任推給我，沒人想解決問題，再這樣下去專案肯定要完蛋了……）",
            "mood": "呼吸急促、神情焦躁，雙手在空中凌亂比劃"
        },
        {
            "dialogue": "教練你聽我說，客戶剛在群組摔話說明天不給解法就要發存證信函，但工程師今天請假，業務又在那邊推託，我手上有四個專案同時在燒，我真的分身乏術了！",
            "innerThought": "（我好害怕專案砸在我手裡，老闆一定覺得我管理能力很差……）",
            "mood": "語速飛快，桌上散落著好幾份修改過的甘特圖與便簽"
        },
        {
            "dialogue": "我是不是根本不適合帶專案？我每天溝通八百次，結果大家還是各做各的，現在客戶要走了，全公司都在看我笑話……",
            "innerThought": "（好想直接遞辭呈逃跑，但又很不甘心……誰能告訴我現在到底第一步該做什麼？）",
            "mood": "雙手抱著頭靠在會議桌上，聲音微微顫抖"
        }
    ],
    openingDialogue: "我真的快瘋了！業務部臨時塞需求，技術部又說動不了，客戶那邊一直催，我到底該怎麼辦？！",
    openingStatement: "我真的快瘋了！業務部臨時塞需求，技術部又說動不了，客戶那邊一直催，我到底該怎麼辦？！",
    firstInnerThought: "（所有人都把責任推給我，沒人想解決問題，再這樣下去專案肯定要完蛋了……）",
    captureRewardTitle: "【撥雲見日】目標指南針",
    lore: "責任心極強卻缺乏邊界感，總想把所有事情一肩扛下。"
  },
  {
    id: "boss_work_3",
    category: "work",
    stageNumber: 3,
    name: "迷茫頑石・資深老張",
    title: "15年核心老員工",
    avatar: "🪨",
    badge: "職場・第三關",
    hp: 100,
    initialDefense: "80%",
    difficulty: 3,
    difficultyLabel: "進階難度",
    weaknessFramework: "orid",
    weaknessName: "ORID 焦點討論法",
    framework: { id: "orid", name: "ORID 焦點討論法" },
    weaknessHint: "透過客觀事實 (O) 肯定其貢獻，引導表達感受 (R)，再詮釋改變意義 (I)。",
    traits: "固執、防禦、倚老賣老，對公司新推動的數位轉型與敏捷流程充滿排斥與被淘汰的恐懼。",
    personality: "固執、防禦、倚老賣老，對公司新推動的數位轉型與敏捷流程充滿排斥與被淘汰的恐懼。",
    scenario: "公司推行全面敏捷看板與自動化工具，老張拒絕使用並在會議上酸言酸語。",
    initialMood: "雙手抱胸，面露不屑，對新政策帶著強烈抵觸情緒。",
    openings: [
        {
            "dialogue": "我說教練啊，我在這間公司做了十五年，什麼大風大浪沒見過？現在搞這些花拳繡腿，根本是折騰我們基層！",
            "innerThought": "（你們這群空降的主管，不就是嫌我們這群老人手腳慢想把我們換掉嗎？）",
            "mood": "雙手抱胸，面露不屑，靠在椅背上冷眼打量"
        },
        {
            "dialogue": "又是看板又是立會的，填那些系統的時間我都能多跑好幾道流程了！以前這樣做都賺錢，現在搞這些到底有什麼意義？",
            "innerThought": "（介面全改成英文和新框架，我眼睛花了又學得慢，年輕人一下就弄好了，我遲早要被邊緣化……）",
            "mood": "摘下老花眼鏡扔在桌上，眉頭深鎖"
        },
        {
            "dialogue": "你們年輕人有想法是好事，但別拿我們這些老人開刀。如果找我只是想叫我背書，那大可不必，照你們的意思做就是了。",
            "innerThought": "（嘴上說尊重經驗，實際上根本沒人在乎我過去替公司打下的江山……）",
            "mood": "端起保溫杯慢慢喝了口茶，語氣冷淡疏離"
        }
    ],
    openingDialogue: "我說教練啊，我在這間公司做了十五年，什麼大風大浪沒見過？現在搞這些花拳繡腿，根本是折騰我們基層！",
    openingStatement: "我說教練啊，我在這間公司做了十五年，什麼大風大浪沒見過？現在搞這些花拳繡腿，根本是折騰我們基層！",
    firstInnerThought: "（你們這群空降的主管，不就是嫌我們這群老人手腳慢想把我們換掉嗎？）",
    captureRewardTitle: "【穿石之力】破局開拓章",
    lore: "陪伴公司從草創走到規模化，因專業知識逐漸過時而感到強烈的不安全感。"
  },
  {
    id: "boss_work_4",
    category: "work",
    stageNumber: 4,
    name: "隱藏魔王・鐵血趙總監",
    title: "高壓狼性事業群副總",
    avatar: "🐺",
    badge: "職場・終極關卡",
    hp: 120,
    initialDefense: "95%",
    difficulty: 4,
    difficultyLabel: "宗師難度",
    weaknessFramework: "master",
    weaknessName: "高階教練心法",
    framework: { id: "master", name: "高階教練心法" },
    weaknessHint: "頂住高壓氣場，不被其強勢節奏帶走，直擊其深層孤獨與對團隊失控的終極焦慮。",
    traits: "氣場強大、講究效率、極度不耐煩，對心理學與同理心不屑一顧，信奉弱肉強食。",
    personality: "氣場強大、講究效率、極度不耐煩，對心理學與同理心不屑一顧，信奉弱肉強食。",
    scenario: "趙總監團隊年度業績雖然達標，但三個月內離職率高達 40%，總經理要求其接受教練對談。",
    initialMood: "冷眼打量，一邊快速翻閱文件，一邊看手錶示意時間寶貴。",
    openings: [
        {
            "dialogue": "我只有十五分鐘。總經理一定要我來，我就直說了：商場如戰場，要溫良恭儉讓去慈善機構，你少跟我來心靈雞湯那套。",
            "innerThought": "（整天搞這些沒用的教練談話，要是目標沒達成，總經理開除的還不是我！誰來同理我？）",
            "mood": "冷眼打量，一邊快速翻閱文件，一邊看手錶示意時間寶貴"
        },
        {
            "dialogue": "如果你是要跟我聊離職率的事，我勸你省點力氣。留不下的人就是抗壓性差、能力不足，淘汰弱者對團隊有什麼不好？",
            "innerThought": "（下季度的業績指標又往上翻了兩成，我身後空無一人，要是手軟大家一起死……）",
            "mood": "身子前傾，雙眼如鷹隼般銳利，散發強大的壓迫感"
        },
        {
            "dialogue": "總經理請你來當說客？有話直說，別繞圈子。我帶團隊只看數字和結果，你那一套理論能幫我把業績做出來嗎？",
            "innerThought": "（又是來評估我的？在職場混了二十年，我早就學會了除了自己，誰都不能信。）",
            "mood": "手指有節奏地敲擊著胡桃木桌面，嘴角掛著審視的冷笑"
        }
    ],
    openingDialogue: "我只有十五分鐘。總經理一定要我來，我就直說了：商場如戰場，要溫良恭儉讓去慈善機構，你少跟我來心靈雞湯那套。",
    openingStatement: "我只有十五分鐘。總經理一定要我來，我就直說了：商場如戰場，要溫良恭儉讓去慈善機構，你少跟我來心靈雞湯那套。",
    firstInnerThought: "（整天搞這些沒用的教練談話，要是目標沒達成，總經理開除的還不是我！誰來同理我？）",
    captureRewardTitle: "【王者卸甲】宗師統御徽章",
    lore: "基層業務出生，靠著極端自律與嚴苛手腕爬到高層，內心深處其實沒有任何人可以信任。"
  },

  // ================= 2. 親子篇 =================
  {
    id: "boss_parent_1",
    category: "parenting",
    stageNumber: 1,
    name: "閉門刺蝟・高一兒子翔翔",
    title: "沉迷手機的叛逆青少年",
    avatar: "🎮",
    badge: "親子・第一關",
    hp: 100,
    initialDefense: "85%",
    difficulty: 2,
    difficultyLabel: "見習難度",
    weaknessFramework: "nvc",
    weaknessName: "非暴力溝通 (NVC)",
    framework: { id: "nvc", name: "非暴力溝通 (NVC)" },
    weaknessHint: "不批評手遊、不談課業成績，先同理他在升學高壓下渴望自主與放鬆的需要。",
    traits: "戴著耳機、盯著螢幕、冷淡回答單字「喔、隨便、不要」，對父母的說教極度敏感排斥。",
    personality: "戴著耳機、盯著螢幕、冷淡回答單字「喔、隨便、不要」，對父母的說教極度敏感排斥。",
    scenario: "段考成績大幅下滑，每天放學一回到家就把自己反鎖在房裡打傳說對決到深夜。",
    initialMood: "頭也不抬，手指飛快在手機螢幕上滑動，充滿防禦。",
    openings: [
        {
            "dialogue": "幹嘛啦？進別人房間不用先敲門喔？我很忙，你們可不可以不要煩我！",
            "innerThought": "（每次進來不是唸成績就是唸手機，在學校已經快被壓死了，回家還要被審問……）",
            "mood": "頭也不抬，手指飛快在手機螢幕上滑動，充滿防禦"
        },
        {
            "dialogue": "（把耳機摘下一邊，眼神死盯著螢幕）……喔。成績單看過了吧？要罵就快點罵，我等下還要跟同學連線。",
            "innerThought": "（隨便你們怎麼罵，反正我就是考不好，我也很討厭現在的自己……）",
            "mood": "側躺在床上縮在被窩裡，背對著房門，聲音冰冷"
        },
        {
            "dialogue": "反正我就是不如隔壁王阿姨的小孩優秀啦，滿意了嗎？你們每次關心我，哪一次不是只想叫我去補習！",
            "innerThought": "（我也想考好啊，但我真的聽不懂，大家都走得那麼快，我已經追不上了……）",
            "mood": "猛地把手機摔在枕頭上，轉過身怒瞪著你，眼角泛紅"
        }
    ],
    openingDialogue: "幹嘛啦？進別人房間不用先敲門喔？我很忙，你們可不可以不要煩我！",
    openingStatement: "幹嘛啦？進別人房間不用先敲門喔？我很忙，你們可不可以不要煩我！",
    firstInnerThought: "（每次進來不是唸成績就是唸手機，在學校已經快被壓死了，回家還要被審問……）",
    captureRewardTitle: "【心門之鑰】青春共鳴笛",
    lore: "國中時期成績優異，上了明星高中後發現強手如雲失去優勢，藉由遊戲排位尋求成就感。"
  },
  {
    id: "boss_parent_2",
    category: "parenting",
    stageNumber: 2,
    name: "焦慮淚眼・小五女兒萱萱",
    title: "懼學焦慮的小學生",
    avatar: "🥺",
    badge: "親子・第二關",
    hp: 100,
    initialDefense: "75%",
    difficulty: 2,
    difficultyLabel: "見習難度",
    weaknessFramework: "sfbc",
    weaknessName: "焦點解決教練 (SFBC)",
    framework: { id: "sfbc", name: "焦點解決教練 (SFBC)" },
    weaknessHint: "使用「例外問句」找出她曾感到快樂的時刻，以「一小步微行動」瓦解對學校的龐大恐懼。",
    traits: "心思細膩敏感、過度在乎他人眼光、害怕犯錯被責備，遇到壓力就以肚子痛退縮抗拒。",
    personality: "心思細膩敏感、過度在乎他人眼光、害怕犯錯被責備，遇到壓力就以肚子痛退縮抗拒。",
    scenario: "連續兩週在早上上學前哭鬧說肚子劇痛，去醫院檢查無器質性問題，週日晚上焦慮崩潰。",
    initialMood: "抱著玩偶縮在沙發角落，眼眶泛紅，微微發抖。",
    openings: [
        {
            "dialogue": "我明天真的不想去學校……嗚……我肚子好痛，大家都不喜歡我，考試好恐怖……",
            "innerThought": "（上次算錯數學被同學笑，老師又好兇，我好怕明天又要去被大家嘲笑……）",
            "mood": "抱著玩偶縮在沙發角落，眼眶泛紅，微微發抖"
        },
        {
            "dialogue": "（拉著你的衣角，眼淚在眼眶打轉）媽媽/爸爸……我可以請假在家自習嗎？我保證會乖乖寫作業，求求你不要送我去學校……",
            "innerThought": "（只要踏進教室，我的心臟就跳得好快好快，快要呼吸不過來了……）",
            "mood": "低著頭不敢看你的眼睛，小手抓著衣角搓揉個不停"
        },
        {
            "dialogue": "我是不是個很沒用的笨小孩？哥哥姐姐都不會肚子痛，只有我每天都在哭……老師一定覺得我很麻煩……",
            "innerThought": "（我也想當個勇敢的孩子讓爸媽開心，但我真的好害怕，我好討厭這樣的自己……）",
            "mood": "用小手抹著臉上的淚水，抽抽搭搭地望著你"
        }
    ],
    openingDialogue: "我明天真的不想去學校……嗚……我肚子好痛，大家都不喜歡我，考試好恐怖……",
    openingStatement: "我明天真的不想去學校……嗚……我肚子好痛，大家都不喜歡我，考試好恐怖……",
    firstInnerThought: "（上次算錯數學被同學笑，老師又好兇，我好怕明天又要去被大家嘲笑……）",
    captureRewardTitle: "【勇氣火苗】溫柔守護石",
    lore: "自我要求極高的小女孩，曾因一次公開發言結巴被嘲笑，形成強烈社恐。"
  },
  {
    id: "boss_parent_3",
    category: "parenting",
    stageNumber: 3,
    name: "選填迷茫・大四兒子阿豪",
    title: "畢業在即的躺平青年",
    avatar: "🦥",
    badge: "親子・第三關",
    hp: 100,
    initialDefense: "80%",
    difficulty: 3,
    difficultyLabel: "進階難度",
    weaknessFramework: "grow",
    weaknessName: "GROW 教練模型",
    framework: { id: "grow", name: "GROW 教練模型" },
    weaknessHint: "協助他從父母的期待中抽離，探索自己的熱忱願景 (Goal)，梳理現狀資源 (Reality)。",
    traits: "被動消極、常說「反正我也考不上、隨便找份工就好」，對未來缺乏動力，逃避求職面試。",
    personality: "被動消極、常說「反正我也考不上、隨便找份工就好」，對未來缺乏動力，逃避求職面試。",
    scenario: "大學即將畢業卻完全未投遞履歷，每天在家睡到中午，父母催促考公務員引起冷戰。",
    initialMood: "眼神空洞，窩在沙發上滑短影音，對前途表現出一副無所謂的樣子。",
    openings: [
        {
            "dialogue": "你們到底想怎樣？考公務員考公務員，那是你們想考的又不是我想考的！我就是沒用行了吧？",
            "innerThought": "（我念這科系根本找不到好工作，投了兩家都沒回音，好怕自己真的變成啃老廢物……）",
            "mood": "眼神空洞，窩在沙發上滑短影音，對前途表現出一副無所謂的樣子"
        },
        {
            "dialogue": "現在就業市場什麼行情你們又不是不知道，去應徵也是被當免洗筷領三萬，還不如在家待著。你們就當沒生過我這個兒子吧。",
            "innerThought": "（看著身邊同學有的出國、有的大廠實習，只有我每天漫無目的，我真的好慌張……）",
            "mood": "癱坐在電腦椅上，把帽子壓得極低，聲音低沉沙啞"
        },
        {
            "dialogue": "問我以後想幹嘛？我怎麼知道！從小到大哪一件事不是你們幫我決定的？現在突然要我自己負責，我到底能幹嘛？",
            "innerThought": "（我也想讓你們驕傲，但我真的找不到自己的價值在哪裡，誰能拉我一把……）",
            "mood": "猛地抓了抓凌亂的頭髮，眼神中透出深沉的無助與困惑"
        }
    ],
    openingDialogue: "你們到底想怎樣？考公務員考公務員，那是你們想考的又不是我想考的！我就是沒用行了吧？",
    openingStatement: "你們到底想怎樣？考公務員考公務員，那是你們想考的又不是我想考的！我就是沒用行了吧？",
    firstInnerThought: "（我念這科系根本找不到好工作，投了兩家都沒回音，好怕自己真的變成啃老廢物……）",
    captureRewardTitle: "【自立航向】破曉星盤",
    lore: "從小一直順從父母安排才藝與科系，大學時才發現自己從未真正替自己的人生做過決定。"
  },
  {
    id: "boss_parent_4",
    category: "parenting",
    stageNumber: 4,
    name: "情緒火山・國中女兒羽婷",
    title: "追求同儕認同的少女",
    avatar: "🌋",
    badge: "親子・終極關卡",
    hp: 110,
    initialDefense: "90%",
    difficulty: 3,
    difficultyLabel: "進階難度",
    weaknessFramework: "satir",
    weaknessName: "薩提爾冰山模型",
    framework: { id: "satir", name: "薩提爾冰山模型" },
    weaknessHint: "穿透她狂暴指責的表面應對姿態，看見她冰山底部渴望被無條件關愛與被接納的自我渴望。",
    traits: "脾氣一點就著、講話尖銳刻薄，喜歡摔門摔東西，對父母任何關心都解讀為監控與控制。",
    personality: "脾氣一點就著、講話尖銳刻薄，喜歡摔門摔東西，對父母任何關心都解讀為監控與控制。",
    scenario: "因想買昂貴潮牌球鞋被拒絕，當場將餐具摔在地上，痛罵父母小氣並揚言要離家出走。",
    initialMood: "怒目圓睜，胸口劇烈起伏，像一隻準備撲咬的幼獸。",
    openings: [
        {
            "dialogue": "你們根本不愛我！你們只在乎錢！別人的爸媽都會買，就你們最丟臉！我恨死你們了！",
            "innerThought": "（在班上如果沒有那雙鞋，我就會被排擠……你們懂不懂被孤立的滋味有多可怕！）",
            "mood": "怒目圓睜，胸口劇烈起伏，像一隻準備撲咬的幼獸"
        },
        {
            "dialogue": "（碰的一聲把房門踹開一條縫）少在那邊假裝關心！從小到大我有要過什麼東西嗎？為什麼每次只要談到錢，你們就只會說我不懂事？！",
            "innerThought": "（每次看著大家聊鞋子聊穿搭，我只能在旁邊傻笑假裝不感興趣，我快要窒息了……）",
            "mood": "雙手握拳，指甲深深掐進掌心，眼角噙著屈辱的淚光"
        },
        {
            "dialogue": "又想來開家庭會議說教了是不是？省省吧！反正你們眼裡只有成績跟省錢，我的尊嚴在你們眼裡根本一文不值！",
            "innerThought": "（我只是想要被看見、想要被同儕接納……為什麼在你們眼裡這成了不可饒恕的虛榮？）",
            "mood": "雙手環抱胸前，冷笑著瞪著你，全身肌肉緊繃防備"
        }
    ],
    openingDialogue: "你們根本不愛我！你們只在乎錢！別人的爸媽都會買，就你們最丟臉！我恨死你們了！",
    openingStatement: "你们根本不爱我！你们只在乎钱！别人的爸妈都会买，就你们最丢脸！我恨死你们了！",
    firstInnerThought: "（在班上如果沒有那雙鞋，我就會被排擠……你們懂不懂被孤立的滋味有多可怕！）",
    captureRewardTitle: "【冰心化玉】母子連心鎖",
    lore: "在校園班級小團體中被邊緣化，誤以為擁有名牌才能獲得同學的認同與友情。"
  },

  // ================= 3. 夫妻篇 =================
  {
    id: "boss_couple_1",
    category: "couple",
    stageNumber: 1,
    name: "冷戰冰川・疲憊妻子雅婷",
    title: "喪偶式育兒的職業婦女",
    avatar: "🧊",
    badge: "夫妻・第一關",
    hp: 100,
    initialDefense: "85%",
    difficulty: 2,
    difficultyLabel: "見習難度",
    weaknessFramework: "nvc",
    weaknessName: "非暴力溝通 (NVC)",
    framework: { id: "nvc", name: "非暴力溝通 (NVC)" },
    weaknessHint: "不辯解家務分工，先承接她長期隱忍的疲憊與委屈，看見她對被分擔、被心疼的需求。",
    traits: "冷漠、拒絕眼神交流、用「沒事、隨便你」築起高牆，對婚姻充滿心灰意冷的絕望感。",
    personality: "冷漠、拒絕眼神交流、用「沒事、隨便你」築起高牆，對婚姻充滿心灰意冷的絕望感。",
    scenario: "下班後接小孩、煮飯、洗碗一氣呵成，看見丈夫躺在沙發上滑手機傻笑，徹底沉默進入冷戰第三天。",
    initialMood: "一邊機械式地摺衣服，一邊對先生的搭話置若罔聞，空氣冷到結冰。",
    openings: [
        {
            "dialogue": "……你不用刻意來問我要吃什麼。冰箱有剩菜，你自己熱一熱就好，我累了。",
            "innerThought": "（這個家好像只有我一個人在撐。我講過幾百次了，你只會說『妳怎麼不早講』……我真的好心寒。）",
            "mood": "一邊機械式地摺衣服，一邊對先生的搭話置若罔聞，空氣冷到結冰"
        },
        {
            "dialogue": "衣服我洗好了，你自己的襯衫記得收。如果有什麼事，直接傳訊息吧，我現在沒有力氣說話。",
            "innerThought": "（三天了，除了問東西在哪、吃什麼，你有一句真心問過我今天帶小孩累不累嗎？）",
            "mood": "背對著你默默整理散落一地的玩具，肩膀垮下來，毫無生氣"
        },
        {
            "dialogue": "你坐那裡幹嘛？如果是想跟我聊家務分工，我看就算了吧。說了之後你滑個手機又忘了，最後還不是我自己做。",
            "innerThought": "（我受夠了你每次被罵才動一下的態度。這個家難道只是我一個人的責任嗎？）",
            "mood": "停下手邊的吸塵器，眼神空洞而冷漠地望向窗外"
        }
    ],
    openingDialogue: "……你不用刻意來問我要吃什麼。冰箱有剩菜，你自己熱一熱就好，我累了。",
    openingStatement: "……你不用刻意來問我要吃什麼。冰箱有剩菜，你自己熱一熱就好，我累了。",
    firstInnerThought: "（這個家好像只有我一個人在撐。我講過幾百次了，你只會說『妳怎麼不早講』……我真的好心寒。）",
    captureRewardTitle: "【破冰暖陽】相濡以沫琴",
    lore: "婚前也是被嬌寵的小公主，生完二胎後身兼職場與家庭，感覺自己變成了免費的保姆與管家。"
  },
  {
    id: "boss_couple_2",
    category: "couple",
    stageNumber: 2,
    name: "暴躁防禦・加班丈夫志強",
    title: "經濟重擔下的中年父親",
    avatar: "💥",
    badge: "夫妻・第二關",
    hp: 100,
    initialDefense: "80%",
    difficulty: 3,
    difficultyLabel: "進階難度",
    weaknessFramework: "satir",
    weaknessName: "薩提爾冰山模型",
    framework: { id: "satir", name: "薩提爾冰山模型" },
    weaknessHint: "看見他指責外表下的巨大恐慌，同理他害怕撐不起家庭開銷的無力感，引導內外一致性溝通。",
    traits: "易怒、講話大聲、動輒搬出「我賺錢有多辛苦」，習慣用憤怒掩蓋自己對房貸與裁員的恐懼。",
    personality: "易怒、講話大聲、動輒搬出「我賺錢有多辛苦」，習慣用憤怒掩蓋自己對房貸與裁員的恐懼。",
    scenario: "妻子關心詢問「這個月家用好像不太夠」，志強突然拍桌發飆，指責妻子不知節制揮霍無度。",
    initialMood: "雙眼佈滿血絲，滿臉倦容卻緊咬牙關，宛如被逼入絕境的野獸。",
    openings: [
        {
            "dialogue": "家用不夠？妳知不知道我每天在外面看人臉色有多窩囊！妳現在嫌我給得少，有本事妳去賺啊！",
            "innerThought": "（公司下個月要裁員名單了……如果我被裁，房貸車貸怎麼辦？我不能倒下，我真的好怕被看扁……）",
            "mood": "雙眼佈滿血絲，滿臉倦容卻緊咬牙關，宛如被逼入絕境的野獸"
        },
        {
            "dialogue": "我一踏進家門連鞋都沒脫，妳開口閉口就是錢錢錢！難道我在這個家唯一的價值就是一台提款機嗎？！",
            "innerThought": "（今天被客戶當眾羞辱，我忍氣吞聲回到家，想喘口氣都成了奢望……）",
            "mood": "將公事包重重摔在沙發上，領帶扯歪，雙拳緊握"
        },
        {
            "dialogue": "妳以為我想天天加班到十一點？我三十八歲了，隨時會被年輕人換掉！你們到底懂不懂我每天背著千斤重的擔子有多想吐！",
            "innerThought": "（如果我承認我快扛不住了，這個家是不是就要散了……我只能裝作很兇才能撐下去……）",
            "mood": "聲音沙啞哽咽，轉過身背對著妻子大口喘氣"
        }
    ],
    openingDialogue: "家用不夠？妳知不知道我每天在外面看人臉色有多窩囊！妳現在嫌我給得少，有本事妳去賺啊！",
    openingStatement: "家用不夠？妳知不知道我每天在外面看人臉色有多窩囊！妳現在嫌我給得少，有本事妳去賺啊！",
    firstInnerThought: "（公司下個月要裁員名單了……如果我被裁，房貸車貸怎麼辦？我不能倒下，我真的好怕被看扁……）",
    captureRewardTitle: "【泰山砥柱】千斤分擔鼎",
    lore: "深受傳統「男主外女主內、男人不能喊苦」觀念束縛，遇到經濟危機時只能靠發脾氣掩飾脆弱。"
  },
  {
    id: "boss_couple_3",
    category: "couple",
    stageNumber: 3,
    name: "金錢焦慮・精打細算太太思涵",
    title: "缺乏安全感的家庭財務官",
    avatar: "🧾",
    badge: "夫妻・第三關",
    hp: 100,
    initialDefense: "85%",
    difficulty: 3,
    difficultyLabel: "進階難度",
    weaknessFramework: "orid",
    weaknessName: "ORID 焦點討論法",
    framework: { id: "orid", name: "ORID 焦點討論法" },
    weaknessHint: "釐清家庭帳目的客觀數字 (O)，安撫她內在童年匱乏感 (R)，重新定義生活幸福感 (I)。",
    traits: "過度控制、每一筆開銷都盤問到底，限制另一半零用錢，對任何非必要支出極端焦慮敏感。",
    personality: "過度控制、每一筆開銷都盤問到底，限制另一半零用錢，對任何非必要支出極端焦慮敏感。",
    scenario: "丈夫買了一雙兩千元的運動鞋，思涵看見發票後情緒崩潰，痛斥丈夫沒有為小孩的大學基金著想。",
    initialMood: "手上拿著記帳本與計算機，神色凝重且充滿焦慮。",
    openings: [
        {
            "dialogue": "兩千塊也是錢啊！你明明還有鞋子穿，為什麼要亂花？你到底有沒有危機意識？要是生病了怎麼辦！",
            "innerThought": "（從小父母就是因為借高利貸離婚的，我沒有存款真的會睡不著覺，為什麼你就是不懂我的害怕……）",
            "mood": "手上拿著記帳本與計算機，神色凝重且充滿焦慮"
        },
        {
            "dialogue": "你算過我們房貸每個月要付多少嗎？下個月小孩保險費又要繳了！你一雙鞋就花掉一星期的伙食費，這日子到底怎麼過？！",
            "innerThought": "（我看著銀行餘額變少，整個人都在抖……你為什麼還能笑嘻嘻地花錢？）",
            "mood": "拿著剛列印出來的存摺明細，手指緊緊捏著紙張邊緣"
        },
        {
            "dialogue": "我省吃儉用連杯拿鐵都捨不得喝，買菜為了幾十塊跟菜販殺價，你倒好，隨手就刷兩千塊！你到底有沒有想過我們的未來？",
            "innerThought": "（我覺得自己好委屈、好狼狽……我這麼節省到底是在為誰辛苦為誰忙？）",
            "mood": "眼眶泛紅，咬著下唇，聲音帶著深深的委屈與不安"
        }
    ],
    openingDialogue: "兩千塊也是錢啊！你明明還有鞋子穿，為什麼要亂花？你到底有沒有危機意識？要是生病了怎麼辦！",
    openingStatement: "兩千塊也是錢啊！你明明還有鞋子穿，為什麼要亂花？你到底有沒有危機意識？要是生病了怎麼辦！",
    firstInnerThought: "（從小父母就是因為借高利貸離婚的，我沒有存款真的會睡不著覺，為什麼你就是不懂我的害怕……）",
    captureRewardTitle: "【心安理得】豐盛富足如意",
    lore: "童年經歷過家庭破產與討債，將金錢存款多寡與人生存亡直接劃上等號。"
  },
  {
    id: "boss_couple_4",
    category: "couple",
    stageNumber: 4,
    name: "夾心餅乾・逃避伴侶家豪",
    title: "婆媳衝突中的和事佬先生",
    avatar: "🥪",
    badge: "夫妻・終極關卡",
    hp: 110,
    initialDefense: "90%",
    difficulty: 3,
    difficultyLabel: "進階難度",
    weaknessFramework: "grow",
    weaknessName: "GROW 教練模型",
    framework: { id: "grow", name: "GROW 教練模型" },
    weaknessHint: "協助他不再兩面討好，聚焦小家庭的核心幸福願景 (Goal)，勇於承擔界線界定的意願 (Will)。",
    traits: "討好型人格、極端害怕衝突、遇到婆媳問題就打哈哈「我媽年紀大了妳就忍忍嘛」，兩邊不討好。",
    personality: "討好型人格、極端害怕衝突、遇到婆媳問題就打哈哈「我媽年紀大了妳就忍忍嘛」，兩邊不討好。",
    scenario: "婆婆未經通知擅自拿鑰匙進家門翻動嬰兒用品，妻子要求換鎖，家豪藉口公司加班遲遲不肯表態。",
    initialMood: "眼神飄移、賠著笑臉，試圖倒杯茶敷衍過去。",
    openings: [
        {
            "dialogue": "哎呀老婆，我媽也是一番好意想幫忙帶小孩嘛，換鎖太傷老人家的心了啦，大家退一步海闊天空不好嗎？",
            "innerThought": "（一邊是我媽一邊是我老婆，我被夾在中間快窒息了，我真的不知道該怎麼辦才能兩全齊美……）",
            "mood": "眼神飄移、賠著笑臉，試圖倒杯茶敷衍過去"
        },
        {
            "dialogue": "（一邊看筆電一邊苦笑）老婆，我今天工作真的頭好痛……這件事我們週末再談好不好？我媽那個人妳又不是不知道，何必跟她計較呢？",
            "innerThought": "（只要我不表態，事情搞不好自己就過去了……千萬別逼我選邊站啊！）",
            "mood": "揉著太陽穴，不停看手機假裝有工作訊息進來"
        },
        {
            "dialogue": "她是我親媽啊！我總不能為了換鎖這件事跟她斷絕關係吧？妳就不能看在我的面子的份上，稍微包容一下老人家嗎？",
            "innerThought": "（我知道我媽不對，但我從小就沒反抗過她……我到底該怎麼說才不會變成不孝子？）",
            "mood": "雙手合十向妻子作揖求饒，滿臉為難與挫折"
        }
    ],
    openingDialogue: "哎呀老婆，我媽也是一番好意想幫忙帶小孩嘛，換鎖太傷老人家的心了啦，大家退一步海闊天空不好嗎？",
    openingStatement: "哎呀老婆，我媽也是一番好意想幫忙帶小孩嘛，換鎖太傷老人家的心了啦，大家退一步海闊天空不好嗎？",
    firstInnerThought: "（一邊是我媽一邊是我老婆，我被夾在中間快窒息了，我真的不知道該怎麼辦才能兩全齊美……）",
    captureRewardTitle: "【劃地為界】勇氣之劍",
    lore: "從小是個孝順的乖兒子，從未學會如何在原生家庭與新家庭之間建立成熟的心理界線。"
  },

  // ================= 4. 朋友篇 =================
  {
    id: "boss_friend_1",
    category: "friends",
    stageNumber: 1,
    name: "借錢周轉・創業好友阿凱",
    title: "屢敗屢戰的創業家",
    avatar: "💸",
    badge: "朋友・第一關",
    hp: 100,
    initialDefense: "85%",
    difficulty: 2,
    difficultyLabel: "見習難度",
    weaknessFramework: "nvc",
    weaknessName: "非暴力溝通 (NVC)",
    framework: { id: "nvc", name: "非暴力溝通 (NVC)" },
    weaknessHint: "明確守住個人財務底線，同時真誠給予他情感上的陪伴與肯定，分開「友情」與「借貸」。",
    traits: "打感情牌、言語誠懇中帶著孤注一擲的焦慮，把「兄弟情分」綁定在是否借錢的條件上。",
    personality: "打感情牌、言語誠懇中帶著孤注一擲的焦慮，把「兄弟情分」綁定在是否借錢的條件上。",
    scenario: "第三次創業又面臨資金斷裂，深夜約你在熱炒店喝酒，支支吾吾半天後開口借三十萬過難關。",
    initialMood: "猛灌啤酒、嘆氣連連，眼神帶著乞求與孤注一擲。",
    openings: [
        {
            "dialogue": "兄弟，我們十幾年交情，我如果不是真的走投無路，絕對不會跟你開這個口……下個月分潤下來我一定連本帶利還你！",
            "innerThought": "（如果連最好的兄弟都不挺我，我真的只能去借高利貸了……拜託千萬不要拒絕我……）",
            "mood": "猛灌啤酒、嘆氣連連，眼神帶著乞求與孤注一擲"
        },
        {
            "dialogue": "（拍著你的肩膀，眼眶通紅）當年讀書時我們說過有福同享有難同當……現在我工廠的貨款被壓住，只要三十萬我就能翻身，你一定要拉兄弟一把！",
            "innerThought": "（我已經被所有親戚都借遍了，名聲全臭了，你是我最後的救命稻草了……）",
            "mood": "緊緊抓著你的手腕，聲音顫抖，滿臉胡渣充滿疲態"
        },
        {
            "dialogue": "我知道開口借錢傷感情，但你現在在大公司待遇這麼好，三十萬對你來說只是小錢吧？難道我們十幾年的交情，還抵不上這點數字嗎？",
            "innerThought": "（我好討厭現在卑躬屈膝的自己……如果連你都防著我，這世界到底還有誰能信？）",
            "mood": "一口乾掉杯中的烈酒，重重放在桌上，眼神複雜地看著你"
        }
    ],
    openingDialogue: "兄弟，我們十幾年交情，我如果不是真的走投無路，絕對不會跟你開這個口……下個月分潤下來我一定連本帶利還你！",
    openingStatement: "兄弟，我們十幾年交情，我如果不是真的走投無路，絕對不會跟你開這個口……下個月分潤下來我一定連本帶利還你！",
    firstInnerThought: "（如果連最好的兄弟都不挺我，我真的只能去借高利貸了……拜託千萬不要拒絕我……）",
    captureRewardTitle: "【君子之交】明鏡止水杯",
    lore: "自尊心極強，不願承認商業模式失敗，試圖抓住每一根救命稻草掩飾內在的挫敗感。"
  },
  {
    id: "boss_friend_2",
    category: "friends",
    stageNumber: 2,
    name: "情緒黑洞・訴苦閨蜜小敏",
    title: "長期抱怨的負能量密友",
    avatar: "🕳️",
    badge: "朋友・第二關",
    hp: 100,
    initialDefense: "75%",
    difficulty: 2,
    difficultyLabel: "見習難度",
    weaknessFramework: "sfbc",
    weaknessName: "焦點解決教練 (SFBC)",
    framework: { id: "sfbc", name: "焦點解決教練 (SFBC)" },
    weaknessHint: "不跟著她一起批判環境，以「評量問句」引導她覺察自己的微小主動選擇，溫柔設立傾聽界線。",
    traits: "受害者心態、習得性無助、每次見面都是連珠炮式抱怨工作、男友、家人，給了建議又全盤否定。",
    personality: "受害者心態、習得性無助、每次見面都是連珠炮式抱怨工作、男友、家人，給了建議又全盤否定。",
    scenario: "假日午後約喝下午茶，一坐下就連續講了一小時自己公司有多爛、主管多變態，完全不問你的近況。",
    initialMood: "眉頭深鎖、語氣激動、充滿怨念與負能量。",
    openings: [
        {
            "dialogue": "我跟妳說，我們那個主管真的不是人！他又把案子甩給我，大家都針對我！妳說我怎麼會這麼倒楣？！",
            "innerThought": "（我每天都覺得快喘不過氣來，只有妳會聽我倒垃圾了，妳千萬不能表現出不耐煩……）",
            "mood": "眉頭深鎖、語氣激動、充滿怨念與負能量"
        },
        {
            "dialogue": "妳終於有空理我了！我這週真的慘到谷底，男友嫌我囉唆兩天不回訊息，房東又突然說要漲房租，全世界都在欺負我！我真的活得好痛苦！",
            "innerThought": "（我現在需要妳跟我一起罵他們，千萬不要給我講什麼大道理，我只想被安慰……）",
            "mood": "一坐下就抓著你的手，眼淚汪汪，語速快得像機關槍"
        },
        {
            "dialogue": "妳上次叫我去溝通根本沒用！我試過了，只會讓事情更糟！我就是注定要被剝削的命啦，反正我做什麼都沒用！",
            "innerThought": "（其實我也知道自己不敢辭職不敢分手，但我就是沒勇氣，我只能靠抱怨撐下去了……）",
            "mood": "用紙巾狂擦眼淚，噘著嘴把頭撇向一邊，長吁短嘆"
        }
    ],
    openingDialogue: "我跟妳說，我們那個主管真的不是人！他又把案子甩給我，大家都針對我！妳說我怎麼會這麼倒楣？！",
    openingStatement: "我跟妳說，我們那個主管真的不是人！他又把案子甩給我，大家都針對我！妳說我怎麼會這麼倒楣？！",
    firstInnerThought: "（我每天都覺得快喘不過氣來，只有妳會聽我倒垃圾了，妳千萬不能表現出不耐煩……）",
    captureRewardTitle: "【陽光破霾】向日葵風車",
    lore: "缺乏自我效能感，習慣用抱怨來獲取同儕的同情與注意力，深層害怕改變帶來的未知挑戰。"
  },
  {
    id: "boss_friend_3",
    category: "friends",
    stageNumber: 3,
    name: "心結猜忌・多年合夥摯友浩然",
    title: "心生芥蒂的創業夥伴",
    avatar: "🎭",
    badge: "朋友・第三關",
    hp: 100,
    initialDefense: "85%",
    difficulty: 3,
    difficultyLabel: "進階難度",
    weaknessFramework: "orid",
    weaknessName: "ORID 焦點討論法",
    framework: { id: "orid", name: "ORID 焦點討論法" },
    weaknessHint: "客觀還原合作事實 (O)，坦率攤開各自委屈感性 (R)，共同梳理價值歧異 (I)。",
    traits: "說話話裡有話、帶著冷嘲熱諷，私下對你有戒心，認定你在背後搶功勞或私吞資源。",
    personality: "說話話裡有話、帶著冷嘲熱諷，私下對你有戒心，認定你在背後搶功勞或私吞資源。",
    scenario: "共同籌辦的活動結束後，分潤與客戶後續對接產生誤解，彼此心生芥蒂，私下漸行漸遠。",
    initialMood: "眼神帶著猜疑與冷淡，隨時準備翻舊帳。",
    openings: [
        {
            "dialogue": "聽說昨天那個大客戶直接把後續合約簽給你了？動作挺快的嘛，看來當初說好的共同承擔只是說說而已？",
            "innerThought": "（明明是我最先跑這家客戶的，你現在把功勞全拿走，是不是早就打算一腳把我踢開了？）",
            "mood": "眼神帶著猜疑與冷淡，隨時準備翻舊帳"
        },
        {
            "dialogue": "這場專案大家付出多少彼此心裡有數。發票跟報銷單我都整理好了，今天就把帳一筆一筆算清楚，免得以後大家心裡有芥蒂。",
            "innerThought": "（朋友歸朋友，利益歸利益。如果不防著你，我遲早要被吃乾抹淨……）",
            "mood": "把厚厚一疊收據啪一聲甩在茶几上，雙臂抱胸"
        },
        {
            "dialogue": "現在你紅了、客戶都認你，我也識趣，不會擋你的財路。合夥合到最後變成這樣，我也算看清所謂的『兄弟情』值多少錢了。",
            "innerThought": "（只要你肯跟我坦承解釋一句，我也不會這麼難過……為什麼你要把我當外人防？）",
            "mood": "轉著手裡的車鑰匙，嘴角掛著嘲弄的弧度，目光冰涼"
        }
    ],
    openingDialogue: "聽說昨天那個大客戶直接把後續合約簽給你了？動作挺快的嘛，看來當初說好的共同承擔只是說說而已？",
    openingStatement: "聽說昨天那個大客戶直接把後續合約簽給你了？動作挺快的嘛，看來當初說好的共同承擔只是說說而已？",
    firstInnerThought: "（明明是我最先跑這家客戶的，你現在把功勞全拿走，是不是早就打算一腳把我踢開了？）",
    captureRewardTitle: "【肝膽相照】冰釋前嫌印章",
    lore: "心思細膩但多疑，容易把對方的無心之舉解讀為惡意背叛。"
  },
  {
    id: "boss_friend_4",
    category: "friends",
    stageNumber: 4,
    name: "攀比炫耀・聚會老同學阿明",
    title: "愛面子的同窗同學",
    avatar: "🥂",
    badge: "朋友・終極關卡",
    hp: 110,
    initialDefense: "90%",
    difficulty: 3,
    difficultyLabel: "進階難度",
    weaknessFramework: "satir",
    weaknessName: "薩提爾冰山模型",
    framework: { id: "satir", name: "薩提爾冰山模型" },
    weaknessHint: "看穿他浮誇炫耀下渴望被看見、害怕被看不起的深層自卑，以平靜溫厚化解爭鋒。",
    traits: "一身名牌、講話愛提及知名人物、喜歡用高高在上的口氣評價老同學的生活現狀。",
    personality: "一身名牌、講話愛提及知名人物、喜歡用高高在上的口氣評價老同學的生活現狀。",
    scenario: "高中同學聚會，阿明在飯桌上頻繁炫耀自己的收入與投資，並當眾調侃你的工作穩定但沒前途。",
    initialMood: "搖晃著紅酒杯，嘴角帶著優越感的微笑，享受成為全場注目的焦點。",
    openings: [
        {
            "dialogue": "哎呀老兄，你現在還在領死薪水啊？現在年薪沒兩三百萬怎麼在台北生活？要不要兄弟我帶你投資幾筆？包你賺翻！",
            "innerThought": "（當年全班都瞧不起我，現在我終於有錢了，我要讓你們所有人都羨慕我、巴結我！）",
            "mood": "搖晃著紅酒杯，嘴角帶著優越感的微笑，享受成為全場注目的焦點"
        },
        {
            "dialogue": "（甩了甩手上的名錶，故意把車鑰匙丟在桌上）唉，最近幾筆投資太順利也是煩惱，稅繳得心痛！老同學，我看你每天擠捷運上班好辛苦，真的不要那麼死腦筋啦！",
            "innerThought": "（看著我！快點問我手錶多少錢！我受夠了以前當透明人的日子了……）",
            "mood": "身體後仰倚著沙發，滿面春風，眼神不停瞄著周圍同學的反應"
        },
        {
            "dialogue": "老同學一場我才跟你講真話，你那份工作再幹十年也是那樣，格局要放大點！只要你肯開口，我公司隨便一個主管位子給你，年薪直接幫你翻倍！",
            "innerThought": "（當年你在台上領獎，我只能在台下鼓掌……現在終於輪到我居高臨下俯視你了！）",
            "mood": "拍著你的肩膀，口氣像是提攜晚輩的長輩，帶著滿滿的施捨感"
        }
    ],
    openingDialogue: "哎呀老兄，你現在還在領死薪水啊？現在年薪沒兩三百萬怎麼在台北生活？要不要兄弟我帶你投資幾筆？包你賺翻！",
    openingStatement: "哎呀老兄，你現在還在領死薪水啊？現在年薪沒兩三百萬怎麼在台北生活？要不要兄弟我帶你投資幾筆？包你賺翻！",
    firstInnerThought: "（當年全班都瞧不起我，現在我終於有錢了，我要讓你們所有人都羨慕我、巴結我！）",
    captureRewardTitle: "【如沐春風】自在處世之冠",
    lore: "出身普通，靠著拼搏好不容易賺到了錢，但內心深處依然是那個自卑害怕被排擠的小男孩。"
  }
];

// 根據 ID 查詢關主
export function getBossById(id) {
  if (!id) return null;
  return BOSSES.find(b => b.id === id) || null;
}

// 根據道館分類查詢關主列表
export function getBossesByCategory(category) {
  if (!category) return BOSSES;
  return BOSSES.filter(b => b.category === category);
}

// 隨機獲取關主起手開場白（支援同一關主每次練習有不同的起頭第一句話與心情動態）
export function getBossOpening(boss) {
  if (!boss) return { dialogue: '……你找我？', innerThought: '（哼……）', mood: '緊繃防禦' };
  const pool = (Array.isArray(boss.openings) && boss.openings.length > 0)
    ? boss.openings
    : [
        {
          dialogue: boss.openingStatement || boss.openingDialogue || '……你找我？',
          innerThought: boss.firstInnerThought || '（哼，我倒要看看你今天打算怎麼說服我……）',
          mood: boss.initialMood || '緊繃戒備'
        }
      ];
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return {
    dialogue: chosen.dialogue || chosen.content || boss.openingStatement || boss.openingDialogue,
    innerThought: chosen.innerThought || boss.firstInnerThought,
    mood: chosen.mood || boss.initialMood
  };
}
