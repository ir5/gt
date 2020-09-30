import {Act} from "./simulation"
import {Game} from "./game"
import {gtrAgent} from "./bot"


function main() {
  let pairs = Int8Array.from([3,3,1,2,2,1,2,2,2,3,4,3,2,1,2,4,3,4,2,2,3,1]);

  let game = new Game(pairs);

  function dummy(field: Int8Array, pairs: Int8Array): Act {
    return [0, 1];
  }
  // game.run(dummy);
  game.run(gtrAgent);
}

main();
