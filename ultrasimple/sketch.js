"use strict";

window.onload = function()
{


// Define
var _W = 450;
var _H = 450;
var _StartTime = Date.now();
var FPS = 60;
var abs = Math.abs;
var sin = Math.sin;
var cos = Math.cos;
var log = console.log;
var COLOR_RED = [1,0,0,1];
var COLOR_GREEN = [0,1,0,1];
var COLOR_BLUE = [0,0,1,1];
var _mouseMoveOffs = mat4.create(); // matrix for mousemove camera
var _wheelScrollOffs = 1; // float for mousemove wheel camera
var _wheelMoveOffs = [0,0]; // vec2 for wheelmove camera
var BG_COLOR = [0.61,0.45,0.15];
var cnt = 0;
var mouseX=0,mouseY=0;
var mouseClick = 0;


// Class
class GameObject
{
  constructor(program,vertexBuff,vertLength,normalBuff)
  {
    this.prg = program;
    this.vertexBuff = vertexBuff;
    this.vertLength = vertLength;
    this.normalBuff = normalBuff;
    this.scale = 1;
    this.pos = [0,0,0];
    this.color = [1,1,1];
    this.ambientLightIntensity = 0.5;
    this.rot = [0,1,0];
    this.texture;
    this.textureCoordBuff;
    this.textureAttatched = false;
  }

  setUpTexture(image,texCoord)
  {
    this.textureCoordBuff = createBuffer(texCoord);

    // create texture
    gl.activeTexture(gl.TEXTURE0);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    this.textureAttatched = true;
  }


  draw(vp,dirLightDirection)
  {
    // set attribute
    gl.useProgram(this.prg);
    setAttribute(gl,this.prg,this.vertexBuff,"v_pos",3);
    setAttribute(gl,this.prg,this.normalBuff,"a_normal",3);

    // model matrix
    var world_rect = mat4.create();
    var wvp_rect = mat4.create();
    var rectPos = [0,0,0];
    mat4.translate(world_rect,world_rect,this.pos);
    mat4.rotate(world_rect,world_rect,0,this.rot)
    mat4.scale(world_rect,world_rect,[this.scale,this.scale,this.scale]);
    mat4.multiply(wvp_rect,vp,world_rect);

    //　parameters to shader
    var u_wvp = gl.getUniformLocation(this.prg, 'u_wvp');
    gl.uniformMatrix4fv(u_wvp,false,wvp_rect);
    gl.uniform3fv(gl.getUniformLocation(this.prg,'v_dirLight'), dirLightDirection);
    gl.uniform3f(gl.getUniformLocation(this.prg,"u_color"),this.color[0],this.color[1],this.color[2]);
    gl.uniform1f(gl.getUniformLocation(this.prg,"u_ambientLight"), this.ambientLightIntensity);

    
    
    if(this.textureAttatched)
    {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(gl.getUniformLocation(this.prg, 'texture'), 0);
        setAttribute(gl,this.prg,this.textureCoordBuff,"a_texCoord",3);
        gl.uniform1f(gl.getUniformLocation(this.prg,"u_ifTexReadyThisIsOne"),1.0);
    }
    else
    {
        gl.uniform1f(gl.getUniformLocation(this.prg,"u_ifTexReadyThisIsOne"),0);
    }

    // Draw
    gl.drawArrays(gl.TRIANGLES,0,this.vertLength/3);
  }
}


// Vertex
var vertices = 
[
    // front side
    -0.5, 0.5, 0.5,     // Front-top-left
    0.5, 0.5, 0.5,      // Front-top-right
    -0.5, -0.5, 0.5,    // Front-bottom-left

    -0.5, -0.5, 0.5,    // Front-bottom-left
    0.5, 0.5, 0.5,      // Front-top-right
    0.5, -0.5, 0.5,     // Front-bottom-right

    // back side
    0.5, -0.5, -0.5,    // Back-bottom-right
    0.5, 0.5, -0.5,     // Back-top-right
    -0.5, 0.5, -0.5,    // Back-top-left

    -0.5, 0.5, -0.5,    // Back-top-left
    -0.5, -0.5, -0.5,   // Back-bottom-left
    0.5, -0.5, -0.5,    // Back-bottom-right

    // right side
    0.5, -0.5, -0.5,    // Back-bottom-right
    0.5, -0.5, 0.5,     // Front-bottom-right
    0.5, 0.5, 0.5,      // Front-top-right

    0.5, 0.5, 0.5,      // Front-top-right
    0.5, -0.5, -0.5,    // Back-bottom-right
    0.5, 0.5, -0.5,     // Back-top-right

    // left side
    -0.5, 0.5, 0.5,     // Front-top-left
    -0.5, -0.5, 0.5,    // Front-bottom-left
    -0.5, -0.5, -0.5,   // Back-bottom-left

    -0.5, 0.5, 0.5,     // Front-top-left
    -0.5, -0.5, -0.5,   // Back-bottom-left
    -0.5, 0.5, -0.5,    // Back-top-left

    // top side
    -0.5, 0.5, 0.5,     // Front-top-left
    0.5, 0.5, 0.5,      // Front-top-right
    0.5, 0.5, -0.5,     // Back-top-right

    -0.5, 0.5, 0.5,     // Front-top-left
    0.5, 0.5, -0.5,     // Back-top-right
    -0.5, 0.5, -0.5,    // Back-top-left

    // bottom side
    0.5, -0.5, 0.5,     // Front-bottom-right
    0.5, -0.5, -0.5,    // Back-bottom-right
    -0.5, -0.5, 0.5,    // Front-bottom-left

    -0.5, -0.5, 0.5,    // Front-bottom-left
    -0.5, -0.5, -0.5,   // Back-bottom-left
    0.5, -0.5, -0.5,    // Back-bottom-right
];
var normals = 
[
    // front side
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // back side
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    // right side
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    // left side
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,

    // top side
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    // bottom side
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
];

var texCoord = 
[

    // front side
    1.0, 0.0, 0,
    0.0, 0.0, 0,
    1.0, 1.0, 0,

    1.0, 1.0, 0,
    0.0, 0.0, 0,
    0.0, 1.0, 0,

    // back side
    1.0, 1.0, 0,
    1.0, 0.0, 0,
    0.0, 0.0, 0,

    0.0, 0.0, 0,
    0.0, 1.0, 0,
    1.0, 1.0, 0,

    // right side
    0.0, 1.0, 0,
    1.0, 1.0, 0,
    1.0, 0.0, 0,

    1.0, 0.0, 0,
    0.0, 1.0, 0,
    0.0, 0.0, 0,

    // left side
    0.0, 0.0, 0,
    0.0, 1.0, 0,
    1.0, 1.0, 0,

    0.0, 0.0, 0,
    1.0, 1.0, 0,
    1.0, 0.0, 0,

    // top side
    1.0, 1.0, 0,
    0.0, 1.0, 0,
    0.0, 0.0, 0,

    1.0, 1.0, 0,
    0.0, 0.0, 0,
    1.0, 0.0, 0,

    // bottom side
    1.0, 1.0, 0,
    1.0, 0.0, 0,
    0.0, 1.0, 0,

    0.0, 1.0, 0,
    0.0, 0.0, 0,
    1.0, 0.0, 0,
];

// Init
var canvas = document.querySelector('#glcanvas');
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mousemove', onMouseMove, false);
canvas.addEventListener('mousewheel', onMouseWheel, false);

canvas.width = _W;
canvas.height = _H;

var gl = canvas.getContext('webgl');
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);


