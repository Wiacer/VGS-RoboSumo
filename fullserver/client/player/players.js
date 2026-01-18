let canvas;
let ctx;
let video;
let width;
let height;

window.onload = (event) => {
    carID = getCarIDFromUrl()
    myRobotId = Number(carID);
    canvas = document.getElementById("canvasRemoteVideo")
    ctx = canvas.getContext("2d");
    video = document.getElementById("remoteVideo");
    width = video.offsetWidth
    height = video.offsetHeight
    hentRingen()
};

function getCarIDFromUrl() {
    // Get the current URL
    const currentUrl = window.location.href;

    // Parse the query parameters from the URL
    const urlParams = new URLSearchParams(currentUrl.split('?')[1]);

    // Get the value of the 'carName' parameter
    const carID = urlParams.get('carID');

    // Return the retrieved carName (or null if not found)
    return carID;
}

//alert(carID)



const buttons = document.querySelectorAll('.bttn');

// Map WASD keys to corresponding arrow keys
const keyMap = {
    'W': 'ArrowUp',
    'A': 'ArrowLeft',
    'S': 'ArrowDown',
    'D': 'ArrowRight'
};

// Function to handle button click or key press
function handleControl(event) {
    let key;

    // Determine the key based on event type and map WASD keys to arrow keys
    if (event.type === 'keydown') {
        key = keyMap[event.key.toUpperCase()] || event.key;
    } else if (event.type === 'click') {
        key = event.target.getAttribute('data-key');
    }

    const button = document.querySelector(`[data-key="${key}"]`);
    
    if (button) {
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 300);
    }
}

// Attach click event listener to each button
buttons.forEach(button => {
    button.addEventListener('click', handleControl);
});

// Attach key press event listener to the document
document.addEventListener('keydown', handleControl);

//lag brukergrensesnitt
//fix knappene
//gjør at den reconnecter med failed attempt på websocketsane



shift = false;
states = [false,false,false,false,false,false];
data = [false,false,false];
let ctrlId;


function changeState(id,state,states){
    states[id] = state
}

document.getElementById('forward').addEventListener('click', function () {
    states[0] = true
});
document.getElementById('forward').onmouseup = changeState(0,false,states)/* function () {
    states[0] = false
}; */

document.getElementById('left').addEventListener('click', function () {
    states[2] = true
});
document.getElementById('left').onmouseup = changeState(2,false,states)/* function() {
    states[1] = false
};
 */
document.getElementById('backward').addEventListener('click', function () {
    states[1] = true
});
document.getElementById('backward').onmouseup = changeState(1,false,states)/* function () {
    states[2] = false
}; */

document.getElementById('right').addEventListener('click', function () {
    states[3] = true
});
document.getElementById('right').onmouseup = changeState(3,false,states)/* function () {
    states[3] = false
}; */



function shifter(x,shift){
    if(x){
        return shift ? 100 : 50;
    }else{
        return 0;
    }
}

window.addEventListener('keydown', (event) => {

    switch (event.key) {
        case 'w':
            states[0] = true
           // console.log('w pressed');
        break;
        case 's':
            states[1] = true
           // console.log("s pressed");
        break;
        case 'a':
            states[2] = true
          //  console.log("a pressed");
        break;
        case 'd':
            states[3] = true
          //  console.log("d pressed");
        break;
        case 'q':
            states[4] = true
          //  console.log("q pressed");
        break;
        case 'e':
            states[5] = true
         //   console.log("e pressed");
        break;
        case 'Shift':
            shift = true
          //  console.log("shift pressed");
        break;
    }
});


window.addEventListener('keyup', (event) => {

    switch (event.key) {
        case 'w':
            states[0] = false
          //  console.log('w released');
        break;
        case 's':
            states[1] = false
          //  console.log("s released");
        break;
        case 'a':
            states[2] = false
          //  console.log("a released");
        break;
        case 'd':
            states[3] = false
           // console.log("d released");
        break;
        case 'q':
            states[4] = false
           // console.log("q released");
        break;
        case 'e':
            states[5] = false
            //console.log("e released");
        break;
        case 'Shift':
            shift = false
            for(i=0; i<states.length; i++){
                states[i] = false
            }
            //console.log("shift released");
        break;
    }
});

function connect(){
    var ws = new WebSocket('wss://bingusserver.duckdns.org/websock/player');
    ws.watchDogCounter = 0

    ws.addEventListener("open", (event) => {
        console.log("we are connected");
        console.log(`we are using` + ws.protocol);

        ws.intervalId = setInterval(() => {
    
            data[0] = shifter(states[0],shift) - shifter(states[1],shift);
            data[1] = shifter(states[3],shift) - shifter(states[2],shift);
            data[2] = shifter(states[5],shift) - shifter(states[4],shift); 

            console.log(data, states, myRobotId);

            ws.send(JSON.stringify({"cmd": data, "id":myRobotId, "ctrlId":ctrlId}));
        }, 50);
    })
    
    ws.addEventListener("upgrade", (event) => {
        console.log("we are using the websocket protocol");
    })
    
    ws.onmessage = (msg) => {
        data = JSON.parse(msg.data)
        console.log(data)
        if(data.gameOver){
            console.log(data)
            if(data.controller === "loser"){
                console.log(data)
                alert("Du tapte")
            }{
                console.log(data)
                alert("Du vant")
            }
        }else if(data.controller === "loser"){
            console.log("stinky")
            alert("Du er ute")
        }
    };

    ws.onerror = function(err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        ws.close();
    };

    ws.onclose = () => {
        console.log("connection closed, retrying in 1 second")
        clearInterval(ws.intervalId)
        setTimeout(function() {
            connect();
        }, 1000);
    };
}
let circle;

async function hentRingen(){
    let begin = Date.now();
    ctx.drawImage(video,0,0,width,602);
    
    if(circle === undefined){
        let myObject = await fetch("https://bingusserver.duckdns.org/websock/ring?");
        let myText = await myObject.text()
        circle = JSON.parse(myText);
    }else{
        ctx.beginPath();
        ctx.arc(circle.pos.x, circle.pos.y, circle.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.stroke();
    }
    let delay = 1000/60 - (Date.now() - begin);
    setTimeout(hentRingen, delay);
}

connect()