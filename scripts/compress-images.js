const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imageDir = path.join(__dirname, '../frontend/src/assets/images');
const maxEdge = 1920;
const quality = 82;

async function compress(file) {
  const input = path.join(imageDir, file);
  const before = fs.statSync(input).size;
  const tmp = input + '.tmp';

  await sharp(input)
    .rotate()
    .resize(maxEdge, maxEdge, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toFile(tmp);

  fs.renameSync(tmp, input);
  const after = fs.statSync(input).size;
  console.log(`${file}: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);
}

(async () => {
  const files = fs.readdirSync(imageDir).filter((f) => /\.(jpe?g|png)$/i.test(f));
  for (const file of files) {
    try {
      await compress(file);
    } catch (err) {
      console.warn(`Skipped ${file}:`, err.message);
    }
  }
  console.log('Done.');
})();
