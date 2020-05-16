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
