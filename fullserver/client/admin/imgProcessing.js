// Queue class

/* 


*/
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
    //console.log(sum.x)
    for(let i=0; i<this.items.length; i++){
        sum = new cv.Point(sum.x + this.items[i].x, sum.y+this.items[i].y)
    }
    return new cv.Point(sum.x/this.items.length,sum.y/this.items.length)
    }
}

let data = [50,25,10,69]
let robots = []
let circle = {pos:[350,150],radius:200}

class Robot {
    pos = [0,0]
    constructor(id, pos) {
      this.pos = pos;
      this.id = id;
    }
}

robots.push(new Robot(0,[0,0]))
robots.push(new Robot(1,[0,0]))

class message {
    constructor(cmd,args){
        this.cmd = cmd
        this.args = args
    }
}

/* 
assign {id color front area}
updatePos {id pos}
ring {radius pos}
list {}
*/

let gameState = 0

document.getElementById('dataForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    // Get values from input fields
    let myRadius = Number(document.getElementById('inputRadius').value);
    if(myRadius){
        circle.radius = myRadius
    }
    // Call a function with the parsed data
    let xPos = Number(document.getElementById('inputxPos').value);
    if(xPos){
        circle.pos[0] = xPos
    }
    
    let yPos = Number(document.getElementById('inputyPos').value);
    if(yPos){
        circle.pos[1] = yPos
    } 
    console.log(JSON.stringify(circle))
});

const ws = new WebSocket('wss://bingusserver.duckdns.org/websock/admin');

ws.addEventListener("open", (event) => {
    //ws.send(JSON.stringify(new message("list",{})))
    //ws.send(JSON.stringify(data))
})

ws.addEventListener("message", (msg) => {
    let msgData = JSON.parse(msg.data)
    if(msgData.cmd === "list"){
        robots = msgData.args.data
        console.log(robots)
    }
})

let canvasFrame = document.getElementById("canvas"); // canvasFrame is the id of <canvas>
let canvasOut = document.getElementById("canvasOut"); // canvasFrame is the id of <canvas>
let ctx = canvasFrame.getContext("2d",{ willReadFrequently: true });
let video = document.getElementById("remoteVideo"); // video is the id of video tag

// For Red1
let red1LowH = document.getElementById('red1LowH');
let red1LowS = document.getElementById('red1LowS');
let red1LowV = document.getElementById('red1LowV');

let red1HighH = document.getElementById('red1HighH');
let red1HighS = document.getElementById('red1HighS');
let red1HighV = document.getElementById('red1HighV');

// For Red2
let red2LowH = document.getElementById('red2LowH');
let red2LowS = document.getElementById('red2LowS');
let red2LowV = document.getElementById('red2LowV');

let red2HighH = document.getElementById('red2HighH');
let red2HighS = document.getElementById('red2HighS');
let red2HighV = document.getElementById('red2HighV');

// For Yellow
let yellowLowH = document.getElementById('yellowLowH');
let yellowLowS = document.getElementById('yellowLowS');
let yellowLowV = document.getElementById('yellowLowV');

let yellowHighH = document.getElementById('yellowHighH');
let yellowHighS = document.getElementById('yellowHighS');
let yellowHighV = document.getElementById('yellowHighV');

// For Blue
let blueLowH = document.getElementById('blueLowH');
let blueLowS = document.getElementById('blueLowS');
let blueLowV = document.getElementById('blueLowV');

let blueHighH = document.getElementById('blueHighH');
let blueHighS = document.getElementById('blueHighS');
let blueHighV = document.getElementById('blueHighV');

// For Green
let greenLowH = document.getElementById('greenLowH');
let greenLowS = document.getElementById('greenLowS');
let greenLowV = document.getElementById('greenLowV');

let greenHighH = document.getElementById('greenHighH');
let greenHighS = document.getElementById('greenHighS');
let greenHighV = document.getElementById('greenHighV');

