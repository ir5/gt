import {Act} from "./simulation"
import {Game} from "./game"
import {getMCBAgent} from "./bot_mcb"


function main() {
  let pairs = new Int8Array(120);
  for (let i = 0; i < 120; i++) pairs[i] = Math.floor(Math.random() * 4) + 1;
  // let pairs = Int8Array.from([1, 1, 2, 2, 1, 1, 2, 2]);

  let game = new Game(pairs);

  let agent = getMCBAgent(40, 20);
  game.run(agent);
}

main();
