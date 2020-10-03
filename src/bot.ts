import {Act, simulateAll, simulateAllWithoutAct, enumerateActs} from "./simulation"
import {enumerateFrontChains, enumerateTailChains} from "./template_enumeration"

function computeTemplateScore(field: Int8Array, template: Int8Array, forbiddenList: number[]): number {
  let c2p: Map<number, number[]> = new Map();
  for (let y = 0; y <= 12; y++) {
    for (let x = 0; x < 6; x++) {
      const c = template[y * 6 + x];
      if (c == 0) continue;
      if (!c2p.has(c)) c2p.set(c, []);
      c2p.get(c).push(y * 6 + x);
    }
  }

  let match = 0;
  let commons: Map<number, number> = new Map();
  for (const [baseColor, positions] of c2p) {
    // if distinct colors are matched, we need to return -inf.
    let commonColor = 0;
    for (const position of positions) {
      const color = field[position];
      if (color == 0) continue;
      if (commonColor == 0) commonColor = color;
      if (commonColor != color) return 0;
      match++;
    }
    commons.set(baseColor, commonColor);
  }

  // check distinct constraints
  for (let i = 0; i * 2 < forbiddenList.length; i++) {
    const c1 = forbiddenList[i * 2];
    const c2 = forbiddenList[i * 2 + 1];
    const actual1 = commons.get(c1);
    const actual2 = commons.get(c2);
    if (actual1 == 0 || actual2 == 0) continue;
    if (actual1 == actual2) return 0;
  }

  return match;
}

function computeHeightScore(field: Int8Array): number {
  let heights = new Array<number>(6).fill(13);
  for (let x = 0; x < 6; x++) {
    for (let y = 12; y >= 0; y--) {
      if (field[y * 6 + x] == 0) {
        heights[x] = 12 - y;
        break;
      }
    }
  }
  // console.log(heights);

  if (heights[1] - heights[0] >= 2) return -1e9;
  for (let x = 1; x < 5; x++) {
    if (heights[x] - heights[x - 1] >= 2 && heights[x] - heights[x + 1] >= 2) return -1e9;
  }
  for (let x = 0; x < 5; x++) {
    if (Math.abs(heights[x] - heights[x + 1]) >= 3) {
      return -1e9;
    }
  }
  return 0;
}

function render(field: Int8Array): string[] {
  let lines: string[] = [];

  const RESET = "\x1b[0m";
  for (let y = 1; y <= 12; y++) {
    let line: string = "#";
    for (let x = 0; x < 6; x++) {
      let c = field[y * 6 + x];
      if (c > 0) line += "" + "\x1b[0;" + (40 + c) + "m" + c + RESET;
      else line += ".";
    }
    line += "#";

    lines.push(line);
  }
  lines.push("########");
  return lines;
}

export function getGTRAgent(): (field: Int8Array, pairs: Int8Array) => Act {
  const templates = enumerateTailChains(5);
  let forbiddens: number[][] = [];
  for (let i = 0; i < templates.length; i++) {
    const C = 5; // max chain number
    let fieldTemp = Int8Array.from(templates[i]);
    fieldTemp[0 * 6 + 2] = C;
    const scoreBase = simulateAllWithoutAct(fieldTemp);
    console.log(scoreBase);

    let forbidden: number[] = [];
    for (let c1 = 1; c1 <= C; c1++)
    for (let c2 = 1; c2 < c1; c2++) {
      let field = Int8Array.from(templates[i]);
      for (let j = 0; j < field.length; j++) {
        if (field[j] == c2) field[j] = c1;
      }

      field[0 * 6 + 2] = C;
      let scoreCurr = simulateAllWithoutAct(field);
      if (scoreCurr != scoreBase) {
        forbidden.push(c1);
        forbidden.push(c2);
      }
    }
    forbiddens.push(forbidden);
  }

  for (let k = 0; k < templates.length; k++) {
    const lines = render(templates[k]);
    for (let line of lines) console.log(line);
    for (let i = 0; i < forbiddens[k].length; i += 2) {
      console.log("" + forbiddens[k][i] + "" + forbiddens[k][i + 1]);
    }
  }

  function computeScore(field: Int8Array) {
    let templateScoreMax = 0;
    let templateScorePositive = 0;
    for (let i = 0; i < templates.length; i++) {
      const score = computeTemplateScore(field, templates[i], forbiddens[i]);
      templateScoreMax = Math.max(score, templateScoreMax); 
      templateScorePositive += score > 0 ? 1 : 0;
    }
    let heightScore = computeHeightScore(field);
    /*
    console.log(templateScoreMax, heightScore, templateScorePositive)
    for (let line of render(field)) {
      console.log(line);
    }
    */
    return (templateScoreMax * 100 + heightScore) * 10000 + templateScorePositive;
  }

  function agentImpl(field: Int8Array, pairs: Int8Array) {
    let bestScore = -1e9;
    let bestAct: Act = [0, 0];
    let actlist: Act[] = [];

    function search(currField: Int8Array, turn: number) {
      if (turn == 3) {
        const score = computeScore(currField);
        if (actlist.length > 0) {
          if (score > bestScore) {
            console.log(score, actlist);
            bestAct = actlist[0];
            bestScore = score;
          }
        }
        return;
      }

      const pair = pairs.slice(2 * turn, 2 * turn + 2);
      const acts = enumerateActs(pair);
      for (const act of acts) {
        actlist.push(act);
        let nextField = Int8Array.from(currField);
        let score = simulateAll(nextField, pair, act);
        if (score == 0) {
          search(nextField, turn + 1);
        }
        actlist.pop();
      }
    }

    search(field, 0);
    console.log(bestScore);
    return bestAct;
  }

  return agentImpl;
}