// Shader , Program , Buffer
var vertShader = createShader(gl,"shader-vs",gl.VERTEX_SHADER);
var fragShader = createShader(gl,"shader-fs",gl.FRAGMENT_SHADER);
var prg = createProgram(gl,vertShader,fragShader);
var buff = createBuffer(vertices);
var normal_buff = createBuffer(normals);


// Lines
var lineVertices = 
[
    0.5,0.0,0.0,
    -0.5,0.0,0.0,
    0.5,0.0,0.0,
    0.45,0.03,0.0,
    0.5,0.0,0.0,
    0.45,-0.03,0.0,

];



// camera matrix
var proj = mat4.create();
var view = mat4.create();
var vp = mat4.create();
mat4.perspective(proj,30,canvas.width/canvas.height,0.01,300);


// lines
var vs_line = createShader(gl,"SimpleUnlitShader-vs",gl.VERTEX_SHADER);
var fs_line = createShader(gl,"SimpleUnlitShader-fs",gl.FRAGMENT_SHADER);
var prg_line = createProgram(gl,vs_line,fs_line);
var lineBuff = createBuffer(lineVertices);


// frame buffer
var frameBuffAndTex = createFrameBufferAndTexture(512,512);


// model and texture
var box_old = new GameObject(prg,buff,vertices.length,normal_buff);
box_old.scale = 0.5;
box_old.color = [0,0,1];
box_old.pos = [0,0,2];

