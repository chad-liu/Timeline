---
title: AI晶片發展史
category: 政經商科
tags: [現代科技]
see: [AIHistory, AI, IntegratedCircuits, TaiwanAISemiconductor, TSMC, ComputerHistory]
related:
  - AI晶片發展史: https://chad-liu.github.io/books/html/8-4.現代科技/AI晶片發展史.html
aliases: [AI晶片, AI 晶片]
cover: images/tech-aichips-cover.jpg
color: "#2f9e44"
description: 1950至2026年AI運算硬體的演進：從早期神經網路與感知器的前史，到GPU與CUDA使平行運算成為深度學習引擎，2012年AlexNet之後Google TPU與各種NPU等專用晶片興起，2022年ChatGPT帶動NVIDIA H100、AMD、Google與Amazon的資料中心競賽，到2024至2026年Blackwell、HBM與先進封裝的全面競爭
---

<!--
內容整理自 Books 網站〈AI晶片發展史〉所依據的筆記〈AI晶片發展史（1950～2026）〉（D:\Books\md\歷史\術語\現代科技\AI晶片發展史.md）與英文維基百科「AI accelerator」「Graphics processing unit」條目（CC BY-SA 4.0），以台灣用語改寫摘要。中文維基百科條目沒有讀取。
時期依筆記的六個階段：前史（1943–1989）、GPU與平行運算（1990–2009）、深度學習革命（2010–2015）、專用AI晶片（2016–2020）、生成式AI革命（2021–2023）、全面競爭（2024–2026）。
兩份資料出入與處理方式：
- GeForce 256：NVIDIA稱它是「全球第一款GPU」，這是公司的說法，這裡照寫並加「據NVIDIA」。
- 2024至2026年的產品（Blackwell Ultra、Google Ironwood、AMD MI350、NVIDIA Rubin、TPU v7等）只依筆記，英文維基百科對這些最近的產品資料有限，這裡不補充規格。
- 與〈台灣AI半導體產業發展史〉（TaiwanAISemiconductor）的分工：這條寫晶片本身的演進，那條寫台灣供應鏈。
圖片來源（皆為 Wikimedia Commons 公有領域／CC0 作品，縮成最長邊 640px）：
- tech-aichips-cover.jpg：Nvidia@12nm@Turing@TU104@GeForce RTX 2080@S TAIWAN 1841A1 PKYN44.000 TU104-400-A1 DSC07236-DSC07279 - ZS-DMap (50914790756).jpg（NVIDIA Turing架構TU104 GPU晶粒的顯微影像）
-->

# Periods
- 1943 ~ 1989 | 前史：人工智慧與神經網路 | #868e96
  人工神經元、感知器、反向傳播與早期神經網路硬體。
- 1990 ~ 2009 | GPU與平行運算時代 | #1971c2
  NVIDIA成立，GeForce 256、CUDA與可程式化GPU。
- 2010 ~ 2015 | 深度學習革命 | #2f9e44
  GPU成為訓練深度學習的核心，TensorFlow與第一代TPU。
- 2016 ~ 2020 | 專用AI晶片興起 | #e8590c
  TPU、Tensor Core、Neural Engine與邊緣AI。
- 2021 ~ 2023 | 生成式AI革命與GPU競賽 | #c92a2a
  H100、MI300X與雲端業者自研加速器。
- 2024 ~ 2026 | 全面競爭 | #5f3dc4
  Blackwell、HBM與先進封裝。

# Events

## 1958 | 感知器與早期神經網路 {label="1943–1989年"}
1943年人工神經元模型，1958年羅森布拉特提出感知器，1969年《感知器》指出單層網路的限制，1982年霍普菲爾德網路與1986年反向傳播使神經網路再度受到重視；1960年代起也有人以專用類比電路實現神經網路。

## 1993 | NVIDIA成立 {label="1993年"}
黃仁勳等人創辦NVIDIA；1999年推出GeForce 256，據NVIDIA稱是全球第一款GPU，把幾何轉換與光照計算放進晶片，GPU開始成為平行運算的主力。

## 2006 | CUDA使GPU用於一般運算 {label="2006–2009年"}
2006年NVIDIA推出CUDA，讓開發者能用GPU做一般用途的平行運算，2007年Tesla運算平台把GPU推向科學與高效能運算；2009年起研究人員把GPU用在神經網路訓練。

## 2012 | AlexNet讓GPU成為AI核心 {label="2010–2013年"}
2012年AlexNet在ImageNet以GPU訓練大幅勝出，GPU成為深度學習的標準運算平台；2011年Google Brain計畫以大規模神經網路與運算展開。

## 2015 | TensorFlow與第一代TPU {label="2014–2015年"}
2014年IBM TrueNorth展示神經形態晶片；2015年TensorFlow公開，Google開始在資料中心部署第一代TPU，專為AI推論設計。

## 2016 | TPU公開與DGX-1 {label="2016年"}
Google正式公開第一代TPU，NVIDIA推出Tesla P100與把多張GPU整合成AI超級電腦的DGX-1。

## 2017 | Tensor Core、Neural Engine與Transformer {label="2017年"}
NVIDIA的Volta架構V100首次導入Tensor Core，Google推出可訓練的TPU v2，Apple的A11 Bionic在手機晶片中加入Neural Engine；同年Transformer架構提出，改變後來的AI晶片需求。

## 2019 | 邊緣AI {label="2018–2019年"}
2018年Google TPU v3採用液冷、NVIDIA Turing架構加入RT Core；2019年Google Edge TPU與NVIDIA Jetson Nano讓AI能在本地設備與嵌入式裝置運行。

## 2020 | A100與Apple M1 {label="2020年"}
NVIDIA推出Ampere架構A100，大幅提升資料中心的訓練能力；Apple的M1晶片整合CPU、GPU與Neural Engine，把AI運算帶入個人電腦。

## 2022 | H100與ChatGPT {label="2022年"}
NVIDIA推出Hopper架構H100，AMD推出Instinct MI200；11月ChatGPT推出使生成式AI受到全球關注，AI運算晶片需求暴增。

## 2023 | GPU供不應求，各家加速器競爭 {label="2023年"}
H100需求大幅增加，AMD推出Instinct MI300X，Google推出TPU v5e與v5p，Amazon、Intel（Gaudi2）也以自研加速器參與資料中心市場。

## 2024 | Blackwell時代 {label="2024年"}
NVIDIA推出Blackwell架構與B200 GPU（雙晶粒設計搭配高頻寬記憶體），並推出整合Grace CPU的GB200，形成機櫃級的AI運算系統；Google同年推出Trillium TPU。

## 2025 | AI加速器的全面競爭 {label="2025–2026年"}
據筆記，2025年NVIDIA推出Blackwell Ultra、Google推出Ironwood TPU、AMD推出MI350；2026年NVIDIA Rubin、Google TPU v7與Meta新一代MTIA等繼續推出，競爭從單顆晶片擴大到高頻寬記憶體、先進封裝與資料中心系統。
