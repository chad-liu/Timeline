---
title: AI 程式設計發展史
category: 政治科技
tags: [現代科技]
see: [AIHistory, AI, ProgrammingLanguages, ComputerHistory]
related:
  - AI 程式設計發展史: https://chad-liu.github.io/books/html/8-4.現代科技/AI%20程式設計發展史.html
aliases: [AI 程式設計, AI輔助程式設計, AI程式設計發展史]
cover: images/tech-aicoding-cover.jpg
color: "#1c7ed6"
description: 從1956年的人工智慧起點、專家系統與自動程式生成，到2021年GitHub Copilot讓大型語言模型進入編輯器，2025年「Vibe Coding」與雲端軟體工程代理，以及2026年多代理人協作與AI軟體工程：程式設計從人類逐行撰寫，逐步走向由自然語言與AI共同開發
---

<!--
內容整理自 Books 網站〈AI 程式設計發展史〉所依據的筆記〈AI 程式設計發展史〉（D:\Books\md\歷史\術語\現代科技\AI 程式設計發展史.md）與英文維基百科「GitHub Copilot」「Large language model」條目（CC BY-SA 4.0），以台灣用語改寫摘要。中文維基百科條目沒有讀取。
時期依筆記的八個階段，合併成六段：AI與自動程式設計的萌芽（1956–1969）、專家系統與自動程式生成（1970–1989）、智慧型工具（1990–2009）、深度學習與程式碼智慧（2010–2019）、大型語言模型與AI程式助理（2020–2023）、AI原生開發與智能代理（2024–2026）。
兩份資料出入與處理方式：
- GitHub Copilot：2021年6月技術預覽（筆記），2022年正式推出，這裡寫成2021年預覽。
- 2025年的事件（Vibe Coding、OpenAI Codex雲端代理與CLI、MCP生態系）與2026年的「Harness Engineering」等，只依筆記，英文維基百科資料有限，這裡不另行補充。
- 筆記把2023年亞馬遜CodeWhisperer寫成2023年4月正式推出，依筆記。
圖片來源（皆為 Wikimedia Commons 公有領域／CC0 作品，縮成最長邊 640px）：
- tech-aicoding-cover.jpg：VS2025 IntelliCode + Copilot.png（Visual Studio中的AI程式碼建議畫面（IntelliCode與Copilot））
-->

# Periods
- 1956 ~ 1969 | AI與自動程式設計的萌芽 | #868e96
  達特茅斯會議、符號推理與ELIZA。
- 1970 ~ 1989 | 專家系統與自動程式生成 | #1971c2
  PROLOG、規則系統與從規格生成程式的研究。
- 1990 ~ 2009 | 智慧型開發工具 | #2f9e44
  智慧型IDE、靜態分析與自動測試。
- 2010 ~ 2019 | 深度學習與程式碼智慧 | #e8590c
  AlexNet、BERT與CodeBERT。
- 2020 ~ 2023 | 大型語言模型與AI程式助理 | #c92a2a
  GPT-3、Copilot、AlphaCode與GPT-4。
- 2024 ~ 2026 | AI原生開發與智能代理 | #5f3dc4
  AI原生編輯器、Vibe Coding、雲端代理與多代理協作。

# Events

## 1956 | 達特茅斯會議與自動程式設計的夢想 {label="1956–1966年"}
人工智慧成為正式的研究領域，1959年麥卡錫推動符號推理，1966年ELIZA展現電腦與人用文字對話的可能。

## 1972 | PROLOG與專家系統 {label="1970–1989年"}
PROLOG成為邏輯程式設計的代表，1970年代開始探索從規格描述自動產生程式，1983年CLIPS專家系統工具讓規則型知識系統更容易建立。

## 1995 | 智慧型IDE與程式分析 {label="1995–2009年"}
自動補全等智慧型IDE功能在1990年代中期逐漸普及，Java IDE與程式分析工具提升大型軟體的開發效率；2000年代靜態分析與自動測試工具成熟。

## 2012 | 深度學習進入程式碼領域 {label="2012–2018年"}
2012年AlexNet帶來深度學習革命，2016年AlphaGo、2018年BERT推動自然語言理解，為後來把程式碼當成語言處理鋪路。

## 2019 | CodeBERT與程式碼理解 {label="2019年"}
CodeBERT等研究讓模型更深入理解程式碼與自然語言之間的關係。

## 2020 | GPT-3展現依文字指令寫程式的能力 {label="2020年"}
OpenAI發表GPT-3，大型語言模型能依照文字指令完成簡單的程式撰寫，成為後來Copilot等工具的技術基礎。

## 2021 | GitHub Copilot技術預覽 {label="2021年6月"}
GitHub推出Copilot的技術預覽，AI開始在編輯器中即時建議程式碼，是AI程式設計第一個廣為人知的產品。

## 2022 | AlphaCode {label="2022年"}
DeepMind發表AlphaCode，在競賽程式設計題目上展現接近一般參賽者的水準。

## 2023 | GPT-4與CodeWhisperer {label="2023年"}
3月GPT-4發表，複雜程式的理解、推理與除錯能力進一步提升；4月Amazon CodeWhisperer正式推出，把AI程式助理帶進雲端與企業開發環境。

## 2024 | AI原生開發環境 {label="2024年"}
Claude 3.5 Sonnet發表，程式碼生成與分析能力受到關注；GitHub Copilot Edits讓AI能同時修改多個檔案，Windsurf等編輯器強調讓AI理解整個專案。

## 2025 | Vibe Coding與雲端軟體工程代理 {label="2025年"}
據筆記，2月卡帕西提出「Vibe Coding」一詞，描述以自然語言驅動AI寫程式；4月OpenAI推出Codex雲端軟體工程代理，5月Codex CLI開源，MCP生態系讓AI Agent能連接更多外部工具。

## 2026 | 多代理人協作與AI軟體工程 {label="2026年"}
據筆記，AI自動測試與程式碼審查繼續深化，AI不再只是寫程式，也參與審查與測試；「Harness Engineering」（設計工具、環境與流程讓AI穩定工作）受到重視。
