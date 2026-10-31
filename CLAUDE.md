# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概要

Liu's Timeline：仿 Timetoast 的個人時間軸網站（Vite + React + TypeScript，純靜態、唯讀）。`Data/*.md` 是唯一資料來源，一個檔案就是一條時間軸。push 到 `main` 後由 `.github/workflows/deploy.yml` 執行 `npm test` 與 `npm run build`，再部署到 GitHub Pages：https://chad-liu.github.io/Timeline/ （repo `chad-liu/Timeline` 是**公開**的）。

**資料格式**（frontmatter 欄位、Periods／Events 語法、日期寫法）完整寫在 [plan.md](plan.md)。新增或修改時間軸前先讀它，並以它為準。

三份文件的分工：
- [README.md](README.md)：給讀者的使用說明，包括功能介紹與網址格式表。
- plan.md：資料格式。
- 本檔：架構與工作慣例。

新增頁面、路由、檢視或 frontmatter 欄位時，README 與 plan.md 要一起更新。README 只放入門範例，完整格式連到 plan.md，不重複寫。

## 指令

```bash
npm run dev                                # http://localhost:5173，Data/ 存檔後自動重新整理
npm test                                   # vitest run（全部）
npx vitest run src/lib/parseDate.test.ts   # 單一測試檔
npx vitest run -t "buildPeopleIndex"       # 依測試名稱
npm run build                              # tsc 型別檢查 + vite build → dist/
```

Node.js 22（與 CI 相同）。沒有 lint 設定；型別檢查只靠 `npm run build` 裡的 `tsc`。內建瀏覽器預覽用 `.claude/launch.json` 的 `timeline-dev`。

也沒有 Prettier 設定檔；程式碼的風格相當於 `npx prettier --print-width 140 --single-quote`。新檔案可以用它格式化，但不要整檔重排既有檔案（部分舊檔與這個設定不完全一致，會產生無關的 diff）。

## 架構

- **建置時解析**：`vite-plugin-timelines.ts` 在 Node 端讀取 `Data/*.md`，用 `src/lib/parseTimeline.ts`（gray-matter + marked）解析後，以虛擬模組 `virtual:timelines` 提供給前端（型別宣告在 `src/virtual.d.ts`）。前端拿到的是已解析好的 `Timeline[]`，本身不含 markdown 或 yaml 解析器。這個 plugin 同時負責：
  - 在 dev 時以 `data/` 路徑提供 `Data/images/`，build 時把圖片 emit 到 `dist/data/`；
  - 輸出 `people.json`（`src/lib/peopleIndex.ts`），供其他網站讀取人物生卒年。books 站的 `tools/add_timeline_links.py` 會把每人的 `related` 反推成「哪些頁面要連回這條時間軸」，所以兩站的互連只需要維護 `related:`。
- **日期**：統一轉成「小數年」（`src/lib/parseDate.ts`），支援西元前、世紀、區間、約略年代，不使用 JS `Date`。排序與座標換算都用這個數值。
- **路由**：全部放在 URL hash，由 `src/lib/route.ts` 處理：
  - 不帶 `t` 參數是 Dashboard，例如 `#c=音樂家&tag=…`；
  - `#v=horizontal&t=Bach|Handel` 開啟一條或多條時間軸，多條時會疊加比較；
  - `#p=lifespans` 是人物年表。
  - `#p=index` 是人名索引；時間軸網址加上 `&e=事件id`（如 `&e=Voltaire-6`）會直接開啟該事件。
  - `#p=topics` 是主題索引（`topicIndex.ts` + `TopicIndex.tsx`）：主題清單寫在 `Data/index/topics.md`，以 `virtual:index-topics` 提供，比對事件標題與內文；主題的專屬時間軸（`timeline:`）只附連結，不重複列出事件。新增主題時先掃一遍比對結果，用 `notTerms` 排除同字詞。
  - `#p=graph` 是人物關係圖（`relationGraph.ts` + `RelationGraph.tsx`，`d3-force`／`d3-zoom`／`d3-drag`／`d3-selection`，不用整包 d3）：由 `buildNameIndex` 的結果反推，A 的自有時間軸（`links`）提到 B 就連線，權重是事件數；`#p=graph&c=音樂家&w=2` 篩類別與最小權重。D3 只管模擬與 SVG，選取與搜尋只切換 class，不重啟模擬；模擬穩定後會自動縮放到全圖可見（使用者操作過就不再動）。
  - `#p=years&y=1789&s=10` 是年代對照（`src/lib/yearIndex.ts` + `YearIndex.tsx`）：`s` 為 1／10／100（單年／十年／百年），列出各時間軸在該段期間的事件與同時在世的人物。跨度約百年以上的事件（如 `18世紀` 或 `1700 ~ 1799`）只在百年檢視出現。標題旁的中國帝王由 `chineseRulers.ts` 的 `reignsInSlice` 產生，和人物年表共用同一份帝王資料。明、清的年號紀年要用 `eraStart`（元年），它通常是即位的次年，例外是洪武、順治、天順、隆慶、嘉慶、光緒，元年與即位同年。事件詳細內容底部有連結可跳到這一頁。
