const fs = require('fs');
const pptx = require('pptxgenjs');
const async = require('async');

try {
  fs.mkdirSync('public');
} catch (err) {
}
try {
  fs.mkdirSync('public/generated');
} catch (err) {
}
try {
  fs.mkdirSync('public/generated/icons');
} catch (err) {
}

// global properties for the deck
pptx.setLayout('LAYOUT_16x9');

const configuration = JSON.parse(fs.readFileSync('configuration.json'));

async.waterfall([
  (callback) => {
    require('./pages/default-diagram').generate(pptx, configuration, callback);
  },
  (callback) => {
    require('./pages/all-resources').generate(pptx, configuration, callback);
  },
  (callback) => {
    require('./pages/more-icons').generate(pptx, configuration, callback);    
  }
], (err) => {
  if (err) {
    console.log('[KO]', err);
  } else {
    pptx.save('mycatalog-architecture-diagram-template');
    console.log('[OK] Processing complete!');
  }
});
