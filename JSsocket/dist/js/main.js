class Boid {
    constructor(){
        this.position = createVector(mouseX,mouseY);
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2,4));
        this.acceleration = createVector();
        this.maxForce = 0.2;
        this.maxSpeed = 4;
        this.vel = p5.Vector.random2D();
        this.vel.setMag(random(0.1,1));
        // this.cursorPic = random(cursors);
    }

    edges(){
        if(this.position.x > width){
            this.position.x = 0;
        } else if(this.position.x < 0){
            this.position.x = width;
        }
        if(this.position.y > height){
            this.position.y = 0;
        } else if (this.position.y < 0){
            this.position.y = height;
        }
    }
    
    //align -----

    align(boids){
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0; //total boids precepted
        for(let other of boids){
            let d = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            if(other != this && d < perceptionRadius){
                steering.add(other.velocity);
                total++;
            }
        }
        if(total > 0){
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering; //return  the force
    }

    //cohesion -----

    cohesion(boids){
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0; //total boids precepted
        for(let other of boids){
            let d = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            if(other != this && d < perceptionRadius){
                steering.add(other.position);
                total++;
                // console.log(total);
            }
        }
        if(total > 0){
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering; //return  the force
    }

    //separation -----

    separation(boids){
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0; //total boids precepted
        for(let other of boids){
            let d = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            if(other != this && d < perceptionRadius){
                let diff = p5.Vector.sub(this.position, other.position);
                diff.div(d); // farer -> lower magnitude   closer -> higher magnitude
                steering.add(diff);
                total++;
            }
        }
        if(total > 0){
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering; //return the force
    }

    flock(boids){
        this.acceleration.mult(0);
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        // separation.mult(separationSlider.value());
        // cohesion.mult(cohesionSlider.value());
        // alignment.mult(alignSlider.value());


        this.acceleration.add(alignment); // F = M * A (M = 1 -> F = A)
        this.acceleration.add(cohesion); //force accumlation - the resulting acceleration is the sum of those forces
        this.acceleration.add(separation);

    }


    update(){
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
    }


    showWhite(){
        image(cursor0,this.position.x,this.position.y,286/20,429/20);
    }

    showBlack(){
        image(cursor1,this.position.x,this.position.y,286/20,429/20);
    }
}

//main sketch

//flock setting
const flock = [];
const flock2 = [];

//box setting
let textBoxs = [];
let storedTexts = [];
let sendCount = -1;
let xoff1, xoff2;

//basic setting
let mainPage;
let posX,posY;
let cursor0,cursor1;
var socket;

const messageContainer = document.getElementById('message-container');
const textValueContainer = document.getElementById('textValue-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

const submitButton = document.getElementById('send-button');

const name = prompt('Welcome! What is your name?');
appendMessage('You joined')//Change the text here

messageForm.addEventListener('submit', e => {
    e.preventDefault() //not refresh the page
    const message = messageInput.value
    if(message != ''){
        appendMessage(`You:${message}`) //?????
        socket.emit('send-chat-message', message)
        messageInput.value = ''
    }
}) 

submitButton.addEventListener('click',createBox);
submitButton.addEventListener('click',changeNoise);

//------------------------------------------------------------
function preload(){
    cursor0 = loadImage('../images/cursor0.png');
    cursor1 = loadImage('../images/cursor1.png');
}

function setup(){
    mainPage = createCanvas(windowWidth, windowHeight);
    mainPage.position(0,0);
    mainPage.style("z-index",-1);
    
    //socket
    socket = io.connect('http://localhost:3000');
    
    socket.on('mouse', newFlocks);

    socket.emit('new-user', name);

    socket.on('chat-message',data => {
        appendMessage(`${data.name}:${data.message}`)
        // storedMessage(`${data.message}`)
    })

    socket.on('user-connected',name => {
        appendMessage(`${name} connected`)
    })

    socket.on('user-disconnected',name => {
        appendMessage(`${name} disconnected`)
    })


}

function newFlocks(){
    flock2.push((new Boid()));
}

function mouseDragged(){
    // console.log('Sending: ' + mouseX + ',' + mouseY);
    
    //Message sending to socket - data & name
    //data - js object
    var data = {
      x: mouseX,
      y: mouseY,
    }
    //name - send data to socket server with different name
    socket.emit('mouse',data); 
  
    flock.push((new Boid()));
}

function draw(){

    posX = map(noise(xoff1),0,1,0,width);
    posY = map(noise(xoff2),0,1,0,height);

    xoff1 += 0.01;
    xoff2 += 0.01;

    background(255);

    for (let boid of flock){
        boid.edges();
        boid.flock(flock);
        boid.update();
        boid.showWhite();
    }
    
    for (let boid of flock2){
        boid.edges();
        boid.flock(flock);
        boid.update();
        boid.showBlack();
    }

    for (var i=0; i<textBoxs.length; i++){
        textBoxs[i].showBlue(posX,posY);
    }
    fill(255,100,100);
    // rect(posX,height/2,30,30);

}

//message function
function appendMessage(message){
    sendCount++;
    const messageElement = document.createElement('div');
    messageElement.setAttribute('id','msgNo'+`${sendCount}`);
    messageElement.innerText = message;
    messageContainer.append(messageElement);

    let messageInfo = document.getElementById('msgNo'+`${sendCount}`).textContent;
    storedTexts.push(messageInfo);

    console.log(storedTexts);
}

//create text box
function createBox(){
    textBoxs.push(new Box(random(0,width/2),random(0,height/2)));
}

function changeNoise(){
    xoff1 = random(0,1000);
    xoff2 = random(1000,2000);
    console.log(xoff1,xoff2);
}

function Box(x, y){
    
    var n = int(random(1,storedTexts.length));
    // var nlength = int(textWidth(storedTexts[n]));
    
    this.showBlue = function(posX,posY){
        rectMode(CENTER);
        noStroke();
        fill(50,100,255,200);
        rect(posX+x,posY+y, storedTexts[n].length * 20,50,10);

        fill(0);
        textAlign(CENTER);
        textSize(25);
        text(storedTexts[n],posX+x,posY+y+10);
    }

}