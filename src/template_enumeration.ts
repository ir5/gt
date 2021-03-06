import {simulateFall, simulateErase} from "./simulation"
import {default as isEqual} from "lodash.isequal"

type GroupPattern = [number, number][];  // [top, bottom]

function enumerateGroupPattern(heights: number[]): GroupPattern[] {
  const n = heights.length;
  let patterns: GroupPattern[] = []

  function search(now: GroupPattern, idx: number) {
    if (now.length == n) {
      patterns.push([...now]);
      return;
    }
    const h = heights[idx];
    const [top, bottom] = now[idx - 1];
    for (let y = top - h + 1; y < bottom; y++) {
      now.push([y, y + h]);
      search(now, idx + 1);
      now.pop();
    }
  }

  search([[0, heights[0]]], 1);

  return patterns;
}

function getHeights(field: Int8Array): number[] {
  let heights = new Array<number>(6).fill(13);
  for (let x = 0; x < 6; x++) {
    for (let y = 12; y >= 0; y--) {
      if (field[y * 6 + x] == 0) {
        heights[x] = 12 - y;
        break;
      }
    }
  }
  return heights;
}

function liftUp(field: Int8Array, xoffset: number, yoffset: number, pattern: GroupPattern, chain: number): boolean {
  for (let ix = 0; ix < pattern.length; ix++) {
    const x = ix + xoffset;
    let height = 13;
    for (let y = 12; y >= 0; y--) {
      if (field[y * 6 + x] == 0) {
        height = 12 - y;
        break;
      }
    }
    const ylift = pattern[ix][1] - pattern[ix][0];
    if (height + ylift > 13) return false;
    if (yoffset + pattern[ix][1] > 13) return false;
  }

  for (let ix = 0; ix < pattern.length; ix++) {
    const x = ix + xoffset;
    const ylift = pattern[ix][1] - pattern[ix][0];
    const ytop = yoffset + pattern[ix][0];
    const ybottom = yoffset + pattern[ix][1];
    for (let y = 0; y <= ytop; y++) {
      field[y * 6 + x] = field[(y + ylift) * 6 + x];
    }
    for (let y = ytop; y < ybottom; y++) {
      field[y * 6 + x] = chain;
    }
  }
  return true;
}

function checkLiftUp(field: Int8Array, xoffset: number, yoffset: number, pattern: GroupPattern, chain: number): Int8Array {
  const fieldBeforeLiftUp = Int8Array.from(field);
  if (!liftUp(field, xoffset, yoffset, pattern, chain)) return null;
  const fieldAfterLiftUp = Int8Array.from(field);
  simulateFall(field);
  const fieldAfterFall = Int8Array.from(field);
  if (!isEqual(fieldAfterFall, fieldAfterLiftUp)) return null;

  simulateErase(field, 1);
  simulateFall(field);
  if (!isEqual(field, fieldBeforeLiftUp)) return null;

  return fieldAfterLiftUp; // true;
}

function getDefaultGroupPatterns(): GroupPattern[] {
  const heightsList = [
    [1, 1, 2],
    [1, 2, 1],
    [2, 1, 1],
    [2, 2],
    [1, 2, 2],
    [1, 3],
  ];
  let patterns: GroupPattern[] = [];
  for (const heights of heightsList) {
    patterns = patterns.concat(enumerateGroupPattern(heights));
  }
  return patterns;
}

export function enumerateTailChains(maxChain: number): Int8Array[] {
  const patterns = getDefaultGroupPatterns();
  const lastPatterns: GroupPattern[] = [
    [[0, 2], [0, 1], [0, 1]],
    [[0, 2], [0, 2]],
    [[0, 2], [0, 1], [0, 1], [0, 1]],
    [[0, 2], [0, 1], [0, 2]],
  ];
  let res: Int8Array[] = [];
  function search(field: Int8Array, chain: number) {
    let savedField = [...field];
    if (chain == maxChain) {
      // last chain should be constrained to be GTR's formation
      for (let lastPattern of lastPatterns) {
        let nextField = checkLiftUp(field, 2, 11, lastPattern, chain);
        if (nextField) {
          // filtering rule?
          const heights = getHeights(nextField);
          if (heights[3] > heights[4]) continue;
          if (heights[4] - heights[3] > 2) continue;
          if (heights[4] > heights[5]) continue;
          if (heights[5] - heights[4] > 1) continue;
          nextField[11 * 6 + 2] = 0;
          nextField[10 * 6 + 2] = chain;
          res.push(nextField);
        }
        field = Int8Array.from(savedField);
      }
      return;
    }

    for (let pattern of patterns) {
      for (let yoffset = 11; yoffset <= 12; yoffset++) {
        for (let xoffset = 3; xoffset + pattern.length <= 6; xoffset++) {
          let nextField = checkLiftUp(field, xoffset, yoffset, pattern, chain);
          if (nextField) {
            search(nextField, chain + 1);
          }
          field = Int8Array.from(savedField);
        }
      }
    }
  }

  let field = new Int8Array(13 * 6);
  search(field, 1);

  return res;
}

export function enumerateFrontChains(maxChain: number): Int8Array[] {
  const patterns = getDefaultGroupPatterns();
  let res: Int8Array[] = [];
  function search(field: Int8Array, chain: number) {
    if (chain > maxChain) {
      const heights = getHeights(field);
      if (heights[1] - heights[0] > 1) return;
      if (heights[1] - heights[2] > 2) return;
      let y2 = 13 - heights[2];
      if (field[y2 * 6 + 2] != maxChain + 3) return;

      // check that (y2, 2) is a trigger point.
      field[y2 * 6 + 2] = 0;
      if (simulateErase(field, 1) > 0) return;
      res.push(Int8Array.from(field));
      return;
    }

    let savedField = [...field];
    for (let pattern of patterns) {
      for (let yoffset = 0; yoffset <= 9; yoffset++) {
        let ok = true;
        for (let ix = 0; ix < pattern.length; ix++) {
          if (yoffset + pattern[ix][1] > 10) ok = false;
        }
        if (!ok) continue;

        for (let xoffset = 0; xoffset + pattern.length <= 3; xoffset++) {
          let nextField = checkLiftUp(field, xoffset, yoffset, pattern, chain + 3);
          if (nextField) {
            search(nextField, chain + 1);
          }
          field = Int8Array.from(savedField);
        }
      }
    }
  }

  let fieldStr =
      "000000" +
      "000000" +
      "000000" +
      "000000" +
      "000000" +
      "000000" +
      "000000" +
      "000000" +
      "000000" +
      "300000" +
      "321000" +
      "332100" +
      "221100";
  let field = new Int8Array(fieldStr.length);
  for (let i = 0; i < field.length; i++) field[i] = parseInt(fieldStr[i]);
  search(field, 1);

  return res;
}
