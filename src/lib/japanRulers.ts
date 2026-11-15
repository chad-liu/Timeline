import { reignsInSlice } from './chineseRulers';
import type { Ruler } from './chineseRulers';

/**
 * Japanese era names (年號) and emperors, for the year comparison page.
 * Source: the era list of the Chinese Wikipedia (日本年號列表), which gives each era's first year and the emperor it began under;
 * emperors who proclaimed no era (齊明, 天智, 持統, 淳仁, 仲恭, 明正 …) and those before the first era in 645 are added from the list of emperors.
 * The first year of an era is the Western year most of its 元年 falls in, as that list has it (天保 1830, 安政 1854).
 */

const MAIN = '日本';
const SOUTH = '日本南朝';
const NORTH = '日本北朝';

/** `name` + first year, optionally `-last year`; without it an era or reign lasts until the next one begins. */
function parse(list: string, dynasty: string, era: boolean): Ruler[] {
  const items = list
    .trim()
    .split(/\s+/)
    .map((token) => {
      const m = token.match(/^(\D+)(\d+)(?:-(\d+))?(?:\/(\d+))?$/);
      if (!m) throw new Error(`japanRulers: ${token}`);
      return { name: m[1], start: Number(m[2]), end: m[3] ? Number(m[3]) : undefined, eraStart: m[4] ? Number(m[4]) : undefined };
    });
  return items.map((item, i): Ruler => {
    const end = item.end ?? items[i + 1]?.start ?? 9999;
    const ruler: Ruler = { name: era ? item.name : `${item.name}天皇`, dynasty, start: item.start, end };
    if (era) ruler.eraStart = item.eraStart ?? item.start;
    return ruler;
  });
}

/**
 * Eras of the single court. 白雉 and 朱鳥 are followed by years without an era; 建武 stops in 1335 here because
 * from 1336 the two courts each have their own entry, and 明德 comes back in 1393 (its fourth year) after the courts reunited in 1392.
 */
const MAIN_ERAS = `
大化645 白雉650-654 朱鳥686-686 大寶701 慶雲704 和銅708
靈龜715 養老717 神龜724 天平729 天平感寶749 天平勝寶749 天平寶字757 天平神護765 神護景雲767 寶龜770 天應781 延曆782
大同806 弘仁810 天長824 承和834 嘉祥848 仁壽851 齊衡854 天安857 貞觀859 元慶877 仁和885 寬平889 昌泰898 延喜901 延長923
承平931 天慶938 天曆947 天德957 應和961 康保964 安和968 天祿970 天延973 貞元976 天元978 永觀983 寬和985 永延987 永祚989
正曆990 長德995 長保999 寬弘1004 長和1012 寬仁1017 治安1021 萬壽1024 長元1028 長曆1037 長久1040 寬德1044 永承1046
天喜1053 康平1058 治曆1065 延久1069 承保1074 承曆1077 永保1081 應德1084 寬治1087 嘉保1094 永長1096 承德1097 康和1099
長治1104 嘉承1106 天仁1108 天永1110 永久1113 元永1118 保安1120 天治1124 大治1126 天承1131 長承1132 保延1135 永治1141
康治1142 天養1144 久安1145 仁平1151 久壽1154 保元1156 平治1159 永曆1160 應保1161 長寬1163 永萬1165 仁安1166 嘉應1169
承安1171 安元1175 治承1177 養和1181 壽永1182 元曆1184
文治1185 建久1190 正治1199 建仁1201 元久1204 建永1206 承元1207 建曆1211 建保1213 承久1219 貞應1222 元仁1224 嘉祿1225
安貞1227 寬喜1229 貞永1232 天福1233 文曆1234 嘉禎1235 曆仁1238 延應1239 仁治1240 寬元1243 寶治1247 建長1249 康元1256
正嘉1257 正元1259 文應1260 弘長1261 文永1264 建治1275 弘安1278 正應1288 永仁1293 正安1299 乾元1302 嘉元1303 德治1306
延慶1308 應長1311 正和1312 文保1317 元應1319 元亨1321 正中1324 嘉曆1326 元德1329 元弘1331 建武1334-1335
明德1393-1394/1390 應永1394 正長1428 永享1429 嘉吉1441 文安1444 寶德1449 享德1452 康正1455 長祿1457 寬正1460
文正1466 應仁1467 文明1469 長享1487 延德1489 明應1492 文龜1501 永正1504 大永1521 享祿1528 天文1532 弘治1555 永祿1558
元龜1570 天正1573 文祿1592 慶長1596
元和1615 寬永1624 正保1644 慶安1648 承應1652 明曆1655 萬治1658 寬文1661 延寶1673 天和1681 貞享1684 元祿1688 寶永1704
正德1711 享保1716 元文1736 寬保1741 延享1744 寬延1748 寶曆1751 明和1764 安永1772 天明1781 寬政1789 享和1801 文化1804
文政1818 天保1830 弘化1844 嘉永1848 安政1854 萬延1860 文久1861 元治1864 慶應1865
明治1868 大正1912 昭和1926 平成1989 令和2019`;

