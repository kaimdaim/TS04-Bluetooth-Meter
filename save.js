let reading;
function preload(){
  reading = loadJSON('https://htmlpreview.github.io/?https://raw.githubusercontent.com/kaimdaim/TS04-Bluetooth-Meter/master/index.html');
}
function setup(){
  createCanvas(200, 100);
  let reading = reading.features[0].properties.mag;
  let reading = reading.features[0].properties.place;
  text(readingPlace, 0, height/2);
  text(readingMag, 0, height-height/3);
}
