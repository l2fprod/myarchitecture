function generate(pptx, configuration, onComplete) {
  let slide = pptx.addNewSlide();
  slide.back = configuration.background;

  slide.addText('The Internet', {
    shape: pptx.shapes.CLOUD,
    x: 0.3,
    y: 1.8,
    w: 1.1,
    h: 0.7,
    fontSize: configuration.pages.diagram.font.size,
    fontFace: configuration.pages.diagram.font.face,
    fill: { type:'solid', color: configuration.background },
    line: configuration.color,
    lineSize: 1,
    align: 'center',
    valign: 'middle',
    color: configuration.color,
  });

  // an arrow
  slide.addShape(pptx.shapes.LINE, {
    x: 1.52,
    y: 2.15,
    w: 0.56,
    h: 0,
    line: configuration.color,
    lineSize: 1,
    lineTail: 'arrow',
  });

  slide.addText('VPC', {
    shape: pptx.shapes.ROUNDED_RECTANGLE,
    x: 2.2,
    y: 0.3,
    w: 4,
    h: 4,
    fontSize: configuration.pages.diagram.font.size,
    fontFace: configuration.pages.diagram.font.face,
    rectRadius: 0.1,
    fill: { type:'solid', color: configuration.background },
    line: configuration.color,
    lineSize: 1.5,
    align: 'left',
    valign: 'top',
    color: configuration.color,
  });

  slide.addText('Region', {
    shape: pptx.shapes.ROUNDED_RECTANGLE,
    x: 2.35,
    y: 0.6,
    w: 3.7,
    h: 3.55,
    fontSize: configuration.pages.diagram.font.size,
    fontFace: configuration.pages.diagram.font.face,
    rectRadius: 0.1,
    fill: { type:'solid', color: configuration.pages.vpc.region.background },
    line: configuration.color,
    lineSize: 1.5,
    align: 'left',
    valign: 'top',
    lineDash: 'sysDot',
    color: configuration.color,
  });

  slide.addText('Zone', {
    shape: pptx.shapes.ROUNDED_RECTANGLE,
    x: 2.5,
    y: 0.9,
    w: 3.4,
    h: 3.10,
    fontSize: configuration.pages.diagram.font.size,
    fontFace: configuration.pages.diagram.font.face,
    rectRadius: 0.1,
    fill: { type:'solid', color: configuration.background },
    line: configuration.color,
    lineSize: 1.5,
    align: 'left',
    valign: 'top',
    lineDash: 'sysDash',
    color: configuration.color,
  });

  slide.addText('Subnet', {
    shape: pptx.shapes.ROUNDED_RECTANGLE,
    x: 2.65,
    y: 1.2,
    w: 3.1,
    h: 1.2,
    fontSize: configuration.pages.diagram.font.size,
    fontFace: configuration.pages.diagram.font.face,
    rectRadius: 0.1,
    fill: { type:'solid', color: configuration.background },
    line: configuration.color,
    lineSize: 0.5,
    align: 'left',
    valign: 'top',
    color: configuration.color,
  });

  onComplete();
}

module.exports = {
  generate,
};
