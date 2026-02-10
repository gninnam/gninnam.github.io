//----------------------------------------------------------------------------->
//----------------------------------Worker------------------------------------->
//----------------------------------------------------------------------------->

console.log("wasm_worker.js");

var wasmInstance;
var count = 0;
onmessage = function(e) {
  console.log('Message received from main script');
  var result;
  if (e.data.module)
  {
    env.memory = e.data.memory;
    WebAssembly.instantiate(e.data.module, { env: env }).then(function(instance) {
      wasmInstance = instance;
      postMessage("Instantiated WebAssembly Module");
    });
    result = "Instantiating WebAssembly Module";
  }
  else if (e.data.substring)
  {
    let func = wasmInstance.exports[e.data];
    if (func) func();
    result = "Called Function " + e.data + " in separate thread";
  }
  else if (e.data.bundle)
  {
    env.memory = e.data.bundle.memory;
    WebAssembly.instantiate(e.data.bundle.module, { env: env }).then(function(instance) {
      wasmInstance = instance;
      postMessage("Instantiated WebAssembly Module");
      wasmInstance.exports["Wasm_CreateThread"](e.data.function_ptr, e.data.arg_ptr);
    });
    result = "Instantiating WebAssembly Module"; 
  }
  console.log('Posting message back to main script');
  postMessage(result);
}