const async = require('async');
const fs = require('fs');
const imageHelper = require('../lib/image-helper');
const pageHelper = require('../lib/page-helper');

function generate(pptx, configuration, onComplete) {
  // additional icons
  const moreIcons = JSON.parse(fs.readFileSync('architecture-icons.json', 'utf8'));
  moreIcons.forEach((icon) => {
    icon.pathOnDisk = `public/generated/icons/${icon.title}-${encodeURIComponent(icon.icon)}.png`;
    if (fs.existsSync(icon.pathOnDisk)) {
      icon.icon = icon.pathOnDisk;
    }
  });

  const tasks = [];
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

  async.parallel(tasks, (err) => {
    if (err) {
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
