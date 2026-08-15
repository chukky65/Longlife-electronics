import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const products = JSON.parse(readFileSync(new URL('../src/importData.json', import.meta.url), 'utf8'));

test('catalog records are complete and internally consistent', () => {
  assert.equal(products.length, 78);
  assert.equal(new Set(products.map((product) => product.slug)).size, products.length);

  for (const product of products) {
    assert.ok(product.name?.trim(), 'Every product needs a name');
    assert.match(product.slug, /^[a-z0-9][a-z0-9-]*[a-z0-9]$/);
    assert.ok(Number.isFinite(product.price) && product.price >= 0, `${product.slug} has an invalid price`);
    assert.ok(Number.isInteger(product.stock) && product.stock >= 0, `${product.slug} has invalid stock`);
    assert.equal(product.in_stock, product.stock > 0, `${product.slug} has inconsistent availability`);
    assert.ok(Array.isArray(product.gallery), `${product.slug} needs a gallery array`);
    assert.equal(typeof product.specs, 'object', `${product.slug} needs a specs object`);

    if (product.image.startsWith('/')) {
      const localImage = new URL(`../public${product.image}`, import.meta.url);
      assert.ok(existsSync(localImage), `${product.slug} is missing ${product.image}`);
    }
  }
});

test('production dependencies exclude one-off scraping and server utilities', () => {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const developmentOnlyPackages = [
    '@google/genai',
    'dotenv',
    'duck-duck-scrape',
    'express',
    'g-i-s',
    'pdf-parse',
    'puppeteer',
  ];

  for (const packageName of developmentOnlyPackages) {
    assert.equal(packageJson.dependencies?.[packageName], undefined, `${packageName} must not ship to production`);
  }
});

test('edge function authentication configuration protects privileged endpoints', () => {
  const config = readFileSync(new URL('../supabase/config.toml', import.meta.url), 'utf8');
  const requiredJwtFunctions = ['create-order', 'verify-payment', 'manage-order', 'validate-promo', 'send-receipt'];

  for (const functionName of requiredJwtFunctions) {
    const escapedName = functionName.replace('-', '\\-');
    assert.match(config, new RegExp(`\\[functions\\.${escapedName}\\][\\s\\S]*?verify_jwt = true`));
  }

  assert.match(config, /\[functions\.paystack-webhook\][\s\S]*?verify_jwt = false/);
  assert.match(config, /\[functions\.submit-inquiry\][\s\S]*?verify_jwt = false/);
  assert.match(config, /\[functions\.subscribe-newsletter\][\s\S]*?verify_jwt = false/);
});
