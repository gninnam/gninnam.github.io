
//----------------------------------------------------------------------------->
//-----------------------------------WebGL------------------------------------->
//----------------------------------------------------------------------------->

console.log("wasm_webgl.js");

"use strict";

function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
 
  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight;
 
  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
 
  return needResize;
}

function WebGL_Init(x_ptr, y_ptr) {
  WA.gl = WA.canvas.getContext("webgl2", {preserveDrawingBuffer: false});
  WebGL_Resize();
  console.log(`${WA.gl.canvas.width} : ${WA.gl.canvas.height}`);
  WA.gl.viewport(0, 0, WA.gl.canvas.width, WA.gl.canvas.height);
  WA.viewF32[x_ptr/4] = WA.gl.canvas.width;
  WA.viewF32[y_ptr/4] = WA.gl.canvas.height;
}

function WebGL_Resize() {
  if (!WA.gl) {
    return;
  }

  resizeCanvasToDisplaySize(WA.gl.canvas);
  //WA.asm.Wasm_Set_Camera_ViewProj(WA.canvas.width, WA.canvas.height);
  //WA.asm.Wasm_Set_Viewport(0, 0, WA.gl.canvas.width, WA.gl.canvas.height);
}
function create_input_on_canvas() {
    var container = document.getElementById('canvas-container');

    // 3. Create the input element
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = 'Enter text here';

    // 4. Apply inline styles for positioning the input on top of the canvas
    inputElement.style.position = 'absolute';
    inputElement.style.top = '100px';    // Adjust these values to position the input
    inputElement.style.left = '50px';   // exactly where you want it on the canvas
    inputElement.style.width = '300px';

    // Add the input element to the container
    container.appendChild(inputElement);
}