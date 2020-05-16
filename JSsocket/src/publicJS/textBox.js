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