let widthOut = document.getElementById('widthTeller');
let heightOut = document.getElementById('heightTeller');

let dstHSV,imgHSV,mask,redMask1,yellowMask,blueMask,greenMask,src,redMask2;

let red1Low, red1High, yellowLow, yellowHigh, blueLow, blueHigh, greenLow, greenHigh,  redLow2, redHigh2;
let cnt,rect,contoursColor,rectangleColor,point1,point2;

let redPoints = new pointQueue(); 
let yellowPoints1 = new pointQueue(); 
let yellowPoints2 = new pointQueue(); 
let bluePoints = new pointQueue(); 
let greenPoints = new pointQueue(); 

let width, height;

const FPS = 20

let domLoaded = false
let videoLoaded = false
let cvLoaded = false

let lowerArea1 = 200
let upperArea1 = 1000
let lowerArea2 = 200
let upperArea2 = 1000
let lowerArea3 = 200
let upperArea3 = 1000

let detector = new AR.Detector();

/* contoursColor = new cv.Vec(30, 255, 255);
rectangleColor = new cv.Vec(0, 0, 255);
circleColor = new cv.Vec(0, 255, 0); */

//const wCap = new cv.VideoCapture(0);
//const wCap = new cv.VideoCapture("rtsp://192.168.170.119:8554/live.sdp");
//const wCap = new cv.VideoCapture("rtsp://192.168.1.32:554/mjpeg/1");

function cvLoad(){
    cvLoaded = true
    cv['onRuntimeInitialized']=()=>{
        initOpenCv()
    }
}

function instill(){
    gameState = 1
}

function startGame(){
    gameState = 2
}

function domLoad(){
    domLoaded = true
    red1LowH = document.getElementById('red1LowH');
    red1LowS = document.getElementById('red1LowS');
    red1LowV = document.getElementById('red1LowV');

    red1HighH = document.getElementById('red1HighH');
    red1HighS = document.getElementById('red1HighS');
    red1HighV = document.getElementById('red1HighV');

    // For Red2
    red2LowH = document.getElementById('red2LowH');
    red2LowS = document.getElementById('red2LowS');
    red2LowV = document.getElementById('red2LowV');

    red2HighH = document.getElementById('red2HighH');
    red2HighS = document.getElementById('red2HighS');
    red2HighV = document.getElementById('red2HighV');

    // For Yellow
    yellowLowH = document.getElementById('yellowLowH');
    yellowLowS = document.getElementById('yellowLowS');
    yellowLowV = document.getElementById('yellowLowV');

    yellowHighH = document.getElementById('yellowHighH');
    yellowHighS = document.getElementById('yellowHighS');
    yellowHighV = document.getElementById('yellowHighV');

    // For Blue
    blueLowH = document.getElementById('blueLowH');
    blueLowS = document.getElementById('blueLowS');
    blueLowV = document.getElementById('blueLowV');

    blueHighH = document.getElementById('blueHighH');
    blueHighS = document.getElementById('blueHighS');
    blueHighV = document.getElementById('blueHighV');

    // For Green
    greenLowH = document.getElementById('greenLowH');
    greenLowS = document.getElementById('greenLowS');
    greenLowV = document.getElementById('greenLowV');

    greenHighH = document.getElementById('greenHighH');
    greenHighS = document.getElementById('greenHighS');
    greenHighV = document.getElementById('greenHighV');

    widthOut = document.getElementById('widthTeller');
    heightOut = document.getElementById('heightTeller');

    document.getElementById('areaForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        // Get values from input fields
        var x = Number(document.getElementById('lowerArea1').value);
        if(x){
            lowerArea1 = x
        }
        delete x

        var x = Number(document.getElementById('upperArea1').value);
        if(x){
            upperArea1 = x
        }
        delete x

        var x = Number(document.getElementById('lowerArea2').value);
        if(x){
            lowerArea2 = x
        }
        delete x

        var x = Number(document.getElementById('upperArea2').value);
        if(x){
            upperArea2 = x
        }
        delete x

        var x = Number(document.getElementById('lowerArea3').value);
        if(x){
            lowerArea3 = x
        }
        delete x

        var x = Number(document.getElementById('upperArea3').value);
        console.log(x)
        if(x){
            upperArea3 = x
            console.log(x)
        }
    });
}

