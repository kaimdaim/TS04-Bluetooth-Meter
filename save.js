// gets the value
let inp;
function setup() {
  inp = createInput('');
}

function mousePressed() {
  print(inp.value());
}
