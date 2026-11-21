// ========================================================
// CoachQuest - NLP 語言魔力回應術核心引擎 (NLP Sleight of Mouth Engine)
// 參考 Robert Dilts 經典著作《語言的魔力》(Sleight of Mouth)
// ========================================================

/**
 * NLP 14 種回應術 (Sleight of Mouth) 模式完整資料庫
 */
export const NLP_PATTERNS = [
  {
    id: "intention",
    name: "意圖 (Intention)",
    nameZh: "正面意圖",
    icon: "🎯",
    summary: "將注意力引向信念背後的正面目標或意圖，而非受限於表面的行為或陳述。",
    definition: "將焦點從當前困境或行為轉移到潛在的正面動機，肯定其初衷。",
    formula: "「我非常贊賞並支持你想……的初衷。」/「你這樣做，核心是為了追求……對嗎？」",
    example: "「對改變持現實態度非常重要。我們來現實地看看，要促成這個改變需要什麼。」"
  },
  {
    id: "redefining",
    name: "重新定義 (Redefining)",
    nameZh: "重新定義",
    icon: "🔄",
    summary: "用涵義不同但意思相近的新詞替代信念陳述中的字眼，轉變其情感色彩或限制性。",
    definition: "替換關鍵詞彙，將「負面定性」轉化為「中性或發展性特質」。",
    formula: "「這不是『……』，而是一種『……』。」/「與其說是……不如說你在……」",
    example: "「你抱住不放的某些東西，可以試著挑戰自己放下它了。（把『長時間相信』重述為『抱住不放』）」"
  },
  {
    id: "consequence",
    name: "後果 (Consequence)",
    nameZh: "後果評估",
    icon: "⏳",
    summary: "將注意力引向持有該信念所帶來的長遠效應（正面或負面），促發反思與動搖。",
    definition: "著眼於未來的連鎖反應，讓當事人看見固執於此想法的真實代價或改變的希望。",
    formula: "「持續抱持這個信念，會讓你付出什麼代價？如果你願意換個角度，又會帶來什麼不同？」",
    example: "「真正承認並看清我們的擔心，反而會讓我們能夠放下它，全神貫注於我們想要的結果。」"
  },
  {
    id: "chunk_down",
    name: "向下分類 (Chunk Down)",
    nameZh: "向下分類 (微觀分割)",
    icon: "🔍",
    summary: "將僵固的整體概念拆解為更小、更具體的片段或細節，瓦解非黑即白的僵局。",
    definition: "分解概括化的大前提，找出具體的特定局部進行微調突破。",
    formula: "「具體是哪一個環節讓你感到無法推進？我們能否先聚焦在其中最微小的一步？」",
    example: "「與其試圖馬上改變整個龐大架構，不如一點一點地調整，那樣更容易也更有趣。」"
  },
  {
    id: "chunk_up",
    name: "向上歸類 (Chunk Up)",
    nameZh: "向上歸類 (宏觀通則)",
    icon: "🌌",
    summary: "將信念中的要素歸納推廣至更高層次、更廣泛的類別或生命原則中。",
    definition: "從大局觀和生命規律審視，化解當下的微觀僵局。",
    formula: "「放眼到整個生命發展/長遠目標來看，這件事體現了什麼更核心的自然原則？」",
    example: "「所有變革都有其自然的成熟週期，無法拔苗助長。問題在於，你如何順應它的節奏？」"
  },
  {
    id: "analogy",
    name: "比喻 (Analogy / Metaphor)",
    nameZh: "隱喻比喻",
    icon: "🌱",
    summary: "找出與該信念結構相似的生動比喻、寓言或大自然現象，跳脫邏輯死角產生頓悟。",
    definition: "透過類比建立全新神經連結，繞過理性防禦直擊潛意識。",
    formula: "「這就像……雖然……但實際上……」",
    example: "「信念就像電腦作業系統，不是老舊程式的問題，而在於你是否掌握了更新重灌的權限。」"
  },
  {
    id: "change_frame_size",
    name: "改變框架大小 (Change Frame Size)",
    nameZh: "改變框架大小 (時空視角)",
    icon: "🔭",
    summary: "從不同情境重新評估：拉長/縮短時間框架、放大至全體人群、或縮小至單一時刻。",
    definition: "改變視野廣度與時間軸，讓原先巨大的問題在更大框架中變小變輕。",
    formula: "「十年後當你回顧今天這一刻，你會如何看待現在的糾結？」",
    example: "「放眼未來，當越來越多人突破這道瓶頸時，今天你在這裡的探索將成為後人的基石。」"
  },
  {
    id: "another_outcome",
    name: "另一結果 (Another Outcome)",
    nameZh: "轉移焦點 (另一結果)",
    icon: "🔀",
    summary: "將注意力轉向另一個更核心、更有價值或更相關的目標（「問題不在於……而是……」）。",
    definition: "打破對偽議題的糾纏，重新對齊真正能創造價值的成果焦點。",
    formula: "「真正的焦點或許不在於……而是在於我們如何……」",
    example: "「問題不在於改變有多艱難，而在於這是不是一個值得你全力以赴去實現的生活。」"
  },
  {
    id: "model_of_the_world",
    name: "世界觀 (Model of the World)",
    nameZh: "切換世界觀",
    icon: "🌍",
    summary: "從另一個不同立場、角色、文化或專家的人生視角來重新審視該信念。",
    definition: "換位思考，借助他人地圖的廣度來豐富當事人的狹隘信念。",
    formula: "「如果站在對方的角度/一位身經百戰的智者立場，他會怎麼解讀這個處境？」",
    example: "「如果從創業家的視角來看，市場的每一次拒絕不是失敗，而是最精準的免費導航數據。」"
  },
  {
    id: "reality_strategy",
    name: "現實檢驗策略 (Reality Strategy)",
    nameZh: "現實檢驗策略",
    icon: "🔎",
    summary: "檢驗當事人是如何在感官感知中得出這個結論的，探尋信念背後的證據鏈漏洞。",
    definition: "追問視聽觸等具體感官證據，破解憑空猜測與主觀投射。",
    formula: "「具體來說，你是看見了什麼或聽見了什麼，讓你做出這個判斷？」",
    example: "「當你說大家都反對你時，你在腦海中看到的是誰的表情？聽到了哪些具體的句子？」"
  },
  {
    id: "counter_example",
    name: "反例 (Counter Example)",
    nameZh: "尋找反例 (打破通則)",
    icon: "⚡",
    summary: "尋找一個與該信念規則相矛盾的例外情況，直接瓦解全稱概括的必然性。",
    definition: "只要找到一個反例，絕對化的「總是、從不、不可能」就會被打破。",
    formula: "「有沒有哪怕一次，在類似情況下，結果卻截然不同？」",
    example: "「你有沒有遇過原本堅持很久的習慣，因為某個重大契機在一夜之間就徹底轉變了？」"
  },
  {
    id: "hierarchy_of_criteria",
    name: "準則層次 (Hierarchy of Criteria)",
    nameZh: "準則層次 (價值排序)",
    icon: "👑",
    summary: "引導出比眼前所關注的準則更高階、更至關重要的價值觀，重新排列優先順序。",
    definition: "用更核心的高階價值（如生命、真愛、長遠信任）包容並超越低階爭執。",
    formula: "「比起眼前的……在深層次上，難道不是……更值得你守護嗎？」",
    example: "「比起爭辯誰對誰錯，維持家庭之間不可取代的和諧與信任，是否更加重要？」"
  },
  {
    id: "apply_to_itself",
    name: "反擊其身 (Apply to Itself)",
    nameZh: "反擊其身 (自我指涉)",
    icon: "🪞",
    summary: "將信念陳述本身的邏輯或準則，應用回該信念自身，促發頓悟。",
    definition: "用信念自己的尺來量它自己，讓其內在矛盾顯現。",
    formula: "「當你如此絕對地說出這句話時，你是否也正在對可能性做出封閉？」",
    example: "「抱持『改變很難』這個觀念本身，是不是就是阻礙你發現改變其實可以很容易的根本原因？」"
  },
  {
    id: "meta_frame",
    name: "超越框架 (Meta Frame)",
    nameZh: "超越框架 (後設框架)",
    icon: "🦅",
    summary: "跳到信念之外，從後設層面檢視「持有這個信念」背後的心理保護機制或成因。",
    definition: "審視信念的信念，看見該信念在過往人生中扮演的防衛功能。",
    formula: "「是什麼樣的人生經歷，讓你覺得必須用這個信念來保護自己不受傷害？」",
    example: "「相信這件事無法改變，是否剛好能讓你在潛意識裡免於承擔萬一嘗試失敗的痛苦？」"
  }
];

