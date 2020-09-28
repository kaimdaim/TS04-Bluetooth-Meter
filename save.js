function setup() { 
  mycanvas = createCanvas(400, 400);
} 

iteration = 0;
x = 0;
v = 5;

dt = 0.1;

function draw() { 
  background(255);
  
  x += v*dt;
  
  ellipse(x,0.5*height,50,50);
  
  formatted_number = FormatNumberLength(iteration-90,4);
  saveCanvas(mycanvas,"screenshot"+formatted_number,"png");

  iteration += 1;
}

function FormatNumberLength(num, length) {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
}
