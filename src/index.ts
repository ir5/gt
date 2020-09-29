import {Act} from "./simulation"
import {Game} from "./game"

function main() {
  let pairs = new Int8Array(12);
  for (let i = 0; i < 12; i++) pairs[i] = (i * 7 % 4) + 1;

  let game = new Game(pairs);

  function dummy(field: Int8Array, pairs: Int8Array): Act {
    return [0, 1];
  }
  game.run(dummy);
}

main();