- **排序與分組**：`src/lib/timelineOrder.ts` 是唯一依據。
  - `compareTimelines`：依最早日期排序，`sortLast` 排最後。
  - `CATEGORY_ORDER`：分頁順序，新增類別要改這裡。
  - `groupTimelines`：依類別分組並照 `CATEGORY_ORDER` 排序，未列入的類別接在後面，`未分類` 排最後。
  - `groupByTag`：tag 依首次出現的順序分組。
  - Dashboard、下拉選單、人物年表、people.json 都共用這幾個函式。
- **人物**：frontmatter 有 `born`／`died` 的時間軸視為人物，它的事件會自動加上年齡。只有年份的日期年齡可能不準，可以用 `{age=N}` 指定，或把日期寫到月或日。人物年表（`Lifespans.tsx` + `lifespanScale.ts`）會把沒有人物的年代壓縮成間隔。人名索引（`NameIndex.tsx` + `nameIndex.ts`）列出每位人物在其他時間軸被提到的事件，比對本名與 `aliases`，並排除 `notNames` 裡的詞；新增人物時間軸時，先掃一遍其他時間軸的譯名差異與同字詞。沒有獨立時間軸的常見人物（如梅迪奇家族成員、拿破崙）寫在 `Data/index/people.md` 的補充名單，由 `extraPeople.ts` 解析、以 `virtual:index-people` 提供；它不是時間軸，也不會寫進 people.json。
- **安全**：事件內文是 HTML，渲染前一律經過 `src/lib/sanitize.ts`（DOMPurify）。`related:` 連結只接受 http/https。

## 內容工作慣例

- 常見的請求是「接著請作 X（`圖表/` 內的筆記 .md、中文維基百科網址）」：
  - 合併兩個來源，用台灣用語以自己的話改寫，存成 `Data/<英文名>.md`。
  - 檔案開頭的 HTML 註解記錄資料來源，以及兩份資料出入時的處理方式。
  - 人名在各時間軸之間要一致。
  - 依類別加上 `category`／`tags`（思想家依學派、文學家依語言／國別），並在 `related:` 加上 https://chad-liu.github.io/books/ 的相關頁面。
  - 人名的分隔號一律用「·」（books 原稿常用「・」）。
  - 很早的背景（如詹姆斯鎮1607、希吉拉622）寫進第一則事件的內文，不另立事件。原因是橫向檢視只壓縮超過 `squeeze`（預設 1000 年）的空白，幾百年的空白會佔掉整個畫面。
  - 新增某個主題或人物的專屬時間軸時，順便在 `Data/index/topics.md` 或 `Data/index/people.md` 對應的條目加上 `timeline: <id>`。主題索引會因此只附連結、不再重複列出該時間軸的事件。
- books 的 `related:` 連結與註解中的來源路徑，必須對應 `D:\Books\html\` 底下實際存在的檔案。books 的資料夾編號會調整（例如 `9-2.音樂家作品` 曾改成 `5-2.音樂家作品`），調整後要掃一遍 `Data/` 裡所有 `chad-liu.github.io/books/` 連結並更新。
- 「加公有領域圖片」：
  - 只能用 Wikimedia Commons 上 Public domain／PD-US／CC0 的圖片，放在 `Data/images/`，並設定 `cover:`。
  - 圖片來源要補寫在檔案開頭的註解裡，每張一行：`- <檔名>.jpg：<Commons 原檔名>（中文說明）`。
  - 圖片縮成最長邊 640px 的 JPEG，檔名用該時間軸的前綴（如 `cru-`、`fr-`、`nap-`）。
  - 沿用其他時間軸已有的圖片時，註明「（與X時間軸共用）」。
  - 含裸體或情色內容、暴力（行刑、戰爭、災難、葬禮等）的公有領域圖片都可以使用，不需要為此捨棄或裁切；選圖仍以和事件直接相關、最具代表性為準。
- **不要 commit `圖表/`**（那裡是原始筆記），也不要 commit `圖表/Dashboard.png` 或 `Data/images/84cf78586f2293dd051cdd0ba37832d1.jpeg`。
- 使用者沒有要求就不 commit／push。push 後用 `gh run watch` 確認部署成功。
- 書籍網站是另一個 repo（`D:\Books`，chad-liu/books），兩邊刻意不整合，只透過 `related:`、books 端的 timeline 連結區塊，以及 `people.json` 互相連結。
