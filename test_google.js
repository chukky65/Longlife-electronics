import google from 'googlethis';

async function run() {
  const options = {
    page: 0, 
    safe: false, 
    additional_params: {
      hl: 'en'
    }
  };
  
  try {
    const images = await google.image('Qasa Blender Small Size', options);
    console.log(images.slice(0, 3));
  } catch (err) {
    console.error(err);
  }
}

run();
