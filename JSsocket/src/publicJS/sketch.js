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
