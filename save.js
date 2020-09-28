function setup() { 
createCanvas(500, 300); 
textSize(11); 

text("Click on the button below to save the written text", 20, 20); 

// Create a textarea for the input of text 
inputArea = createElement ("Reading: <output id='value'></label></output>"); 
inputArea.position(30, 50); 
inputArea.size(400, 12); 

// Create a button for saving text 
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
} 