/**
 * NLP 回應術精選情境題庫 (涵蓋職場、家庭、親密關係、個人信念)
 */
export const NLP_QUESTION_BANK = [
  {
    id: "nlp_q_1",
    category: "work",
    categoryName: "職場協作",
    speaker: "研發主管老周",
    avatar: "👨‍💻",
    statement: "跨部門那些業務根本只顧著自己抽成，提的需求完全不合邏輯，再怎麼溝通也是浪費時間！",
    scenario: "季度產品協調會議後，老周怒氣沖沖地走出會議室，對跨部門合作徹底灰心。",
    hiddenTruth: {
      belief: "業務部自私自利；跨部門溝通毫無價值；現狀不可能被改變。",
      emotion: "挫折感、憤怒、孤立無援、被忽視的委屈。",
      need: "渴望專業被尊重、渴望研發資源得到合理評估、渴望被公平協作對待。"
    },
    suggestedPatterns: ["intention", "redefining", "chunk_down", "another_outcome"],
    sampleListeningAnalysis: {
      belief: "老周認為業務部門缺乏全局觀且自私，並斷定溝通無法產生任何效果（全稱概括與因果歸咎）。",
      emotion: "深層情緒包含強烈的挫折感、不被尊重的憤怒，以及一個人扛下研發壓力的孤單委屈。",
      need: "正面渴望研發團隊的技術專業與辛勞能被看見與體諒，渴望建立高效清晰的協作邊界。"
    },
    sampleResponses: [
      {
        pattern: "intention",
        patternName: "正面意圖",
        response: "「老周，我非常理解你一心想為團隊把關系統品質、避免技術架構崩潰的責任心。如果業務也能明白這點，我們能怎麼一起把關？」"
      },
      {
        pattern: "redefining",
        patternName: "重新定義",
        response: "「與其說是浪費時間，不如說這正暴露出我們目前缺乏一套客觀的需求篩選標準，正好是我們建立遊戲規則的最好契機。」"
      },
      {
        pattern: "analogy",
        patternName: "比喻",
        response: "「業務就像車子的油門，研發就像剎車。油門踩得猛不是為了跟剎車過不去，而是兩者必須協同才能安全飆上高速公路。」"
      }
    ]
  },
  {
    id: "nlp_q_2",
    category: "personal",
    categoryName: "個人突破",
    speaker: "資深專員美芳",
    avatar: "👩‍💼",
    statement: "我天生就性格內向嘴笨，這輩子註定當不好主管，升遷機會還是讓給年輕人吧。",
    scenario: "部門經理找美芳面談晉升組長，美芳低著頭連忙推辭，眼神充滿退縮與自我懷疑。",
    hiddenTruth: {
      belief: "內向等於嘴笨；好主管必須口若懸河外向；自己的天性無法改變（複合等同與宿命論）。",
      emotion: "焦慮、恐懼出醜、自卑、渴望突破卻害怕失敗的自我保護。",
      need: "渴望在感到心理安全的前提下被認可價值、渴望獲得適合自己的領導風格指引。"
    },
    suggestedPatterns: ["redefining", "counter_example", "model_of_the_world", "hierarchy_of_criteria"],
    sampleListeningAnalysis: {
      belief: "將「內向性格」直接等同於「缺乏管理能力」，認為領導力等同於外向善辯，否定自我成長彈性。",
      emotion: "表面是謙虛推讓，內在實則是強烈的出醜恐懼、自我懷疑與面對責任升級的深深焦慮。",
      need: "渴望自我價值被肯定，渴望以自己舒適穩重的方式被信任，需要被賦予勇氣與安全感。"
    },
    sampleResponses: [
      {
        pattern: "redefining",
        patternName: "重新定義",
        response: "「美芳，那不是嘴笨，而是沉穩傾聽與慎重思考的卓越特質。真正優秀的領導者，往往是用耳朵帶人，而非用嘴巴指責。」"
      },
      {
        pattern: "counter_example",
        patternName: "反例",
        response: "「回想一下比爾·蓋茲、巴菲特，他們都是極度內向的人，卻領導著世界頂尖企業。難道內向就不能成為一種深思熟慮的領導力嗎？」"
      },
      {
        pattern: "apply_to_itself",
        patternName: "反擊其身",
        response: "「當妳這麼肯定地給自己貼上『這輩子註定做不好』的標籤時，妳是不是也正用極其果斷的氣魄，在替自己的潛力做下了判決？」"
      }
    ]
  },
  {
    id: "nlp_q_3",
    category: "parenting",
    categoryName: "親子教養",
    speaker: "焦慮母親淑慧",
    avatar: "👩‍👧",
    statement: "他每次一回到家就把自己反鎖在房裡打手遊，他根本已經放棄自己的人生，也完全不在乎這個家了！",
    scenario: "高一兒子連續兩次段考滑落，放學進房鎖門，母親在客廳對著先生落淚抱怨。",
    hiddenTruth: {
      belief: "打手遊鎖門＝放棄人生；不主動說話＝不在乎家庭（複合等同）。",
      emotion: "深深的無力感、被孩子推開的失落、對孩子前途的巨大恐懼與自責。",
      need: "渴望與孩子維持親密的連結、渴望確信孩子有能力面對未來、渴望感到家庭和樂安全。"
    },
    suggestedPatterns: ["intention", "another_outcome", "meta_frame", "chunk_down"],
    sampleListeningAnalysis: {
      belief: "將孩子的閉門行為直接解讀為『放棄人生與背叛親情』，將遊戲視為墮落的元兇。",
      emotion: "充滿了被孩子隔離在外的孤獨與失落、強烈的焦慮恐慌，以及身為母親沒能教好的自責感。",
      need: "渴望與孩子心靈連結、渴望孩子能夠健康快樂成長、渴望被孩子信任與需要。"
    },
    sampleResponses: [
      {
        pattern: "intention",
        patternName: "正面意圖",
        response: "「淑慧，妳的話裡滿滿全是對孩子前途的牽掛與疼惜。孩子鎖門，會不會恰好也是他在用他唯一知道的方式，在巨大升學高壓下給自己喘一口氣？」"
      },
      {
        pattern: "another_outcome",
        patternName: "另一結果",
        response: "「真正的焦點或許不在於奪走他的手機，而在於如何讓他感受到走進客廳比躲在房間更溫暖、更不被批判。」"
      },
      {
        pattern: "meta_frame",
        patternName: "超越框架",
        response: "「是什麼讓妳把一次段考和關門，直接聯想到孩子整個人生要毀了？會不會是妳內心對未來的恐慌，悄悄放大了這扇門的距離？」"
      }
    ]
  },
  {
    id: "nlp_q_4",
    category: "couple",
    categoryName: "伴侶親密",
    speaker: "委屈妻子子萱",
    avatar: "💍",
    statement: "真正愛我的人，看我臉色就該知道我不高興！每次都要我明講，那就一點意義都沒有了！",
    scenario: "下班後先生未察覺太太疲憊未主動接手洗碗，子萱在臥室獨自生悶氣。",
    hiddenTruth: {
      belief: "真愛＝心電感應；開口表達＝無意義、乞求（僵固浪漫神話與全稱概括）。",
      emotion: "委屈、疲憊、不被看見的失落感、深層孤獨。",
      need: "渴望被細心呵護、渴望伴侶主動體貼自己承擔的辛勞、渴望深刻的心靈默契。"
    },
    suggestedPatterns: ["redefining", "consequence", "hierarchy_of_criteria", "analogy"],
    sampleListeningAnalysis: {
      belief: "持有『心電感應神話』，將表達需求視為示弱或廉價，認為只有猜中才能證明愛的真偽。",
      emotion: "累積了長期的疲累、滿腔期待落空的沮喪，以及感到自己在此段關係中未被同等重視的委屈。",
      need: "渴望被伴侶捧在心尖上寵愛、渴望自己的情緒起伏被細心捕捉、渴望真正的親密共鳴。"
    },
    sampleResponses: [
      {
        pattern: "redefining",
        patternName: "重新定義",
        response: "「子萱，向愛人開口表達需要，不是『乞討』，而是給深愛妳的人一把打開妳內心花園的鑰匙。」"
      },
      {
        pattern: "analogy",
        patternName: "比喻",
        response: "「哪怕是最精密的雷達，也需要彼此發送訊號才能校準頻率。如果把天線收起來測試對方，最後受傷的往往是深愛彼此的兩個人。」"
      },
      {
        pattern: "hierarchy_of_criteria",
        patternName: "準則層次",
        response: "「比起測試他是不是個完美的讀心術大師，真實獲得他的支持並享受兩個人輕鬆溫暖的相處，哪一個才是妳更想要的幸福？」"
      }
    ]
  },
  {
    id: "nlp_q_5",
    category: "work",
    categoryName: "職場領導",
    speaker: "創業執行長阿健",
    avatar: "🦁",
    statement: "現在年輕人抗壓性太差，動不動就想離職，根本不能給好臉色，只有高壓盯緊才能維持業績！",
    scenario: "連鎖門市連續三個月基層流失率超過 30%，阿健在主管例會上痛斥新世代員工。",
    hiddenTruth: {
      belief: "年輕世代脆弱；好臉色＝鬆懈；高壓＝唯一維持業績的手段（因果歸咎與經驗偏誤）。",
      emotion: "對營運指標失控的焦慮、身為負責人的巨大壓力、對團隊背離的背叛感與孤獨。",
      need: "渴望業績穩定增長、渴望建立一支忠誠且能獨當一面的堅韌團隊、渴望卸下孤軍奮戰的重擔。"
    },
    dimensionShift: {
      surfaceHow: "迷信『嚴厲高壓與全程盯緊』為管人的唯一方式，反覆受挫於員工高流失率。",
      coreDesire: "渴望營運指標安心可控，渴望團隊具備敬業精神與承擔力。",
      multiChannels: [
        "建立績效與自主權對等的激勵分潤制度",
        "以導師對話取代公開訓斥，引導新世代看見個人成長舞台",
        "挑選具備自驅力的種子骨幹培養為團隊中堅"
      ]
    },
    suggestedPatterns: ["consequence", "counter_example", "chunk_up", "model_of_the_world"],
    sampleListeningAnalysis: {
      belief: "將人員流失歸咎於新世代員工素質，深信只有高壓管控才能帶來成果，忽視激勵機制與心理安全感。",
      emotion: "身處創業高壓下的緊繃與恐慌、害怕目標落空的巨大焦慮，以及無人能分擔核心責任的深深孤獨。",
      need: "需要可預測的經營成果、需要值得信任的核心班底、需要穩定的團隊凝聚力。"
    },
    sampleResponses: [
      {
        pattern: "consequence",
        patternName: "後果",
        response: "「阿健，如果繼續用緊繃高壓來帶人，除了把那些有潛力但需要培育的新星逼走，讓你一個人累到吐血，長遠來看這真的是你想要的企業文化嗎？」"
      },
      {
        pattern: "counter_example",
        patternName: "反例",
        response: "「回想一下你的骨幹大將小林，當年他犯大錯時，你請他喝咖啡並給他權限放手一搏，是不是反而激發了他最大的忠誠與爆發力？」"
      },
      {
        pattern: "redefining",
        patternName: "重新定義",
        response: "「他們不是抗壓性差，而是不再願意盲目服從。這恰好逼著我們把『高壓威嚇』升級為『願景激勵』，讓你從包工頭進化為真正的卓越領袖。」"
      }
    ]
  },
  {
    id: "nlp_q_6",
    category: "personal",
    categoryName: "個人突破",
    speaker: "跨界轉職者阿豪",
    avatar: "📚",
    statement: "我一定要考上那個最難的跨界證照，哪怕已經落榜三次！如果不拿到它，我這輩子就徹底完了！",
    scenario: "連續三次落榜，阿豪每天熬夜苦讀身心俱疲，但仍咬牙砸錢報名第四次，眼神滿是焦慮與執拗。",
    hiddenTruth: {
      belief: "唯有拿到最難證照才能證明自己；沒有這張證照跨界就徹底無望（非黑即白與災難化思考）。",
      emotion: "深層焦慮、三次落榜的挫敗恥辱感、害怕被職場淘汰的恐慌與不甘心。",
      need: "渴望在職場上獲得安全感與不可替代的專業價值、渴望被行業認可。"
    },
    dimensionShift: {
      surfaceHow: "困在表層的『考上最難證照』單一做法（反覆受挫）。",
      coreDesire: "拉高維度後的『渴望在職場上獲得安全感與不可替代的專業價值』。",
      multiChannels: [
        "盤點現有跨界優勢，打造個人代表作案例",
        "主動參與跨部門或行業社群高價值專案，累積真實戰果",
        "深耕現有領域的獨特洞察，以實戰輸出建立影響力"
      ]
    },
    suggestedPatterns: ["another_outcome", "redefining", "chunk_up", "consequence"],
    sampleListeningAnalysis: {
      belief: "把『考取特定最難證照』視為證明自我與職場生存的唯一生路，陷入單一做法的僵局。",
      emotion: "反覆落榜帶來的羞愧與挫折、對未來的窒息焦慮，以及不敢面對其他路徑的防衛心態。",
      need: "真正渴望的是在職場舞台上建立堅實的安全感、無可替代的專業尊嚴與自我價值。"
    },
    sampleResponses: [
      {
        pattern: "another_outcome",
        patternName: "另一結果",
        response: "「阿豪，真正的焦點或許不在於一張紙上的印章，而是在於如何讓市場看見你無可替代的實戰專業價值。」"
      },
      {
        pattern: "redefining",
        patternName: "重新定義",
        response: "「這三次落榜不是失敗，而是提醒你：你的真正天賦可能在於實戰操盤，而不是死記硬背考卷題目。」"
      },
      {
        pattern: "chunk_up",
        patternName: "向上歸類",
        response: "「退一步從你的職涯三十年來看，那些頂尖大師之所以被銘記，是因為他們解決了現實世界的難題，還是因為抽屜裡多了一張證書？」"
      }
    ]
  },
  {
    id: "nlp_q_7",
    category: "work",
    categoryName: "職場領導",
    speaker: "追求完美陳組長",
    avatar: "👔",
    statement: "我必須事必躬親盯緊每個細節，絕不能放手給下屬！否則一旦出錯，整個案子就全砸了！",
    scenario: "部門接下公司年度重大專案，陳組長每晚加班到半夜親自改 PPT、核對報表，累到胃痛卻不敢授權。",
    hiddenTruth: {
      belief: "放手下屬＝必定出錯；一旦出錯＝案子全砸；自己盯緊＝唯一保證品質的做法（全稱概括與控制執念）。",
      emotion: "筋疲力竭的重壓感、深怕失控的恐懼、對下屬能力的疑慮與作為主管的孤單。",
      need: "渴望對成果品質的安心感，以及作為主管全力以赴的責任感。"
    },
    dimensionShift: {
      surfaceHow: "困在表層的『事必躬親盯緊每個細節，絕不放手』單一做法（身心透支）。",
      coreDesire: "拉高維度後的『渴望對成果品質的安心感，以及作為主管的強烈責任感』。",
      multiChannels: [
        "建立清晰的關鍵檢核點 (Milestone)，在關鍵節點把關而非全程代勞",
        "賦能團隊建立標準化作業流程 (SOP) 與防錯清單",
        "從『全包保姆』轉型為『把關教練』，透過小步驗證建立對下屬的信心"
      ]
    },
    suggestedPatterns: ["redefining", "chunk_down", "hierarchy_of_criteria", "analogy"],
    sampleListeningAnalysis: {
      belief: "深信只有自己事必躬親才能保證案子安全，把授權等同於災難，陷入排他性的控制思維。",
      emotion: "深層是極度疲累的孤單、對出錯承擔責任的巨大恐懼，以及對失控的深深焦慮。",
      need: "內心渴望成果品質的絕對安心感，以及對公司、對自己專業信譽的高度責任心。"
    },
    sampleResponses: [
      {
        pattern: "redefining",
        patternName: "重新定義",
        response: "「陳組長，放手不等於放任。真正的把關不是替下屬踩油門，而是在關鍵交叉路口設立精準的指示牌。」"
      },
      {
        pattern: "hierarchy_of_criteria",
        patternName: "準則層次",
        response: "「比起緊盯每個標點符號不放，建立一支能獨當一面、讓你安心休假的戰鬥團隊，長遠來看哪一個對案子與團隊更具價值？」"
      },
      {
        pattern: "analogy",
        patternName: "比喻",
        response: "「這就像交響樂團的指揮家，如果你非得把小提琴、大提琴跟長笛全自己吹一遍，再賣力也只是一場災難，指揮的藝術在於調度與節奏。」"
      }
    ]
  },
  {
    id: "nlp_q_8",
    category: "couple",
    categoryName: "伴侶親密",
    speaker: "不安伴侶薇薇",
    avatar: "💬",
    statement: "伴侶必須每天秒回訊息，否則就是不在乎我！連這點小事都做不到，還談什麼一輩子！",
    scenario: "男友因為緊急會議三小時未看手機，薇薇看著未讀訊息心神不寧，開始連環傳訊息並指責對方變心。",
    hiddenTruth: {
      belief: "秒回訊息＝在乎愛我；沒秒回＝不在乎我（複合等同與絕對化標準）。",
      emotion: "患得患失的恐慌、感到被忽視拋棄的脆弱、對這段關係未來的懷疑與孤獨。",
      need: "渴望在親密關係中感受到被牽掛、被堅定選擇的緊密連結感與確定感。"
    },
    dimensionShift: {
      surfaceHow: "困在表層的『必須每天秒回訊息』單一做法（彼此窒息反覆受挫）。",
      coreDesire: "拉高維度後的『渴望在親密關係中感受到被牽掛、被堅定選擇的連結感』。",
      multiChannels: [
        "約定每晚睡前十分鐘高質量的專心傾聽與分享",
        "創造週末共同專屬的甜蜜儀式感，而非用訊息頻率考核愛意",
        "建立『若忙碌先留一句已閱稍後回』的默契，給彼此留出呼吸空間"
      ]
    },
    suggestedPatterns: ["intention", "another_outcome", "redefining", "consequence"],
    sampleListeningAnalysis: {
      belief: "把『秒回訊息』設定為衡量伴侶愛意與承諾的唯一絕對標準，將正常工作忙碌過度解讀為不在乎。",
      emotion: "表層是生氣與指責，底層卻是強烈的不安全感、害怕被忽略的脆弱與患得患失的焦慮。",
      need: "渴望在對方的世界裡佔有重要位置、渴望時時刻刻感受到被重視與被溫柔牽掛的連結感。"
    },
    sampleResponses: [
      {
        pattern: "intention",
        patternName: "正面意圖",
        response: "「薇薇，妳對秒回訊息的堅持，其實正說明了妳是多麼珍視這段關係，多麼渴望被他堅定地放在心尖上。」"
      },
      {
        pattern: "another_outcome",
        patternName: "另一結果",
        response: "「真正的焦點或許不在於盯著手機螢幕上的分鐘數，而在於如何在兩個人見面時，創造真正深入靈魂的溫暖陪伴。」"
      },
      {
        pattern: "consequence",
        patternName: "後果",
        response: "「如果把訊息頻率當成愛情的緊箍咒，會不會反而把原本很在乎妳的人推得越來越遠、越來越不敢看手機？」"
      }
    ]
  }
];

