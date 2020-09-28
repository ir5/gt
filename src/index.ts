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
  field[12 * 6 + 1] = 1;
  field[10 * 6 + 1] = 1;
  field[10 * 6 + 2] = 2;
  field[8 * 6 + 2] = 3;
  render(field);
  simulateFall(field);
  render(field);
}

main();
