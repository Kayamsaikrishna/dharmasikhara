const fs = require('fs');
const sharp = require('sharp');

async function convertJPGtoPNG() {
  try {
    // Read the JPG file and convert to PNG
    const data = await sharp('./public/logo.jpg')
      .resize(32, 32) // Resize to 32x32 which is a common favicon size
      .png()
      .toBuffer();
    
    // Write the PNG file as favicon
    fs.writeFileSync('./public/favicon.ico', data);
    console.log('favicon.ico (PNG format) created successfully!');
  } catch (error) {
    console.error('Error converting image:', error.message);
    console.error(error.stack);
  }
}

convertJPGtoPNG();