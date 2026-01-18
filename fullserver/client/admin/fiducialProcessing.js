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
        if(this.items.length > 6){
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
    let sumx = 0
    let sumy = 0
    for(let i = 0; i < this.items.length; i++){
        sumx += this.items[i].x
        sumy += this.items[i].y
    }
    return new Point(sumx/this.items.length,sumy/this.items.length)
    }
}

let ws = {"open":false};
let robots = []
let circle = {pos:[350,150],radius:200}

class Robot {
    pos = new Point(0,0)
    constructor(id, pos) {
      this.pos = pos;
      this.id = id;
    }
}


class Fiducial {
    constructor(id,pos) {
        this.id = id
        this.pos = pos
    }

}

class Point {
    x = 0
    y = 0
    constructor(x,y) {
      this.x = x;
      this.y = y;
    }
}

class message {
    constructor(cmd,args){
        this.cmd = cmd
        this.args = args
    }
}

/* 
moveCmd {id duration cmd}
updatePos {id pos}
ring {radius pos}
list {}
*/

let robot0PosList = new pointQueue()

let gameState = 0

let canvasFrame,ctx,video;

let widthOut,heightOut;

let processImage;

let width, height;

const FPS = 20

let domLoaded = false
let videoLoaded = false
let arucoLoaded = false
let cvLoaded = false

let lowerArea1 = 200
let upperArea1 = 1000
let lowerArea2 = 200
let upperArea2 = 1000
let lowerArea3 = 200
let upperArea3 = 1000

let detector;

/**
 * Sender en melding.
 *
 * @param {number} cmd - Kommanden du vil sende.
 * @param {number} args - Argumentene du vil sende med kommanden.
 */
function sendMessage(cmd,args){
    ws.send(JSON.stringify(new message(cmd,args)))
}

function instill(){
    gameState = 1
}

function startGame(){
    gameState = 2
}

function arucoLoad(){
    arucoLoaded = true
    detector = new AR.Detector({
        dictionaryName: 'ARUCO_MIP_36h12',
        maxHammingDistance: 1000
      });
    console.log("ArUco loaded")
}

function cvLoad(){
    cvLoaded = true
    console.log("Opencv loaded")
}

function domLoad(){
    domLoaded = true
    canvasFrame = document.getElementById("canvas"); // canvasFrame is the id of <canvas>
    ctx = canvasFrame.getContext("2d",{ willReadFrequently: true });
    video = document.getElementById("remoteVideo"); // video is the id of video tag
    widthOut = document.getElementById('widthTeller');
    heightOut = document.getElementById('heightTeller');

    video.addEventListener("loadedmetadata", function (e) {
        width = this.offsetWidth;
        height = this.offsetHeight;
    
        canvasFrame.width = width
        canvasFrame.height = height
    
        videoLoad()
    
    }, false);

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
        sendMessage("ring",{"pos":circle.pos,"radius":circle.radius})
        console.log(JSON.stringify(circle))
    });

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
    console.log("Video loaded")
}

function wsOpened(){
    ws.open = true;
    console.log("Connected websocket")
}

function dependenciesLoaded(){
    return arucoLoaded && cvLoaded && videoLoaded && domLoaded && ws.open
}
    
function waitDependencies() {
    console.log("waiting for Dependencies")
    if(dependenciesLoaded()){
        console.log("All dependencies loaded")
        preSetup();
    }else{
        if(!domLoaded){
            console.log("Dom not loaded")
        }
        if(!videoLoaded){
            console.log("Video not loaded")
        }
        if(!cvLoaded){
            console.log("Opencv not loaded")
        }
        if(!arucoLoaded){
            console.log("Aruco not loaded")
        }
        setTimeout(waitDependencies,100)
    }   
}

function preSetup(){
    console.log("maybe doing something")
    // do all your work here
    console.log("running")

    getWidthAndHeight()

    circle.pos = [parseInt(width/2),parseInt(height/2)]

    console.log("starting setup")

    setup();
}

function getWidthAndHeight(){
    width = video.offsetWidth
    height = video.offsetHeight

    widthOut.innerHTML = "video bredde: " + width
    heightOut.innerHTML = "video høyde: " + height

    canvasFrame.width = width
    canvasFrame.height = height
}

function setup(){
    let begin = Date.now();

    sendMessage("list",{})

    drawArenaRing()

    sendRobotPos()
    //display available players logic

    let delay = 1000/FPS - (Date.now() - begin);
    if(gameState == 0 ){
        setTimeout(setup, delay);
    }else if(gameState == 1){
        console.log("Starting game initialization")
        startGameInit()
    }
}

