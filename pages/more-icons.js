const async = require('async');
const fs = require('fs');
const humanizeString = require('humanize-string');

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

  function addPage(title) {
    moreIcons.push({
      type: 'separator',
      title,
    });
  }

  function addFolder(folderName, iconCallback/*icon*/) {
    fs.readdirSync(folderName).filter(filename => filename.endsWith('.svg')).sort().forEach((iconFilename) => {
      const icon = {
        icon: iconFilename,
        title: iconFilename.substring(0, iconFilename.lastIndexOf('.')),
      };
      moreIcons.push(icon);
      tasks.push((callback) => {
        imageHelper.convertSvgImage(`${folderName}/${iconFilename}`, null, (err, pngImageFilename) => {
          if (err) {
            callback(err);
          } else {
            icon.icon = pngImageFilename;
            if (iconCallback) {
              iconCallback(icon);
            }
            callback(null);
          }
        });
      });
    });
  }

  // automatic icons
  addFolder('icons/namedsvg');
  fs.readdirSync('icons/refarch')
    .filter(filename => '.DS_Store'!==filename && fs.statSync(`icons/refarch/${filename}`).isDirectory)
    .forEach((dir) => {
    addPage(humanizeString(dir));
    addFolder(`icons/refarch/${dir}`, (icon) => {
      icon.standalone = true;
      icon.title = humanizeString(icon.title);
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
