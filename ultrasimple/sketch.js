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


// Init
var canvas = document.querySelector('#glcanvas');
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
    100.0,0.0,0.0,
    -100.0,0.0,0.0,
];
var lineVertices_y = 
[
    0.0,100.0,0.0,
    0.0,-100.0,0.0,
];
var lineVertices_z = 
[
    0.0,0.0,100.0,
    0.0,0.0,-100.0,
];


// create and bind buffer by vertices
var buff = createBuffer(vertices);

var lineBuff_x = createBuffer(lineVertices_x);
var lineBuff_y = createBuffer(lineVertices_y);
var lineBuff_z = createBuffer(lineVertices_z);



var once = false;
// Update
function update()
{
    if(once)
        return;

    //once = true;

    // time to shader
    var dt = Date.now() - _StartTime;
    gl.uniform1f(gl.getUniformLocation(prg,"time"), dt / 1000 );

    // clear
    var color_clear = 0.5;
    gl.clearColor(color_clear,color_clear,color_clear,0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // set attribute
    setAttribute(gl,prg,buff,"v_pos",3);

    // generate matrix
    var proj = mat4.create();
    var world = mat4.create();
    var view = mat4.create();
    var wvp = mat4.create();
    mat4.perspective(proj,30,canvas.width/canvas.height,0.01,300);
    mat4.lookAt(world,[2,-1,1.4], [0,0,0], [0,1,0]);
    mat4.lookAt(world,[sin(dt*0.001)*2,-1,1.4], [0,0,0], [0,1,0]);
    mat4.multiply(wvp,proj,world,view);

    // matrix to shader
    var u_wvp = gl.getUniformLocation(prg, 'u_wvp');
    gl.uniformMatrix4fv(u_wvp,false,wvp);

    // Draw
    //gl.drawArrays(gl.TRIANGLES,0,6);
    gl.uniform3f(gl.getUniformLocation(prg,"u_color"),1.0,1,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);


    // Draw lines
    gl.uniform3f(gl.getUniformLocation(prg,"u_color"),1.0,0,0);
    setAttribute(gl,prg,lineBuff_x,"v_pos",3);
    gl.drawArrays(gl.LINES, 0, lineVertices_x.length/3);
    gl.uniform3f(gl.getUniformLocation(prg,"u_color"),0,1.0,0);
    setAttribute(gl,prg,lineBuff_y,"v_pos",3);
    gl.drawArrays(gl.LINES, 0, lineVertices_y.length/3);
    gl.uniform3f(gl.getUniformLocation(prg,"u_color"),0,0,1.0);
    setAttribute(gl,prg,lineBuff_z,"v_pos",3);
    gl.drawArrays(gl.LINES, 0, lineVertices_z.length/3);

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
        gl.useProgram(prg);
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



}