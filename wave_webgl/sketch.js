"use strict";

window.onload = function()
{

// Define
var _W = 518;
var _H = 518;
var _StartTime = Date.now();
var abs = Math.abs;
var sin = Math.sin;
var cos = Math.cos;
var log = console.log;
var mouseX=0,mouseY=0;
var mouseClick = 0;

// Init
var canvas = document.querySelector('#glcanvas');
canvas.addEventListener('mousemove', onMouseMove, false);
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);

canvas.addEventListener('touchmove', function(e) {
  mouseX = e.changedTouches[0].pageX;
  mouseY = e.changedTouches[0].pageY;
}, false);

canvas.width = _W;
canvas.height = _H;
var gl = canvas.getContext('webgl');

// Shader , Program , Buffer
var vertShader_input = createShader(gl,"input-vs",gl.VERTEX_SHADER);
var fragShader_input = createShader(gl,"input-fs",gl.FRAGMENT_SHADER);
var prg_input = createProgram(gl,vertShader_input,fragShader_input);

var vertShader_main = createShader(gl,"simple-vs",gl.VERTEX_SHADER);
var fragShader_main = createShader(gl,"simple-fs",gl.FRAGMENT_SHADER);
var prg_main = createProgram(gl,vertShader_main,fragShader_main);

var vertShader_wave = createShader(gl,"wave-vs",gl.VERTEX_SHADER);
var fragShader_wave = createShader(gl,"wave-fs",gl.FRAGMENT_SHADER);
var prg_wave = createProgram(gl,vertShader_wave,fragShader_wave);

var vertices =
[
    -1 , 1, 0,
    -1 ,-1, 0,
     1 , 1, 0,
     1 ,-1, 0,
];

var texCoord =
[
    0.0,1.0,
    0.0,0.0,
    1.0,1.0,
    1.0,0.0,
];

var vertBuff = createBuffer(vertices);
var texCoordBuff = createBuffer(texCoord);

var frameBuff_input = createFrameBufferAndTexture(_W,_H);
var frameBuff_current = createFrameBufferAndTexture(_W,_H);
var frameBuff_prev = createFrameBufferAndTexture(_W,_H);
var frameBuff_prevprev = createFrameBufferAndTexture(_W,_H);

var frameBuffs = [frameBuff_current,frameBuff_prev,frameBuff_prevprev];


var cnt = 0;
update();

// Update
function update()
{
    var dt = Date.now() - _StartTime;



    /*------------------------*/
    // draw input to input texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuff_input.frameBuffer);
    gl.useProgram(prg_input);
    gl.viewport(0, 0, _W, _H);
    gl.clearColor(0.0,0.0,0.0,0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    setAttribute(gl,prg_input,vertBuff,"v_pos",3);
    gl.uniform2fv(gl.getUniformLocation(prg_input,'u_mousePos'), [mouseX,mouseY]);
    gl.uniform2fv(gl.getUniformLocation(prg_input,'u_resolution'), [_W,_H]);
    gl.uniform1i(gl.getUniformLocation(prg_input,"u_click"), mouseClick);
    gl.uniform1f(gl.getUniformLocation(prg_input,"u_time"), dt);

    gl.drawArrays(gl.TRIANGLE_STRIP,0,vertices.length/3);
    gl.flush();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    /*------------------------*/



for(var i=0;i<4;i++)
{
    var idxs = getNextIndexes(cnt);
    cnt++;
    var currentBuff = frameBuffs[idxs.cur];
    var prevBuff = frameBuffs[idxs.prev];
    var prevPrevBuff = frameBuffs[idxs.prevprev];


    /*------------------------*/
    // draw wave to current texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, currentBuff.frameBuffer);
    gl.useProgram(prg_wave);
    gl.viewport(0, 0, _W, _H);
    gl.clearColor(0.0,0.0,0.0,0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    setAttribute(gl,prg_wave,vertBuff,"v_pos",3);
    gl.uniform2fv(gl.getUniformLocation(prg_wave,'u_resolution'), [_W,_H]);
    gl.uniform2fv(gl.getUniformLocation(prg_wave,'mouse'), [mouseX,mouseY]);
    gl.uniform1f(gl.getUniformLocation(prg_wave,"u_time"), dt);

    // from input texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frameBuff_input.texture);
    gl.uniform1i(gl.getUniformLocation(prg_wave, 'texture_input'), 0);
    setAttribute(gl,prg_wave,texCoordBuff,"a_texCoord_input",2);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, prevBuff.texture);
    gl.uniform1i(gl.getUniformLocation(prg_wave, 'texture_prev'), 1);
    setAttribute(gl,prg_wave,texCoordBuff,"a_texCoord_prev",2);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, prevPrevBuff.texture);
    gl.uniform1i(gl.getUniformLocation(prg_wave, 'texture_prevprev'), 2);
    setAttribute(gl,prg_wave,texCoordBuff,"a_texCoord_prevprev",2);

    gl.drawArrays(gl.TRIANGLE_STRIP,0,vertices.length/3);
    gl.flush();
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    /*------------------------*/




}

    /*------------------------*/
    // main render part
    gl.useProgram(prg_main);
    gl.viewport(0, 0, _W, _H);
    gl.clearColor(0.0,0.0,0.0,0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    setAttribute(gl,prg_main,vertBuff,"v_pos",3);

    // from main texture
    gl.activeTexture(gl.TEXTURE0);
    // ↓ here is main render texture
    gl.bindTexture(gl.TEXTURE_2D, currentBuff.texture);
    gl.uniform1i(gl.getUniformLocation(prg_main, 'texture'), 0);
    setAttribute(gl,prg_main,texCoordBuff,"a_texCoord",2);

    gl.drawArrays(gl.TRIANGLE_STRIP,0,vertices.length/3);
    gl.flush();
    gl.bindTexture(gl.TEXTURE_2D, null);
    /*------------------------*/


    requestAnimationFrame(update);
}


/***********************/
/* Functions           */
/***********************/
function createShader(gl,id,type)
{

    var shaderCode = document.getElementById(id).text;
    var shader = gl.createShader(type);
    gl.shaderSource(shader,shaderCode);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        alert(gl.getShaderInfoLog(shader));
    
    return shader;
}

function createProgram(gl,vertShader,fragShader)
{
    var prg = gl.createProgram();
    gl.attachShader(prg,vertShader);
    gl.attachShader(prg,fragShader);
    gl.linkProgram(prg);
    if(gl.getProgramParameter(prg, gl.LINK_STATUS))
    {
        //gl.useProgram(prg);
        return prg;
    }
    else
    {
        alert(gl.getProgramInfoLog(prg));
    }
}

function createBuffer(vertices)
{
    var buff = gl.createBuffer();
    // bind vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,buff);
    // set vertex to buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    // unbind vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    return buff;
}

function createFrameBufferAndTexture(w,h)
{
        var frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        
        // unbind
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        return {
            frameBuffer: frameBuffer,
            texture: texture
        };
}

function setAttribute(gl,prg,buffer,name,stride)
{
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    var al = gl.getAttribLocation(prg, name);
    gl.vertexAttribPointer(al,stride,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(al);
}

function getNextIndexes(i)
{
    //loop
    //0,1,2
    //1,2,0
    //2,0,1
    var cur = i%3;
    var prev = (i+1)%3;
    var prevprev = (i+2)%3;
    return{cur:cur,prev:prev,prevprev:prevprev};
}

function onMouseMove(e) 
{
    mouseX = e.clientX;
    mouseY = e.clientY;
}
function onMouseDown(e) 
{
    mouseClick = 1;
}
function onMouseUp() 
{
    mouseClick = 0;
}


}