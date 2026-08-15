const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const delay = ms => new Promise(res => setTimeout(res, ms));

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

async function run() {
  const dataPath = path.join(__dirname, 'src', 'importData.json');
  const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  const imgDir = path.join(__dirname, 'public', 'images', 'products');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const slug = product.slug;
    const destPath = path.join(imgDir, `${slug}.png`);
    
    // Skip if already downloaded
    if (fs.existsSync(destPath)) {
       console.log(`[${i + 1}/${products.length}] Skipping ${product.name} - already downloaded`);
       product.image = `/images/products/${slug}.png`;
      continue;
    }

    try {
      console.log(`[${i + 1}/${products.length}] Searching for: ${product.name}`);
      const query = encodeURIComponent(product.name + " png transparent");
      await page.goto(`https://www.bing.com/images/search?q=${query}`, { waitUntil: 'domcontentloaded' });
      
      // Wait for the first image result to appear
      await page.waitForSelector('.mimg', { timeout: 5000 }).catch(() => {});
      
      const imgUrl = await page.evaluate(() => {
        const img = document.querySelector('.mimg');
        return img ? (img.getAttribute('src') || img.getAttribute('data-src')) : null;
      });

      if (imgUrl) {
        console.log(`Found image for ${product.name}: ${imgUrl.substring(0, 50)}...`);
        let finalUrl = imgUrl;
        if (finalUrl.startsWith('//')) {
          finalUrl = 'https:' + finalUrl;
        } else if (finalUrl.startsWith('/')) {
          finalUrl = 'https://www.bing.com' + finalUrl;
        }
        await downloadImage(finalUrl, destPath);
        product.image = `/images/products/${slug}.png`;
      } else {
        console.log(`No image found for ${product.name}, using dummy.`);
        // Fallback to dummy if search fails
        product.image = `https://dummyimage.com/800x800.png?text=${encodeURIComponent(product.name)}`;
      }
    } catch (err) {
      console.log(`Error processing ${product.name}: ${err.message}`);
      product.image = `https://dummyimage.com/800x800.png?text=${encodeURIComponent(product.name)}`;
    }
    
    // Delay to prevent rate limiting
    await delay(1500);
  }

  await browser.close();

  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
  console.log('Finished updating importData.json!');
}

run().catch(console.error);