function videoLoad(){
    videoLoaded = true
}

document.addEventListener('DOMContentLoaded', domLoad);

video.addEventListener("loadedmetadata", function (e) {
    width = this.offsetWidth;
    height = this.offsetHeight;

    canvasFrame.width = width
    canvasFrame.height = height

    canvasOut.width = width
    canvasOut.height = height
    videoLoad()
    initOpenCv()
    console.log("video initialized")

}, false);

function initOpenCv() {
    console.log("initOpenCv")
    if(cvLoaded && videoLoaded && domLoaded){
        checkAllReady();
    }else{
        setTimeout(initOpenCv,100)
    }
     
}

function checkAllReady() {
    // Check if both DOM and video are loaded and OpenCV.js is ready
    if (document.readyState === 'complete' && video.readyState === 4 && cv.onRuntimeInitialized) {
        console.log("opencv not ready or somethin")
        openCvReady();
    }else{
        console.log("Not ready or sumethin")
        setTimeout(checkAllReady, 100);
    }
}

/* function waitForGameStart() {
    if(gameState==0){
        ws.send(JSON.stringify(new message("list",{})))
        setTimeout(waitForGameStart,1000)
    }else if(gameState==1){

    }
} */

function openCvReady() {
    console.log("maybe doing something")
        // do all your work here
        console.log("running")

        width = video.offsetWidth
        height = video.offsetHeight

        widthOut.innerHTML = "video bredde: " + width
        heightOut.innerHTML = "video høyde: " + height

        circle.pos = [parseInt(width/2),parseInt(height/2)]

        dstHSV = new cv.Mat(/* height, width, cv.CV_8UC3, new cv.Scalar(158, 105, 69) */);
        
        //imgMasked = new cv.Mat();
        mask = new cv.Mat();
        redMask2 = new cv.Mat();
        redMask1 = new cv.Mat();
        yellowMask = new cv.Mat();
        blueMask = new cv.Mat();
        greenMask = new cv.Mat();

        redMask1_2 = new cv.Mat();
        yellowMask_2 = new cv.Mat();
        blueMask_2 = new cv.Mat();
        greenMask_2 = new cv.Mat();

        mask5 = new cv.Mat();
        outMat = new cv.Mat();
        src = new cv.Mat(height, width, cv.CV_8UC4);

        
        
        contoursColor = new cv.Scalar(30, 255, 255);
        rectangleColor = new cv.Scalar(0, 0, 255);
        circleColor = new cv.Scalar(0, 255, 255);
        bigCircleColor = new cv.Scalar(100, 255, 255);

        console.log("processing video")
        //writeFileSync('output.png', canvas.toBuffer('image/png'));
        /* src.delete();dstHSV.delete();imgMasked.delete();imgHSV.delete();
        red1Low.delete();high.delete();yellowLow.delete();yellowHigh.delete();blueLow.delete();blueHigh.delete();greenLow.delete();greenHigh.delete();
        mask.delete();redMask1.delete();yellowMask.delete();blueMask.delete();greenMask.delete();
        redContours.delete(); hierarchy.delete(); */
        setTimeout(circleDrawState, 0);
}

