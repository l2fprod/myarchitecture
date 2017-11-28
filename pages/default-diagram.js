function generate(pptx, configuration, onComplete) {
  let slide = pptx.addNewSlide();
  slide.back = configuration.background;

  // the diagram template slide
  const diagramConfiguration = {
    font: {
      size: 9,
      face: 'Helvetica',
    },
    numbers: {
      size: 0.20,
      font: {
        size: 7,
        face: 'Helvetica',
      },
    }
  };

  slide.addText('USER', {
    x: 0.6,
    y: 0.5,
    w: 0.4,
    font_size: diagramConfiguration.font.size,
    font_face: diagramConfiguration.font.face,
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
    line_size: 1.5,
  });

  slide.addText('EXTERNAL', {
    x: 2.7,
    y: 0.5,
    w: 0.75,
    font_size: diagramConfiguration.font.size,
    font_face: diagramConfiguration.font.face,
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
    line_size: 1.5,
  });

  slide.addText('CLOUD', {
    x: 5.7,
    y: 0.5,
    w: 0.75,
    font_size: diagramConfiguration.font.size,
    font_face: diagramConfiguration.font.face,
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
    line_size: 1,
    line_tail: 'arrow',
  });

  // a diagonal
  slide.addShape(pptx.shapes.LINE, {
    x: 6,
    y: 1.3,
    w: 1,
    h: 0,
    line: configuration.color,
    line_size: 1,
    line_tail: 'arrow',
    rotate: 45,
  });

  // a text box
  slide.addText("POST /users", {
    shape: pptx.shapes.ROUNDED_RECTANGLE,
    x: 6,
    y: 3,
    w: 1,
    h: 0.3,
    font_size: diagramConfiguration.font.size,
    font_face: diagramConfiguration.font.face,
    color: configuration.color,
    fill: { type: 'solid', color: configuration.background },
    line: configuration.color,
    line_size: 1,
  });

  // to number steps
  for (let number = 0; number < 15; number++) {
    slide.addShape(pptx.shapes.OVAL, {
      x: 0.3,
      y: 1 + (diagramConfiguration.numbers.size + 0.1) * number,
      w: diagramConfiguration.numbers.size,
      h: diagramConfiguration.numbers.size,
      fill: { type: 'solid', color: configuration.background },
      line: configuration.diagram.numbers.color,
      line_size: 1.5,
    });
    slide.addText(`${number + 1}`, {
      x: 0.3,
      y: 1 + (diagramConfiguration.numbers.size + 0.1) * number,
      w: diagramConfiguration.numbers.size,
      h: diagramConfiguration.numbers.size,
      font_size: diagramConfiguration.numbers.font.size,
      font_face: diagramConfiguration.numbers.font.face,
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
