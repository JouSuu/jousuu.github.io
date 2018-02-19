window.onload = function()
{

// Define
var _W = 300;
var _H = 300;
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


// Shader
var vertShader = createShader(gl,"shader-vs",gl.VERTEX_SHADER);
var fragShader = createShader(gl,"shader-fs",gl.FRAGMENT_SHADER);


// Program
var prg = createProgram(gl,vertShader,fragShader);
// uniform to shader
gl.uniform2f(gl.getUniformLocation(prg,"resolution"),_W,_H);


// Vertex
var vertices = 
[
    -0.5, 0.5, 0.0, //0
    0.5,  0.5, 0.0, //1 
    -0.5,-0.5, 0.0, //2
    0.5, -0.5, 0.0  //3
];


// Lines
var lineVertices_x = 
[
    1.0,0.0,0.0,
    -1.0,0.0,0.0,
    1.0,0.0,0.0,
    0.95,0.03,0.0,
    1.0,0.0,0.0,
    0.95,-0.03,0.0,

];

// create and bind buffer by vertices
var buff = createBuffer(vertices);




// camera matrix
var proj = mat4.create();
var view = mat4.create();
var vp = mat4.create();
mat4.perspective(proj,30,canvas.width/canvas.height,0.01,300);



// lines
var vs_line = createShader(gl,"SimpleUnlitShader-vs",gl.VERTEX_SHADER);
var fs_line = createShader(gl,"SimpleUnlitShader-fs",gl.FRAGMENT_SHADER);
var prg_line = createProgram(gl,vs_line,fs_line);
var lineBuff = createBuffer(lineVertices_x);


// Update
function update()
{
    // camera
    var eyePos = vec3.create();
    vec3.set(eyePos,0.6,0.8,1.5);
    vec3.add(eyePos,eyePos,[_wheelMoveOffs[0]*0.01,_wheelMoveOffs[1]*0.01,0]);
    vec3.scale(eyePos,eyePos,_wheelScrollOffs);
    mat4.lookAt(view,eyePos, [0,0,0], [0,-1,0]);
    mat4.multiply(view,view,_mouseMoveOffs);
    mat4.multiply(vp,proj,view);

    // time to shader
    var dt = Date.now() - _StartTime;
    gl.uniform1f(gl.getUniformLocation(prg,"time"), dt / 1000 );

    // clear
    var color_clear = 0.5;
    gl.clearColor(color_clear,color_clear,color_clear,0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // set attribute
    gl.useProgram(prg);
    setAttribute(gl,prg,buff,"v_pos",3);


    // model matrix
    var world_rect = mat4.create();
    var wvp_rect = mat4.create();
    mat4.rotate(world_rect,world_rect,dt*0.007,[1,0,0]);
    mat4.multiply(wvp_rect,vp,world_rect);

    // matrix to shader
    var u_wvp = gl.getUniformLocation(prg, 'u_wvp');
    gl.uniformMatrix4fv(u_wvp,false,wvp_rect);

    // Draw
    //gl.drawArrays(gl.TRIANGLES,0,6);
    gl.uniform3f(gl.getUniformLocation(prg,"u_color"),1.0,1,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);




    // Draw lines
    gl.useProgram(prg_line);
    var world_line_x = mat4.create();
    var wvp_line_x = mat4.create();
    mat4.rotate(world_line_x,world_line_x,0,[1,0,0]);
    mat4.multiply(wvp_line_x,vp,world_line_x);

    var u_wvp = gl.getUniformLocation(prg_line, 'u_wvp');
    gl.uniformMatrix4fv(u_wvp,false,wvp_line_x);

    gl.uniform3f(gl.getUniformLocation(prg_line,"u_color"),1.0,0,0);
    setAttribute(gl,prg_line,lineBuff,"v_pos",3);
    gl.drawArrays(gl.LINES, 0, lineVertices_x.length/3);



    var world_line_y = mat4.create();
    var wvp_line_y = mat4.create();
    mat4.rotate(world_line_y,world_line_y,glMatrix.toRadian(90),[0,0,1]);
    mat4.rotate(world_line_y,world_line_y,glMatrix.toRadian(90),[1,0,0]);
    mat4.multiply(wvp_line_y,vp,world_line_y);

    var u_wvp = gl.getUniformLocation(prg_line, 'u_wvp');
    gl.uniformMatrix4fv(u_wvp,false,wvp_line_y);

    gl.uniform3f(gl.getUniformLocation(prg_line,"u_color"),0,1.0,0);
    setAttribute(gl,prg_line,lineBuff,"v_pos",3);
    gl.drawArrays(gl.LINES, 0, lineVertices_x.length/3);


    var world_line_z = mat4.create();
    var wvp_line_z = mat4.create();
    mat4.rotate(world_line_z,world_line_z,glMatrix.toRadian(-90),[0,1,0]);
    mat4.multiply(wvp_line_z,vp,world_line_z);

    var u_wvp = gl.getUniformLocation(prg_line, 'u_wvp');
    gl.uniformMatrix4fv(u_wvp,false,wvp_line_z);

    gl.uniform3f(gl.getUniformLocation(prg_line,"u_color"),0,0,1);
    setAttribute(gl,prg_line,lineBuff,"v_pos",3);
    gl.drawArrays(gl.LINES, 0, lineVertices_x.length/3);



    gl.flush();


}

(function(){
    update();
    setTimeout(arguments.callee,1000/FPS);
})();




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

function setAttribute(gl,prg,buffer,name,stride)
{
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    var al = gl.getAttribLocation(prg, name);
    gl.vertexAttribPointer(al,stride,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(al);
}


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