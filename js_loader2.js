function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

WA.imports = {};

fetch(WA.module).then(res => res.arrayBuffer()).then(function(wasmBytes)
{
  'use strict';

  // generate worker.js instead of downloading it
  // allows reuse of environment section so we don't have to keep two copies up to date
  var thread_blob = new Blob([
    document.querySelector('#environment').textContent,
    //document.querySelector('#thread_script').textContent, 
    ], { type: "text/javascript" })

  var thread = new Worker(window.URL.createObjectURL(thread_blob), { type: "module" });
  thread.onmessage = function(e) {
    console.log('Message received from worker: ' + e.data);

    if (e.data === "Instantiated WebAssembly Module") {
      WA.started();
    }
  }

  WA.buffer = wasmBytes;
  wasmBytes = new Uint8Array(wasmBytes);
  
  WA.print = WA.print || function (msg) { console.log(msg); };
  WA.error = WA.error || function (code, msg) { WA.print('[ERROR] ' + code + ': ' + msg + '\n'); };
  
  function abort(code, msg)
  {
    WA.error(code, msg);
    throw 'abort';
  }
  
  WebAssembly.instantiate(WA.buffer, { env: env }).then(function (output)
  {
    // TODO(gninnam): We need to support multiple memory objects
    // that act like separte reservations of virtual memory
    // though its gonna end up using a lot of memory since the page size is 64k
    // NOTE(gninnam): Currently, there is no support for multiple memory obejects
    WA.asm = output.instance.exports;
    WA.memory = (WA.asm.memory) ? WA.asm.memory : env.memory;
    WA.thread_bundle = { module: output.module, memory: WA.memory };
    WA.view8  = new Uint8Array(WA.memory.buffer);
    WA.view16 = new Uint16Array(WA.memory.buffer);
    WA.view32 = new Uint32Array(WA.memory.buffer);
    WA.viewF32 = new Float32Array(WA.memory.buffer);
    //WA.view64 = new Uint64Array(WA.memory.buffer); // Currently no Uint64Array

    WA.size_t   = 4;                                 // 32-bit
    WA.viewPtr  = new Uint32Array(WA.memory.buffer); // 32-bit
    WA.viewSize = new Uint32Array(WA.memory.buffer); // 32-bit
    //WA.size_t   = 8;                                 // 64-bit
    //WA.viewPtr  = new Uint64Array(WA.memory.buffer); // 64-bit
    //WA.viewSize = new Uint64Array(WA.memory.buffer); // 64-bit

    WA.canvas = document.getElementById('glCanvas');
    //if (WA.enableWebGL) WebGL_Init();
    //else WA.context = WA.canvas.getContext('2d');

    if (WA.asm.Wasm_Init) WA.GameMemory = WA.asm.Wasm_Init(WA.asm.__heap_base, 
                                                           WA.canvas.width, WA.canvas.height, 
                                                           WA.enableWebGL);
    window.onresize();

    //console.log('Message posted to worker');
    WA.started(); // For now we wait for the worker to spool up before calling WA.started
  })
  .catch(function (err)
  {
    if (err !== 'abort') abort('BOOT', 'WASM instiantate error: ' + err + (err.stack ? "\n" + err.stack : ''));
  });  
});