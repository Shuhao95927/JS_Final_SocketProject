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

//physical setting
let textBoxs = [];
let textBoxsS = [];
let storedTexts = [];
let sendCount = -1;
let xoff1, xoff2;

let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

let engine;
let world;
// let boxTexts = [];
// let boxTextsFromServer = [];

var ground;

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

//------------------------------------------------------------
function preload(){
    cursor0 = loadImage('../images/cursor0.png');
    cursor1 = loadImage('../images/cursor1.png');
}

function setup(){
    mainPage = createCanvas(windowWidth, windowHeight);
    mainPage.position(0,0);
    mainPage.style("z-index",-1);

    //physical world building
    engine = Engine.create(); 
    world = engine.world;
    Engine.run(engine);

    var options = {
        isStatic: true
    }

    ground = Bodies.rectangle(width/2,height-10,width,100,options);
    World.add(world,ground);
    
    //socket
    socket = io.connect('http://localhost:3000');
    
    socket.on('mouse', newFlocks);

    socket.emit('new-user', name);

    socket.on('chat-message',data => {
        appendMessage(`${data.name}:${data.message}`)
        // storedMessage(`${data.message}`)
        textBoxsFromServer(`${data.name}:${data.message}`);
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
        textBoxs[i].show();
    }

    for (var i=0; i<textBoxsS.length; i++){
        textBoxsS[i].showFromServer();
    }


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
    textBoxs.push(new Box(random(width/1.5,width/4.5),random(-10,10)));
}

function textBoxsFromServer(message){
    textBoxsS.push(new Box(random(width/1.5,width/4.5),random(-10,10)));
}

function Box(x, y){ 
    var options = {
        friction:1,
        frictionAir:0.1,
        restitution:1,
        density:0.1      
    }
    var n = int(random(1,storedTexts.length));
    var nl = int(textWidth(storedTexts[n]));
  
    var j = int(random(0,storedTexts.length));
    var jl = int(textWidth(storedTexts[j]));

    this.body = Bodies.rectangle(x,y,nl*2.5,50,options);
  
    World.add(world,this.body);
  
    this.show = function(){
        var pos = this.body.position;
        var angle = this.body.angle;

        push();
  
        noStroke();
  
        translate(pos.x,pos.y);
        rotate(angle);
        rectMode(CENTER);
        
        //real physical body
        //fill(255,100,100,30);
        //rect(0,0,nl*2.5,50);
  
        fill(50,100,255,200);
        rect(0,0,storedTexts[n].length * 17,50,10);
  
        textAlign(CENTER);
        fill(255);
        textSize(25);
        text(storedTexts[n],0, 8);  
        pop();
    }
  
    this.showFromServer = function(){
  
      var pos = this.body.position;
      var angle = this.body.angle;
     
      push();
  
      noStroke();
  
      translate(pos.x,pos.y);
      rotate(angle);
      rectMode(CENTER);
      
      //real physical body
      //fill(100,255,100,255);
      //rect(0,0,jl*2.5,50);
  
      fill(100,200);
      rect(0,0,storedTexts[j].length * 17,50,10);
  
      textAlign(CENTER);
      fill(255);
      textSize(25);
      text(storedTexts[j],0, 8); //change the value here!! Rtts
  
      pop();
  
    }
  
  }