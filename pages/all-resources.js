const async = require('async');
const fs = require('fs');
const request = require('request');

const imageHelper = require('../lib/image-helper');
const pageHelper = require('../lib/page-helper');

function generate(pptx, configuration, onComplete) {
  request({
    url: 'https://mycatalog.mybluemix.net/generated/resources-full.json'
  }, (err, response, body) => {
    if (err) {
      onComplete(err);
    } else {
      fs.writeFile('public/generated/resources-full.json', body, (err) => {
        if (err) {
          onComplete(err);
        } else {
          const resources = JSON.parse(fs.readFileSync('public/generated/resources-full.json', { encoding: 'UTF-8' }));
          downloadResourceIcons(pptx, configuration, resources, onComplete);
        }
      });
    }
  });
}

function downloadResourceIcons(pptx, configuration,resources, onComplete) {
  console.log('Downloading all resource icons from mycatalog...');
  const tasks = [];
  const resourceIcons = [];
  resources.forEach((resource) => {
    if (resource.localPngIcon && !fs.existsSync(resource.localPngIcon)) {
      tasks.push((callback) => {
        imageHelper.downloadRaw(`https://mycatalog.mybluemix.net/${resource.localPngIcon.substring('public/'.length)}`, resource.localPngIcon, callback);
      });
    }
    if (resource.localSvgIcon && !fs.existsSync(resource.localSvgIcon)) {
      tasks.push((callback) => {
        imageHelper.downloadRaw(`https://mycatalog.mybluemix.net/${resource.localSvgIcon.substring('public/'.length)}`, resource.localSvgIcon, callback);
      });
    }

    resourceIcons.push({
      id: resource.id,
      title: resource.displayName,
      icon: `public/generated/icons/${resource.id}.png`,
    })
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
