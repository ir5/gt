import {enumerateTailChains, enumerateFrontChains} from "./template_enumeration"


function render(field: Int8Array): string[] {
  let lines: string[] = [];

  const RESET = "\x1b[0m";
  for (let y = 1; y <= 12; y++) {
    let line: string = "#";
    for (let x = 0; x < 6; x++) {
      let c = field[y * 6 + x];
      if (c > 0) line += "" + "\x1b[0;" + (40 + c) + "m" + c + RESET;
      else line += ".";
    }
    line += "#";

    lines.push(line);
  }
  lines.push("########");
  return lines;
}

function renderList(fieldList: Int8Array[]) {
  const W = 16;
  for (let i = 0; i < fieldList.length; i++) {
    let linesList: string[][] = [];
    for (let j = 0; j < W; j++) {
      if (i * W + j >= fieldList.length) break;
      linesList.push(render(fieldList[i * W + j]));
    }
    if (linesList.length == 0) break;

    for (let k = 0; k < linesList[0].length; k++) {
      let line = "";
      for (let j = 0; j < linesList.length; j++) {
        line += linesList[j][k];
        line += "  ";
      }
      console.log(line);
    }
    console.log("");
  }
  console.log("TOTAL=" + fieldList.length);
}

{
  const fieldList = enumerateTailChains(4);
  renderList(fieldList);
}
{
  const fieldList = enumerateFrontChains(3);
  renderList(fieldList);
}
