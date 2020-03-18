var canvas = document.querySelector('canvas');

cw = window.innerWidth;
canvas.width = cw;
ch = window.innerHeight;
canvas.height = ch;

var c = canvas.getContext('2d');

left = false;
right = false;
up = false;
down = false;

stepsPerFrame = 4;

window.addEventListener('keydown', function(event) {
    console.log(event);
    if (event.keyCode == 37 && !left) {
        left = true;
        Circles[0].addforcex(-10);
    }
    if (event.keyCode == 38 && !up) {
        up = true;
        Circles[0].addforcey(-10);
    }
    if (event.keyCode == 39 && !right) {
        right = true;
        Circles[0].addforcex(10)
    }
    if (event.keyCode == 40 && !down) {
        down = true;
        Circles[0].addforcey(10);
    }
    if (event.keyCode == 32) {
        Circles.push(new Circle(30, 100, 100, 0, 0, 69, .99));
    }
});

window.addEventListener('keyup', function(event) {
    if (event.keyCode == 37 && left) {
        Circles[0].addforcex(10);
        left = false;
    }
    if (event.keyCode == 38 && up) {
        Circles[0].addforcey(10);
        up = false;
    }
    if (event.keyCode == 39 && right) {
        Circles[0].addforcex(-10)
        right = false;
    }
    if (event.keyCode == 40 && down) {
        Circles[0].addforcey(-10);
        down = false;
    }
});

class Circle {
    constructor(radius, x, y, vx, vy, m, airres) {
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.m = m;
        this.fx = 0;
        this.fy = 0;
        this.airres = airres;
    }
    draw() {
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.strokeStyle = 'cyan';
        c.stroke();
    }
    update(Circles) {
        //check for outside bounds
        if (this.x+this.radius>cw) {
            this.vx = -this.vx;
            this.x = cw-this.radius;
        }
        if (this.x-this.radius<0) {
            this.vx = -this.vx;            
           this.x=this.radius;
        }
        if (this.y+this.radius>ch) {
            this.vy = -this.vy;
            this.y = ch-this.radius;
        }
        if (this.y-this.radius<0) {
            this.vy = -this.vy;            
           this.y=this.radius;
        }
        for(const circle of Circles) {
            var distsq = (Math.pow(this.x-circle.x,2) + Math.pow(this.y-circle.y,2));
            if(distsq < Math.pow((this.radius + circle.radius),2) && circle != this) {
                //collision

                //resolve static collision
                var dist = Math.sqrt(distsq);
                var overlap = .5*(dist-this.radius - circle.radius)

                if(dist == 0) {
                    circle.x+=.05;                
                    dist = Math.sqrt(Math.pow(this.x-circle.x,2) + Math.pow(this.y-circle.y,2));
                    overlap = .5*(dist-this.radius - circle.radius);
                }

                //this ball
                this.x -= overlap * (this.x - circle.x) / dist;
                this.y -= overlap * (this.y - circle.y) / dist;

                //other ball
                circle.x += overlap * (this.x - circle.x) / dist;
                circle.y += overlap * (this.y - circle.y) / dist;

                //resolve dynamic collision

                //recalculate dist
                dist = Math.sqrt(Math.pow(this.x-circle.x,2) + Math.pow(this.y-circle.y,2));

                //normal
                var nx = (circle.x-this.x) / dist;
                var ny = (circle.y-this.y) / dist;
                
                //tangent
                var tx = -ny;
                var ty = nx;

                //tangential response / tangent dot velocity
                var tan1 = this.vx*tx + this.vy*ty;
                var tan2 = circle.vx*tx + circle.vy*ty;

                //tangential response / tangent dot velocity
                var norm1 = this.vx*nx + this.vy*ny;
                var norm2 = circle.vx*nx + circle.vy*ny;

                //conservation of momentum in 1d - wikipedia
                var m1 = (norm1*(this.m-circle.m) + 2*circle.m*norm2) / (this.m + circle.m);
                var m2 = (norm2*(circle.m-this.m) + 2*this.m*norm1) / (this.m + circle.m);
                
                this.vx = tx*tan1 + nx*m1;
                this.vy = ty*tan1 + ny*m1;
                circle.vx = tx*tan2 + nx*m2;
                circle.vy = ty*tan2 + ny*m2;
                
            }
        }
        //move based on kinematics
        this.x += this.vx;
        this.y += this.vy;
        this.vx += this.fx / this.m;
        this.vx = this.airres * this.vx;
        this.vy += this.fy / this.m;
        this.vy = this.airres * this.vy;

        //if velocity small, stop
        if (Math.abs(this.vx) < .05) { this.vx = 0;}
        if (Math.abs(this.vy) < .05) { this.vy = 0;}
        this.draw();
    }
    addforcex(force) {
        this.fx += force;
    }
    addforcey(force) {
        this.fy += force;
    }

}

let Circles = [];
Circles.push(new Circle(30, 100, 100, 0, 0, 69, .99));

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, cw, ch);
    for (i=1;i<stepsPerFrame;i++) {
        for (circle in Circles) {
            Circles[circle].update(Circles);
        }       
    }
}

animate();