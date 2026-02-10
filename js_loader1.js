//----------------------------------------------------------------------------->
//----------------------------------Loader------------------------------------->
//----------------------------------------------------------------------------->

console.log("wasm_loader.js");

var textRatio = 14 / (1920*.30);

function IsTouchEnabled() {
  return ( ( navigator.maxTouchPoints > 0 ) );
}

var safe_to_lock_cursor = true;

var WA =
{
    module: 'output.wasm',
    enableWebGL: true,
    memory_reservations: [],
    textures: [],
    assets: [],
    programs: [],
    shaders: [],
    locations: [],
    vaos: [],
    bos: [],
    events: [],
    textureCount: 1,
    assetCount: 1,
    programCount: 1,
    shaderCount: 1,
    locationCount: 1,
    vaoCount: 1,
    boCount: 1,
    event_count: 1,
    key_states: [],
    cursors: [
      "default",
      "move",
      "n-resize", //2
      "wait",
      "s-resize", //4
      "e-resize", //5
      "w-resize", //6
      
      "ne-resize",//7
      "nw-resize",//8
      "se-resize",//9
      "sw-resize",//10
    ],
    input_flags: {
      left:   1 << 0,
      right:  1 << 1,
      middle: 1 << 2,
      four:   1 << 3,
      five:   1 << 4,
    },
    inputState: 0,
    charState: 0,
    input_map: {
      KeyB: 1 << 0,
      KeyA: 1 << 1,
      KeyC: 1 << 2,
      KeyD: 1 << 3,
      KeyE: 1 << 4,
    },
    window_event_null: 0,
    window_event_close: 1,
    window_event_keyboard: 2,
    window_event_character: 3,
    window_event_mouse: 4,
    window_event_raw_mouse: 5,
    window_event_drag_and_drop_file: 6,
    key_state_null:   0,  
    key_state_up:     1,
    key_state_down:   2,
    key_state_repeat: 4,
    key_modifier_shift:   1,
    key_modifier_control: 2,
    key_modifier_alt:     4,
    key_modifier_cmd:     8,
    key_map: {
    "key_unknown": 0,
  
    // Non-textual keys that have placements in the ASCII table
    // (and thus in Unicode):
  
    "Backspace":      8,
    "Tab":            9,
    "key_linefeed":  10,
    "Enter":         13,
    "Escape":        27,
    "Space":         32,
    
    "Delete":       127,
  
    "ArrowUp":      128,
    "ArrowDown":    129,
    "ArrowLeft":    130,
    "ArrowRight":   131,
  
    "PageUp":       132,
    "PageDown":     133,
  
    "Home":         134,
    "End":          135,
  
    "Insert":       136,
  
    "Pause":        137,
    "ScrollLock":   138,
    "CapsLock":     139,
   
    "AltLeft":      140,
    "AltRight":     140,
    "ControlLeft":  141,
    "ControlRight": 141,
    "ShiftLeft":    142,
    "ShiftRight":   142,
    "MetaLeft":     143,
    "MetaRight":    143,

    "F1":           144,
    "F2":           145,
    "F3":           146,
    "F4":           147,
    "F5":           148,
    "F6":           149,
    "F7":           150,
    "F8":           151,
    "F9":           152,
    "F10":          153,
    "F11":          154,
    "F12":          155,
    "F13":          156,
    "F14":          157,
    "F15":          158,
    "F16":          159,
    "F17":          160,
    "F18":          161,
    "F19":          162,
    "F20":          163,
    "F21":          164,
    "F22":          165,
    "F23":          166,
    "F24":          167,
  
    "PrintScreen":  168,
  
    "Numpad0":        169,
    "Numpad1":        170,
    "Numpad2":        171,
    "Numpad3":        172,
    "Numpad4":        173,
    "Numpad5":        174,
    "Numpad6":        175,
    "Numpad7":        176,
    "Numpad8":        177,
    "Numpad9":        178,
    "NumpadMultiply": 179,
    "NumpadDivide":   180,
    "NumpadAdd":      188,
    "NumpadSubtract": 182,
    "NumpadDecimal":  183,
    "NumpadEnter":    184,

    0: 185,
    1: 186,
    2: 187,
  
    3: 188,
    4: 189,

    },
    mouseX: -100,
    mouseY: -100,
    add_button_press_event: (type, state, data, shift, control, alt, cmd) => {
      WA.events[WA.event_count] = {};
      WA.events[WA.event_count].type = type;
      WA.events[WA.event_count].state = state;
      WA.events[WA.event_count].data = WA.get_key_value(data);

      WA.events[WA.event_count].modifier = 0;
      WA.events[WA.event_count].modifier |= shift   ? WA.key_modifier_shift : 0;
      WA.events[WA.event_count].modifier |= control ? WA.key_modifier_control : 0;
      WA.events[WA.event_count].modifier |= alt     ? WA.key_modifier_alt : 0;
      WA.events[WA.event_count].modifier |= cmd     ? WA.key_modifier_cmd : 0;

      WA.event_count++;
    },
    add_mouse_event: (state, data, x, y, shift, control, alt, cmd) => {
      WA.events[WA.event_count] = {};
      WA.events[WA.event_count].type = WA.window_event_mouse;
      WA.events[WA.event_count].state = state;
      WA.events[WA.event_count].data = WA.get_key_value(data);
      WA.events[WA.event_count].x = x;
      WA.events[WA.event_count].y = y;

      WA.events[WA.event_count].modifier = 0;
      WA.events[WA.event_count].modifier |= shift   ? WA.key_modifier_shift : 0;
      WA.events[WA.event_count].modifier |= control ? WA.key_modifier_control : 0;
      WA.events[WA.event_count].modifier |= alt     ? WA.key_modifier_alt : 0;
      WA.events[WA.event_count].modifier |= cmd     ? WA.key_modifier_cmd : 0;

      WA.event_count++;
    },
    add_raw_mouse_event: (state, data, x, y, shift, control, alt, cmd) => {
      WA.events[WA.event_count] = {};
      WA.events[WA.event_count].type = WA.window_event_raw_mouse;
      WA.events[WA.event_count].state = state;
      WA.events[WA.event_count].data = WA.get_key_value(data);
      WA.events[WA.event_count].x = x;
      WA.events[WA.event_count].y = y;

      WA.events[WA.event_count].modifier = 0;
      WA.events[WA.event_count].modifier |= shift   ? WA.key_modifier_shift : 0;
      WA.events[WA.event_count].modifier |= control ? WA.key_modifier_control : 0;
      WA.events[WA.event_count].modifier |= alt     ? WA.key_modifier_alt : 0;
      WA.events[WA.event_count].modifier |= cmd     ? WA.key_modifier_cmd : 0;

      WA.event_count++;
    },
    get_key_value: (key) => {
      let map_result =  WA.key_map[key];
      if (map_result != undefined) return map_result;
      if (key.includes("Digit")) return key.charCodeAt(5);
      if (key.includes("Key")) return key.charCodeAt(3);
    },
    decoder: new TextDecoder("utf8"),
    // NOTE(gninnam): decodeUtf8 is broken I think, something with null-termination?
    decodeUtf8: function(ptr, size = 64)
    {
      let Buffer = new Uint8Array(size);
      //let View = WA.view8.slice(ptr);
      Buffer.set(WA.view8, ptr);
      let string = WA.decoder.decode(Buffer);
      return string;
    },
    decodeAscii: function(base)
    {
      let cursor = base;
      let result = '';
      while (WA.view8[cursor] !== 0) {
        result += String.fromCharCode(WA.view8[cursor++]);
      }
      return result;
    },
    print: function(text)
    {
    console.log(text);
    },
    error: function(code, msg)
    {
      // TODO(gninnam): Redirect user to a backup html page that explains
      // the web assembly requirement or if it's simple, just pop it up on this page
    console.log({
      BOOT: 'Error during startup. Your browser might not support WebAssembly. Please update it to the latest version.',
      CRASH: 'The program crashed.',
      MEM: 'The program ran out of memory.',
        }[code] + '\n(' + msg + ')');
    },
    arrayToInt: function(bs, start) 
    {
    start = start || 0;
    const bytes = bs.subarray(start, start+8); 
    let n = 0;
    let i = 64;
    for (const byte of bytes.values()) {
      n = byte<<i;
      i -= 8;
    }
    return n;
    },
    // Decode a string from memory starting at address base.
    decode: function(memory, base, length = Math.pow(2, 24)) {
    let cursor = base;
    let result = '';
    while (memory[cursor] !== 0) {
      result += String.fromCharCode(memory[cursor++]);
      if (--length == 0)
        break;
    }
    return result;
    },
    started: function()
    {
    WA.print('\nStarting...\n');
    WA.start = window.performance.now();
    let Time = BigInt(Date.now());

    let selectable_margin = 20.0;

    if (IsTouchEnabled())
    {
      console.log("Touch Enabled");
      //WA.charState = 1 << 0;
      selectable_margin = 50.0;
      WA.canvas.addEventListener("touchstart", function(e) { 
      var cRect = WA.canvas.getBoundingClientRect();
      WA.mouseX = Math.round(e.touches.item(0).clientX - cRect.left);
      WA.mouseY = Math.round(e.touches.item(0).clientY - cRect.top);
      WA.inputState |= WA.input_flags.left;
      if (e.touches.length == 2) WA.charState = WA.input_map.KeyE;
      if (e.touches.length == 3) WA.charState = WA.input_map.KeyA;
      if (e.touches.length == 1) WA.charState = WA.input_map.KeyD;
    });
      WA.canvas.addEventListener("touchmove", function(e) { 
      var cRect = WA.canvas.getBoundingClientRect();
      WA.mouseX = Math.round(e.touches.item(0).clientX - cRect.left);
      WA.mouseY = Math.round(e.touches.item(0).clientY - cRect.top);
      WA.inputState |= WA.input_flags.left;
    });
      WA.canvas.addEventListener("touchend", function(e) { 
      WA.inputState &= ~WA.input_flags.left;
      WA.mouseX = -100;
      WA.mouseY = -100;
    });
      WA.canvas.addEventListener("touchcancel", function(e) { 
      WA.inputState &= ~WA.input_flags.left;
      WA.mouseX = -100;
      WA.mouseY = -100;
    });
    }
    
    {
      WA.canvas.addEventListener("mousemove", function(e) { 
        if (document.pointerLockElement != WA.gl.canvas) {
          WA.add_mouse_event(WA.key_state_null, 0, e.x, e.y, e.shiftKey, e.ctrKey, e.altKey, e.metaKey);
        }
        else {
          WA.add_raw_mouse_event(WA.key_state_null, 0, e.movementX, e.movementY, e.shiftKey, e.ctrKey, e.altKey, e.metaKey);
        }
        var cRect = WA.canvas.getBoundingClientRect();
        WA.mouseX = Math.round(e.clientX - cRect.left);
        WA.mouseY = Math.round(e.clientY - cRect.top);
      });
      WA.canvas.addEventListener("mousedown", function(e) { 
        e.preventDefault();
        WA.add_mouse_event(WA.key_state_down, e.button, e.x, e.y, e.shiftKey, e.ctrKey, e.altKey, e.metaKey);
        WA.key_states[WA.get_key_value(e.button)] = 1;
        var cRect = WA.canvas.getBoundingClientRect();
        switch(e.button)
        {
          case 0: WA.inputState |= WA.input_flags.left;  break;
          case 2: WA.inputState |= WA.input_flags.right; break;
        }
        WA.mouseX = Math.round(e.clientX - cRect.left);
        WA.mouseY = Math.round(e.clientY - cRect.top);
    });
      WA.canvas.addEventListener("mouseup", function(e) { 
        WA.add_mouse_event(WA.key_state_up, e.button, e.x, e.y, e.shiftKey, e.ctrKey, e.altKey, e.metaKey);
        WA.key_states[WA.get_key_value(e.button)] = 0;
        var cRect = WA.canvas.getBoundingClientRect();
        switch(e.button)
        {
          case 0: WA.inputState &= ~WA.input_flags.left;  break;
          case 2: WA.inputState &= ~WA.input_flags.right; break;
        }
        WA.mouseX = Math.round(e.clientX - cRect.left);
        WA.mouseY = Math.round(e.clientY - cRect.top);
    });
      window.addEventListener("keydown", function(e) {
        WA.add_button_press_event(WA.window_event_keyboard, WA.key_state_down, e.code, e.shiftKey, e.ctrKey, e.altKey, e.metaKey);
        WA.key_states[WA.get_key_value(e.code)] = 1;
        WA.charState |= WA.input_map[e.code];
        console.log(e.code);
      });
      window.addEventListener("keyup", function(e) {
        WA.add_button_press_event(WA.window_event_keyboard, WA.key_state_up, e.code, e.shiftKey, e.ctrKey, e.altKey, e.metaKey);
        WA.key_states[WA.get_key_value(e.code)] = 0;
        WA.charState &= ~WA.input_map[e.code];
      });
      document.addEventListener("pointerlockchange", () => {
        if (document.pointerLockElement != WA.gl.canvas) {
          WA.asm.wasm_canvas_unlock_cursor();
        }
      });
    }

    //window.onresize();
    WA.asm.Wasm_Main(Time, WA.canvas.width, WA.canvas.height, selectable_margin);

    let Count = 1000;
    var last_ts;
    draw_func = (ts) =>
    {
      //if (WA.enableWebGL) WA.gl.clear(16640);

      let DeltaTime = (ts-last_ts)/1000;
      //WA.print(DeltaTime);
      // TODO: Measure Update function
      //let start = window.performance.now();
      //console.log(start);
      WA.asm.Update(DeltaTime, WA.canvas.width, WA.canvas.height, WA.mouseX, WA.mouseY, BigInt(0));
      //console.log(`Update time: ${window.performance.now() - start}`);

      last_ts = ts;

      //Count--;
      //if (Count > 0) window.requestAnimationFrame(draw_func);
      window.requestAnimationFrame(draw_func);
    };

    window.requestAnimationFrame(draw_func);
    },
};

window.onresize = () => {
    var canvas = document.getElementById('glCanvas');
    let actualWindowHeight = 0;
    
    //canvas.width  = window.innerWidth;
    //canvas.height = window.innerHeight;
    //WebGL_Resize();
    // TODO: Manage an array of resizes
    WA.canvas.resized = true;
}