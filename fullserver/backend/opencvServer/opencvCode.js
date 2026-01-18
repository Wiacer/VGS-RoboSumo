const cv = require('opencv4nodejs-prebuilt-install');
// load image from file
const src = cv.imread('/home/wiac/personal/battleBotProject/fullserver/backend/opencvServer/img.png');


let dstHSV = new cv.Mat();
let imgHSV = new cv.Mat();
let mask = new cv.Mat();
let mask1 = new cv.Mat();
let mask2 = new cv.Mat();
let mask3 = new cv.Mat();
let mask4 = new cv.Mat();

imgHSV = src.cvtColor(cv.COLOR_RGBA2RGB);
imgHSV = imgHSV.cvtColor(cv.COLOR_RGB2HSV);

//define mask thresholds
const low = new cv.Vec(158, 105, 69);
const high = new cv.Vec(179, 255, 255);

const low1 = new cv.Vec(9, 112, 111);
const high1 = new cv.Vec(27, 255, 255);

const low2 = new cv.Vec(92, 120, 120);
const high2 = new cv.Vec(135, 255, 255);

const low3 = new cv.Vec(0, 200, 200);
const high3 = new cv.Vec(255, 255, 255);

//combine mask thresholds
mask1 = imgHSV.inRange(low, high);
mask2 = imgHSV.inRange(low1, high1);
mask3 = imgHSV.inRange(low2, high2);
mask4 = imgHSV.inRange(low3, high3);
dstHSV = mask1.add(mask2);
dstHSV = dstHSV.add(mask3);
dstHSV = dstHSV.add(mask4);

//combine image and mask
//cv.bitwise_and(imgHSV,imgHSV,imgMasked,dstHSV)

let channels = imgHSV.splitChannels();
let maskedChannels = channels.map(c => c.bitwiseAnd(dstHSV));
let output = new cv.Mat(maskedChannels);

let imgMasked = output
//let contours = new cv.MatVector();

// You can try more different parameters
contours = dstHSV.findContours(cv.RETR_EXTERNAL , cv.CHAIN_APPROX_SIMPLE);
let cnt,rect,contoursColor,rectangleColor,point1,point2;
//console.log(contours)

//imgMasked.drawContours(contours,new cv.Vec3(0, 0, 0) , 0,lineType = cv.LINE_8, offset = new cv.Point2(0, 0));


for (let i = 0; i < contours.length; ++i) {
    cnt = contours[i];
    if (cnt.area > 200){
        edgePoints = cnt.getPoints();
        rect = cnt.boundingRect();
        contoursColor = new cv.Vec(30, 255, 255);
        rectangleColor = new cv.Vec(0, 0, 255);
        //console.log(cnt.hierarchy)

        imgMasked.drawContours(
            [edgePoints],
            0,
            new cv.Vec(0, 0, 255),
            { thickness: 5 }
        );

        //imgMasked.drawContours([edgePoints], i, contoursColor, 1, cv.LINE_8, cnt.hierarchy, 8);
        point1 = new cv.Point(rect.x, rect.y);
        point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
        imgMasked.drawRectangle(point1, point2, rectangleColor, 0, cv.LINE_AA, 0);
    }
    
}

imgMasked = imgMasked.cvtColor(cv.COLOR_HSV2RGB);
console.log("Hi")

// show image
/* cv.imshow('a window name', imgHSV);
cv.waitKey(); */

// save image
cv.imwrite('/home/wiac/personal/battleBotProject/fullserver/backend/opencvServer/test.jpg', imgMasked);




