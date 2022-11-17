
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
    if (!fs.existsSync(iconFilename)) {
      return null;
    }

    const imageContent = fs.readFileSync(iconFilename);
    const imageContentBase64 = imageContent.toString('base64');
    const imageData = isSvg ?
      `data:image/svg+xml,${imageContentBase64}` :
      `data:image/png,${imageContentBase64}`;

    const graphModel = `
<mxGraphModel>
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <mxCell id="2" value="" style="group;fontFamily=IBM Plex Sans;verticalAlign=top;labelPosition=center;verticalLabelPosition=bottom;align=center;spacingLeft=0;spacingRight=0;spacingBottom=4;whiteSpace=wrap;html=1;fontStyle=0;fontSize=14;strokeOpacity=0;strokeColor=none;strokeWidth=0;spacing=0;connectable=1;" vertex="1" connectable="0" parent="1">
      <mxGeometry width="48" height="48" as="geometry" />
    </mxCell>
    <mxCell id="3" value="" style="editable=0;moveable=0;rounded=0;whiteSpace=wrap;html=1;spacingLeft=0;verticalAlign=top;fontFamily=IBM Plex Sans;fontSize=14;align=center;spacingBottom=0;spacingRight=0;labelPosition=center;verticalLabelPosition=bottom;spacing=0;strokeColor=#999999;connectable=0;allowArrows=0;" vertex="1" parent="2">
      <mxGeometry width="48" height="48" as="geometry" />
    </mxCell>
    <mxCell id="4" value="" style="editable=0;moveable=0;rounded=0;shape=image;verticalLabelPosition=bottom;labelBackgroundColor=default;verticalAlign=top;aspect=fixed;imageAspect=0;image=${imageData};imageBorder=none;perimeterSpacing=0;imageBackground=none;sketch=0;connectable=0;allowArrows=0;" vertex="1" parent="2">
      <mxGeometry x="14" y="14" width="20" height="20" as="geometry" />
    </mxCell>
  </root>
</mxGraphModel>`.replace(/  /g, '').replace(/\n/g, '');

    const xmlContent = self.compress(graphModel, false);
    return {
      xml: xmlContent,
      w: 48,
      h: 48,
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
      try {
        if (!resource.localPngIcon && !resource.localSvgIcon) {
          console.log('No icon for', resource.displayName);
        } else {
          const link = (resource.kind === 'service') ?
            `https://cloud.ibm.com/catalog/services/${resource.name}` :
            `https://cloud.ibm.com/catalog/infrastructure/${resource.name}`;
          const icon = self.makeIcon(resource.displayName,
            './public/' + (resource.localSvgIcon ? resource.localSvgIcon : resource.localPngIcon),
            resource.localSvgIcon, link);
          if (icon) {
            resourceIcons.push(icon);
          }
        }
      } catch (err) {
        console.log("Failed", err);
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

      let iconFile = self.makeIcon(icon.title, svgPathOnDisk, true);
      if (!iconFile) {
        iconFile = self.makeIcon(icon.title, pngPathOnDisk, false);
    	}
      if (iconFile) {
        resourceIcons.push(iconFile);
      } else {
        console.log('No icon for', icon.title);
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
