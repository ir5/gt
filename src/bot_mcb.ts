// monte carlo + beam search
import {Act, simulateAll, simulateAllWithoutAct, enumerateActs} from "./simulation"

const G1 = [[12, 0], [12, 1], [11, 2], [10, 1]];
const G2 = [[11, 0], [11, 1], [10, 0]];
const G3 = [[12, 2], [11, 3], [11, 4], [10, 2]];
function evaluate(field: Int8Array, gainedScore: number) {
  let maxScore = 0;
  for (let color = 1; color <= 4; color++) {
    for (let x = 0; x < 6; x++) {
      if (field[1 * 6 + x] > 0) continue;
      let copyField = Int8Array.from(field);
      copyField[1 * 6 + x] = color;
      let currScore = simulateAllWithoutAct(copyField);
      maxScore = Math.max(currScore, maxScore);
    }
  }
  return maxScore;
  // return gainedScore;

  /*

  // GTR score
  let matched = 0;
  for (const Gs of [G1, G2, G3]) {
    let common = 0;
    for (const [y, x] of Gs) {
      const c = field[y * 6 + x];
      if (c == 0) continue;
      if (common == 0) common = c;
      if (common != c) matched -= 100;
      matched++;
    }
  }
  const matchScore = 0; // Math.max(0, matched) * 1000000;

  return matchScore + gainedScore;
  */
}


export function getMCBAgent(beamWidth: number, beamDepth: number): (field: Int8Array, pairs: Int8Array) => Act {
  function agentImpl(field: Int8Array, pairs: Int8Array) {

    // extend the pairs array
    let ext = new Int8Array(beamDepth * 2 + 6);
    for (let i = 0; i < beamDepth * 2 + 6; i++) ext[i] = Math.floor(Math.random() * 4) + 1;
    pairs = Int8Array.from([...pairs, ...ext]);

    const actsFirst = enumerateActs(pairs.slice(0, 2));
    let bestScore = -1e9;
    let bestAct: Act = null;
    for (const actFirst of actsFirst) {
      // perform beam search to compute the score of this action
      let candidateScore = -1e9;

      let cands: Int8Array[] = [Int8Array.from(field)];
      for (let iter = 0; iter < beamDepth; iter++) {
        const pair = pairs.slice(iter * 2, iter * 2 + 2);
        const actList = (iter == 0) ? [actFirst] : enumerateActs(pair);

        let nextFieldList: Int8Array[] = [];
        let scoreList: [number, number, boolean][] = [];  // [score, reference index to nextFieldList, terminal]

        for (const cand of cands) {
          for (const act of actList) {
            let nextField = Int8Array.from(cand);
            const gainedScore = simulateAll(nextField, pair, act);
            if (gainedScore < 0) continue;

            let evalScore = evaluate(nextField, gainedScore);
            if (iter <= 1 && gainedScore > 50000) evalScore += 1e7;
            nextFieldList.push(nextField);
            const terminal = gainedScore > 0;
            scoreList.push([evalScore, scoreList.length, terminal]);
          }
        }

        // take top candidates
        scoreList.sort((a, b) => b[0] - a[0]);
        let nextCands = [];
        for (let i = 0; i < Math.min(beamWidth, scoreList.length); i++) {
          if (scoreList[i][2]) continue;  // terminal
          const idx = scoreList[i][1];
          nextCands.push(nextFieldList[idx]);
        }
        if (scoreList.length > 0) {
          candidateScore = Math.max(candidateScore, scoreList[0][0]);
        }
        cands = nextCands;
      }

      if (candidateScore > bestScore) {
        bestScore = candidateScore;
        bestAct = actFirst;
      }
    }
    console.log(bestScore);
    return bestAct;
  }
  return agentImpl;
}
