const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.flycookie.com/wp-content/uploads/2024/03/';
const OUT_DIR = path.join(__dirname, '..', 'g4-plates');

const PLATES = [
  ['Black Camo', '0000_Black-Camo-1.png-1.png'],
  ['Black G4', '0001_Black-G4-1.png-1.png'],
  ['Black Loop', '0002_Black-Loop-1.png-1.png'],
  ['Blue Camo', '0003_Blue-Cam-1.png-1.png'],
  ['Blue G4', '0004_Blue-G4-1.png-1.png'],
  ['Blue Loop', '0005_Blue-Loop-1.png-1.png'],
  ['Gray Camo', '0007_Gray-Camo-1.png-1.png'],
  ['Gray G4', '0008_Gray-G4-1.png-1.png'],
  ['Gray Loop', '0009_Gray-Loop-1.png-1.png'],
  ['Green Camo', '0010_Green-Camo-1.png-1.png'],
  ['Green G4', '0011_Green-G4-1.png-1.png'],
  ['Green Loop', '0012_Green-Loop-1.png-1.png'],
  ['Orange Camo', '0013_Orange-Camo-1.png-1.png'],
  ['Orange G4', '0014_Orange-G4-1.png-1.png'],
  ['Orange Loop', '0015_Orange-Loop-1.png-1.png'],
  ['Pink Camo', '0016_Pink-Camo-1.png-1.png'],
  ['Pink G4', '0017_Pink-G4-1.png-1.png'],
  ['Pink Loop', '0018_Pink-Loop.png.png'],
  ['Purple Camo', '0019_Purple-Camo.png.png'],
  ['Purple G4', '0020_Purple-G4.png.png'],
  ['Purple Loop', '0021_Purple-Loop.png.png'],
  ['Red Camo', '0022_Red-Camo.png.png'],
  ['Red G4', '0023_Red-G4.png.png'],
  ['Red Loop', '0024_Red-Loop.png.png'],
  ['Yellow Camo', '0025_Yellow-Camo.png.png'],
  ['Yellow G4', '0026_Yellow-G4.png.png'],
  ['Yellow Loop', '0027_Yellow-Loop.png.png'],
];

function slugify(colorName) {
  return colorName.toLowerCase().replace(/\s+/g, '-') + '.png';
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  for (const [colorName, filename] of PLATES) {
    const url = BASE_URL + filename;
    const outPath = path.join(OUT_DIR, slugify(colorName));
    try {
      const data = await download(url);
      fs.writeFileSync(outPath, data);
      console.log(`Saved: ${colorName} -> ${path.basename(outPath)}`);
    } catch (err) {
      console.error(`Failed ${colorName}: ${err.message}`);
    }
  }

  console.log('Done.');
}

main();