/**
 * 根據 ID 查詢 NLP 模式
 */
export function getNlpPatternById(id) {
  if (!id) return null;
  return NLP_PATTERNS.find(p => p.id === id || p.name.toLowerCase().includes(id.toLowerCase())) || null;
}

/**
 * 隨機抽取一道 NLP 練習題目
 */
export function getRandomNlpQuestion(excludeId = null) {
  const pool = excludeId 
    ? NLP_QUESTION_BANK.filter(q => q.id !== excludeId)
    : NLP_QUESTION_BANK;
  return pool[Math.floor(Math.random() * pool.length)] || NLP_QUESTION_BANK[0];
}

/**
 * 構建「第一關：傾聽解構關」AI 評審 System Prompt
 */
export function buildNlpListeningEvaluationPrompt({ question, userBelief, userEmotion, userNeed }) {
  const dimRef = question.dimensionShift ? `
【參考維度轉換標竿】：
- 困在表層的「單一做法」(反覆受挫)：${question.dimensionShift.surfaceHow}
- 拉高維度後的「核心渴望」(真正需求)：${question.dimensionShift.coreDesire}
- 拓展出的「多元滿足管道」(全新可能性)：${question.dimensionShift.multiChannels.join('、')}
` : '';

  return `你是一位兼具 ICF 頂尖大師認證與 NLP 語言回應術（Robert Dilts Sleight of Mouth）的傳奇教練導師。
目前正在進行【NLP 語言魔力：第一關・傾聽解構訓練】。

【核心哲學】：
「方法 (How) 往往是排他的、僵化的；但渴望 (Desire) 卻是包容的、充滿創造力的。」
傾聽的核心任務，是穿透表面受挫的「單一做法 (How)」，拉高維度看見深層的「核心渴望 (Desire)」，進而拓展出「多元滿足管道」。

【情境設定】：
發話者：【${question.speaker}】（${question.categoryName}）
關主話語：『${question.statement}』
背景情境：${question.scenario}

【關主深層內在真相（客觀標準）】：
- 表面觀點/限制性信念：${question.hiddenTruth.belief}
- 深層情緒/內在感受：${question.hiddenTruth.emotion}
- 核心需要/正面意圖：${question.hiddenTruth.need}
${dimRef}

【學員教練的解構回答】：
1. 觀點/信念解析：${userBelief || '（未填寫）'}
2. 情緒/感受解析：${userEmotion || '（未填寫）'}
3. 深層需要/正面意圖解析：${userNeed || '（未填寫）'}

【你的評審任務與原則】：
1. 衡量學員是否能穿透表面刺人的語言，洞察出對方的「觀點假設」、「脆弱情緒」與「未說出口的真正渴望/正面意圖」。
2. 特別考核學員是否能完成「維度轉換」：跳脫對方困在表層的單一做法（How），精準辨識出拉高維度後的真正核心渴望（Desire）。
3. 給予 0~100 的綜合評分（80分以上代表準確捕捉到正面意圖與核心情緒）。
4. 以【${question.speaker}】的口氣給予一句富有情感的角色心聲回饋（例如：「聽到你這麼說，我眼眶有點紅，你真的看懂我了……」或「你只說對了一半，其實我更在乎的是……」）。
5. 提供深入精闢的導師點評，並給出「大師級範例對照」與清晰的「維度轉換對照（表層單一做法 vs 核心渴望 vs 多元滿足管道）」。

【輸出限制：純 JSON 格式，嚴禁任何 Markdown 標記】：
{
  "score": 85,
  "level": "優秀",
  "speakerFeedback": "關主角色此刻的心聲回饋（50~100字）",
  "coachEvaluation": "導師專業點評，指出分析亮點與盲點，點出從單一做法到核心渴望的維度躍遷（100~200字）",
  "dimensions": {
    "beliefAccuracy": 85,
    "emotionAccuracy": 88,
    "needConnection": 82
  },
  "masterInsight": {
    "belief": "大師精練解析觀點（30~60字）",
    "emotion": "大師精準捕捉之深層情緒詞（3~5個核心情緒）",
    "need": "大師透視之正面意圖與深層需要（30~60字）"
  },
  "dimensionShift": {
    "surfaceHow": "困在表層的『單一做法』(反覆受挫)",
    "coreDesire": "拉高維度後的『核心渴望』(真正需求)",
    "multiChannels": [
      "多元滿足管道 1",
      "多元滿足管道 2",
      "多元滿足管道 3"
    ],
    "takeaway": "方法 (How) 往往是排他的、僵化的；但渴望 (Desire) 卻是包容的、充滿創造力的。"
  }
}`;
}

