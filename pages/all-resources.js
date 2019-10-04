const async = require('async');
const fs = require('fs');
const request = require('request');

const imageHelper = require('../lib/image-helper');
const pageHelper = require('../lib/page-helper');

function generate(pptx, configuration, onComplete) {
  request({
    url: 'https://mycatalog.mybluemix.net/generated/resources.json'
  }, (err, response, body) => {
    if (err) {
      onComplete(err);
    } else {
      fs.writeFile('public/generated/resources.json', body, (err) => {
        if (err) {
          onComplete(err);
        } else {
          const resources = JSON.parse(fs.readFileSync('public/generated/resources.json', { encoding: 'UTF-8' }));
          generateResourceIcons(pptx, configuration, resources, onComplete);
        }
      });
    }
  });
}

function generateResourceIcons(pptx, configuration, resources, onComplete) {
  const resourceIcons = resources.map((resource) => {
    let iconFilename = `public/generated/icons/${resource.id}.png`;
    if (!fs.existsSync(iconFilename)) {
      iconFilename = resource.imageUrl;
    }
    return {
      id: resource.id,
      title: resource.displayName,
      icon: iconFilename,
    }
  });

  // additional icons
  const tasks = [];
  resourceIcons.forEach((icon) => {
    if (icon.icon.startsWith("http")) {
      tasks.push((callback) => {
        imageHelper.downloadImage(icon.icon, `public/generated/icons/${icon.id}`, null, (err) => {
          if (err) {
            console.log(`Can't download ${icon.icon}`, err);
          }
          icon.icon = `public/generated/icons/${icon.id}.png`;
          callback(null);
        });
      });
    }
  });

  async.parallelLimit(tasks, 5, (err) => {
    if (err) {
      onComplete(err);
    } else {
      resourceIcons.splice(0, 0, {
        type: 'separator',
        title: 'Catalog',
      });
      pageHelper.addIcons(pptx, configuration, resourceIcons);
      onComplete(null);
    }
  });
}

module.exports = {
  generate,
};