var box_wall = new GameObject(prg,buff,vertices.length,normal_buff);
box_wall.pos = [1,0,0];

var box_grass = new GameObject(prg,buff,vertices.length,normal_buff);
box_grass.pos = [0,1,0];

// texture
var image = new Image();
image.src = "ok.png";

var image_grass = new Image();
image_grass.src = "grass.png";

var image_wall = new Image();
image_wall.src = "wall.png";

var imgReady = [false,false,false,];
image.onload = function()
{
    //box_old.setUpTexture(image,texCoord);
    imgReady[0] = true;
}

image_grass.onload = function()
{
    //box_grass.setUpTexture(image_grass,texCoord);
    imgReady[1] = true;
}

image_wall.onload = function()
{
    //box_wall.setUpTexture(image_wall,texCoord);
    imgReady[2] = true;
}








/*--------------------------------*/
// plane start
/*--------------------------------*/

var vertices_plane = 
[
    0,0,0,
    1,0,0,
    2,0,0,

    0,-1,0,
    1,-1,0,
    2,-1,0,

    0,-2,0,
    1,-2,0,
    2,-2,0,
];

var indexes_plane =
[
    0,3,4,
    0,4,1,
    1,4,5,
    1,5,2,
    3,6,7,
    3,7,4,
    4,7,8,
    4,8,5,
];

var vs_plane = createShader(gl,"PlaneShader-vs",gl.VERTEX_SHADER);
var fs_plane = createShader(gl,"PlaneShader-fs",gl.FRAGMENT_SHADER);
var prg_plane = createProgram(gl,vs_plane,fs_plane);
var buff_plane = createBuffer(vertices_plane);
var indexBuff_plane = createIndexBuffer(indexes_plane);
/*--------------------------------*/
// plane end
/*--------------------------------*/




loading();



var callBackId;
function loading()
{
    var ready = true;
    for(var i=0;i<imgReady.length;i++)
    {
        if(imgReady[i] == false)
            ready = false;
    }

    if(ready)
    {
        cancelAnimationFrame(callBackId);
        update();
        return;
    }

    callBackId = requestAnimationFrame(loading);
}

//update();