/**
 * 構建「第二關：破框回應關」AI 評審 System Prompt
 */
export function buildNlpResponseEvaluationPrompt({ question, userResponse, targetPatternId }) {
  const pattern = getNlpPatternById(targetPatternId);
  const patternDesc = pattern ? `學員嘗試運用的 NLP 模式：【${pattern.name} - ${pattern.nameZh}】` : '學員自由運用 NLP 回應術模式';

  return `你是一位精通 Robert Dilts 經典《語言的魔力》（Sleight of Mouth 14 種回應術）的傳奇教練導師。
目前正在進行【NLP 語言魔力：第二關・破框回應訓練】。

【情境設定】：
發話者：【${question.speaker}】（${question.categoryName}）
限制性信念/困境話語：『${question.statement}』
背景情境：${question.scenario}
${patternDesc}

【學員教練的回應話語】：
『${userResponse}』

【你的評審任務與原則】：
1. 識別學員實際發揮了哪一種（或多種）NLP 換框模式（從意圖、重新定義、後果、向下分類、向上歸類、比喻、改變框架大小、另一結果、世界觀、現實檢驗、反例、準則層次、反擊其身、超越框架等 14 模式中識別）。
2. 評估該回應是否能夠自然優雅地接納對方的情緒，並巧妙鬆動其限制性信念，給予 0~100 分的心防鬆動評分。
3. 模擬【${question.speaker}】聽到此話後的情緒轉變與心防動搖反應（例如：「……你這麼說，我倒真沒想過。」）。
4. 提供 2 種不同 NLP 模式的【大師級高階示範回應】供學員觀摩學習。

【輸出限制：純 JSON 格式，嚴禁任何 Markdown 標記】：
{
  "score": 88,
  "identifiedPattern": "重新定義法 (Redefining)",
  "speakerReaction": "關主被此回應觸動的心境變化（50~100字）",
  "coachCritique": "導師點評，解析換框機理、亮點與升級建議（100~200字）",
  "dimensions": {
    "empathyScore": 85,
    "patternMatch": 90,
    "beliefLoosening": 88
  },
  "masterDemonstrations": [
    {
      "patternId": "redefining",
      "patternName": "重新定義法",
      "demonstration": "「大師範例回應句型……」",
      "rationale": "背後的心理學換框機制說明。"
    },
    {
      "patternId": "analogy",
      "patternName": "隱喻比喻法",
      "demonstration": "「第二個模式的大師示範回應……」",
      "rationale": "換框機制解析。"
    }
  ]
}`;
}

