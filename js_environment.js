//----------------------------------------------------------------------------->
//-------------------------------Environment----------------------------------->
//----------------------------------------------------------------------------->

console.log("wasm_environment.js");

var EnableDebugTrace = false;
function DebugTrace(extra_info)
{
  if (extra_info === undefined) extra_info = "";
  if (EnableDebugTrace)
    WA.print("Called " + DebugTrace.caller.name + extra_info + "\n");
}
var env = { 
    // NOTE(gninnam) This is how you import memory (3 64KB pages)
    //memory: new WebAssembly.Memory({ initial: 3, maximum: 3, shared: true }),
    WasmPrintUtf16: (utf16, length) => {
      let string = WA.decode(WA.view16, utf16/2, length);
      WA.print(string);
    },
    WasmPrintUtf8: (utf8, size) => {
      let Buffer = new Uint8Array(size);
      let View = WA.view8.slice(utf8, utf8+size);
      Buffer.set(View, 0);
      let string = WA.decoder.decode(Buffer);
      WA.print(string);
    },
    Log: (utf8) => { 
      let string = WA.decode(WA.view8, utf8);
      WA.print(string);
    },
    WasmCreateThread: (functionName) => { 
      functionName = WA.decode(WA.view8, functionName);
      console.log("CreateThread: " + functionName);
      thread.postMessage(functionName);
    },
    JS_GrowMemory: (page_count) =>
    {
      WA.memory.grow(page_count);
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
    },
    js_webgl_init: (x_ptr, y_ptr) =>
    {
      WebGL_Init(x_ptr, y_ptr);
    },
    js_update_events: () => {
      for (i = 1; i < WA.event_count; i++)
      {
        WA.asm.wasm_post_window_event(WA.events[i].type, WA.events[i].x, WA.events[i].y, WA.events[i].state, WA.events[i].data, WA.events[i].modifier);
      }
      WA.event_count = 1;
    },
    js_get_canvas_size: (x_ptr, y_ptr) =>
    {
      WA.viewF32[x_ptr/4] = WA.gl.canvas.width;
      WA.viewF32[y_ptr/4] = WA.gl.canvas.height;
    },
    js_get_canvas_resize: (x_ptr, y_ptr) => {
      let result = WA.canvas.resized;
      WA.canvas.resized = false;
      WA.viewF32[x_ptr/4] = window.innerWidth;
      WA.viewF32[y_ptr/4] = window.innerHeight;
      return result;
    },
    js_resize_canvas: (width, height) =>
    {
      var canvas = document.getElementById('glCanvas');
      let actualWindowHeight = 0;
      
      canvas.width  = width;
      canvas.height = height;
      WebGL_Resize();
    },
    js_resize_canvas_to_window: (x_ptr, y_ptr) => {
      let width  = window.innerWidth;
      let height = window.innerHeight;
      WA.viewF32[x_ptr/4] = width;
      WA.viewF32[y_ptr/4] = height;
      WA.gl.canvas.width = width;
      WA.gl.canvas.height = height;
      WebGL_Resize();
    },
    js_toggle_fullscreen: () => {
      let elem = document.documentElement;
      if (!document.fullscreenElement) {
        /* Enter fullscreen */
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
          elem.msRequestFullscreen();
        }
      } else {
        /* Exit fullscreen */
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
          document.msExitFullscreen();
        }
      }
    },
    js_lock_cursor_to_canvas: () => {
      WA.gl.canvas.requestPointerLock({ unadjustedMovement: true });
    },
    js_unlock_cursor: () => {
      document.exitPointerLock();
    },
    js_get_key_state: (key) => {
      let state = WA.key_states[key];
      if (state === undefined) {
        state = 0;
        WA.key_states[key] = state;
      }
      return state;
    },
    js_set_title: (string) => {
      document.title = WA.decode(WA.view8, string);
    },
    Platform_Clock_U64: () => {
      return BigInt(Date.now());
    },
    js_performance_now : () => { return window.performance.now(); },
    omp_get_thread_num: () => { return 0 },
    omp_get_num_threads: () => { return 8 },
    JS_CreateThread: (function_ptr, arg_ptr) =>
    {
      thread.postMessage({ 
        bundle: WA.thread_bundle, 
        function_ptr: function_ptr, 
        arg_ptr: arg_ptr
      });
    },
    JS_DebugFloat: (f32) =>
    {
      console.log(f32);
    },
    JS_DebugInt: (s32) =>
    {
      console.log(s32);
    },
    JS_DebugPtr: (ptr) =>
    {
      console.log(ptr);
    },
    JS_DebugSize: (size) =>
    {
      console.log(size);
    },
    js_read_entire_file: (path) =>
    {
      path = WA.decode(WA.view8, path);
      fetch(path, {cache: "no-cache"}).then(res => {
        res.blob().then(blob => {
          console.log(`size: ${blob.size}`);
          return blob.size;
        })
      });
    },
    Platform_Input_Get_Flags: () => {
      return WA.inputState | 0;
    },
    Platform_Input_Get_Chars: () => {
      let state = WA.charState;
      WA.charState = 0;
      return state | 0;
    },
    Platform_Window_Cursor_Set: (window, cursor) => {
      WA.canvas.style.cursor = WA.cursors[cursor];
    },
    JS_CopyToCanvas: (width, height, pixels, size) =>
    {
      //let start = window.performance.now(); 
      let Buffer = new Uint8ClampedArray(WA.view8.buffer, pixels, size); // .005 ms
      let PixelData = new ImageData(Buffer.slice(), width, height); // 3ms
      WA.context.putImageData(PixelData, 0, 0); // 0.5ms
      //console.log(`Copy time: ${window.performance.now() - start}`);
    },
    tan: (x) => { DebugTrace(); return Math.tan(x); },
    tanf: (x) => { DebugTrace(); return Math.tan(x); },
    cos: (x) => { DebugTrace(); return Math.cos(x); },
    cosf: (x) => { DebugTrace(); return Math.cos(x); },
    sin: (x) => { DebugTrace(); return Math.sin(x); },
    sinf: (x) => { DebugTrace(); return Math.sin(x); },
    atanf: (x) => { DebugTrace(); return Math.atan(x); },
    atan2f: (x, y) => { DebugTrace(); return Math.atan2(x, y); },
    atanf: (x) => { DebugTrace(); return Math.sqrt(x); },
    pow: (x, y) => { DebugTrace(); return Math.pow(x, y); },
    powf: (x, y) => { DebugTrace(); return Math.pow(x, y); },
    abs: (x) => { DebugTrace(); return Math.abs(x); },
    glClearColor: (red, green, blue, alpha) => { WA.gl.clearColor(red, green, blue, alpha); },
    glEnable: (Value) => { WA.gl.enable(Value); },
    glBlendFunc: (sfactor, dfactor) => { WA.gl.blendFunc(sfactor, dfactor); },
    glDeleteShader: (shader_id) => { WA.gl.deleteShader(WA.shaders[shader_id]); }, 
    glGenVertexArrays: (count, ptr) => { 
      WA.vaos[WA.vaoCount] = WA.gl.createVertexArray(); 
      WA.view32[ptr/4] = WA.vaoCount;
      WA.vaoCount++;
    },
    glBindVertexArray: (id) => { if (id) WA.gl.bindVertexArray(WA.vaos[id]); },
    glGenBuffers: (count, ptr) => {
      WA.bos[WA.boCount] = WA.gl.createBuffer();
      WA.view32[ptr/4] = WA.boCount;
      WA.boCount++;
    },
    glBindBuffer: (target, id) => { if (id) WA.gl.bindBuffer(target, WA.bos[id]); },
    glGenTextures: (count, ptr) => { 
      DebugTrace();
      // TODO(gninnam): Handle more than one at a time, lots of other functions need this too
      WA.textures[WA.textureCount] = WA.gl.createTexture();
      WA.view32[ptr/4] = WA.textureCount;
      WA.textureCount++;
    },
    glBindTexture: (target, id) => { 
      DebugTrace(": " + id);
      if (id) WA.gl.bindTexture(target, WA.textures[id]); 
    },
    glTexParameteri: (target, pname, param) => { 
      DebugTrace();  
      WA.gl.texParameteri(target, pname, param); 
    },
    glTexImage2D: (target, level, internalformat, width, height, border, format, type, pixels) =>
    {
      // TODO(gninnam): Change size based on format, for now assume 32bit pixels
      DebugTrace();
      let Size = width*height*4;
      let Buffer = new Uint8Array(Size);
      let View = WA.view8.slice(pixels, pixels+Size);
      Buffer.set(View, 0);
      WA.gl.texImage2D(target, level, internalformat, 
                         width, height, border, format, type, Buffer);
    },
    glTexSubImage2D: (target, level, xoffset, yoffset, width, height, format, type, pixels) =>
    {
      // TODO(gninnam): Change size based on format, for now assume 32bit pixels
      DebugTrace();
      let Size = width*height*4;
      let Buffer = new Uint8Array(Size);
      let View = WA.view8.slice(pixels, pixels+Size);
      Buffer.set(View, 0);
      WA.gl.texSubImage2D(target, level, xoffset, yoffset, 
                         width, height, format, type, Buffer);
    },
    glGenerateMipmap: (target) => { WA.gl.generateMipmap(target); },
    glBufferData: (target, size, ptr, usage) => { 
      WA.gl.bufferData(target, WA.view8, usage, ptr, size); 
    },
    glGetAttribLocation: (program_id, ptr) => { 
      let string = WA.decodeAscii(ptr);
      WA.gl.getAttribLocation(WA.programs[program_id], ptr);
    },
    glVertexAttribPointer: (index, size, type, normalized, stride, offset) => { 
      WA.gl.vertexAttribPointer(index, size, type, normalized, stride, offset); 
    },
    glVertexAttribIPointer: (index, size, type, stride, offset) => {
      WA.gl.vertexAttribIPointer(index, size, type, stride, offset);
    },
    glVertexAttribDivisor: (index, divisor) => {
      WA.gl.vertexAttribDivisor(index, divisor);
    },
    glEnableVertexAttribArray: (index) => { WA.gl.enableVertexAttribArray(index); },
    glUseProgram: (id) => { WA.gl.useProgram(WA.programs[id]); },
    glGetUniformLocation: (program_id, name) => { 
      name = WA.decodeAscii(name);
      WA.locations[WA.locationCount] = WA.gl.getUniformLocation(WA.programs[program_id], name);
      let result = WA.locationCount;
      WA.locationCount++;
      return result;
    },
    glGetUniformBlockIndex: (program_id, uniformBlockName) => {
      WA.gl.getUniformBlockIndex(WA.programs[program_id], uniformBlockName);
    },
    glUniformBlockBinding: (program_id, uniformBlockIndex, uniformBlockBinding) => {
      WA.gl.uniformBlockBinding(WA.programs[program_id], uniformBlockIndex, uniformBlockBinding);
    },
    glBindBufferRange: (target, index, buffer_id, offset, size) => {
      if (buffer_id) WA.gl.bindBufferRange(target, index, WA.bos[buffer_id], offset, size);
    },
    glActiveTexture: (texture) => {
      WA.gl.activeTexture(texture);
    },
    glDrawArraysInstanced: (mode, first, count, instanceCount) => {
      WA.gl.drawArraysInstanced(mode, first, count, instanceCount);
    },
    glCreateShader: (type) => { 
      WA.shaders[WA.shaderCount] = WA.gl.createShader(type);
      let result = WA.shaderCount;
      WA.shaderCount++;
      return result;
    },
    glAttachShader: (program_id, shader_id) => {
      WA.gl.attachShader(WA.programs[program_id], WA.shaders[shader_id]);
    },
    glShaderSource: (shader_id, count, ptr, size) => {
      let string = WA.decodeAscii(WA.viewPtr[ptr/4], size);
      WA.gl.shaderSource(WA.shaders[shader_id], string);
    },
    glCompileShader: (shader_id) => {
      WA.gl.compileShader(WA.shaders[shader_id]);
    },
    glGetShaderiv: (shader_id, pname, successPtr) => {
      let success = WA.gl.getShaderParameter(WA.shaders[shader_id], pname);
      WA.view32[successPtr/4] = success;
    },
    glGetShaderInfoLog: (shader_id, size, length, ptr) => {
      let string = WA.gl.getShaderInfoLog(WA.shaders[shader_id]);
      // NOTE(gninnam): For now we just print to console instead of writing to memory
      console.log(string);
    },
    glCreateProgram: () => { 
      WA.programs[WA.programCount] = WA.gl.createProgram();
      let result = WA.programCount;
      WA.programCount++;
      return result;
    },
    glLinkProgram: (program_id) => { 
      WA.gl.linkProgram(WA.programs[program_id]);
    },
    glGetProgramiv: (program_id, pname, successPtr) => { 
      let success = WA.gl.getProgramParameter(WA.programs[program_id], pname);
      WA.view32[successPtr/4] = success;
    },
    glGetProgramInfoLog: (program_id, size, length, ptr) => {
      let string = WA.gl.getProgramInfoLog(WA.programs[program_id]);
      // NOTE(gninnam): For now we just print to console instead of writing to memory
      console.log(string);
    },
    glViewport: (x, y, width, height) => {
      WA.gl.viewport(x, y, width, height);
    },
    glUniformMatrix4fv: (location_id, count, transpose, ptr) =>
    {
      WA.gl.uniformMatrix4fv(WA.locations[location_id], transpose, WA.viewF32, ptr/4, 16*count);
    },
    glUniform3fv: (location_id, count, ptr) =>
    {
      WA.gl.uniform3fv(WA.locations[location_id], WA.viewF32, ptr/4, 3*count);
    },
    glUniform4fv: (location_id, count, ptr) =>
    {
      WA.gl.uniform4fv(WA.locations[location_id], WA.viewF32, ptr/4, 4*count);
    },
    glDrawElements: (mode, count, type, offset) => {
      WA.gl.drawElements(mode, count, type, offset);
    },
    glClear: (mask) => {
      WA.gl.clear(mask);
    },
  };