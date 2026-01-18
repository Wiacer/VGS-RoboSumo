const cv = require('opencv4nodejs-prebuilt-install');

let rows = 100; // height
let cols = 100; // width

// empty Mat
let emptyMat = new cv.Mat(rows, cols, cv.CV_8UC3);

// fill the Mat with default value
let whiteMat = new cv.Mat(rows, cols, cv.CV_8UC1, 255);
let blueMat = new cv.Mat(rows, cols, cv.CV_8UC3, [255, 0, 0]);

// from array (3x3 Matrix, 3 channels)
let matData = [
  [[255, 0, 0], [255, 0, 0], [255, 0, 0]],
  [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
  [[255, 0, 0], [255, 0, 0], [255, 0, 0]]
];
let matFromArray = new cv.Mat(matData, cv.CV_8UC3);

// from node buffer
let charData = [255, 0, 0];
matFromArray = new cv.Mat(Buffer.from(charData), rows, cols, cv.CV_8UC3);

// Point
let pt2 = new cv.Point(100, 100);
let pt3 = new cv.Point(100, 100, 0.5);

// Vector
let vec2 = new cv.Vec(100, 100);
let vec3 = new cv.Vec(100, 100, 0.5);
let vec4 = new cv.Vec(100, 100, 0.5, 0.5);