function circleDrawState(){
    let begin = Date.now();
    ctx.drawImage(video,0,0,width,height)

    var imageData = ctx.getImageData(0, 0, width, height);

    src.data.set(imageData.data);

    var markers = detector.detect(imageData);

    for(i=0; i<markers.length;i++){
        if(i==0){
            console.log(JSON.stringify(markers))
        }
        if(markers[i].id == 0){
            console.log(JSON.stringify(markers[i]))
        }
    }

    cv.circle(src, new cv.Point(circle.pos[0],circle.pos[1]), circle.radius ,bigCircleColor, 2, cv.LINE_AA, 0);

    cv.imshow("canvasOut", src);

    let delay = 1000/FPS - (Date.now() - begin);
    if(gameState == 0 ){
        setTimeout(circleDrawState, delay);
    }else if(gameState == 1){
        setTimeout(processVideo, 0);
    }
    
}

function processVideo(){
    let begin = Date.now();
    //console.log("video processing")
    let average = new cv.Point(0,0);
    ctx.drawImage(video,0,0,width,height)
    // using node-canvas, we an image file to an object compatible with HTML DOM Image and therefore with cv.imread()
    src.data.set(ctx.getImageData(0, 0, width, height).data);
    let dtype = -1;

    imgHSV = new cv.Mat(height, width, cv.CV_8UC3);
    let circleMat = new cv.Mat(imgHSV.rows, imgHSV.cols, cv.CV_8UC1,new cv.Scalar(0));
    cv.circle(circleMat, new cv.Point(circle.pos[0],circle.pos[1]), circle.radius ,new cv.Scalar(255), -1, cv.LINE_AA, 0);

    // For Red1
    red1Low = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(parseFloat(red1LowH.value), parseFloat(red1LowS.value), parseFloat(red1LowV.value)));
    red1High = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(parseFloat(red1HighH.value), parseFloat(red1HighS.value), parseFloat(red1HighV.value)));

    // For Red2
    redLow2 = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(parseFloat(red2LowH.value), parseFloat(red2LowS.value), parseFloat(red2LowV.value)));
    redHigh2 = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(parseFloat(red2HighH.value), parseFloat(red2HighS.value), parseFloat(red2HighV.value)));

    // For Yellow
    yellowLow = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(parseFloat(yellowLowH.value), parseFloat(yellowLowS.value), parseFloat(yellowLowV.value)));
    yellowHigh = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(parseFloat(yellowHighH.value), parseFloat(yellowHighS.value), parseFloat(yellowHighV.value)));

    // For Blue
    blueLow = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(parseFloat(blueLowH.value), parseFloat(blueLowS.value), parseFloat(blueLowV.value)));
    blueHigh = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(parseFloat(blueHighH.value), parseFloat(blueHighS.value), parseFloat(blueHighV.value)));

    // For Green
    greenLow = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(parseFloat(greenLowH.value), parseFloat(greenLowS.value), parseFloat(greenLowV.value)));
    greenHigh = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(parseFloat(greenHighH.value), parseFloat(greenHighS.value), parseFloat(greenHighV.value)));


   /* red1Low = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(red1LowH.value, red1LowS.value, red1LowV.value));
   red1High = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(red1HighH.value, red1HighS.value, red1HighV.value));

   redLow2 = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(red2LowH.value, red2LowS.value, red2LowV.value));
   redHigh2 = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(red2HighH.value, red2HighS.value, red2HighV.value));

   yellowLow = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(yellowLowH.value, yellowLowS.value, yellowLowV.value));
   yellowHigh = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(yellowHighH.value, yellowHighS.value, yellowHighV.value));

   blueLow = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(blueLowH.value, blueLowS.value, blueLowV.value));
   blueHigh = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(blueHighH.value, blueHighS.value, blueHighV.value));

    greenLow = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(greenLowH.value, greenLowS.value, greenLowV.value));
    greenHigh = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), new cv.Scalar(greenHighH.value, greenHighS.value, greenHighV.value));
     */
    cv.cvtColor(src, imgHSV, cv.COLOR_RGBA2RGB, 0);
    cv.cvtColor(imgHSV, imgHSV, cv.COLOR_RGB2HSV, 0);

    cv.inRange(imgHSV, red1Low, red1High, redMask1);
    cv.inRange(imgHSV, yellowLow, yellowHigh, yellowMask);
    cv.inRange(imgHSV, blueLow, blueHigh, blueMask);
    cv.inRange(imgHSV, greenLow, greenHigh, greenMask);
    cv.inRange(imgHSV, redLow2, redHigh2, redMask2);
    cv.add(redMask1, redMask2, redMask2, mask, dtype);
    //cv.bitwise_and(dstHSV,dstHSV,mask5,circleMat)
    cv.bitwise_and(redMask2,redMask2,redMask1_2,circleMat)
    cv.bitwise_and(yellowMask,yellowMask,yellowMask_2,circleMat)
    cv.bitwise_and(blueMask,blueMask,blueMask_2,circleMat)
    cv.bitwise_and(greenMask,greenMask,greenMask_2,circleMat)
    
    //cv.bitwise_and(imgHSV,imgHSV,imgMasked,dstHSV)

    let redContours = new cv.MatVector();
    let redHierarchy = new cv.Mat();

    // You can try more different parameters
    cv.findContours(redMask1_2, redContours, redHierarchy, cv.RETR_EXTERNAL , cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < redContours.size(); ++i) {
        cnt = redContours.get(i);
        let contArea =cv.contourArea(cnt,false)
        if(upperArea3 > contArea && contArea> lowerArea3){
            let color = new cv.Scalar(175,255,255)
            rect = cv.boundingRect(cnt);
            cv.drawContours(imgHSV, redContours, i, color, 1, 8, redHierarchy, 100);
            point1 = new cv.Point(rect.x, rect.y);
            point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            redPoints.enqueue(new cv.Point(rect.x + rect.width/2,rect.y + rect.height/2));
            average = redPoints.average();
            cv.rectangle(imgHSV, point1, point2, color, 2, cv.LINE_AA, 0);
            cv.circle(imgHSV, average, 4 ,color, 2, cv.LINE_AA, 0);
        }
    }

    let yellowContours = new cv.MatVector();
    let yellowHierarchy = new cv.Mat();

    // You can try more different parameters
    cv.findContours(yellowMask_2, yellowContours, yellowHierarchy, cv.RETR_EXTERNAL , cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < yellowContours.size(); ++i) {
        cnt = yellowContours.get(i);
        let contArea =cv.contourArea(cnt,false)
        if((upperArea1 > contArea && contArea> lowerArea1) || (upperArea2 > contArea && contArea> lowerArea2)){
            cv.drawContours(imgHSV, yellowContours, i, new cv.Scalar(19,255,255), 1, 8, yellowHierarchy, 100);
        }
        if(upperArea1 > contArea && contArea> lowerArea1){
            let color = new cv.Scalar(0,0,255)
            rect = cv.boundingRect(cnt);
            point1 = new cv.Point(rect.x, rect.y);
            point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            yellowPoints1.enqueue(new cv.Point(rect.x + rect.width/2,rect.y + rect.height/2));
            average = yellowPoints1.average();
            cv.rectangle(imgHSV, point1, point2, color, 3, cv.LINE_AA, 0);
            cv.circle(imgHSV, average, 4 ,color, 2, cv.LINE_AA, 0);
            robots[0].pos = [average.x,average.y]
        }
        if(upperArea2 > contArea && contArea> lowerArea2){
            let color = new cv.Scalar(0,255,0)
            rect = cv.boundingRect(cnt);
            point1 = new cv.Point(rect.x, rect.y);
            point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            yellowPoints2.enqueue(new cv.Point(rect.x + rect.width/2,rect.y + rect.height/2));
            average = yellowPoints2.average();
            cv.rectangle(imgHSV, point1, point2, color, 2, cv.LINE_AA, 0);
            cv.circle(imgHSV, average, 4 ,color, 2, cv.LINE_AA, 0);
            robots[1].pos = [average.x,average.y]
        }
    }

    let blueContours = new cv.MatVector();
    let blueHierarchy = new cv.Mat();

    // You can try more different parameters
    cv.findContours(blueMask_2, blueContours, blueHierarchy, cv.RETR_EXTERNAL , cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < blueContours.size(); ++i) {
        cnt = blueContours.get(i);
        let contArea =cv.contourArea(cnt,false)
        if(upperArea3 > contArea && contArea> lowerArea3){
            let color = new cv.Scalar(110,255,255)
            rect = cv.boundingRect(cnt);
            cv.drawContours(imgHSV, blueContours, i, color, 1, 8, blueHierarchy, 100);
            point1 = new cv.Point(rect.x, rect.y);
            point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            bluePoints.enqueue(new cv.Point(rect.x + rect.width/2,rect.y + rect.height/2));
            average = bluePoints.average();
            cv.rectangle(imgHSV, point1, point2, color, 2, cv.LINE_AA, 0);
            cv.circle(imgHSV, average, 4 ,color, 2, cv.LINE_AA, 0);
        }
    }

    let greenContours = new cv.MatVector();
    let greenHierarchy = new cv.Mat();

    // You can try more different parameters
    cv.findContours(greenMask_2, greenContours, greenHierarchy, cv.RETR_EXTERNAL , cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < greenContours.size(); ++i) {
        cnt = greenContours.get(i);
        let contArea =cv.contourArea(cnt,false)
        if(upperArea3 > contArea && contArea> lowerArea3){
            let color = new cv.Scalar(70,255,255)
            rect = cv.boundingRect(cnt);
            cv.drawContours(imgHSV, greenContours, i, color, 1, 8, greenHierarchy, 100);
            point1 = new cv.Point(rect.x, rect.y);
            point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            greenPoints.enqueue(new cv.Point(rect.x + rect.width/2,rect.y + rect.height/2));
            average = greenPoints.average();
            cv.rectangle(imgHSV, point1, point2, color, 2, cv.LINE_AA, 0);
            cv.circle(imgHSV, average, 4 ,color, 2, cv.LINE_AA, 0);
        }
    }
    let avgPoint = new cv.Point(parseInt((redPoints.average().x + yellowPoints1.average().x)/2),parseInt((redPoints.average().y + yellowPoints1.average().y)/2))

    cv.circle(imgHSV, avgPoint, 4 ,new cv.Scalar(50, 255, 255), 2, cv.LINE_AA, 0);

    avgPoint = new cv.Point(parseInt((bluePoints.average().x + yellowPoints2.average().x)/2),parseInt((bluePoints.average().y + yellowPoints2.average().y)/2))

    cv.circle(imgHSV, avgPoint, 4 ,new cv.Scalar(75, 255, 255), 2, cv.LINE_AA, 0);

    cv.circle(imgHSV, new cv.Point(circle.pos[0],circle.pos[1]), circle.radius ,bigCircleColor, 2, cv.LINE_AA, 0);

    redContours.delete()
    redHierarchy.delete()
    yellowContours.delete()
    yellowHierarchy.delete()
    blueContours.delete()
    blueHierarchy.delete()
    greenContours.delete()
    greenHierarchy.delete()

    red1Low.delete()
    red1High.delete()
    redLow2.delete()
    redHigh2.delete()
    yellowLow.delete()
    yellowHigh.delete()
    blueLow.delete()
    blueHigh.delete()
    greenLow.delete()
    greenHigh.delete()

    console.log(JSON.stringify(robots))

    cv.cvtColor(imgHSV, outMat, cv.COLOR_HSV2RGB, 0);
    cv.imshow("canvasOut", outMat);

    circleMat.delete()
    imgHSV.delete()

    let delay = 1000/FPS - (Date.now() - begin);
    setTimeout(processVideo, delay);
}