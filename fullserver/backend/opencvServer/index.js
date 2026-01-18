const { Canvas, createCanvas, Image, ImageData, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');
const { writeFileSync, existsSync, mkdirSync } = require("fs");
console.log("Hi");
const cv = require('@u4/opencv4nodejs');

async function asyncCall() {
  console.log("Hi");
  // before loading opencv.js we emulate a minimal HTML DOM. See the function declaration below.
  installDOM();
  //await loadOpenCV();
  console.log("Hi");
  // using node-canvas, we an image file to an object compatible with HTML DOM Image and therefore with cv.imread()
  const image = await loadImage('./img.png');
  const src = cv.imread(image);
  let dstHSV = new cv.Mat();
  let imgHSV = new cv.Mat();
  let imgMasked = new cv.Mat(); 
  let mask = new cv.Mat();
  let mask1 = new cv.Mat();
  let mask2 = new cv.Mat();
  let mask3 = new cv.Mat();
  let mask4 = new cv.Mat();
  let dtype = -1;
  cv.cvtColor(src, imgHSV, cv.COLOR_RGBA2RGB, 0);
  cv.cvtColor(imgHSV, imgHSV, cv.COLOR_RGB2HSV, 0);

  let low = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(158, 105, 69));
  let high = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(179, 255, 255));

  let low1 = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(9, 112, 111));
  let high1 = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(27, 255, 255));

  let low2 = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(92, 120, 120));
  let high2 = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(135, 255, 255));

  let low3 = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(0, 200, 200));
  let high3 = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(255, 255, 255));

  //let dstHSV = new cv.Mat();

  cv.inRange(imgHSV, low, high, mask1);
  cv.inRange(imgHSV, low1, high1, mask2);
  cv.inRange(imgHSV, low2, high2, mask3);
  cv.inRange(imgHSV, low3, high3, mask4);
  cv.add(mask1, mask2, dstHSV, mask, dtype);
  cv.add(dstHSV, mask3, dstHSV, mask, dtype);
  cv.add(dstHSV, mask4, dstHSV, mask, dtype);
  
  cv.bitwise_and(imgHSV,imgHSV,imgMasked,dstHSV)
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  // You can try more different parameters
  cv.findContours(dstHSV, contours, hierarchy, cv.RETR_EXTERNAL , cv.CHAIN_APPROX_SIMPLE);
    let cnt,rect,contoursColor,rectangleColor,point1,point2;

  for (let i = 0; i < contours.size(); ++i) {
    cnt = contours.get(i);
    rect = cv.boundingRect(cnt);
    contoursColor = new cv.Scalar(30, 255, 255);
    rectangleColor = new cv.Scalar(0, 0, 255);
    cv.drawContours(imgHSV, contours, i, contoursColor, 1, 8, hierarchy, 100);
    point1 = new cv.Point(rect.x, rect.y);
    point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
    cv.rectangle(imgHSV, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
  }

  cv.cvtColor(imgHSV, imgHSV, cv.COLOR_HSV2RGB, 0);
  console.log("Hi")
  
  // we create an object compatible HTMLCanvasElement
  const canvas = createCanvas(300, 300);
  cv.imshow(canvas, imgHSV);
  writeFileSync('output.png', canvas.toBuffer('image/png'));
  src.delete();dstHSV.delete();imgMasked.delete();imgHSV.delete();
  low.delete();high.delete();low1.delete();high1.delete();low2.delete();high2.delete();low3.delete();high3.delete();
  mask.delete();mask1.delete();mask2.delete();mask3.delete();mask4.delete();
  contours.delete(); hierarchy.delete();
};
// This is our program. This time we use JavaScript async / await and promises to handle asynchronicity.
/* (async () => {
  
})(); */
asyncCall().catch((err) => {
  console.error(err)
});
//asyncCall()

// Using jsdom and node-canvas we define some global variables to emulate HTML DOM.
// Although a complete emulation can be archived, here we only define those globals used
// by cv.imread() and cv.imshow().
function installDOM() {
  const dom = new JSDOM();
  global.document = dom.window.document;
  // The rest enables DOM image and canvas and is provided by node-canvas
  global.Image = Image;
  global.HTMLCanvasElement = Canvas;
  global.ImageData = ImageData;
  global.HTMLImageElement = Image;
}