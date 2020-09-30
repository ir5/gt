import {Act, simulateAll, enumerateActs} from "./simulation"

function computeTemplateScore(field: Int8Array, template: string, forbiddenList: string): number {
  let c2p: Map<string, number[]> = new Map();
  for (let y = 0; y <= 12; y++) {
    for (let x = 0; x < 6; x++) {
      const c = template[y * 6 + x];
      if (c == ".") continue;
      if (!c2p.has(c)) c2p.set(c, []);
      c2p.get(c).push(y * 6 + x);
    }
  }

  let match = 0;
  let commons: Map<string, number> = new Map();
  for (const [baseColor, positions] of c2p) {
    // if distinct colors are matched, we need to return -inf.
    let commonColor = 0;
    for (const position of positions) {
      const color = field[position];
      if (color == 0) continue;
      if (commonColor == 0) commonColor = color;
      if (commonColor != color) return -1e9;
      match++;
    }
    commons.set(baseColor, commonColor);
  }

  // check distinct constraints
  for (let i = 0; i < forbiddenList.length; i += 2) {
    const c1 = forbiddenList[i * 2];
    const c2 = forbiddenList[i * 2 + 1];
    if (!commons.has(c1) || !commons.has(c2)) continue;
    if (commons.get(c1) == commons.get(c2)) return -1e9;
  }

  return 100 * match;
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

  const weights = [1, 2, 3, 3, 5, 6];
  let score = 0;
  for (let x = 0; x < 6; x++) score += -weights[x] * heights[x];
  return score;
}

function computeScore(field: Int8Array): number {
  // hand tuned templates...
  const TFs: [string, string][] = [
    [
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "XYZ..5" +
      "123455" +
      "112344" +
      "223345", "122334451X2Y3Z"
    ],
    [
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "XYZ5.." +
      "123455" +
      "112345" +
      "223344", "122334451X2Y3Z"
    ],
    [
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "XYZ45." +
      "12345." +
      "112345" +
      "223345", "122334451X2Y3Z"
    ],
    [
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "XYZ.5." +
      "123545" +
      "112335" +
      "223444", "12233445351X2Y3Z"
    ],
    [
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "XYZ.55" +
      "123545" +
      "112333" +
      "223444", "12233445351X2Y3Z"
    ],
    [
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      ".....5" +
      "XYZ.55" +
      "123544" +
      "112333" +
      "223444", "12233445351X2Y3Z"
    ],
    [
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "XYZ.5." +
      "123545" +
      "112334" +
      "223544", "12233445351X2Y3Z"
    ],
    [
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "......" +
      "XYZ.5." +
      "123445" +
      "112334" +
      "223545", "12233445351X2Y3Z"
    ],
  ];

  let templateScore = -1e9;
  for (let [template, forbidden] of TFs) {
    templateScore = Math.max(templateScore, computeTemplateScore(field, template, forbidden));
  }
  let heightScore = computeHeightScore(field);
  return templateScore + heightScore;
}

export function gtrAgent(field: Int8Array, pairs: Int8Array): Act {

  let bestScore = -1e9;
  let bestAct: Act = [0, 0];
  let actlist: Act[] = [];

  function search(currField: Int8Array, turn: number) {
    const filled = currField.reduce((acc, curr) => (acc + (curr != 0 ? 1 : 0)), 0);
    if (filled >= 44 || turn == 3) {
      const score = computeScore(currField);
      if (actlist.length > 0) {
        if (score > bestScore) {
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
      simulateAll(nextField, pair, act);
      search(nextField, turn + 1);
      actlist.pop();
    }
  }

  search(field, 0);
  return bestAct;
}