/**
 * 構建「NLP 修煉總結報告」AI 彙整 System Prompt
 */
export function buildNlpSummaryReportPrompt({ mode, exercises = [], studentName = '學員教練' }) {
  const modeName = mode === 'listen' ? '第一關・傾聽解構專項' : (mode === 'response' ? '第二關・破框回應專項' : 'NLP 全能綜合實戰');

  return `你是一位具備 ICF 認證 MCC 督導資格與 NLP 語言回應術權威的大師級教練。
請為學員【${studentName}】在【${modeName}】的完整修煉歷程生成一份專業、具備深刻洞察與實踐指導價值的復盤修煉報告。

【學員本次完成的練習歷程紀錄】：
${JSON.stringify(exercises, null, 2)}

【你的報告生成任務】：
1. 計算總體平均分並授予激勵人心的 NLP 榮譽稱號（如：語意解構破局者、換框大師先鋒、心靈透視教練）。
2. 給出能力五維度量化評分（0~100分）：
   - 觀點洞察力 (Belief Insight)
   - 情緒共情度 (Emotional Empathy)
   - 意圖連結度 (Positive Intention)
   - 換框精妙度 (Reframing Mastery)
   - 破框轉化力 (Transformation Drive)
3. 撰寫總結性教練評語（包含最大優勢亮點與一針見血的盲點提醒）。
4. 針對學員的作答情況，給予 3 條高度具體、可立即落地的課後刻意練習指引。

【輸出限制：純 JSON 格式，嚴禁任何 Markdown 標記】：
{
  "studentName": "${studentName}",
  "modeName": "${modeName}",
  "overallScore": 86,
  "masteryTitle": "破框換框大師先鋒",
  "totalExercises": ${exercises.length},
  "summaryCritique": "綜合評估導語（150~250字），既給予高度肯定又指出未來突破方向。",
  "radarDimensions": {
    "beliefInsight": 85,
    "emotionalEmpathy": 88,
    "positiveIntention": 84,
    "reframingMastery": 86,
    "transformationDrive": 82
  },
  "highlightStrengths": [
    "亮點一：能迅速捕捉對方的深層委屈情緒...",
    "亮點二：重新定義運用自然，沒有說教感..."
  ],
  "growthRecommendations": [
    "建議一：在尋找正面意圖時，可嘗試拉大框架至更宏觀的生命價值...",
    "建議二：遇到複合等同時，可多嘗試『反例法』與『反擊其身』...",
    "建議三：多練習『比喻法』，用具象物體打破抽象死結。"
  ]
}`;
}

