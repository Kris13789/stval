const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.flycookie.com/wp-content/uploads/2024/03/';
const OUT_DIR = path.join(__dirname, '..', 'g35-plates');

const PLATES = [
  ['Black Camo', 'G35TPBKCAMPNG_500.png'],
  ['Black G35', 'G35TPBK35PNG_500.png'],
  ['Black Loop', 'G35TPBKLPPNG_500.png'],
  ['Blue Camo', 'G35TPBLCAMPNG_500.png'],
  ['Blue G35', 'G35TPBL35PNG_500.png'],
  ['Blue Loop', 'G35TPBLLPPNG_500.png'],
  ['Gray Camo', 'G35TPGR35PNG_500.png'],
  ['Gray G35', 'G35TPGR352PNG_500.png'],
  ['Gray Loop', 'G35TPGRLPPNG_500.png'],
  ['Green Camo', 'G35TPGNCAMPNG_500.png'],
  ['Green G35', 'G35TPGN35PNG_500.png'],
  ['Green Loop', 'G35TPGNLPPNG_500.png'],
  ['Orange Camo', 'G35TPORCAM2PNG_500.png'],
  ['Orange G35', 'G35TPOR352PNG_500.png'],
  ['Orange Loop', 'G35TPORLP2PNG_500.png'],
  ['Pink Camo', 'G35TPICAMPNG_500.png'],
  ['Pink G35', 'G35TPI35PNG_500.png'],
  ['Pink Loop', 'G35TPILPPNG_500.png'],
  ['Purple Camo', 'G35TPPUCAMPNG_500.png'],
  ['Purple G35', 'G35TPPU35PNG_500.png'],
  ['Purple Loop', 'G35TPILPPNG_500.png'],
  ['Red Camo', 'G35TPRDCAMPNG_500.png'],
  ['Red G35', 'G35TPRD35PNG_500.png'],
  ['Red Loop', 'G35TPRDLPPNG_500.png'],
  ['Yellow Camo', 'G35TPYLCAMPNG_500.png'],
  ['Yellow G35', 'G35TPYL35PNG_500.png'],
  ['Yellow Loop', 'G35TPYLLPPNG_500.png'],
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
