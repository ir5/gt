// field is represented by Int8Array of 13*6 elements.
// A cell at the i-th row from top in the j-th column from left is field[i*6+j].
// When element == 0, it means an empty cell.
// When element >= 1, the cell is occupied by a puyo.

function simulateFall(field: Int8Array) {
  for (let x = 0; x < 6; x++) {
    let bottom = 12;
    for (let y = 12; y >= 0; y--) {
      const index = y * 6 + x;
      if (field[index] > 0) {
        const val = field[index];
        field[index] = 0;
        field[bottom * 6 + x] = val;
        bottom--;
      }
    }
  }
}

function simulateErase(field: Int8Array, chain: number): number {
  // chain should be >= 1
  let visited = new Int8Array(13 * 6);
  const chain_bonus_list = [0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480, 512];
  const group_bonus_list = [0, 2, 3, 4, 5, 6, 7, 10];
  const color_bonus_list = [0, 0, 3, 6, 12];

  function dfs(y: number, x: number, c: number, f: number): number {
    if (y <= 0 || x < 0 || y > 12 || x >= 6) return 0;
    const index = y * 6 + x;
    if (field[index] != c) return 0;
    if (visited[index] == f) return 0;
    visited[index] = f;
    return 1 + dfs(y - 1, x, c, f) + dfs(y + 1, x, c, f) + dfs(y, x - 1, c, f) + dfs(y, x + 1, c, f);
  };

  let colors = new Set();
  let group_bonus = 0;
  let total = 0;
  for (let y = 1; y <= 12; ++y) {
    for (let x = 0; x < 6; ++x) {
      let c = field[y * 6 + x];
      if (c == 0 || visited[y * 6 + x]) continue;
      const count = dfs(y, x, c, 1);
      if (count <= 3) continue;
      group_bonus += group_bonus_list[count - 4];  // FIXME: crush when count >= 12
      total += count;
      colors.add(c);

      // mark erase flag
      dfs(y, x, c, 2);
    }
  }
  const color_bonus = color_bonus_list[colors.size];
  const chain_bonus = chain_bonus_list[chain - 1];

  const score = 10 * total * Math.max(chain_bonus + group_bonus + color_bonus, 1);

  // perform erasion
  for (let y = 1; y <= 12; ++y) {
    for (let x = 0; x < 6; ++x) {
      if (visited[y * 6 + x] == 2) field[y * 6 + x] = 0;
    }
  }

  return score;
}

function simulateDrop(field: Int8Array, pair: Int8Array, pos: number, dir: number): boolean {
  // dir: 0 --> no rotation
  // dir: 1 --> 90 degree right rotation
  // dir: 2 --> 180 degree rotation
  // dir: 3 --> 90 degree left rotation
  
  // dir: 0 or 2
  // a
  // b
  // dir: 1 or 3
  // a b

  if (pos < 0 || pos >= 6) return false;
  if (dir % 2 == 1 && pos == 5) return false;

  let which = (dir == 0 || dir == 3) ? 0 : 1;
  const a = pair[which];
  const b = pair[1 - which];

  if (dir % 2 == 0) {
    if (field[1 * 6 + pos] != 0) return false;
    field[0 * 6 + pos] = b;
    simulateFall(field);
    field[0 * 6 + pos] = a;
    simulateFall(field);
  } else {
    if (field[0 * 6 + pos] || field[0 * 6 + pos + 1]) return false;
    field[0 * 6 + pos] = a;
    field[0 * 6 + pos + 1] = b;
    simulateFall(field);
  }
  return true;
}

function render(field: Int8Array) {
  const RESET = "\033[0m";
  const RED = "\033[0;41m";
  const GREEN = "\033[0;42m";
  const BLUE = "\033[0;44m";
  const YELLOW = "\033[0;43m";

  console.log("########")
  for (let y = 0; y < 13; y++) {
    let line: string = "#";
    for (let x = 0; x < 6; x++) {
      let c = field[y * 6 + x];
      if (c == 0) line += ".";
      if (c == 1) line += RED + "R" + RESET;
      if (c == 2) line += GREEN + "G" + RESET;
      if (c == 3) line += BLUE + "B" + RESET;
      if (c == 4) line += YELLOW + "Y" + RESET;
    }
    line += "#";
    console.log(line);
    if (y == 0) console.log("#------#")
  }
  console.log("########")
}

function main() {
  let field = new Int8Array(13 * 6);

  let aaa = [
    "1.....",
    "2...43",
    "1.2223",
    "441244",
    "311424",
    "144233",
    "133423",
    "344321",
    "114311",
    "123434",
    "224113",
    "111344",
    "444334",
  ];

  /*
  for (let y = 0; y <= 12; y++) {
    for (let x = 0; x < 6; x++) {
      let c = aaa[y].charAt(x);
      if ('1' <= c && c <= '4') field[y * 6 + x] = parseInt(c);
    }
  }

  let total = 0;
  for (let chain = 1; ; chain++) {
    simulateFall(field);
    render(field);
    let score = simulateErase(field, chain);
    if (score == 0) break;
    total += score;
    console.log(total);
    render(field);
  }
  */

  let pairs = new Int8Array(8);
  pairs[0] = 1;
  pairs[1] = 2;
  simulateDrop(field, pairs.slice(0, 2), 4, 3);
  simulateDrop(field, pairs.slice(0, 2), 4, 3);
  simulateDrop(field, pairs.slice(0, 2), 4, 3);
  simulateDrop(field, pairs.slice(0, 2), 4, 3);
  render(field);
}

main();
