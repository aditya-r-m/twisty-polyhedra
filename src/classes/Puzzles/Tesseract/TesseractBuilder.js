function buildTesseractCycles(stickers) {
  let smap = {};
  let cycles = [];
  let axes = ["w", "x", "y", "z"];
  let abs = Math.abs;
  let sreps = stickers.map((s) => {
    smap[s.id] = s;
    let [w, x, y, z] = s.id.split("|").map((i) => parseInt(i));
    return { w, x, y, z };
  });
  sreps.forEach((s) => {
    if (axes.reduce((c, a) => c + !s[a], 0) !== 2) return;
    let primaryAxis = axes.reduce((c, a) => (abs(s[c]) > abs(s[a]) ? c : a));
    let attachedSreps = sreps.filter(
      (t) =>
        s[primaryAxis] === t[primaryAxis] ||
        s[primaryAxis] === 4 * t[primaryAxis]
    );
    let faxes = axes.filter((a) => s[a] !== s[primaryAxis]);
    let nzi = faxes.findIndex((a) => s[a]);
    let [a1, a2] = [(nzi + 1) % 3, (nzi + 2) % 3].map((i) => faxes[i]);

    let nx = {};
    attachedSreps.forEach((asr) => {
      let nxsr = Object.assign({}, asr);
      [nxsr[a1], nxsr[a2]] = rotate2(nxsr[a1], nxsr[a2], Math.PI / 2).map((v) =>
        Math.round(v)
      );
      nx[[asr.w, asr.x, asr.y, asr.z].join("|")] = [
        [nxsr.w, nxsr.x, nxsr.y, nxsr.z].join("|"),
      ];
    });

    let stickerCollections = [];
    for (let s of Object.keys(nx)) {
      if (!nx[s]) continue;
      let stickerCollection = [];
      while (s in nx) {
        stickerCollection.push(smap[nx[s]]);
        let ns = nx[s];
        delete nx[s];
        s = ns;
      }
      stickerCollections.push(stickerCollection);
    }
    cycles.push(
      new Cycle(
        [s.w, s.x, s.y, s.z].join("|"),
        stickerCollections,
        4,
        undefined,
        undefined
      )
    );
  });
  return cycles;
}

function buildTesseractStickers(offset, del, radius) {
  let stickers = [];
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++)
        stickers.push(
          new TesseractSticker(
            "yellow",
            -offset,
            i * del,
            j * del,
            k * del,
            radius
          ),
          new TesseractSticker(
            "white",
            offset,
            i * del,
            j * del,
            k * del,
            radius
          ),
          new TesseractSticker(
            "blue",
            i * del,
            -offset,
            j * del,
            k * del,
            radius
          ),
          new TesseractSticker(
            "red",
            i * del,
            offset,
            j * del,
            k * del,
            radius
          ),
          new TesseractSticker(
            "cyan",
            j * del,
            i * del,
            -offset,
            k * del,
            radius
          ),
          new TesseractSticker(
            "green",
            j * del,
            i * del,
            offset,
            k * del,
            radius
          ),
          new TesseractSticker(
            "magenta",
            k * del,
            i * del,
            j * del,
            -offset,
            radius
          ),
          new TesseractSticker(
            "purple",
            k * del,
            i * del,
            j * del,
            offset,
            radius
          )
        );
  return stickers;
}
