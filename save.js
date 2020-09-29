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
}// Create a button for saving text 
  saveBtn = createButton("Save text to file"); 
  saveBtn.position(30, 200); 
  saveBtn.mousePressed(saveFile); 
} 
  
function saveFile() { 
  // Get the value of the textarea 
  // Split according to nextline characters 
  stringList = inputArea.value().split("\n"); 
  
  // Save the strings to file 
  save(stringList, "output_file.txt"); 