function drawArenaRing(){
    ctx.drawImage(video,0,0,width,height)

    let imageData = ctx.getImageData(0, 0, width, height);

    findFiducials(imageData)

    drawRobotsPos()

    ctx.beginPath();
    ctx.arc(circle.pos[0], circle.pos[1], circle.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function startGameInit(){
    let begin = Date.now();

    drawArenaRing()

    sendRobotPos()
    //display available players logic

    let delay = 1000/FPS - (Date.now() - begin);
    if(gameState == 1 ){
        setTimeout(startGameInit, delay);
    }else if(gameState == 2){
        console.log("Starting game")
        sendMessage("startGame",{})
        processVideo()
    }
}

function findFiducials(imageData){
    var markers = detector.detect(imageData);
    for(i=0; i<markers.length; i += 1){
        if((markers[i].id == 0 || markers[i].id == 1) && robots[0] != undefined ){

            robots[0].fids[markers[i].id].pos = findAvgPoint(
                markers[i].corners,
                robots[0].fids[markers[i].id].pos
            )

            robots[0].pos = findAvgPoint(
                [robots[0].fids[0].pos,robots[0].fids[1].pos],
                robots[0].pos  
            )

            robots[0].dir = new Point(
                robots[0].fids[1].pos.x - robots[0].fids[0].pos.x,
                robots[0].fids[1].pos.y - robots[0].fids[0].pos.y
            )

        }else if((markers[i].id == 2 || markers[i].id == 3) && robots[1] != undefined ){

            robots[1].fids[markers[i].id - 2].pos = findAvgPoint(
                markers[i].corners,
                robots[1].fids[markers[i].id - 2].pos
            )
            robots[1].pos = findAvgPoint(
                [robots[1].fids[0].pos,robots[1].fids[1].pos],
                robots[1].pos
            )
            robots[1].dir = new Point(
                robots[1].fids[1].pos.x - robots[1].fids[0].pos.x,
                robots[1].fids[1].pos.y - robots[1].fids[0].pos.y
            )
        } 
    }
    /* if(robots[1] != undefined){
        console.log(robots[1].pos,robots[1].fids,robots[1].dir)
    } */
}

function findAvgPoint(points,prevPoint){
    if(points.length == 0 || points === undefined){
        return prevPoint
    }else{
        let sumx = 0
        let sumy = 0
        for(let i = 0; i < points.length; i++){
            sumx += points[i].x
            sumy += points[i].y
        }
        return new Point(sumx/points.length,sumy/points.length)
    }
}

function processVideo(){
    let begin = Date.now();
    
    drawArenaRing()

    sendRobotPos()

    let delay = 1000/FPS - (Date.now() - begin);
    setTimeout(processVideo, delay);
}

function drawRobotsPos(){
    for(i = 0; i < robots.length; i ++){
        if(robots[i] != undefined){
            ctx.beginPath();
            ctx.arc(robots[i].pos.x, robots[i].pos.y, 5, 0, 2 * Math.PI);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(robots[i].fids[0].pos.x, robots[i].fids[0].pos.y, 5, 0, 2 * Math.PI);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(robots[i].fids[1].pos.x, robots[i].fids[1].pos.y, 5, 0, 2 * Math.PI);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(robots[i].fids[1].pos.x, robots[i].fids[1].pos.y)
            ctx.lineTo(robots[i].fids[0].pos.x, robots[i].fids[0].pos.y)
            ctx.strokeStyle = "green";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    } 
}

function sendRobotPos(){
    for(let i = 0; i<robots.length;i++){
        if(robots[i]!=undefined){
            sendMessage("updatePos",{
                "id":i,
                "pos":robots[i].pos
            })
        }
    }
}

function connect(){
    ws = new WebSocket('wss://bingusserver.duckdns.org/websock/admin');

    ws.onopen = (event) => {
        wsOpened();
    };
    
    ws.addEventListener("upgrade", (event) => {
        console.log("we are using the websocket protocol");
    })
    
    ws.onmessage = (msg) => {
        let msgData = JSON.parse(msg.data)
        if(msgData.cmd === "list"){
            if(robots.length != 0){
                for(let i = 0; i<msgData.args.data.length;i++){
                    if(robots[i] != undefined){
                        msgData.args.data[i].pos = robots[i].pos
                        msgData.args.data[i].fids = robots[i].fids
                    }
                    robots[i] = msgData.args.data[i]    
                }
            }else{
                robots = msgData.args.data
            }

            
            //console.log(robots)
        }
    };

    ws.onerror = function(err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        ws.close();
    };

    ws.onclose = () => {
        ws.open = false
        console.log("connection closed, retrying in 1 second")
        setTimeout(function() {
            connect();
        }, 1000);
    };
}

connect()

document.addEventListener('DOMContentLoaded', domLoad);

waitDependencies()