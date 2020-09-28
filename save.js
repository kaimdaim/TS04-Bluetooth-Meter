<script>
text("Okumayı kaydetmek için bas", 20, 20); 
function setup() { 
createCanvas(500, 300); 
textSize(22); 

// Create a textarea for the input of reading
inputArea = createElement("textarea"); 
inputArea.position(30, 50); 
inputArea.size(400, 120); 

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

  // handle incoming data:
function handleData(event) {
  // get the data buffer from the meter:
  var buf = new Uint8Array(event.target.value.buffer);
  // decode the results if this is the correct characteristic:
  if (buf.length == 9) {
    // decode the binary string:
    decode(buf);
    // from display.js, fill the HTML page:
    fillDisplay(meter);

  // Create a button for saving text 
  saveBtn = createButton("Save text to file"); 
  saveBtn.position(30, 200); 
  saveBtn.mousePressed(saveFile); 
} 

  // Save the strings to file 
  save(stringList, "output_file.txt"); 
} 
</script>
