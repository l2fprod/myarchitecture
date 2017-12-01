const async = require('async');
const fs = require('fs');
const imageHelper = require('../lib/image-helper');
const pageHelper = require('../lib/page-helper');

function generate(pptx, configuration, onComplete) {
  const tasks = [];
  
  // additional manually added icons
  const moreIcons = JSON.parse(fs.readFileSync('architecture-icons.json', 'utf8'));
  moreIcons.forEach((icon) => {
    icon.pathOnDisk = `public/generated/icons/${icon.title}-${encodeURIComponent(icon.icon)}.png`;
    if (fs.existsSync(icon.pathOnDisk)) {
      icon.icon = icon.pathOnDisk;
    }
  });

  moreIcons.forEach((icon) => {
    if (icon.icon.startsWith("http")) {
      tasks.push((callback) => {
        imageHelper.downloadImage(icon.icon, icon.pathOnDisk.substring(0, icon.pathOnDisk.length - 4), icon.color ? `#${icon.color}` : null, (err) => {
          if (err) {
            console.log(err);
          }
          icon.icon = icon.pathOnDisk;
          callback(null);
        });
      });
    }
  });

  // automatic icons
  fs.readdirSync('icons/namedsvg').sort().forEach((iconFilename) => {
    tasks.push((callback) => {
      if (!iconFilename.endsWith('.svg')) {
        callback(null);
        return;
      }

      imageHelper.convertSvgImage(`icons/namedsvg/${iconFilename}`, null, (err, pngImageFilename) => {
        if (err) {
          callback(err);
        } else {
          moreIcons.push({
            icon: pngImageFilename,
            title: iconFilename.substring(0, iconFilename.lastIndexOf('.')),
          });
          callback(null);
        }
      });
    });
  });

  async.parallelLimit(tasks, 5, (err) => {
    if (err) {
      console.log(err);
      onComplete(err);
    } else {
      pageHelper.addIcons(pptx, configuration, moreIcons);  
      onComplete(null);
    }
  });    
}

module.exports = {
  generate,
};
