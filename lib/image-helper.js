const request = require('request');
const fs = require('fs');
const svg2png = require("svg2png");

function downloadImage(imageUrl, outputFilenameWithoutExtension, svgRecolor, onComplete) {
  console.log('Downloading', imageUrl);
  request({
    url: imageUrl,
    encoding: null
  }, (err, res, body) => {
    if (err) {
      onComplete(err);
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
            var imageBuffer = fs.readFileSync(`${outputFilenameWithoutExtension}.svg`);
            if (svgRecolor) {
              let imageBufferAsString = imageBuffer.toString();
              imageBufferAsString = imageBufferAsString.replace('<path', `<path fill="${svgRecolor}"`);
              imageBuffer = Buffer.from(imageBufferAsString);
            }
            svg2png(imageBuffer, { width: 64, height: 64 })
              .then(buffer => fs.writeFile(`${outputFilenameWithoutExtension}.png`, buffer, (convertError) => {
                if (convertError) {
                  console.log(convertError);
                }
                onComplete(convertError);
              }))
              .catch(e => console.log(e));
          } else {
            onComplete(null);
          }
        }
      });
    }
  });
}

module.exports = {
  downloadImage,
};
