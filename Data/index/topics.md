---
# 主題索引的主題清單：跨時間軸反覆出現的事件或概念。
# 每個主題一筆：
#   name      顯示名稱
#   group     主題分類，索引頁用來篩選
#   terms     在事件標題與內文比對的詞（含其中任何一個就算提到）
#   notTerms  選填：含有這些詞、但指的不是此主題的較長詞，例如「天花板」之於「天花」
#   timeline  選填：專門講這個主題的時間軸 id，索引中會附上連結，它自己的事件不再重複列出
#   note      一句話說明
topics:
  # 疫病與災害
  - name: 黑死病
    group: 疫病與災害
    terms: [黑死病, 鼠疫, 查士丁尼瘟疫, 查士丁尼大瘟疫]
    notTerms: [《鼠疫》]
    note: 1347 年起席捲歐亞的鼠疫大流行，歐洲死去約三分之一人口
  - name: 天花
    group: 疫病與災害
    terms: [天花, 牛痘]
    notTerms: [天花板]
    note: 隨哥倫布大交換摧毀美洲原住民社會，也是第一個靠疫苗根除的疾病
  - name: 霍亂
    group: 疫病與災害
    terms: [霍亂]
    note: 十九世紀隨貿易與都市化反覆爆發，催生了近代公共衛生
  - name: 1918 年大流感
    group: 疫病與災害
    terms: [西班牙流感, 大流感]
    note: 第一次世界大戰末期的流感大流行，死亡人數超過大戰戰死者
  - name: 新冠疫情
    group: 疫病與災害
    terms: [新冠, COVID]
    note: 2020 年起的全球大流行

  # 科技與發明
  - name: 印刷術
    group: 科技與發明
    terms: [印刷術, 活字, 古騰堡, 印刷革命]
    note: 古騰堡活字印刷讓書籍與小冊大量流通，為宗教改革與科學革命鋪路
  - name: 蒸汽機
    group: 科技與發明
    terms: [蒸汽機]
    note: 瓦特改良後成為工業革命的動力來源
  - name: 鐵路
    group: 科技與發明
    terms: [鐵路, 火車, 蒸汽機車]
    note: 改變了距離、時間與市場的尺度
  - name: 電報
    group: 科技與發明
    terms: [電報]
    note: 第一種即時遠距通訊，金融、新聞與外交從此加速
  - name: 原子彈與核武
    group: 科技與發明
    terms: [原子彈, 核武, 曼哈頓計畫]
    note: 1945 年投下廣島、長崎，此後主宰冷戰的嚇阻戰略
  - name: 網際網路
    group: 科技與發明
    terms: [網際網路, 全球資訊網, ARPANET, 阿帕網, 網路泡沫, 瀏覽器]
    note: 從冷戰時期的軍事研究網路，發展成全球的資訊基礎設施
  - name: 半導體
    group: 科技與發明
    terms: [半導體, 晶片, 電晶體, 積體電路, 晶圓]
    note: 電晶體與積體電路是電腦、手機與人工智慧的基礎
  - name: 人工智慧
    group: 科技與發明
    terms: [人工智慧, 深度學習, 神經網路, AlphaGo, ChatGPT, 生成式AI]
    timeline: AI
    note: 從 1950 年代的符號推理到今天的大型語言模型

  # 經濟與金融
  - name: 東印度公司
    group: 經濟與金融
    terms: [東印度公司]
    note: 英國與荷蘭的特許貿易公司，近代股份公司與殖民帝國的起點
  - name: 鬱金香狂熱
    group: 經濟與金融
    terms: [鬱金香]
    note: 1637 年荷蘭的鬱金香球根投機泡沫
  - name: 南海泡沫
    group: 經濟與金融
    terms: [南海泡沫, 南海公司]
    note: 1720 年英國的股票投機泡沫，韓德爾也曾持有南海公司股票
  - name: 金本位
    group: 經濟與金融
    terms: [金本位]
    note: 以黃金為貨幣基礎的國際貨幣制度，在大蕭條中崩解
  - name: 大蕭條
    group: 經濟與金融
    terms: [大蕭條, 黑色星期四, 華爾街股災]
    note: 1929 年股災引發的全球經濟崩潰

  # 思想與文化
  - name: 文藝復興
    group: 思想與文化
    terms: [文藝復興]
    timeline: Renaissance
    note: 十四至十六世紀從義大利開始的古典學術與藝術復興
  - name: 宗教改革
    group: 思想與文化
    terms: [宗教改革, 九十五條論綱, 贖罪券]
    note: 1517 年路德發表《九十五條論綱》，西方基督教分裂
  - name: 科學革命
    group: 思想與文化
    terms: [科學革命, 日心說, 地動說]
    note: 十六、十七世紀從哥白尼到牛頓，近代科學方法成形
  - name: 啟蒙運動
    group: 思想與文化
    terms: [啟蒙運動, 啟蒙時代, 百科全書]
    note: 十八世紀以理性批判傳統權威的思想運動
  - name: 浪漫主義
    group: 思想與文化
    terms: [浪漫主義]
    note: 十八世紀末起重視情感與個人的文藝思潮
  - name: 共產主義
    group: 思想與文化
    terms: [共產主義, 共產黨, 馬克思主義]
    note: 從 1848 年《共產黨宣言》到二十世紀的社會主義國家

  # 政治與戰爭
  - name: 絲路
    group: 政治與戰爭
    terms: [絲路, 絲綢之路]
    note: 連結中國與地中海的陸上貿易路線
  - name: 十字軍
    group: 政治與戰爭
    terms: [十字軍]
    timeline: Crusades
    note: 1096 年起西歐對地中海東岸的宗教戰爭
  - name: 大航海時代
    group: 政治與戰爭
    terms: [大航海, 地理大發現, 哥倫布, 麥哲倫, 達伽馬]
    timeline: AgeOfDiscovery
    note: 十五世紀末起歐洲人航向美洲、非洲與亞洲
  - name: 殖民與奴隸貿易
    group: 政治與戰爭
    terms: [殖民, 奴隸貿易, 黑奴, 奴隸制]
    note: 歐洲列強的海外殖民，以及跨大西洋的奴隸貿易
  - name: 三十年戰爭
    group: 政治與戰爭
    terms: [三十年戰爭, 西發里亞]
    note: 1618–1648 年由宗教衝突擴大成的歐洲大戰
  - name: 工業革命
    group: 政治與戰爭
    terms: [工業革命]
    timeline: IndustrialRevolution
    note: 十八世紀後半從英國開始的生產方式變革
  - name: 美國獨立
    group: 政治與戰爭
    terms: [美國獨立, 獨立宣言, 美國革命]
    note: 1776 年北美十三州宣布脫離英國
  - name: 法國大革命
    group: 政治與戰爭
    terms: [法國大革命, 巴士底, 恐怖統治]
    timeline: FrenchRevolution
    note: 1789 年推翻舊制度，影響整個十九世紀的歐洲
  - name: 拿破崙戰爭
    group: 政治與戰爭
    terms: [拿破崙戰爭, 滑鐵盧, 奧斯特利茨, 維也納會議]
    timeline: NapoleonicWars
    note: 1803–1815 年拿破崙與反法同盟的戰爭，以維也納會議重整歐洲秩序
  - name: 鴉片戰爭
    group: 政治與戰爭
    terms: [鴉片戰爭]
    note: 1840 年英國對清朝的戰爭，東亞門戶被迫開放
  - name: 第一次世界大戰
    group: 政治與戰爭
    terms: [第一次世界大戰, 一次大戰, 一戰]
    notTerms: [統一戰爭, 皮德納一戰]
    note: 1914–1918 年的總體戰
  - name: 第二次世界大戰
    group: 政治與戰爭
    terms: [第二次世界大戰, 二次大戰, 二戰]
    note: 1939–1945 年的全球戰爭
  - name: 冷戰
    group: 政治與戰爭
    terms: [冷戰, 鐵幕, 柏林圍牆, 柏林牆, 蘇聯解體]
    notTerms: [正在冷戰]
    note: 1947–1991 年美蘇兩大陣營的對峙
---
