let photo;

function preload() {
  photo = loadImage('https://htmlpreview.github.io/?https://raw.githubusercontent.com/kaimdaim/TS04-Bluetooth-Meter/master/index.html ');
}

function draw() {
  image(photo, 0, 0);
}

function keyTyped() {
  if (key === 's') {
    photo.save('photo', 'jpg');
  }
}
