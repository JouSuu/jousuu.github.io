window.onload = function()
{


// Define
var _W = 300;
var _H = 300;
var _StartTime = Date.now();
var FPS = 40;
var abs = Math.abs;
var sin = Math.sin;
var cos = Math.cos;


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


// Vertex
var vertices = 
[
        -0.5, 0.5, 0.0, //0
         0.5, 0.5, 0.0, //1 
        -0.5,-0.5, 0.0, //2
         0.5,-0.5, 0.0  //3
];

var buff = gl.createBuffer();
// bind vertex buffer
gl.bindBuffer(gl.ARRAY_BUFFER,buff);
// set vertex to buffer
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
// unbind buffer
gl.bindBuffer(gl.ARRAY_BUFFER, null);
gl.bindBuffer(gl.ARRAY_BUFFER,buff);


var al = gl.getAttribLocation(prg, "pos");
gl.vertexAttribPointer(al,3,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(al);

// uniform to shader
gl.uniform2f(gl.getUniformLocation(prg,"resolution"),_W,_H);



var imgLoaded = false;


// Texture
var image = new Image();
var texture;
image.src = "ok.png";
image.onload = function(){
    var texCoordLocation = gl.getAttribLocation(prg, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // genarate texture
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // upload image to texture
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    imgLoaded = true;
};



// Update
function update()
{
    if(!imgLoaded)
        return;

    // time to shader
    var dt = Date.now() - _StartTime;
    gl.uniform1f(gl.getUniformLocation(prg,"time"), dt / 1000 );

    // clear
    gl.clearColor(0.0,0.0,1.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // bind texture
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // MVP
    var proj = mat4.create();
    var modelview = mat4.create();
    var mvp = mat4.create();
    var u_mvp = gl.getUniformLocation(prg, 'mvp');
    mat4.perspective(proj,90,canvas.width/canvas.height,0.1,100);
    mat4.lookAt(modelview,[0,0,0.4], [0,0,0], [0,1,0]);
    mat4.multiply(mvp, proj, modelview);
    gl.uniformMatrix4fv(u_mvp, false, mvp);

    // Draw
    //gl.drawArrays(gl.TRIANGLES,0,6);

    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
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



}