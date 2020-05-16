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
