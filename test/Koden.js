const cv = require('@u4/opencv4nodejs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let dstHSV = new cv.Mat();
let imgHSV = new cv.Mat();
let mask = new cv.Mat();
let mask1 = new cv.Mat();
let mask2 = new cv.Mat();
let mask3 = new cv.Mat();
let mask4 = new cv.Mat();

//define mask thresholds
const low = new cv.Vec(158, 105, 69);
const high = new cv.Vec(179, 255, 255);

const low1 = new cv.Vec(9, 112, 111);
const high1 = new cv.Vec(27, 255, 255);

const low2 = new cv.Vec(92, 120, 120);
const high2 = new cv.Vec(135, 255, 255);

const low3 = new cv.Vec(0, 200, 200);
const high3 = new cv.Vec(255, 255, 255);

let cnt,rect,contoursColor,rectangleColor,point1,point2;

contoursColor = new cv.Vec(30, 255, 255);
rectangleColor = new cv.Vec(0, 0, 255);

const wCap = new cv.VideoCapture(0);
//const wCap = new cv.VideoCapture("rtsp://192.168.1.8:8554/live.sdp");
//const wCap = new cv.VideoCapture("rtsp://192.168.1.32:554/mjpeg/1");


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});

setInterval(() => {
    const frame = wCap.read();

    /* imgHSV = frame.cvtColor(cv.COLOR_RGBA2RGB);
    imgHSV = imgHSV.cvtColor(cv.COLOR_RGB2HSV);



    //combine mask thresholds
    mask1 = imgHSV.inRange(low, high);
    mask2 = imgHSV.inRange(low1, high1);
    mask3 = imgHSV.inRange(low2, high2);
    mask4 = imgHSV.inRange(low3, high3);
    dstHSV = mask1.add(mask2);
    dstHSV = dstHSV.add(mask3);
    dstHSV = dstHSV.add(mask4);

    //combine image and mask
    let channels = imgHSV.splitChannels();
    let maskedChannels = channels.map(c => c.bitwiseAnd(dstHSV));
    let imgMasked = new cv.Mat(maskedChannels);

    // You can try more different parameters
    contours = dstHSV.findContours(cv.RETR_EXTERNAL , cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < contours.length; ++i) {
        cnt = contours[i];
        if (cnt.area > 200){
            edgePoints = cnt.getPoints();
            rect = cnt.boundingRect();

            frame.drawContours(
                [edgePoints],
                0,
                new cv.Vec(0, 0, 255),
                { thickness: 5 }
            );

            point1 = new cv.Point(rect.x, rect.y);
            point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            frame.drawRectangle(point1, point2, rectangleColor, 0, cv.LINE_AA, 0);
        }
        
    }

    imgMasked = imgMasked.cvtColor(cv.COLOR_HSV2RGB);
 */
    const image = cv.imencode('.jpg', frame).toString('base64');
    io.emit('image',image );
}, 1000/40);

server.listen(3000);



// load image from file
/* const frame = cv.imread('./img.png');



console.log("Hi")

// show image
cv.imshow('a window name', imgMasked);
cv.waitKey();

// save image
//cv.imwrite('./test.jpg', imgMasked);




 */