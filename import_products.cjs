require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing products.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const products = JSON.parse(fs.readFileSync('src/importData.json', 'utf-8'));
  console.log('Synchronizing ' + products.length + ' products...');
  
  const { data: insData, error: insError } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'slug' });
    
  if (insError) {
    console.error('Failed to insert new products:', insError);
  } else {
    console.log('Successfully inserted all new products!');
  }
}

run();
