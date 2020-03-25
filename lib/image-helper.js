const request = require('request');
const fs = require('fs');
const sharp = require('sharp');
const svg2png = require("svg2png");	
const zlib = require('zlib');

function convertSvgImage(svgImageFilename, svgRecolor, onComplete) {
  let outputFilenameWithoutExtension = svgImageFilename.substring(0, svgImageFilename.lastIndexOf('.'));

  // if we generated it before, just return it
  if (fs.existsSync(`${outputFilenameWithoutExtension}.png`)) {
    onComplete(null, `${outputFilenameWithoutExtension}.png`);
    return;
  }

  readAndConvertSvgToPng(outputFilenameWithoutExtension, 'png', svgRecolor, onComplete);
}

function convertWithSharp(imageBuffer, callback/*err, buffer*/) {
  sharp(imageBuffer)
    .resize(64, 64)
    .toBuffer()
    .then(buffer => callback(null, buffer))
    .catch(e => callback(e));
}

function convertWithSvgToPng(imageBuffer, callback/*err, buffer*/) {
  svg2png(imageBuffer, { width: 64, height: 64 })
    .then(buffer => callback(null, buffer))
    .catch(e => callback(e));
}

function readAndConvertSvgToPng(filenameWithoutExtension, extension, svgRecolor, onComplete) {
  var imageBuffer = fs.readFileSync(`${filenameWithoutExtension}.svg`);

  // some svg are compressed
  try {
    imageBuffer = zlib.gunzipSync(imageBuffer);
  } catch (e) { }

  if (svgRecolor) {
    let imageBufferAsString = imageBuffer.toString();
    imageBufferAsString = imageBufferAsString.replace('<path', `<path fill="${svgRecolor}"`);
    imageBuffer = Buffer.from(imageBufferAsString);
  }

  const onConvertSuccess = (buffer, onComplete) => {
    fs.writeFile(`${filenameWithoutExtension}.png`, buffer, (convertError) => {
      if (convertError) {
        onComplete(convertError);
      } else {
        onComplete(null, `${filenameWithoutExtension}.${extension}`);
      }
    });
  }

  convertWithSharp(imageBuffer, (sharpErr, sharpBuffer) => {
    if (sharpErr) {
      console.log(`Failed to convert ${filenameWithoutExtension}.svg with sharp. Defaulting to svg2png...`, sharpErr);
      convertWithSvgToPng(imageBuffer, (svgToPngError, svgToPngBuffer) => {
        if (svgToPngError) {
          onComplete(svgToPngError);
        } else {
          onConvertSuccess(svgToPngBuffer, onComplete);
        }
      });
    } else {
      onConvertSuccess(sharpBuffer, onComplete);
    }
  });
}

function downloadRaw(fileUrl, destination, onComplete) {
  console.log('Downloading', fileUrl);
  request({
    url: fileUrl,
    encoding: null,
  }, (err, res, body) => {
    if (err) {
      onComplete(err);
    } else if (res.statusCode === 404) {
      onComplete(new Error(`${fileUrl} not found`));      
    } else {
      fs.writeFile(destination, body, (saveErr) => {
        onComplete(saveErr);
      });
    }
  });
}

function downloadImage(imageUrl, outputFilenameWithoutExtension, svgRecolor, onComplete) {
  console.log('Downloading', imageUrl);
  request({
    url: imageUrl,
    encoding: null
  }, (err, res, body) => {
    if (err) {
      onComplete(err);
    } else if (res.statusCode === 404) {
      onComplete(new Error(`${imageUrl} not found`));
    } else {
      let extension;
      if (imageUrl.indexOf('.svg') > 0) {
        extension = 'svg';
      } else {
        extension = 'png';
      }
      fs.writeFile(`${outputFilenameWithoutExtension}.${extension}`, body, (saveErr) => {
        if (saveErr) {
          onComplete(saveErr);
        } else {
          if (extension === 'svg') {
            readAndConvertSvgToPng(outputFilenameWithoutExtension, extension, svgRecolor, onComplete);
          } else {
            onComplete(null, `${outputFilenameWithoutExtension}.${extension}`);
          }
        }
      });
    }
  });
}

module.exports = {
  convertSvgImage,
  downloadImage,
  downloadRaw,
};
