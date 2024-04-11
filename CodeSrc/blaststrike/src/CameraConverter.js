const processImageForClassification = (imageElement) => {
    //let img = tf.browser.fromPixels(imageElement);
    let imageBuffer = tf.node.decodeImage(imageElement);
    const img = tf.tensor(imageBuffer);
    img = tf.image.resizeBilinear(img, [224, 224]).div(tf.scalar(255));
    img = tf.cast(img, 'float32');
    let meanRgb = { red: 0.485, green: 0.456, blue: 0.406 };
    let stdRgb = { red: 0.229, green: 0.224, blue: 0.225 };
    let indices = [tf.tensor1d([0], 'int32'), tf.tensor1d([1], 'int32'), tf.tensor1d([2], 'int32')];
    let centeredRgb = {
      red: tf.gather(img, indices[0], 2).sub(tf.scalar(meanRgb.red)).div(tf.scalar(stdRgb.red)).reshape([224, 224]),
  
      green: tf
        .gather(img, indices[1], 2)
        .sub(tf.scalar(meanRgb.green))
        .div(tf.scalar(stdRgb.green))
        .reshape([224, 224]),
  
      blue: tf
        .gather(img, indices[2], 2)
        .sub(tf.scalar(meanRgb.blue))
        .div(tf.scalar(stdRgb.blue))
        .reshape([224, 224]),
    };
    let processedImg = tf.stack([centeredRgb.red, centeredRgb.green, centeredRgb.blue]).expandDims();
    return processedImg;
  };