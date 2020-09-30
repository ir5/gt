import {Act} from "./simulation"
import {Game} from "./game"
import {gtrAgent} from "./bot"


function main() {
  let pairs = new Int8Array(36);
  for (let i = 0; i < 36; i++) pairs[i] = Math.floor(Math.random() * 4) + 1;

  let game = new Game(pairs);

  function dummy(field: Int8Array, pairs: Int8Array): Act {
    return [0, 1];
  }
  // game.run(dummy);
  game.run(gtrAgent);
}

main();
