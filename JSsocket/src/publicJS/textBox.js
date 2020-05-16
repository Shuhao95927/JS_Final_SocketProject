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