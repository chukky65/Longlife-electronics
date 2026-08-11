const { search, SafeSearchType } = require('duck-duck-scrape');

async function run() {
  try {
    const searchResults = await search('Qasa Blender Small Size png', {
      safeSearch: SafeSearchType.OFF
    });
    console.log(searchResults.images.slice(0, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
