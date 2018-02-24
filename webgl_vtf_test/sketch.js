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
var _mouseMoveOffs = mat4.create(); // matrix for mousemove camera
var _wheelScrollOffs = 1; // float for mousemove wheel camera
var _wheelMoveOffs = [0,0]; // vec2 for wheelmove camera
var BG_COLOR = [0.61,0.45,0.15];
var cnt = 0;
var mouseX=0,mouseY=0;
var mouseClick = 0;



// Init
var canvas = document.querySelector('#glcanvas');
canvas.addEventListener('mousemove', onMouseMove, false);
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mousewheel', onMouseWheel, false);
canvas.width = _W;
canvas.height = _H;
var gl = canvas.getContext('webgl');
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

// camera matrix
var proj = mat4.create();
var view = mat4.create();
var vp = mat4.create();
mat4.perspective(proj,30,canvas.width/canvas.height,0.01,300);





/*--------------------------------*/
// plane start
/*--------------------------------*/
var dimension = 100;
var texture_size = 1;
var stride = texture_size/(dimension-1);
var stride_texture = 1/(dimension-1);

var vertices_plane = [];
for(var y=0;y<dimension;y++)
{
    for(var x=0;x<dimension;x++)
    {
        vertices_plane.push(x*stride);
        vertices_plane.push(y*stride);
        vertices_plane.push(0);
    }
}

var indexes_plane = [];
for(var y=0;y<dimension-1;y++)
{
    for(var x=0;x<dimension-1;x++)
    {
        var first_index = x+y*dimension;
        var second_index = x+(y+1)*dimension;
        var third_index = x+(y+1)*dimension +1;
        indexes_plane.push(first_index);
        indexes_plane.push(second_index);
        indexes_plane.push(third_index);

        var fourth_index = first_index;
        var fifth_index = third_index;
        var sixth_index = first_index+1;
        indexes_plane.push(fourth_index);
        indexes_plane.push(fifth_index);
        indexes_plane.push(sixth_index);
    }
}

var texcoords_plane = [];
for(var y=0;y<dimension;y++)
{
    for(var x=0;x<dimension;x++)
    {
        texcoords_plane.push(stride_texture*x);
        texcoords_plane.push(stride_texture*y);
    }
}

var vs_plane = createShader(gl,"PlaneShader-vs",gl.VERTEX_SHADER);
var fs_plane = createShader(gl,"PlaneShader-fs",gl.FRAGMENT_SHADER);
var prg_plane = createProgram(gl,vs_plane,fs_plane);
var buff_plane = createBuffer(vertices_plane);
var indexBuff_plane = createIndexBuffer(indexes_plane);
var frameBuff_plane = createFrameBufferAndTexture(512,512);
var planeTexture;
var planeTexCoordBuff;

/*--------------------------------*/
// plane end
/*--------------------------------*/

var image = new Image();
image.src = "ok.png";
image.onload = function()
{
    // create plane texture
    planeTexCoordBuff = createBuffer(texcoords_plane);
    gl.activeTexture(gl.TEXTURE0);

    planeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, planeTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    update();
}




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

    // light
    var lightDir = [cos(dt*0.0015)*1.7,sin(dt*0.0015)*1.7,sin(dt*0.0015)*0.7];
    lightDir = [-0.4,-1,-0.6];

    // clear all
    gl.clearColor(BG_COLOR[0],BG_COLOR[1],BG_COLOR[2],0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);



    // Plane
    gl.useProgram(prg_plane);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff_plane);
    var world_plane = mat4.create();
    var wvp_plane = mat4.create();
    var world_plane = mat4.create();
    mat4.scale(world_plane,world_plane,[3,3,3]);
    mat4.rotate(world_plane,world_plane,glMatrix.toRadian(90),[1,0,0])
    mat4.rotate(world_plane,world_plane,glMatrix.toRadian(90),[0,0,1])

    mat4.multiply(world_plane,vp,world_plane);
    var u_wvp_plane = gl.getUniformLocation(prg_plane, 'u_wvp');
    gl.uniformMatrix4fv(u_wvp_plane,false,world_plane);

    // texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, planeTexture);
    gl.uniform1i(gl.getUniformLocation(prg_plane, 'texture'), 0);
    setAttribute(gl,prg_plane,planeTexCoordBuff,"a_texCoord",2);

    gl.uniform3f(gl.getUniformLocation(prg_plane,"u_color"),0,1,0);
    setAttribute(gl,prg_plane,buff_plane,"v_pos",3);
    gl.drawElements(gl.TRIANGLES, indexes_plane.length, gl.UNSIGNED_SHORT, 0);


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

// mouse and wheel handling functions
var __mouseDownNow = false;
var __mouseDownPos = [0,0];
var __wheelDownNow = false;
var __wheelDownPos = [0,0];
function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
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