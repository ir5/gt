// monte carlo + beam search
import {Act, simulateAll, simulateAllWithoutAct, enumerateActs} from "./simulation"

function evaluate(field: Int8Array, gainedScore: number) {
  // TODO: improve
  return gainedScore;
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
        let scoreList: [number, number][] = [];  // [score, reference index to nextFieldList]

        for (const cand of cands) {
          for (const act of actList) {
            let nextField = Int8Array.from(cand);
            let gainedScore = simulateAll(nextField, pair, act);
            if (gainedScore < 0) continue;

            let evalScore = evaluate(nextField, gainedScore);
            nextFieldList.push(nextField);
            scoreList.push([evalScore, scoreList.length]);
          }
        }

        // take top candidates
        scoreList.sort((a, b) => b[0] - a[0]);
        cands = [];
        for (let i = 0; i < Math.min(beamWidth, scoreList.length); i++) {
          const idx = scoreList[i][1];
          cands.push(nextFieldList[idx]);
        }
        if (scoreList.length > 0) {
          candidateScore = Math.max(candidateScore, scoreList[0][0]);
        }
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
