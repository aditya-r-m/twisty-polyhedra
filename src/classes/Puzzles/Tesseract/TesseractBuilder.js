
function buildTesseractCycles(stickers, offset, del) {
  let cycles = [];
  let axes = ['w','x','y','z'];
  stickers.forEach(s => {
    //TODO
  });
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

