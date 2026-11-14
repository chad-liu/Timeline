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
  - { name: 埃森納赫, aliases: [Eisenach], lat: 50.97, lon: 10.32 }
  - { name: 奧德魯夫, aliases: [Ohrdruf], lat: 50.83, lon: 10.73 }
  - { name: 阿恩施塔特, aliases: [Arnstadt], lat: 50.83, lon: 10.95 }
  - { name: 哈雷, aliases: [Halle], lat: 51.48, lon: 11.97 }
  - { name: 茲威考, aliases: [Zwickau], lat: 50.72, lon: 12.49 }
  - { name: 波昂, aliases: [Bonn], lat: 50.73, lon: 7.10 }
  - { name: 恩德尼希, aliases: [Endenich], lat: 50.72, lon: 7.07 }
  - { name: 杜塞道夫, aliases: [Düsseldorf], lat: 51.23, lon: 6.78 }
  - { name: 慕尼黑, aliases: [München, Munich], lat: 48.14, lon: 11.58 }
  - { name: 加米施, aliases: [Garmisch], lat: 47.49, lon: 11.10 }
  - { name: 拜魯特, aliases: [Bayreuth], lat: 49.95, lon: 11.58 }
  - { name: 海德堡, aliases: [Heidelberg], lat: 49.40, lon: 8.67 }
  - { name: 埃伯施泰因堡, aliases: [Ebersteinburg], lat: 48.78, lon: 8.27 }

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
  - { name: 雷丁, aliases: [Raiding], lat: 47.57, lon: 16.53 }

  # 瑞士
  - { name: 蘇黎世, aliases: [Zürich, Zurich], lat: 47.37, lon: 8.54 }
  - { name: 日內瓦, aliases: [Genève, Geneva], lat: 46.20, lon: 6.14 }

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

  # 英國
  - { name: 倫敦, aliases: [London], lat: 51.51, lon: -0.13 }
  - { name: 牛津, aliases: [Oxford], lat: 51.75, lon: -1.26 }
  - { name: 伯明罕, aliases: [Birmingham], lat: 52.48, lon: -1.90 }
  - { name: 伍斯特, aliases: [Worcester], lat: 52.19, lon: -2.22 }
  - { name: 下布羅德希斯, aliases: [Lower Broadheath], lat: 52.21, lon: -2.28 }
  - { name: 洛斯托夫特, aliases: [Lowestoft], lat: 52.48, lon: 1.75 }
  - { name: 奧德堡, aliases: [Aldeburgh], lat: 52.15, lon: 1.60 }

  # 義大利
  - { name: 羅馬, aliases: [Rome, Roma], lat: 41.90, lon: 12.50 }
  - { name: 威尼斯, aliases: [Venice, Venezia], lat: 45.44, lon: 12.33 }
  - { name: 米蘭, aliases: [Milan, Milano], lat: 45.46, lon: 9.19 }
  - { name: 杜林, aliases: [Turin, Torino], lat: 45.07, lon: 7.69 }
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

  # 捷克、匈牙利、波蘭、斯洛維尼亞
  - { name: 布拉格, aliases: [Prague, Praha], lat: 50.08, lon: 14.44 }
  - { name: 內拉霍澤維斯, aliases: [Nelahozeves], lat: 50.26, lon: 14.30 }
  - { name: 茲洛尼采, aliases: [Zlonice], lat: 50.29, lon: 14.09 }
  - { name: 利托米什爾, aliases: [Litomyšl], lat: 49.87, lon: 16.31 }
  - { name: 伊赫拉瓦, aliases: [Jihlava], lat: 49.40, lon: 15.59 }
  - { name: 卡利什捷, aliases: [Kaliště], lat: 49.59, lon: 15.30 }
  - { name: 布達佩斯, aliases: [Budapest], lat: 47.50, lon: 19.04 }
  - { name: 納吉聖米克洛什, aliases: [Nagyszentmiklós], lat: 46.07, lon: 20.63 }
  - { name: 華沙, aliases: [Warsaw, Warszawa], lat: 52.23, lon: 21.01 }
  - { name: 熱拉佐瓦沃拉, aliases: [Żelazowa Wola], lat: 52.26, lon: 20.31 }
  - { name: 康尼希察, aliases: [Konjšica], lat: 46.07, lon: 14.97 }

  # 北歐、波羅的海
  - { name: 卑爾根, aliases: [Bergen], lat: 60.39, lon: 5.32 }
  - { name: 哥特堡, aliases: [Gothenburg, Göteborg], lat: 57.71, lon: 11.97 }
  - { name: 海門林納, aliases: [Hämeenlinna], lat: 61.00, lon: 24.46 }
  - { name: 耶爾文佩, aliases: [Järvenpää, 愛諾拉, Ainola], lat: 60.47, lon: 25.09 }
  - { name: 維爾紐斯, aliases: [Vilnius], lat: 54.69, lon: 25.28 }

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

  # 希臘、中東
  - { name: 雅典, aliases: [Athens], lat: 37.98, lon: 23.73 }
  - { name: 埃皮達魯斯, aliases: [Epidaurus], lat: 37.60, lon: 23.08 }
  - { name: 耶路撒冷, aliases: [Jerusalem], lat: 31.78, lon: 35.22 }

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
