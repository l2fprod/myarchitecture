function generate(pptx, configuration, onComplete) {
  let slide = pptx.addNewSlide();
  slide.back = configuration.background;

  slide.addNotes(`Generated on ${new Date()}`);

  slide.addText('USER', {
    x: 0.6,
    y: 0.5,
    w: 0.4,
    fontSize: configuration.pages.diagram.font.size,
    fontFace: configuration.pages.diagram.font.face,
    autoFit: true,
    margin: 0,
    color: configuration.color,
    bold: true,
  });

  slide.addShape(pptx.shapes.LINE, {
    x: 2.3,
    y: 0.5,
    w: 0.01,
    h: 4.5,
    line: configuration.color,
    lineSize: 1.5,
  });

  slide.addText('EXTERNAL', {
    x: 2.7,
    y: 0.5,
    w: 0.75,
    fontSize: configuration.pages.diagram.font.size,
    fontFace: configuration.pages.diagram.font.face,
    autoFit: true,
    margin: 0,
    color: configuration.color,
    bold: true,
  });

  slide.addShape(pptx.shapes.LINE, {
    x: 5.3,
    y: 0.5,
    w: 0.01,
    h: 4.5,
    line: configuration.color,
    lineSize: 1.5,
  });

  slide.addText('CLOUD', {
    x: 5.7,
    y: 0.5,
    w: 0.75,
    fontSize: configuration.pages.diagram.font.size,
    fontFace: configuration.pages.diagram.font.face,
    autoFit: true,
    margin: 0,
    color: configuration.color,
    bold: true,
  });

  // an arrow
  slide.addShape(pptx.shapes.LINE, {
    x: 6,
    y: 2.3,
    w: 2,
    h: 0,
    line: configuration.color,
    lineSize: 1,
    lineTail: 'arrow',
  });

  // a diagonal
  slide.addShape(pptx.shapes.LINE, {
    x: 6,
    y: 1.3,
    w: 1,
    h: 0,
    line: configuration.color,
    lineSize: 1,
    lineTail: 'arrow',
    rotate: 45,
  });

  // a text box
  slide.addText("POST /users", {
    shape: pptx.shapes.ROUNDED_RECTANGLE,
    x: 6,
    y: 3,
    w: 1,
    h: 0.3,
    fontSize: configuration.pages.diagram.font.size,
    fontFace: configuration.pages.diagram.font.face,
    color: configuration.color,
    fill: { type: 'solid', color: configuration.background },
    line: configuration.color,
    lineSize: 1,
  });

  // to number steps
  for (let number = 0; number < 15; number++) {
    slide.addShape(pptx.shapes.OVAL, {
      x: 0.3,
      y: 1 + (configuration.pages.diagram.numbers.size + 0.1) * number,
      w: configuration.pages.diagram.numbers.size,
      h: configuration.pages.diagram.numbers.size,
      fill: { type: 'solid', color: configuration.background },
      line: configuration.pages.diagram.numbers.color,
      lineSize: 1.5,
    });
    slide.addText(`${number + 1}`, {
      x: 0.3,
      y: 1 + (configuration.pages.diagram.numbers.size + 0.1) * number,
      w: configuration.pages.diagram.numbers.size,
      h: configuration.pages.diagram.numbers.size,
      fontSize: configuration.pages.diagram.numbers.font.size,
      fontFace: configuration.pages.diagram.numbers.font.face,
      align: 'center',
      valign: 'middle',
      autoFit: true,
      margin: 0,
      color: '0C755F',
      bold: true,
    });
  }

  onComplete(null);
}

module.exports = {
  generate,
};
