import {Act, simulateFall, simulateErase, simulateDrop} from "./simulation"

export type Agent = (field: Int8Array, pairs: Int8Array) => Act;

export class Game {
  field: Int8Array;
  score: number;
  turn: number;
  pairs: Int8Array;

  constructor(pairs: Int8Array) {
    this.field = new Int8Array(13 * 6);
    this.score = 0;
    this.turn = 0;
    this.pairs = pairs;
  }

  render() {
    const RESET = "\x1b[0m";
    const RED = "\x1b[0;41m";
    const GREEN = "\x1b[0;42m";
    const BLUE = "\x1b[0;44m";
    const YELLOW = "\x1b[0;43m";

    function conv(c: number) {
      if (c == 0) return ".";
      if (c == 1) return RED + "R" + RESET;
      if (c == 2) return GREEN + "G" + RESET;
      if (c == 3) return BLUE + "B" + RESET;
      if (c == 4) return YELLOW + "Y" + RESET;
      return "";
    }

    console.log("");
    console.log("########")
    for (let y = 0; y < 13; y++) {
      let line: string = "#";
      for (let x = 0; x < 6; x++) {
        let c = this.field[y * 6 + x];
        line += conv(c);
      }
      line += "#";

      const nextys = [1, 2, 4, 5, 7, 8];
      for (let i = 0; i < 6; i++) {
        if (y == nextys[i]) line += "  " + conv(this.pairs[this.turn * 2 + i]);
      }

      console.log(line);
      if (y == 0) console.log("#------#")
    }
    console.log("########");
    let s = this.score.toString();
    console.log(" " + "0".repeat(7 - s.length) + s);
  }

  run(agent: Agent) {
    this.render();

    for (; this.turn * 2 + 6 < this.pairs.length; ) {
      const i = this.turn * 2;
      const act = agent(this.field, this.pairs.slice(i, i + 6));
      simulateDrop(this.field, this.pairs.slice(i, i + 2), act);
      this.turn++;
      this.render();
      for (let chain = 1; ; chain++) {
        const score_gain = simulateErase(this.field, chain);
        if (score_gain == 0) break;
        this.score += score_gain;
        this.render();

        simulateFall(this.field);
        this.render();
      }
    }
  }
}
