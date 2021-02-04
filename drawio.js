
// https://github.com/jgraph/drawio/blob/607e2536f03d57bef8c5b6e90e6aba1728661c1c/src/main/webapp/js/mxgraph/Graph.js#L1035
const pako = require('pako');

// https://jgraph.github.io/drawio-tools/tools/convert.html
const Base64 = {

  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
  encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {

      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
      this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
      this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

    }

    return output;
  },

  // public method for decoding
  decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }

    }

    return output;

  }
}

function DrawIOLibrary() {
  const self = this;
  const fs = require('fs');
  const Entities = require('html-entities').AllHtmlEntities;
  const entities = new Entities();

  self.makeIcon = function(iconTitle, iconFilename, isSvg, link) {
    const imageContent = fs.readFileSync(iconFilename);
    const imageContentBase64 = imageContent.toString('base64');
    const imageData = isSvg ?
      `data:image/svg+xml,${imageContentBase64}` :
      `data:image/png,${imageContentBase64}`;

    // icon only
    const styleObject = {
      aspect: 'fixed',
      perimeter: 'ellipsePerimeter',
      html: 1,
      align: 'center',
      shadow: 0,
      dashed: 0,
      fontColor: '#4277BB',
      fontSize: 12,
      spacingTop: 3,
      'image;image': imageData,
      strokeColor: '#4277BB',
      strokeWidth: 2,
      labelBackgroundColor: 'none',
      rounded: 0,
    }

    let style = '';
    Object.keys(styleObject).forEach((key, index) => {
      style = style + ((index > 0) ? ';' : '') + `${key}=${styleObject[key]}`
    });

    const linkElement = link ? `link="${link}" ` : '';
    const graphModel = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <UserObject ${linkElement}id="2">
      <mxCell style="${style}" vertex="1" parent="1">
        <mxGeometry width="60" height="60" as="geometry"/>
      </mxCell>
    </UserObject>
  </root>
</mxGraphModel>`.replace(/  /g, '').replace(/\n/g, '');

    const xmlContent = self.compress(graphModel, false);
    return {
      xml: xmlContent,
      w: 60,
      h: 60,
      aspect: 'fixed',
      title: entities.encode(iconTitle),
    };
  }

  self.generate = function(outputFilename) {
    const resources = JSON.parse(fs.readFileSync('public/generated/resources-full.json', 'utf8'))
      // .filter(resource =>
      //   resource.tags.indexOf('ibm_deprecated') < 0 &&
      //   resource.tags.indexOf('ibm_experimental') < 0)
      //  &&
      // resource.tags.indexOf('ibm_created')>=0)
      .sort((resource1, resource2) => resource1.displayName.localeCompare(resource2.displayName));

    const resourceIcons = [];
    resources.forEach(resource => {
      if (!resource.localPngIcon && !resource.localSvgIcon) {
        console.log('No icon for', resource.displayName);
      } else {
        const link = (resource.kind === 'service') ?
          `https://cloud.ibm.com/catalog/services/${resource.name}` :
          `https://cloud.ibm.com/catalog/infrastructure/${resource.name}`;
        resourceIcons.push(
          self.makeIcon(resource.displayName,
            resource.localSvgIcon ? resource.localSvgIcon : resource.localPngIcon,
            resource.localSvgIcon, link));
      }
    });
    
    function addFolder(folderName) {
      fs.readdirSync(folderName).filter(filename => filename.endsWith('.svg')).sort().forEach((iconFilename) => {
        const icon = {
          icon: `${folderName}/${iconFilename}`,
          title: iconFilename.substring(0, iconFilename.lastIndexOf('.')),
        };
        resourceIcons.push(self.makeIcon(icon.title, icon.icon, true));
      });
    }
    addFolder('icons/namedsvg');

    const moreIcons = JSON.parse(fs.readFileSync('architecture-icons.json', 'utf8'));
    moreIcons.forEach(icon => {
    	let svgPathOnDisk, pngPathOnDisk;
    	if (icon.icon.startsWith("http")) {
    		svgPathOnDisk = `public/generated/icons/${icon.title}-${encodeURIComponent(icon.icon)}.svg`;
    		pngPathOnDisk = `public/generated/icons/${icon.title}-${encodeURIComponent(icon.icon)}.png`;
    	} else {
    		svgPathOnDisk = icon.icon.replace('.png', '.svg');
    		pngPathOnDisk = icon.icon.replace('.svg', '.png');	
    	}
    	if (fs.existsSync(svgPathOnDisk)) {
    		resourceIcons.push(self.makeIcon(icon.title, svgPathOnDisk, true));
    	} else {
    		resourceIcons.push(self.makeIcon(icon.title, pngPathOnDisk, false));
    	}
    });

    fs.writeFileSync(outputFilename, `<mxlibrary title="IBM Cloud Catalog">${JSON.stringify(resourceIcons, null, null)}</mxlibrary>`);
  };

  self.compress = function(data, deflate) {
    const tmp = (deflate) ?
      pako.deflate(encodeURIComponent(data), {to: 'string'}) :
      pako.deflateRaw(encodeURIComponent(data), {to: 'string'});
    return Base64.encode(tmp);
  };
  
  self.decompress = function(data, inflate) {
    var tmp = Base64.decode(data);
    
    var inflated = (inflate) ? pako.inflate(tmp, {to: 'string'}) :
      pako.inflateRaw(tmp, {to: 'string'})

    return zapGremlins(decodeURIComponent(inflated));
  }

  function zapGremlins(text) {
    var checked = [];
    
    for (var i = 0; i < text.length; i++)
    {
      var code = text.charCodeAt(i);
      
      // Removes all control chars except TAB, LF and CR
      if ((code >= 32 || code == 9 || code == 10 || code == 13) &&
        code != 0xFFFF && code != 0xFFFE)
      {
        checked.push(text.charAt(i));
      }
    }
    
    return checked.join('');
  };
}

module.exports = function () {
  return new DrawIOLibrary();
}
