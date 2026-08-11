require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Starting migration...');
  
  // Wipe all existing products (where price > 0, basically all of them)
  const { data: delData, error: delError } = await supabase
    .from('products')
    .delete()
    .neq('price', -1);
    
  if (delError) {
    console.error('Failed to delete existing products:', delError);
    // If it fails due to RLS, we will just insert without deleting
  } else {
    console.log('Successfully cleared dummy products.');
  }

  const products = JSON.parse(fs.readFileSync('src/importData.json', 'utf-8'));
  console.log('Inserting ' + products.length + ' new products...');
  
  const { data: insData, error: insError } = await supabase
    .from('products')
    .insert(products);
    
  if (insError) {
    console.error('Failed to insert new products:', insError);
  } else {
    console.log('Successfully inserted all new products!');
  }
}

run();