// Update
function update()
{


    // camera
    var eyePos = vec3.create();
    vec3.set(eyePos,2.5,2,3);
    //vec3.set(eyePos,6.5,7,2.5);
    var centerPos = vec3.create();
    vec3.set(centerPos,0,0,0);
    //vec3.set(centerPos,3,3,0);

    // wheel actions
    vec3.add(eyePos,eyePos,[_wheelMoveOffs[0]*0.01,-_wheelMoveOffs[1]*0.01,0]);
    vec3.add(centerPos,centerPos,[_wheelMoveOffs[0]*0.01,-_wheelMoveOffs[1]*0.01,0]);

    vec3.scale(eyePos,eyePos,_wheelScrollOffs);
    mat4.lookAt(view,eyePos, centerPos, [0,-1,0]);
    mat4.multiply(view,view,_mouseMoveOffs);
    mat4.multiply(vp,proj,view);

    // time and resolution to shader
    var dt = Date.now() - _StartTime;


    //gl.uniform1f(gl.getUniformLocation(prg,"time"), dt / 1000 );
    //gl.uniform2f(gl.getUniformLocation(prg,"resolution"),_W,_H);

    // light
    var lightDir = [cos(dt*0.0015)*1.7,sin(dt*0.0015)*1.7,sin(dt*0.0015)*0.7];
    lightDir = [-0.4,-1,-0.6];


    // clear all
    gl.clearColor(BG_COLOR[0],BG_COLOR[1],BG_COLOR[2],0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    box_old.draw(vp,lightDir);
    box_wall.draw(vp,lightDir);
    gl.bindTexture(gl.TEXTURE_2D, frameBuffAndTex.texture);
    // draw box
    //box_grass.texture = frameBuffAndTex.texture;
    box_grass.draw(vp,lightDir);




    // Plane
    gl.useProgram(prg_plane);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff_plane);
    var world_plane = mat4.create();
    var wvp_plane = mat4.create();

    mat4.multiply(world_plane,vp,world_plane);
    var u_wvp_plane = gl.getUniformLocation(prg_plane, 'u_wvp');
    gl.uniformMatrix4fv(u_wvp_plane,false,world_plane);

    gl.uniform3f(gl.getUniformLocation(prg_plane,"u_color"),0,1,0);
    setAttribute(gl,prg_plane,buff_plane,"v_pos",3);
    gl.drawElements(gl.TRIANGLES, indexes_plane.length, gl.UNSIGNED_SHORT, 0);







    // Draw axis
    arrow([0.5,0,0],[1,0,0],1,[1,0,0]);
    arrow([0,0.5,0],[0,1,0],1,[0,1,0]);
    arrow([0,0,0.5],[0,0,1],1,[0,0,1]);

    gl.flush();
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

function createIndexBuffer(indexes)
{
    var buff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Int16Array(indexes),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

    return buff;
}

function createFrameBufferAndTexture(w,h)
{
        var frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
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

function arrow(pos,target,scale,color)
{
    if(color == undefined)
        color = [1,1,1];

    gl.useProgram(prg_line);

    var world_line = mat4.create();
    var wvp_line = mat4.create();

    mat4.targetTo(world_line, pos, target, [0,1,0]);
    mat4.rotate(world_line,world_line,glMatrix.toRadian(90),[0,1,0])


    mat4.scale(world_line,world_line,[scale,scale,scale]);

    //mat4.translate(world_line_x,world_line_x,pos);


    mat4.multiply(world_line,vp,world_line);

    var u_wvp = gl.getUniformLocation(prg_line, 'u_wvp');
    gl.uniformMatrix4fv(u_wvp,false,world_line);

    gl.uniform3f(gl.getUniformLocation(prg_line,"u_color"),color[0],color[1],color[2]);
    setAttribute(gl,prg_line,lineBuff,"v_pos",3);
    gl.drawArrays(gl.LINES, 0, lineVertices.length/3);
}


// mouse and wheel handling functions
var __mouseDownNow = false;
var __mouseDownPos = [0,0];
var __wheelDownNow = false;
var __wheelDownPos = [0,0];
function onMouseMove(e) {
    if(__mouseDownNow)
    {

        var xOffs = __mouseDownPos[0] - e.clientX;
        var yOffs = __mouseDownPos[1] - e.clientY;

        mat4.rotate(_mouseMoveOffs,_mouseMoveOffs,glMatrix.toRadian(xOffs),[0,1,0]);
        mat4.rotate(_mouseMoveOffs,_mouseMoveOffs,glMatrix.toRadian(yOffs),[1,0,0]);

        __mouseDownPos[0] = e.clientX;
        __mouseDownPos[1] = e.clientY;
    }

    else if(__wheelDownNow)
    {
        var xOffs = __wheelDownPos[0] - e.clientX;
        var yOffs = __wheelDownPos[1] - e.clientY;
        _wheelMoveOffs[0] += xOffs;
        _wheelMoveOffs[1] += yOffs;
        __wheelDownPos[0] = e.clientX;
        __wheelDownPos[1] = e.clientY;
    }
}
function onMouseDown(e) {
    if(e.button == 0)
    {
        __mouseDownPos[0] = e.clientX;
        __mouseDownPos[1] = e.clientY;
        __mouseDownNow = true;
    }
    else if(e.button == 1)
    {
        __wheelDownPos[0] = e.clientX;
        __wheelDownPos[1] = e.clientY;
        __wheelDownNow = true;
    }
    
}
function onMouseUp() {
    __mouseDownNow = false;
    __wheelDownNow = false;
    __wheelDownPos[0] = 0;
    __wheelDownPos[1] = 0;
}

function onMouseWheel(e) {
    _wheelScrollOffs += e.deltaY * 0.001;
}


}