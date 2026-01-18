const cv = require('@u4/opencv4nodejs');
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

let myQueue = new pointQueue();

setInterval(() => {

    let x = new cv.Point(Math.random()*100, Math.random()*100) 
    let y = new cv.Point(Math.random()*100, Math.random()*100)
    let z = x.add(y).div(200);

    console.log(x,y,z)
    myQueue.enqueue(new cv.Point(Math.random()*100, Math.random()*100));
    console.log(myQueue.average() , myQueue.items.length);


},10)