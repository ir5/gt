import {Act} from "./simulation"
import {Game} from "./game"
import {getGTRAgent} from "./bot"


function main() {
  let pairs = new Int8Array(100);
  for (let i = 0; i < 100; i++) pairs[i] = Math.floor(Math.random() * 4) + 1;
  // let pairs = Int8Array.from([1, 1, 2, 2, 1, 1, 2, 2]);

  let game = new Game(pairs);

  let agent = getGTRAgent();
  // game.run(dummy);
  game.run(agent);
}

main();
