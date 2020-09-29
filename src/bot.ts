function computeTemplateScore(field: Int8Array, template: string): number {
  let c2p: Map<string, number[]> = new Map();
  for (let y = 0; y <= 12; y++) {
    for (let x = 0; x < 6; x++) {
      const c = template[y * 6 + x];
      if (c == ".") continue;
      if (!c2p.has(c)) c2p.set(c, []);
      c2p.get(c).push([y * 6 + x]);
    }
  }

  let match = 0;
  for (const positions of c2p.values()) {
    // if distinct colors are matched, we need to return -inf.
    let commonColor = ".";
    for (const position of positions) {
      const color = field[position];
      if (color == ".") continue;
      if (commonColor == ".") commonColor = color;
      if (commonColor != color) return -1e9;
      match++;
    }
  }

  return 0;
}

export function test() {
  const template1 = 
    "......" +
    "......" +
    "......" +
    "......" +
    "......" +
    "......" +
    "......" +
    "......" +
    "......" +
    "......" +
    "......" +
    "YYX..." +
    "XXZ...";

  let field = new Int8Array(13 * 6);
  computeTemplateScore(field, template1);
}
