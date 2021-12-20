// Define global variables
var gl;
var canvas;
var shaderProgram;
var vertexBuffer;
var triangleVertexBuffer;
var triangleVertexColorBuffer;

var hexagonVertexBuffer;
var stripVertexBuffer;
var stripElementBuffer;

// Import shaders
import vertexShaderGLSL from '/shaders/vertex-shader-unknown-v4.glsl.js';
import fragmentShaderGLSL from '/shaders/fragment-shader-uniform-color.glsl.js';

import * as glUtils from '/js/glUtils.js';

// This function is the entry point of this webgl application
// It is the firts function to be loaded when the html doc is loaded into
function startup() {
  // retrieve html canvas
  canvas = document.getElementById("canvas-web-gl-week-5");
  // Create webgl contex. Here, the debuggin context is created by calling
  // a functin in the library (glUtils.createGLContext(canvas))
  gl = WebGLDebugUtils.makeDebugContext(glUtils.createGLContext(canvas));
  setupShaders();
  setupBuffers();
  // Set the colour to draw width
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  draw();
}

function setupShaders() {
  // Create vertex and fragment shaders
  var vertexShader = glUtils.loadShader(gl, vertexShaderGLSL, "x-shader/x-vertex");
  var fragmentShader = glUtils.loadShader(gl, fragmentShaderGLSL, "x-shader/x-fragment");

  // Create a WebGL program object
  shaderProgram = gl.createProgram();

  // Load the shaders to the program object
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  // Link shaders and check linking COMPILE_STATUS
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  // Activate program
  gl.useProgram(shaderProgram);

  // Add a property to the shader program object. The property is the
  // attribute in the vertex shader, which has beel loaded to the program
  // object. Function getAttribLocation() finds the pointer to this attribute
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  // For the triangle we want to use per vertex color so
  // the vertexColorAttribute, aVertexColor, in the vertex shader
  // is enabled
  // You must enable this attribute here or in draw method before the triangle is drawn
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
}

// Buffers are places for data. All data, e.g., vertex coordinates,
// texture coordinates, indices, colours must be stored in their
// buffers. Here, the buffer is for the vertex coordinates of a triangle
function setupBuffers() {
  // update the triangle vertex position data used last week
  // because we have changed its siize and location
  triangleVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
  var triangleVertices = [
    0.3, 0.4, 0.0,    //v0
    0.7, 0.4, 0.0,    //v1
    0.5, 0.8, 0.0     //v2
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  triangleVertexBuffer.itemSize = 3;      //3 coordinates for each vertex
  triangleVertexBuffer.numberOfItems = 3; //3 vertices in all in this buffer

  // Triangle vertex Colors
  triangleVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  var colors = [
    1.0, 0.0, 0.0, 1.0, //v0
    0.0, 1.0, 0.0, 1.0, //v1
    0.0, 0.0, 1.0, 1.0, //v2
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  triangleVertexColorBuffer.itemSize = 4;
  triangleVertexColorBuffer.numberOfItems = 3

  // Add new items: the following are newly added items

  // Hexagon vertices
  hexagonVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, hexagonVertexBuffer);
  var hexagonVertices = [
    -0.3,  0.6,  0.0,   //v0
    -0.4,  0.8,  0.0,   //v1
    -0.6,  0.8,  0.0,   //v2
    -0.7,  0.6,  0.0,   //v3
    -0.6,  0.4,  0.0,   //v4
    -0.4,  0.4,  0.0,   //v5
    -0.3,  0.6,  0.0    //v6
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hexagonVertices), gl.STATIC_DRAW);
  hexagonVertexBuffer.itemSize = 3;
  hexagonVertexBuffer.numberOfItems = 7;

  // Triangle strip vertices
  stripVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, stripVertexBuffer);
  var stripVertices = [
    -0.5,  0.2,  0.0,   //v0
    -0.4,  0.0,  0.0,   //v1
    -0.3,  0.2,  0.0,   //v2
    -0.2,  0.0,  0.0,   //v3
    -0.1,  0.2,  0.0,   //v4
     0.0,  0.0,  0.0,   //v5
     0.1,  0.2,  0.0,   //v6
     0.2,  0.0,  0.0,   //v7
     0.3,  0.2,  0.0,   //v8
     0.4,  0.0,  0.0,   //v9
     0.5,  0.2,  0.0,   //v10

    // Second strip
    -0.5, -0.3,  0.0,   //v11
    -0.4, -0.5,  0.0,   //v12
    -0.3, -0.3,  0.0,   //v13
    -0.2, -0.5,  0.0,   //v14
    -0.1, -0.3,  0.0,   //v15
     0.0, -0.5,  0.0,   //v16
     0.1, -0.3,  0.0,   //v17
     0.2, -0.5,  0.0,   //v18
     0.3, -0.3,  0.0,   //v19
     0.4, -0.5,  0.0,   //v20
     0.5, -0.3,  0.0    //v21
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stripVertices), gl.STATIC_DRAW);
  stripVertexBuffer.itemSize = 3;
  stripVertexBuffer.numberOfItems = 22;

  // Strip vertices indices
  stripElementBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stripElementBuffer);

  var indices = [
     0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
     10, 10, 11,
     11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  stripElementBuffer.numberOfItems = 25;
}

function draw() {
  // Setup a viewport that is the same as the canvas using
  // function viewport(int x, int y, sizei w, sizei h)
  // where x and y give the x and y window coordinates of the viewport's width
  // and height
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);


  // Draw the triangle
  // Make vertex buffer "triangleVertexBuffer" the current buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);

  // Link the current buffer, to the attribute "aVertexPosition" in
  // the vertex shader
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
     triangleVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Make color buffer "triangleVertexColorBuffer" the current buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  // Link the current buffer to the attribute "aVertexColor" in
  // the vertex shader
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
     triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexBuffer.numberOfItems);


  // Draw the hexagon
  // Constant colour is used for all vertices of the hexagon. In such case,
  // we must disable the vertex attribute array, aVertexColor
  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);

  // A constant colour must be specified when aVertexColor is disabled
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 1.0, 0.0, 0.0, 1.0);

  // Make vertex buffer "hexagonVertexBuffer" the current buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, hexagonVertexBuffer);
  // Link the current buffer to the attribute "aVertexPosition" in the vertex shader
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    hexagonVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
  // Draw line strip
  gl.drawArrays(gl.LINE_STRIP, 0, hexagonVertexBuffer.numberOfItems);


  // Draw the triangle-strip
  // We have disabled the vertex attribute array, vertexColorAttribute
  // so we use a constant colour again.
  gl.bindBuffer(gl.ARRAY_BUFFER, stripVertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    stripVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Specify the constant colour to fill the triangle strip
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 1.0, 1.0, 0.0, 1.0);
  // The triangle strip will be drawn from its vertex index. We first
  // make the index buffer the current buffer by binding it
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stripElementBuffer);
  gl.drawElements(gl.TRIANGLE_STRIP, stripElementBuffer.numberOfItems,
    gl.UNSIGNED_SHORT, 0);

  // Drew help lines to easier see the triangles that build up the
  // triangle-strip. We use a different constant colour for the line
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 0.0, 0.0, 0.0, 1.0);

  // Draw line for the upper strip using index 0-10
  gl.drawArrays(gl.LINE_STRIP, 0, 11);
  // Draw line for the lowe strip using index 11-21
  gl.drawArrays(gl.LINE_STRIP, 11, 11);
}

function main(){
  startup();
}

window.addEventListener('load', main)