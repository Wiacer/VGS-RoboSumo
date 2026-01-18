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

// Queue class
class pointQueue
{
    // Array is used to implement a Queue
    constructor()
    {
        this.items = [];
    }
    isEmpty()
    {
        // return true if the queue is empty.
        return this.items.length == 0;
    }
    enqueue(element)
    {    
        // adding element to the queue
        this.items.push(element);
        if(this.items.length > 5){
            this.items.shift();
        }
        //console.log(element + " enqueued to queue<br>");
    }
    dequeue()
    {
        // removing element from the queue
        // returns underflow when called 
        // on empty queue
        if(this.isEmpty())
            console.log("Underflow");
            return 0
        return this.items.shift();
    }
    front()
    {
        // returns the Front element of 
        // the queue without removing it.
        if(this.isEmpty())
            console.log("No elements in Queue");
            return 0
        return this.items[0];
    }
    rear()
    {
        // returns the Rear element of 
        // the queue without removing it.
        if(this.isEmpty())
            console.log("No elements in Queue");
            return 0
        return this.items[this.items.length-1];
    }
    average()
    {
    let sum = new cv.Point(0,0); 
    for(let i=0; i<this.items.length; i++){
        sum = sum.add(this.items[i])
    }
    return sum.div(this.items.length);
    }
}

//define mask thresholds
/* const low = new cv.Vec(158, 105, 69);
const high = new cv.Vec(179, 255, 255);

const low1 = new cv.Vec(9, 112, 111);
const high1 = new cv.Vec(27, 255, 255); */

const low = new cv.Vec(0, 114, 157);
const high = new cv.Vec(5, 244, 240);

/* const low = new cv.Vec(0, 0, 0);
const high = new cv.Vec(10, 250, 250); */

const low1 = new cv.Vec(162, 114, 157);
const high1 = new cv.Vec(180, 244, 240);

/* const low2 = new cv.Vec(92, 120, 120);
const high2 = new cv.Vec(135, 255, 255);

const low3 = new cv.Vec(0, 100, 100);
const high3 = new cv.Vec(255, 255, 255); */

const low2 = new cv.Vec(0,0,0);
const high2 = new cv.Vec(0,0,0);

const low3 = new cv.Vec(0,0,0);
const high3 = new cv.Vec(0,0,0);

let cnt,rect,contoursColor,rectangleColor,point1,point2;

contoursColor = new cv.Vec(30, 255, 255);
rectangleColor = new cv.Vec(0, 0, 255);
circleColor = new cv.Vec(0, 255, 0);

const wCap = new cv.VideoCapture(0);
//const wCap = new cv.VideoCapture("rtsp://192.168.170.119:8554/live.sdp");
//const wCap = new cv.VideoCapture("rtsp://192.168.1.32:554/mjpeg/1");

let points = new pointQueue(); 


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});

setInterval(() => {
    const frame = wCap.read();

    imgHSV = frame.cvtColor(cv.COLOR_BGR2RGB);
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



            points.enqueue(new cv.Point(rect.x + rect.width/2,rect.y + rect.height/2));
            let average = points.average();

            

            frame.drawCircle(average,1,circleColor,1,cv.LINE_8,0);

            frame.drawRectangle(point1, point2, rectangleColor, 0, cv.LINE_AA, 0);
        }
        
    }

    imgMasked = imgMasked.cvtColor(cv.COLOR_HSV2RGB);

    const image = cv.imencode('.jpg', frame).toString('base64');
    io.emit('image',image );
}, 1000/40);

server.listen(3000);



// load image from file
//const frame = cv.imread('./img.png');zz



/* console.log("Hi")

// show image
cv.imshow('a window name', high1);
cv.waitKey();
 */
// save image
//cv.imwrite('./test.jpg', imgMasked);




