"use strict";

window.onload = function()
{
// Define
var _W = 450;
var _H = 450;
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

canvas.width = _W;
canvas.height = _H;
var gl = canvas.getContext('webgl');

// Shader , Program , Buffer
var vertShader_input = createShader(gl,"input-vs",gl.VERTEX_SHADER);
var fragShader_input = createShader(gl,"input-fs",gl.FRAGMENT_SHADER);
var prg_input = createProgram(gl,vertShader_input,fragShader_input);

var vertShader_test = createShader(gl,"simple-vs",gl.VERTEX_SHADER);
var fragShader_test = createShader(gl,"simple-fs",gl.FRAGMENT_SHADER);
var prg_test = createProgram(gl,vertShader_test,fragShader_test);

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
    1.0,1.0,
];

var vertBuff = createBuffer(vertices);
var texCoordBuff = createBuffer(texCoord);
var frameBuffAndTex_wave_1 = createFrameBufferAndTexture(_W,_H);
var frameBuffInput_1 = createFrameBufferAndTexture(_W,_H);

update();

// 0,1,2 - 1,2,0 - 2,0,1
for(var i=0;i<10;i++)
{
    var idxs = getNextIndexes(i);
    //log("cur:",idxs.cur,", prev:",idxs.prev,", prevprev:",idxs.prevprev);
}

// Update
function update()
{
    var dt = Date.now() - _StartTime;

    
    /*------------------------*/
    // draw input to texture
    gl.useProgram(prg_input);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffInput_1.frameBuffer);
    gl.clearColor(0.2,0.2,0.2,0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    setAttribute(gl,prg_input,vertBuff,"v_pos",3);
    gl.uniform2fv(gl.getUniformLocation(prg_input,'u_mousePos'), [mouseX,mouseY]);
    gl.uniform2fv(gl.getUniformLocation(prg_input,'u_resolution'), [_W,_H]);
    gl.uniform1i(gl.getUniformLocation(prg_input,"u_click"), mouseClick);

    gl.drawArrays(gl.TRIANGLE_STRIP,0,vertices.length/3);
    gl.flush();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    /*------------------------*/


    /*------------------------*/
    // texture to buff
    gl.useProgram(prg_test);
    gl.clearColor(0.2,0.2,0.2,0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frameBuffInput_1.texture);
    gl.uniform1i(gl.getUniformLocation(prg_test, 'texture'), 0);
    setAttribute(gl,prg_test,vertBuff,"v_pos",3);
    setAttribute(gl,prg_test,texCoordBuff,"a_texCoord",2);

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
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        
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