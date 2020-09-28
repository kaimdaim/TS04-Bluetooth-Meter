function setup() { 
createCanvas(500, 300); 
textSize(18); 

background("white"); 
text("Kaydetmek için BAS", 20, 20); 

// Create a button for saving canvas image 
saveImageBtn = createButton("Save Canvas"); 
saveImageBtn.position(400, 60); 
saveImageBtn.mousePressed(saveAsCanvas); 

} 

function saveAsCanvas() { 
save("output_canvas.png"); 
} 