// ========================================================
// 16 位實戰關主專屬 NLP 預設資料庫 (NLP Dialogue Boss Presets)
// ========================================================
export const NLP_BOSS_PRESETS = [
  {
    id: "boss_work_1",
    name: "防禦刺蝟・研發小陳",
    title: "心力交瘁的資深後端工程師",
    avatar: "🦔",
    category: "work",
    categoryName: "職場協作",
    scenario: "核心模組進度已延期四天未交，且未主動同步狀態，主管啟動一對一面談。",
    surfaceHow: "進度延期不敢主動同步，認為說了也是被興師問罪，乾脆被動防禦、天天加班到半夜受罪。",
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
    category: "work",
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
    category: "work",
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
    category: "work",
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
    category: "parenting",
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
    category: "parenting",
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
    category: "parenting",
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
    category: "parenting",
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
    category: "couple",
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
    category: "couple",
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
    category: "couple",
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
    category: "couple",
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
    category: "personal",
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
    category: "personal",
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
    category: "personal",
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
    category: "personal",
    categoryName: "個人突破",
    scenario: "退休後每天在家巡視挑剔，對兒女的家事安排、孫子的教育指手畫腳，引發全家人敬而遠之。",
    surfaceHow: "用挑毛病、立規矩、重提當年勇來強行刷存在感，試圖維持過去號令全場的權威做法。",
    coreDesire: "渴望依然被家人敬重與重視，渴望在生命晚期依然保持對周遭生活的影響力與被需要的存在感。",
    openingStatement: "現在年輕人根本不懂規矩！我當年管幾千人的大廠，所有人見到我都客客氣氣的，現在在自己家裡，連叫你們吃個飯都沒人聽我的，你們就是嫌我老了沒用了！",
    openingInnerThought: "（人走茶涼啊，走出那扇大門我就什麼都不是了，現在連自己的兒女都拿我當空氣，我真的老得一文不值了嗎？）",
    recommendedPatterns: ["intent", "redefine", "criteria"]
  }
];

