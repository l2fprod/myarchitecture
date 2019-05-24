function addIcons(pptx, configuration, icons) {
  const iconOffset = (configuration.circleSize - configuration.iconSize) / 2;
  
  let column = 0;
  let line = 0;
  let slide = null;

  console.log(`${icons.length} icons to generate`);
  icons.forEach(icon => {
    if (icon.type === 'separator') {
      column = 0;
      line = 0;
      console.log(`Adding a new slide ${icon.title}`);
      slide = pptx.addNewSlide();
      slide.back = configuration.background;
      slide.addText(icon.title.toUpperCase(), {
        x: 0.3,
        y: 0,
        fontSize: configuration.font.size * 2,
        fontFace: configuration.font.face,
        autoFit: true,
        margin: 0,
        color: icon.color || configuration.icon.color,
        bold: true,  
      });
      return;
    }

    if (slide === null) {
      console.log('Adding a new slide');
      slide = pptx.addNewSlide();
      slide.back = configuration.background;
    }

    if (icon.standalone) {
      // the icon
      slide.addImage({
        path: icon.icon,
        x: 0.3 + column * configuration.box.width,
        y: 0.3 + line * configuration.box.height,
        w: configuration.circleSize,
        h: configuration.circleSize,    
      });
    } else {      
      // the circle
      slide.addShape(pptx.shapes.OVAL, {
        x: 0.3 + column * configuration.box.width,
        y: 0.3 + line * configuration.box.height,
        w: configuration.circleSize,
        h: configuration.circleSize,
        fill: { type:'solid', color: configuration.icon.background },
        line: icon.color || configuration.icon.color,
        lineSize: 1.5,
      });

      // the icon
      slide.addImage({
        path: icon.icon,
        x: 0.3 + column * configuration.box.width + iconOffset,
        y: 0.3 + line * configuration.box.height + iconOffset,
        w: configuration.iconSize,
        h: configuration.iconSize,    
      });
    }

    // the resource name
    console.log(`   icon: ${icon.title}`);
    slide.addText(icon.title.toUpperCase(), {
      x: 0.3 + column * configuration.box.width - 0.1,
      y: 0.3 + line * configuration.box.height + configuration.circleSize + 0.05,
      fontSize: configuration.font.size,
      fontFace: configuration.font.face,
      w: configuration.circleSize + 0.2,
      align: 'center',
      valign: 'top',
      autoFit: true,
      margin: 0,
      color: icon.color || configuration.icon.color,
      bold: true,
    });

    column = column + 1;

    if (column >= configuration.columnsPerSlide) {
      column = 0;
      line = line + 1;
      console.log('Adding a new line');
    }

    if (line >= configuration.linesPerSlide) {
      column = 0;
      line = 0;
      slide = null;
    }
  });
}

module.exports = {
  addIcons,
};