/** The Southern Court (1336–1392) kept its own eras from 延元 to 元中. */
const SOUTH_ERAS = '延元1336 興國1340 正平1346 建德1370 文中1372 天授1375 弘和1381 元中1384-1392';

/** The Northern Court: 正慶 under 光嚴 (1332–1333), then from 1336 its own line, which kept counting 建武 from 1334. */
const NORTH_ERAS = `正慶1332-1333 建武1336/1334 曆應1338 康永1342 貞和1345 觀應1350 文和1352 延文1356 康安1361 貞治1362 應安1368
永和1375 康曆1379 永德1381 至德1384 嘉慶1387 康應1389 明德1390-1392`;

/** Emperors of the single court, from 繼體 on (the dates before him are legendary); `-year` is the last year of a reign followed by a gap. */
const MAIN_EMPERORS = `
繼體507 安閑531 宣化535 欽明539-571 敏達572 用明585 崇峻587-592 推古593-628 舒明629-641 皇極642 孝德645-654 齊明655 天智661
弘文672-672 天武673 持統686 文武697 元明707 元正715 聖武724 孝謙749 淳仁758 稱德764 光仁770 桓武781 平城806 嵯峨809 淳和823
仁明833 文德850 清和858 陽成876 光孝884 宇多887 醍醐897 朱雀930 村上946 冷泉967 圓融969 花山984 一條986 三條1011 後一條1016
後朱雀1036 後冷泉1045 後三條1068 白河1073 堀河1087 鳥羽1107 崇德1123 近衛1142 後白河1155 二條1158 六條1165 高倉1168 安德1180-1185
後鳥羽1183 土御門1198 順德1210 仲恭1221-1221 後堀河1221 四條1232 後嵯峨1242 後深草1246 龜山1259 後宇多1274 伏見1287 後伏見1298
後二條1301 花園1308 後醍醐1318-1336
後小松1393 稱光1412 後花園1428 後土御門1464 後柏原1500 後奈良1526 正親町1557 後陽成1586 後水尾1611 明正1629 後光明1643
後西1654 靈元1663 東山1687 中御門1709 櫻町1735 桃園1747 後櫻町1762 後桃園1770 光格1779 仁孝1817 孝明1846-1867
明治1868 大正1912 昭和1926 明仁1989 德仁2019`;

const SOUTH_EMPERORS = '後醍醐1336 後村上1339 長慶1368 後龜山1383-1392';
const NORTH_EMPERORS = '光嚴1331-1333 光明1336 崇光1348-1351 後光嚴1352 後圓融1371 後小松1382-1392';

export const JAPAN_ERAS: Ruler[] = [...parse(MAIN_ERAS, MAIN, true), ...parse(SOUTH_ERAS, SOUTH, true), ...parse(NORTH_ERAS, NORTH, true)];
export const JAPAN_EMPERORS: Ruler[] = [
  ...parse(MAIN_EMPERORS, MAIN, false),
  ...parse(SOUTH_EMPERORS, SOUTH, false),
  ...parse(NORTH_EMPERORS, NORTH, false),
];

/** A slice longer than this lists the emperors only: a century holds too many eras to read in a heading. */
const ERA_LIST_YEARS = 10;

/**
 * Japan in the years [from, to), one string per court (two between 1336 and 1392).
 * A single year gives the era year and the emperor (「日本寬政元年（光格天皇）」); up to a decade the eras and the emperors
 * (「日本：安永、天明、寬政（光格天皇）」); a longer slice the emperors alone. Years without an era, before 645 and in the
 * two gaps of the seventh century, name the emperor with the reign (「日本 推古天皇（593–628 在位）」). Before 繼體 there is nothing.
 */
export function japanInSlice(from: number, to: number): string[] {
  const out: string[] = [];
  for (const court of [MAIN, SOUTH, NORTH]) {
    const emperors = JAPAN_EMPERORS.filter((r) => r.dynasty === court && r.start < to && r.end >= from);
    const eras =
      to - from > ERA_LIST_YEARS
        ? []
        : reignsInSlice(
            from,
            to,
            JAPAN_ERAS.filter((r) => r.dynasty === court),
          );
    if (eras.length > 0) out.push(emperors.length > 0 ? `${eras[0]}（${emperors.map((r) => r.name).join('、')}）` : eras[0]);
    else out.push(...reignsInSlice(from, to, emperors));
  }
  return out;
}
