import type { LifespanScale } from './lifespanScale';
import { formatYear } from './parseDate';

/** A Chinese ruler's reign; years are BC-negative like the rest of the app. */
export interface Ruler {
  name: string;
  dynasty: string;
  start: number;
  end: number;
}

type Reign = [name: string, start: number, end: number];

/**
 * Reigns of the unified dynasties, in order (Eastern Zhou kings from 周敬王 on; Ming and Qing by era name).
 * Periods of division (三國, 南北朝, 五代十國) have several rival courts and are left out, as are reigns of a few months.
 */
const DYNASTIES: [dynasty: string, reigns: Reign[]][] = [
  ['東周', [['周敬王', -519, -476], ['周元王', -475, -469], ['周貞定王', -468, -441], ['周考王', -440, -426], ['周威烈王', -425, -402], ['周安王', -401, -376], ['周烈王', -375, -369], ['周顯王', -368, -321], ['周慎靚王', -320, -315], ['周赧王', -314, -256]]],
  ['秦', [['秦始皇', -221, -210], ['秦二世', -209, -207]]],
  ['西漢', [['漢高祖', -202, -195], ['漢惠帝', -194, -188], ['呂后臨朝', -187, -180], ['漢文帝', -179, -157], ['漢景帝', -156, -141], ['漢武帝', -140, -87], ['漢昭帝', -86, -74], ['漢宣帝', -73, -49], ['漢元帝', -48, -33], ['漢成帝', -32, -7], ['漢哀帝', -6, -1], ['漢平帝', 1, 5]]],
  ['新', [['王莽', 9, 23]]],
  ['東漢', [['漢光武帝', 25, 57], ['漢明帝', 58, 75], ['漢章帝', 76, 88], ['漢和帝', 89, 105], ['漢安帝', 106, 125], ['漢順帝', 126, 144], ['漢桓帝', 147, 167], ['漢靈帝', 168, 189], ['漢獻帝', 189, 220]]],
  ['隋', [['隋文帝', 581, 604], ['隋煬帝', 604, 618]]],
  ['唐', [['唐高祖', 618, 626], ['唐太宗', 626, 649], ['唐高宗', 649, 683], ['唐睿宗', 684, 690], ['武則天', 690, 705], ['唐中宗', 705, 710], ['唐睿宗', 710, 712], ['唐玄宗', 712, 756], ['唐肅宗', 756, 762], ['唐代宗', 762, 779], ['唐德宗', 779, 805], ['唐憲宗', 805, 820], ['唐穆宗', 820, 824], ['唐敬宗', 824, 826], ['唐文宗', 826, 840], ['唐武宗', 840, 846], ['唐宣宗', 846, 859], ['唐懿宗', 859, 873], ['唐僖宗', 873, 888], ['唐昭宗', 888, 904], ['唐哀帝', 904, 907]]],
  ['北宋', [['宋太祖', 960, 976], ['宋太宗', 976, 997], ['宋真宗', 997, 1022], ['宋仁宗', 1022, 1063], ['宋英宗', 1063, 1067], ['宋神宗', 1067, 1085], ['宋哲宗', 1085, 1100], ['宋徽宗', 1100, 1126], ['宋欽宗', 1126, 1127]]],
  ['南宋', [['宋高宗', 1127, 1162], ['宋孝宗', 1162, 1189], ['宋光宗', 1189, 1194], ['宋寧宗', 1194, 1224], ['宋理宗', 1224, 1264], ['宋度宗', 1264, 1274], ['宋恭帝', 1274, 1276], ['宋端宗', 1276, 1278], ['宋末帝', 1278, 1279]]],
  ['元', [['元世祖', 1260, 1294], ['元成宗', 1294, 1307], ['元武宗', 1307, 1311], ['元仁宗', 1311, 1320], ['元英宗', 1320, 1323], ['泰定帝', 1323, 1328], ['元文宗', 1328, 1332], ['元順帝', 1333, 1368]]],
  ['明', [['洪武', 1368, 1398], ['建文', 1398, 1402], ['永樂', 1402, 1424], ['宣德', 1425, 1435], ['正統', 1435, 1449], ['景泰', 1449, 1457], ['天順', 1457, 1464], ['成化', 1464, 1487], ['弘治', 1487, 1505], ['正德', 1505, 1521], ['嘉靖', 1521, 1567], ['隆慶', 1567, 1572], ['萬曆', 1572, 1620], ['天啟', 1620, 1627], ['崇禎', 1627, 1644]]],
  ['清', [['順治', 1644, 1661], ['康熙', 1661, 1722], ['雍正', 1722, 1735], ['乾隆', 1735, 1796], ['嘉慶', 1796, 1820], ['道光', 1820, 1850], ['咸豐', 1850, 1861], ['同治', 1861, 1875], ['光緒', 1875, 1908], ['宣統', 1908, 1912]]],
];

export const CHINESE_RULERS: Ruler[] = DYNASTIES.flatMap(([dynasty, reigns]) => reigns.map(([name, start, end]) => ({ name, dynasty, start, end })));

export interface RulerBar {
  ruler: Ruler;
  left: number;
  width: number;
  /** Hover text with the full reign, e.g. 清 康熙（1661–1722 在位）. */
  title: string;
  /** Set on the widest piece of a reign only, so a reign split by an axis break is labelled once. */
  label?: string;
}

/**
 * Lay the reigns out on the lifespan axis. Each reign is cut to the visible segments, and a reign that
 * overlaps the previous one (元世祖 began in 1260, before the Southern Song fell in 1279) starts where the previous one ends.
 */
export function rulerBars(scale: LifespanScale, rulers: Ruler[] = CHINESE_RULERS): RulerBar[] {
  const bars: RulerBar[] = [];
  let prevEnd = -Infinity;
  for (const ruler of rulers) {
    const start = Math.max(ruler.start, prevEnd);
    prevEnd = Math.max(prevEnd, ruler.end);
    const title = `${ruler.dynasty} ${ruler.name}（${formatYear(ruler.start)}–${formatYear(ruler.end)} 在位）`;
    const pieces = scale.segments
      .map((s) => [Math.max(start, s.start), Math.min(ruler.end, s.end)])
      .filter(([a, b]) => a < b)
      .map(([a, b]): RulerBar => ({ ruler, left: scale.xOf(a), width: scale.xOf(b) - scale.xOf(a), title }));
    if (pieces.length === 0) continue;
    const widest = pieces.reduce((w, p) => (p.width > w.width ? p : w));
    widest.label = `${ruler.name}（${formatYear(ruler.start)}–${formatYear(ruler.end)}）`;
    bars.push(...pieces);
  }
  return bars;
}
