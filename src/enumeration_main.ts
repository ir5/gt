import {simulateDrop} from "./simulation"
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

function enumerateChains(patterns: GroupPattern[], maxChain: number): Int8Array[] {
  function search(now: Int8Array) {
  }
  return null;
}

function render(field: Int8Array) {
  console.log("########")
  for (let y = 0; y < 13; y++) {
    let line: string = "#";
    for (let x = 0; x < 6; x++) {
      let c = field[y * 6 + x];
      if (c > 0) line += "" + c;
      else line += ".";
    }
    line += "#";

    console.log(line);
    if (y == 0) console.log("#------#")
  }
  console.log("########");
}

let patterns = enumerateGroupPattern([2, 3]);
console.log(patterns);

let field = new Int8Array(13 * 6);

let pattern: GroupPattern = [[0, 2], [0, 2]];

console.log(liftUp(field, 3, 11, pattern, 1));
console.log(liftUp(field, 3, 10, pattern, 2));
render(field);