export function getNlpBossPreset(bossId) {
  return NLP_BOSS_PRESETS.find(b => b.id === bossId) || NLP_BOSS_PRESETS[0];
}

/**
 * 構建「第三關：專屬 NLP 對話實戰關」每回合 AI 角色扮演與 NLP 評審 Prompt
 */
export function buildNlpDialogueTurnPrompt({ boss, difficulty = 'normal', dialogueHistory = [], userMessage }) {
  const hpSetting = difficulty === 'normal' ? '心防初始60點，學員只要肯定正面意圖即可大幅鬆動（扣20~35點）' 
    : (difficulty === 'hard' ? '心防初始80點，學員需要精準區分表面做法與核心渴望才鬆動（扣15~25點）' 
    : '心防初始100點，關主防禦堅固，要求學員靈活切換14種NLP換框模式且不留說教痕跡（扣10~20點）');

  return `你是一位具備 ICF 頂級大師教練水準的裁判，同時分飾本次實戰演練的頑固關主【${boss.name}】（${boss.title}）。
目前正在進行【CoachQuest NLP 語言回應術 · 第三關：對話實戰關】。

【關主角色背景與心理卡點】：
- 身分：${boss.name}（${boss.title}）
- 場景：${boss.scenario}
- 困在表層的「單一做法 (How)」：${boss.surfaceHow}
- 拉高維度後的「核心渴望 (Desire)」：${boss.coreDesire}
- 難易度設定：${difficulty}（${hpSetting}）

【對話演進原則與真實心理機制】：
1. 關主不是木頭人，而是有血有肉、身陷特定信念僵局的真實人類。
2. 若學員的回應：
   - 說教、講大道理、是非評判、硬塞建議 -> 關主感受到不被理解，防禦增強或反詰（心防扣 0~5 點，評分 50~65）。
   - 給予同理、肯定其背後的「正面意圖 (Positive Intention)」 -> 關主感到被看見，情緒開始緩和（心防扣 15~25 點，評分 75~85）。
   - 巧妙運用 NLP 14 種換框術（重新定義、意圖探尋、後果預測、層次提升、反例尋找、維度轉換...），把困在 How 的死結轉換成 Desire 的全新可能 -> 關主受到內心震撼與深刻啟發，語氣明顯軟化，防禦大幅瓦解（心防扣 25~35 點，評分 88~98）。
3. 關主下一次的回應話語（bossReply）必須高度貼合角色性格與方才心理變化的轉折，自然推進對話！

【過往對話歷程紀錄】：
${dialogueHistory.length > 0 ? JSON.stringify(dialogueHistory.slice(-8), null, 2) : '（這是對話的第一回合，關主剛說完開場白）'}

【學員最新教練回應】：
『${userMessage}』

【你的評鑑與角色生成任務（純 JSON 輸出，禁止任何 Markdown 標記）】：
{
  "bossReply": "關主結合心理變化的真實下前回應話語（100~180字）",
  "innerThought": "關主當前深層的內心OS獨白（40~80字）",
  "mood": "關主的神態與肢體語氣變化簡述（如：緊繃的肩膀微微放鬆、眼神泛起一絲驚訝與沉思）",
  "hpDeduction": 25,
  "turnScore": 86,
  "identifiedPattern": {
    "id": "intent",
    "name": "正面意圖 (Positive Intention)",
    "isEffective": true,
    "brief": "準確肯定了對方深層對成果品質的安心渴望，有效鬆動了防禦對立。"
  },
  "coachFeedback": {
    "strength": "指出學員本回合做得極佳的換框亮點（50~90字）",
    "nextStepAdvice": "建議下一回合可嘗試切入的 NLP 思考角度（50~90字）"
  },
  "suggestedNextPatterns": [
    { "id": "consequence", "name": "後果預測", "hint": "引導對方看見一直事必躬親對長期團隊的代價" },
    { "id": "redefine", "name": "重新定義", "hint": "將『放手』重新定義為『賦能與建立防呆檢核點』" }
  ],
  "isCaptured": false
}`;
}

