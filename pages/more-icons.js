const async = require('async');
const fs = require('fs');
const imageHelper = require('../lib/image-helper');
const pageHelper = require('../lib/page-helper');

function generate(pptx, configuration, onComplete) {
  // additional icons
  const moreIcons = JSON.parse(fs.readFileSync('architecture-icons.json', 'utf8'));
  moreIcons.forEach((icon) => {
    let iconFilename = `public/generated/icons/${icon.title}.png`;
    if (fs.existsSync(iconFilename)) {
      icon.icon = iconFilename;
    }
  });

  const tasks = [];
  moreIcons.forEach((icon) => {
    if (icon.icon.startsWith("http")) {
      tasks.push((callback) => {
        imageHelper.downloadImage(icon.icon, `public/generated/icons/${icon.title}`, icon.color ? `#${icon.color}` : null, (err) => {
          if (err) {
            console.log(err);
          }
          icon.icon = `public/generated/icons/${icon.title}.png`;
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
