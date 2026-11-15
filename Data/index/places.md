---
# 地圖檢視（#p=map）的地名對照表：把時期與事件標題裡「@」後面的地點對到經緯度。
# 每個地點一筆：
#   name     顯示名稱
#   aliases  選填：其他寫法（外文、舊譯名）。「@」後面的文字只要含有 name 或任何一個 alias 就算這個地點，
#            同時符合多個時取最長的那個詞（所以「聖彼得堡」不會被「彼得堡」搶走）
#   lat      緯度（北緯為正）
#   lon      經度（東經為正）
# 座標只需要到城市等級（小數兩位）。村莊或已併入大城市的舊地名，用它實際的位置。
places:
  # 德國
  - { name: 萊比錫, aliases: [Leipzig], lat: 51.34, lon: 12.37 }
  - { name: 柏林, aliases: [Berlin], lat: 52.52, lon: 13.40 }
  - { name: 舍訥貝格, aliases: [Schöneberg], lat: 52.48, lon: 13.35 }
  - { name: 漢堡, aliases: [Hamburg], lat: 53.55, lon: 9.99 }
  - { name: 呂貝克, aliases: [Lübeck], lat: 53.87, lon: 10.69 }
  - { name: 德勒斯登, aliases: [Dresden], lat: 51.05, lon: 13.74 }
  - { name: 威瑪, aliases: [Weimar], lat: 50.98, lon: 11.33 }
  - { name: 埃森納赫, aliases: [Eisenach, 艾森納赫], lat: 50.97, lon: 10.32 }
  - { name: 奧德魯夫, aliases: [Ohrdruf], lat: 50.83, lon: 10.73 }
  - { name: 阿恩施塔特, aliases: [Arnstadt], lat: 50.83, lon: 10.95 }
  - { name: 哈雷, aliases: [Halle], lat: 51.48, lon: 11.97 }
  - { name: 茲威考, aliases: [Zwickau], lat: 50.72, lon: 12.49 }
  - { name: 波昂, aliases: [Bonn], lat: 50.73, lon: 7.10 }
  - { name: 恩德尼希, aliases: [Endenich], lat: 50.72, lon: 7.07 }
  - { name: 杜塞道夫, aliases: [Düsseldorf], lat: 51.23, lon: 6.78 }
  - { name: 慕尼黑, aliases: [München, Munich], lat: 48.14, lon: 11.58 }
  - { name: 加米施, aliases: [Garmisch], lat: 47.49, lon: 11.10 }
  - { name: 拜魯特, aliases: [Bayreuth, 拜羅伊特, 拜雷特], lat: 49.95, lon: 11.58 }
  - { name: 海德堡, aliases: [Heidelberg], lat: 49.40, lon: 8.67 }
  - { name: 埃伯施泰因堡, aliases: [Ebersteinburg], lat: 48.78, lon: 8.27 }
  - { name: 科隆, aliases: [Köln, Cologne], lat: 50.94, lon: 6.96 }
  - { name: 阿沙芬堡, aliases: [Aschaffenburg], lat: 49.98, lon: 9.15 }
  - { name: 米爾滕貝格, aliases: [Miltenberg], lat: 49.70, lon: 9.26 }
  - { name: 巴特梅根特海姆, aliases: [Bad Mergentheim, 梅根特海姆], lat: 49.49, lon: 9.77 }
  - { name: 紐倫堡, aliases: [Nürnberg, Nuremberg], lat: 49.45, lon: 11.08 }
  - { name: 奧格斯堡, aliases: [Augsburg], lat: 48.37, lon: 10.90 }
  - { name: 路德維希堡, aliases: [Ludwigsburg], lat: 48.90, lon: 9.19 }
  - { name: 施韋青根, aliases: [Schwetzingen], lat: 49.38, lon: 8.57 }
  - { name: 曼海姆, aliases: [Mannheim], lat: 49.49, lon: 8.47 }
  - { name: 美因茲, aliases: [Mainz], lat: 50.00, lon: 8.27 }
  - { name: 法蘭克福, aliases: [Frankfurt], lat: 50.11, lon: 8.68 }
  - { name: 科布倫茲, aliases: [Koblenz], lat: 50.36, lon: 7.59 }
  - { name: 亞琛, aliases: [Aachen], lat: 50.78, lon: 6.08 }
  - { name: 多瑙艾辛根, aliases: [Donaueschingen], lat: 47.95, lon: 8.50 }
  - { name: 帕紹, aliases: [Passau], lat: 48.57, lon: 13.46 }
  - { name: 波茨坦, aliases: [Potsdam], lat: 52.40, lon: 13.07 }
  - { name: 漢諾威, aliases: [Hannover], lat: 52.37, lon: 9.73 }
  - { name: 哥廷根, aliases: [Göttingen], lat: 51.53, lon: 9.93 }
  - { name: 代特莫爾德, aliases: [德特莫爾德, Detmold], lat: 51.94, lon: 8.88 }
  - { name: 卡爾斯魯厄, aliases: [Karlsruhe], lat: 49.01, lon: 8.40 }
  - { name: 巴登巴登, aliases: [Baden-Baden, 利希滕塔爾, Lichtenthal], lat: 48.76, lon: 8.24 }
  - { name: 施塔恩貝格湖, aliases: [Starnberger See, 圖青, Tutzing], lat: 47.90, lon: 11.30 }
  - { name: 薩斯尼茨, aliases: [Sassnitz, 呂根島, Rügen], lat: 54.51, lon: 13.64 }
  - { name: 齊格爾豪森, aliases: [Ziegelhausen], lat: 49.43, lon: 8.76 }
  - { name: 邁寧根, aliases: [Meiningen], lat: 50.57, lon: 10.42 }
  - { name: 威斯巴登, aliases: [Wiesbaden], lat: 50.08, lon: 8.24 }
  - { name: 不萊梅, aliases: [不來梅, 布萊梅, Bremen], lat: 53.08, lon: 8.80 }
  - { name: 呂內堡, aliases: [呂訥堡, Lüneburg], lat: 53.25, lon: 10.41 }
  - { name: 桑格豪森, aliases: [Sangerhausen], lat: 51.47, lon: 11.30 }
  - { name: 米爾豪森, aliases: [Mühlhausen], lat: 51.21, lon: 10.46 }
  - { name: 多恩海姆, aliases: [Dornheim], lat: 50.88, lon: 10.93 }
  - { name: 科騰, aliases: [克滕, Köthen], lat: 51.75, lon: 11.97 }
  - { name: 斯圖加特, aliases: [Stuttgart], lat: 48.78, lon: 9.18 }
  - { name: 波嫩韋爾特, aliases: [Nonnenwerth], lat: 50.62, lon: 7.22 }
  - { name: 基爾, aliases: [Kiel], lat: 54.32, lon: 10.14 }
  - { name: 松德斯豪森, aliases: [Sondershausen], lat: 51.37, lon: 10.87 }
  - { name: 安特衛普, aliases: [Antwerp, Antwerpen], lat: 51.22, lon: 4.40 }

  # 奧地利
  - { name: 維也納, aliases: [Vienna, Wien], lat: 48.21, lon: 16.37 }
  - { name: 聖烏爾里希, aliases: [St. Ulrich], lat: 48.20, lon: 16.35 }
  - { name: 薩爾斯堡, aliases: [薩爾茲堡, Salzburg], lat: 47.80, lon: 13.04 }
  - { name: 阿尼夫, aliases: [Anif], lat: 47.75, lon: 13.07 }
  - { name: 林茲, aliases: [Linz], lat: 48.31, lon: 14.29 }
  - { name: 安斯費爾登, aliases: [Ansfelden], lat: 48.21, lon: 14.29 }
  - { name: 聖弗洛里安, aliases: [Sankt Florian], lat: 48.21, lon: 14.38 }
  - { name: 羅勞, aliases: [Rohrau], lat: 48.07, lon: 16.86 }
  - { name: 海恩堡, aliases: [Hainburg], lat: 48.15, lon: 16.94 }
  - { name: 雷丁, aliases: [Raiding, 多博然, 多博爾揚, Doborján], lat: 47.57, lon: 16.53 }
  - { name: 巴登, aliases: [Baden bei Wien], lat: 48.01, lon: 16.23 }
  - { name: 海利根施塔特, aliases: [Heiligenstadt, 聖城], lat: 48.25, lon: 16.36 }
  - { name: 格奈克辛多夫, aliases: [Gneixendorf], lat: 48.43, lon: 15.62 }
  - { name: 因斯布魯克, aliases: [Innsbruck], lat: 47.27, lon: 11.39 }
  - { name: 波爾恰赫, aliases: [Pörtschach], lat: 46.63, lon: 14.15 }
  - { name: 巴德伊舍, aliases: [Bad Ischl], lat: 47.71, lon: 13.62 }
  - { name: 施泰爾, aliases: [Steyr], lat: 48.04, lon: 14.42 }
  - { name: 格蒙登, aliases: [Gmunden], lat: 47.92, lon: 13.80 }
  - { name: 巴德加施泰因, aliases: [Bad Gastein], lat: 47.11, lon: 13.13 }
  - { name: 克雷姆斯明斯特, aliases: [Kremsmünster], lat: 48.05, lon: 14.13 }
  - { name: 阿岑布魯克, aliases: [Atzenbrugg], lat: 48.28, lon: 15.94 }
  - { name: 格拉茲, aliases: [格拉茨, Graz], lat: 47.07, lon: 15.44 }
  - { name: 艾森施塔特, aliases: [Eisenstadt], lat: 47.85, lon: 16.52 }
  - { name: 米爾茨楚施拉格, aliases: [Mürzzuschlag], lat: 47.60, lon: 15.68 }

  # 瑞士
  - { name: 蘇黎世, aliases: [Zürich, Zurich], lat: 47.37, lon: 8.54 }
  - { name: 日內瓦, aliases: [Genève, Geneva], lat: 46.20, lon: 6.14 }
  - { name: 溫特圖爾, aliases: [Winterthur], lat: 47.50, lon: 8.72 }
  - { name: 洛桑, aliases: [Lausanne], lat: 46.52, lon: 6.63 }
  - { name: 伯恩, aliases: [Bern], lat: 46.95, lon: 7.45 }
  - { name: 呂施利孔, aliases: [Rüschlikon], lat: 47.31, lon: 8.55 }
  - { name: 圖恩, aliases: [Thun, 圖恩湖, 霍夫施泰滕, Hofstetten], lat: 46.76, lon: 7.63 }
  - { name: 盧加諾, aliases: [Lugano], lat: 46.00, lon: 8.95 }
  - { name: 巴塞爾, aliases: [Basel], lat: 47.56, lon: 7.59 }
  - { name: 盧塞恩, aliases: [特里布申, Tribschen, Lucerne, Luzern], lat: 47.05, lon: 8.31 }

  # 法國、比利時、荷蘭
  - { name: 巴黎, aliases: [Paris], lat: 48.86, lon: 2.35 }
  - { name: 帕西, aliases: [Passy], lat: 48.86, lon: 2.28 }
  - { name: 聖日耳曼昂萊, aliases: [Saint-Germain-en-Laye], lat: 48.90, lon: 2.09 }
  - { name: 布日瓦爾, aliases: [Bougival], lat: 48.86, lon: 2.14 }
  - { name: 蒙福爾拉莫里, aliases: [Montfort-l'Amaury], lat: 48.78, lon: 1.81 }
  - { name: 圖爾, aliases: [Tours], lat: 47.39, lon: 0.69 }
  - { name: 里爾, aliases: [Lille], lat: 50.63, lon: 3.06 }
  - { name: 拉科特聖安德烈, aliases: [La Côte-Saint-André], lat: 45.39, lon: 5.26 }
  - { name: 錫布爾, aliases: [Ciboure], lat: 43.39, lon: -1.67 }
  - { name: 列日, aliases: [Liège], lat: 50.63, lon: 5.57 }
  - { name: 布魯塞爾, aliases: [Bruxelles, Brussels], lat: 50.85, lon: 4.35 }
  - { name: 阿姆斯特丹, aliases: [Amsterdam], lat: 52.37, lon: 4.90 }
  - { name: 凡爾賽, aliases: [Versailles], lat: 48.80, lon: 2.13 }
  - { name: 加來, aliases: [Calais], lat: 50.95, lon: 1.86 }
  - { name: 第戎, aliases: [Dijon], lat: 47.32, lon: 5.04 }
  - { name: 里昂, aliases: [Lyon], lat: 45.76, lon: 4.84 }
  - { name: 斯特拉斯堡, aliases: [Strasbourg], lat: 48.58, lon: 7.75 }
  - { name: 海牙, aliases: [The Hague, Den Haag], lat: 52.08, lon: 4.31 }
  - { name: 烏特勒支, aliases: [Utrecht], lat: 52.09, lon: 5.12 }
  - { name: 鹿特丹, aliases: [Rotterdam], lat: 51.92, lon: 4.48 }
  - { name: 布洛涅濱海, aliases: [Boulogne-sur-Mer, Boulogne], lat: 50.73, lon: 1.61 }
  - { name: 拉謝內, aliases: [La Chênaie], lat: 48.45, lon: -2.05 }
  - { name: 諾昂, aliases: [Nohant], lat: 46.62, lon: 2.30 }

  # 英國
  - { name: 倫敦, aliases: [London], lat: 51.51, lon: -0.13 }
  - { name: 牛津, aliases: [Oxford], lat: 51.75, lon: -1.26 }
  - { name: 伯明罕, aliases: [Birmingham], lat: 52.48, lon: -1.90 }
  - { name: 伍斯特, aliases: [Worcester], lat: 52.19, lon: -2.22 }
  - { name: 下布羅德希斯, aliases: [Lower Broadheath], lat: 52.21, lon: -2.28 }
  - { name: 洛斯托夫特, aliases: [Lowestoft], lat: 52.48, lon: 1.75 }
  - { name: 奧德堡, aliases: [Aldeburgh], lat: 52.15, lon: 1.60 }
  - { name: 多佛, aliases: [Dover], lat: 51.13, lon: 1.31 }

  # 義大利
  - { name: 羅馬, aliases: [Rome, Roma], lat: 41.90, lon: 12.50 }
  - { name: 威尼斯, aliases: [Venice, Venezia], lat: 45.44, lon: 12.33 }
  - { name: 米蘭, aliases: [Milan, Milano], lat: 45.46, lon: 9.19 }
  - { name: 杜林, aliases: [都靈, Turin, Torino], lat: 45.07, lon: 7.69 }
  - { name: 科莫, aliases: [Como], lat: 45.81, lon: 9.08 }
  - { name: 維洛納, aliases: [Verona], lat: 45.44, lon: 10.99 }
  - { name: 波隆那, aliases: [Bologna], lat: 44.49, lon: 11.34 }
  - { name: 佛羅倫斯, aliases: [Florence, Firenze], lat: 43.77, lon: 11.26 }
  - { name: 拿坡里, aliases: [Naples, Napoli, 那不勒斯], lat: 40.85, lon: 14.27 }
  - { name: 摩德納, aliases: [Modena], lat: 44.65, lon: 10.93 }
  - { name: 雷焦艾米利亞, aliases: [Reggio Emilia], lat: 44.70, lon: 10.63 }
  - { name: 佩薩羅, aliases: [Pesaro], lat: 43.91, lon: 12.91 }
  - { name: 盧戈, aliases: [Lugo], lat: 44.42, lon: 11.91 }
  - { name: 盧卡, aliases: [Lucca], lat: 43.84, lon: 10.50 }
  - { name: 托瑞德拉古, aliases: [Torre del Lago], lat: 43.83, lon: 10.29 }
  - { name: 布塞托, aliases: [Busseto], lat: 44.98, lon: 10.04 }
  - { name: 勒朗科勒, aliases: [Le Roncole], lat: 44.95, lon: 10.07 }
  - { name: 聖阿加塔, aliases: [Sant'Agata], lat: 45.01, lon: 10.00 }
  - { name: 波札諾, aliases: [Bolzano, Bozen], lat: 46.50, lon: 11.35 }
  - { name: 特倫托, aliases: [Trento], lat: 46.07, lon: 11.12 }
  - { name: 曼圖亞, aliases: [Mantua, Mantova], lat: 45.16, lon: 10.79 }
  - { name: 帕爾馬, aliases: [Parma], lat: 44.80, lon: 10.33 }
  - { name: 帕多瓦, aliases: [Padua, Padova], lat: 45.41, lon: 11.88 }
  - { name: 聖羅索雷, aliases: [San Rossore], lat: 43.72, lon: 10.30 }
  - { name: 蒂沃利, aliases: [Tivoli, 德斯特別墅, Villa d'Este], lat: 41.96, lon: 12.80 }

  # 捷克、匈牙利、波蘭、斯洛維尼亞
  - { name: 布拉格, aliases: [Prague, Praha], lat: 50.08, lon: 14.44 }
  - { name: 內拉霍澤維斯, aliases: [Nelahozeves], lat: 50.26, lon: 14.30 }
  - { name: 茲洛尼采, aliases: [Zlonice], lat: 50.29, lon: 14.09 }
  - { name: 利托米什爾, aliases: [Litomyšl], lat: 49.87, lon: 16.31 }
  - { name: 伊赫拉瓦, aliases: [Jihlava], lat: 49.40, lon: 15.59 }
  - { name: 卡利什捷, aliases: [Kaliště], lat: 49.59, lon: 15.30 }
  - { name: 布達佩斯, aliases: [Budapest, 佩斯, 布達, Pest], lat: 47.50, lon: 19.04 }
  - { name: 納吉聖米克洛什, aliases: [Nagyszentmiklós], lat: 46.07, lon: 20.63 }
  - { name: 華沙, aliases: [Warsaw, Warszawa], lat: 52.23, lon: 21.01 }
  - { name: 熱拉佐瓦沃拉, aliases: [Żelazowa Wola], lat: 52.26, lon: 20.31 }
  - { name: 康尼希察, aliases: [Konjšica], lat: 46.07, lon: 14.97 }
  - { name: 奧洛穆茨, aliases: [Olomouc, Olmütz], lat: 49.59, lon: 17.25 }
  - { name: 布爾諾, aliases: [Brno, Brünn], lat: 49.20, lon: 16.61 }
  - { name: 布拉提斯拉瓦, aliases: [Bratislava, Pressburg, 普萊斯堡, 波茲尼, 普雷斯堡], lat: 48.15, lon: 17.11 }
  - { name: 特普利采, aliases: [泰普利采, Teplice], lat: 50.64, lon: 13.83 }
  - { name: 卡羅維瓦利, aliases: [Karlovy Vary, Carlsbad], lat: 50.23, lon: 12.87 }
  - { name: 紹普朗, aliases: [Sopron, Ödenburg], lat: 47.68, lon: 16.59 }
  - { name: 傑爾, aliases: [Győr], lat: 47.69, lon: 17.64 }
  - { name: 埃斯泰爾戈姆, aliases: [Esztergom, Gran], lat: 47.79, lon: 18.74 }
  - { name: 澤利茲, aliases: [Zseliz, Želiezovce], lat: 48.05, lon: 18.67 }
  - { name: 塞克薩德, aliases: [Szekszárd], lat: 46.35, lon: 18.71 }

  # 北歐、波羅的海
  - { name: 卑爾根, aliases: [Bergen], lat: 60.39, lon: 5.32 }
  - { name: 哥特堡, aliases: [Gothenburg, Göteborg], lat: 57.71, lon: 11.97 }
  - { name: 海門林納, aliases: [Hämeenlinna], lat: 61.00, lon: 24.46 }
  - { name: 耶爾文佩, aliases: [Järvenpää, 愛諾拉, Ainola], lat: 60.47, lon: 25.09 }
  - { name: 維爾紐斯, aliases: [Vilnius], lat: 54.69, lon: 25.28 }
  - { name: 哥本哈根, aliases: [Copenhagen, København], lat: 55.68, lon: 12.57 }
  - { name: 里加, aliases: [Riga], lat: 56.95, lon: 24.11 }
  - { name: 塔爾圖, aliases: [Tartu, Derpt], lat: 58.38, lon: 26.72 }

  # 俄羅斯、烏克蘭
  - { name: 聖彼得堡, aliases: [Saint Petersburg, St. Petersburg], lat: 59.94, lon: 30.31 }
  - { name: 奧拉寧鮑姆, aliases: [Oranienbaum], lat: 59.91, lon: 29.77 }
  - { name: 莫斯科, aliases: [Moscow], lat: 55.76, lon: 37.62 }
  - { name: 季赫溫, aliases: [Tikhvin], lat: 59.64, lon: 33.53 }
  - { name: 盧本斯克, aliases: [Lyubensk], lat: 58.55, lon: 29.75 }
  - { name: 謝苗諾沃, aliases: [Semyonovo], lat: 57.98, lon: 31.35 }
  - { name: 奧涅格, aliases: [Oneg], lat: 58.60, lon: 31.50 }
  - { name: 卡列沃, aliases: [Karevo], lat: 56.33, lon: 30.87 }
  - { name: 沃特金斯克, aliases: [Votkinsk], lat: 57.05, lon: 53.99 }
  - { name: 基輔, aliases: [Kyiv, Kiev], lat: 50.45, lon: 30.52 }
  - { name: 敖德薩, aliases: [Odesa, Odessa], lat: 46.48, lon: 30.72 }
  - { name: 日托米爾, aliases: [Zhytomyr], lat: 50.25, lon: 28.66 }
  - { name: 松措夫卡, aliases: [Sontsivka], lat: 48.09, lon: 37.19 }
  - { name: 沃羅寧策, aliases: [Woronince, Voronovytsia], lat: 48.97, lon: 28.69 }
  - { name: 利沃夫, aliases: [Lemberg, Lviv], lat: 49.84, lon: 24.03 }
  - { name: 切爾諾夫策, aliases: [Czernowitz, Chernivtsi], lat: 48.29, lon: 25.94 }
  - { name: 雅西, aliases: [Iași, Jassy], lat: 47.16, lon: 27.59 }

  # 希臘、中東
  - { name: 雅典, aliases: [Athens], lat: 37.98, lon: 23.73 }
  - { name: 埃皮達魯斯, aliases: [Epidaurus], lat: 37.60, lon: 23.08 }
  - { name: 耶路撒冷, aliases: [Jerusalem], lat: 31.78, lon: 35.22 }
  - { name: 伊斯坦堡, aliases: [君士坦丁堡, Constantinople, Istanbul], lat: 41.01, lon: 28.98 }
  - { name: 馬德里, aliases: [Madrid], lat: 40.42, lon: -3.70 }
  - { name: 里斯本, aliases: [Lisbon, Lisboa], lat: 38.72, lon: -9.14 }

  # 美洲
  - { name: 紐約, aliases: [New York], lat: 40.71, lon: -74.01 }
  - { name: 布魯克林, aliases: [Brooklyn], lat: 40.68, lon: -73.94 }
  - { name: 勞倫斯, aliases: [Lawrence], lat: 42.71, lon: -71.16 }
  - { name: 洛杉磯, aliases: [Los Angeles], lat: 34.05, lon: -118.24 }
  - { name: 好萊塢, aliases: [Hollywood], lat: 34.10, lon: -118.33 }
  - { name: 比佛利山, aliases: [Beverly Hills], lat: 34.07, lon: -118.40 }
  - { name: 哈瓦那, aliases: [Havana], lat: 23.11, lon: -82.37 }

  # 東亞
  - { name: 北京, aliases: [Beijing], lat: 39.90, lon: 116.40 }
  - { name: 東京, aliases: [Tokyo], lat: 35.68, lon: 139.69 }
  - { name: 橫濱, aliases: [Yokohama], lat: 35.44, lon: 139.64 }
  - { name: 札幌, aliases: [Sapporo], lat: 43.06, lon: 141.35 }
---