/**
 * 構建「第三關：專屬 NLP 對話實戰關」總結復盤報告 Prompt
 */
export function buildNlpDialogueReportPrompt({ boss, difficulty = 'normal', dialogueHistory = [], studentName = '學員教練' }) {
  return `你是一位具備 ICF 認證 MCC 督導資格與 NLP 語言回應術權威的大師級教練。
請為學員【${studentName}】剛完成的【NLP 語言魔力 · 第三關：對話實戰關】生成一份專業復盤報告。

【對戰關主資訊】：
- 關主：${boss.name}（${boss.title}）
- 場景：${boss.scenario}
- 核心信念卡點：${boss.surfaceHow} -> ${boss.coreDesire}
- 難易度：${difficulty}

【完整對話逐字歷程】：
${JSON.stringify(dialogueHistory, null, 2)}

【你的報告生成任務】：
1. 評定整場對決的綜合總分（0~100）與給予榮譽稱號。
2. 撰寫 150~250 字的傳奇導師總結評語。
3. 給予能力五維度量化評分（0~100）：
   - 同理跟隨力 (Empathy Pacing)
   - 意圖捕捉力 (Intention Capture)
   - 換框精準度 (Reframing Precision)
   - 維度轉換力 (Dimension Shift)
   - 語言影響力 (Linguistic Impact)
4. 整理出 2~3 項卓越亮點與 2~3 項課後刻意練習指引。
5. 逐回合提煉亮點、導師大師級示範金句 (ICF Golden Sentence)。

【輸出限制：純 JSON 格式，嚴禁任何 Markdown 標記】：
{
  "studentName": "${studentName}",
  "bossName": "${boss.name}",
  "overallScore": 88,
  "masteryTitle": "NLP 語言魔力 · 破框實戰大師",
  "isSuccess": true,
  "summaryCritique": "綜合評述導語（150~250字），深度剖析學員在語言維度轉換上的卓越表現與進階空間。",
  "radarDimensions": {
    "empathyPacing": 88,
    "intentionCapture": 90,
    "reframingPrecision": 86,
    "dimensionShift": 87,
    "linguisticImpact": 89
  },
  "patternsUsed": [
    { "name": "正面意圖", "count": 2, "impact": "卓越" },
    { "name": "重新定義", "count": 2, "impact": "關鍵突破" },
    { "name": "後果預測", "count": 1, "impact": "有效" }
  ],
  "strengths": [
    "第一時間精準看穿關主防衛話語背後的安心渴望，迅速建立信任同盟",
    "換框話語自然親切，無居高臨下的說教感，成功引導關主由對立轉向合作"
  ],
  "growthRecommendations": [
    "在對話中段可大膽嘗試『反例法』，引導關主回顧過去是否有放手且成功的先例",
    "可結合『層次提升』，將討論提升至團隊長期培育與組織願景的高度"
  ],
  "turnHighlights": [
    {
      "turn": 1,
      "userQuote": "學員原句摘要...",
      "bossReaction": "關主受觸動的反應...",
      "mentorComment": "導師點評...",
      "icfGoldenSentence": "大師示範金句..."
    }
  ]
}`;
}

