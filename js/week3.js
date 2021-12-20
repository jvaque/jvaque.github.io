// Define global variables
var gl;
var canvas;
var shaderProgram;
var vertexBuffer;

// Import shaders
import vertexShaderGLSL from '/shaders/vertex-shader-unknown-v5.glsl.js';
import fragmentShaderGLSL from '/shaders/fragment-shader-static-color.glsl.js';

import * as glUtils from '/js/glUtils.js';

// This function is the entry point of this webgl application
// It is the firts function to be loaded when the html doc is loaded into
function startup() {
  // retrieve html canvas
  canvas = document.getElementById("canvas-web-gl-week-3");
  // Create webgl contex. Here, the debuggin context is created by calling
  // a functin in the library (glUtils.createGLContext(canvas))
  gl = WebGLDebugUtils.makeDebugContext(glUtils.createGLContext(canvas));
  setupShaders();
  setupBuffers();
  // Set the colour to draw width
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
}

// Buffers are places for data. All data, e.g., vertex coordinates,
// texture coordinates, indices, colours must be stored in their
// buffers. Here, the buffer is for the vertex coordinates of a triangle
function setupBuffers() {
  // A buffer object is first created by calling gl.createBuffer()
  vertexBuffer = gl.createBuffer();
  // Then bind the buffer to gl.ARRAY_BUFFER, which is the WebGL built in
  // buffer where the vertex shader will fetch data from
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Actual coordinates for the vertices
  var triangleVertices = [
    0.0, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0
  ];
  // Load the vertex data to the buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  // Add properties to vertexBuffer object
  vertexBuffer.itemSize = 3;      //3 coordinates for each vertex
  vertexBuffer.numberOfItems = 3; //3 vertices in all in this buffer
}

function draw() {
  // Setup a viewport that is the same as the canvas using
  // function viewport(int x, int y, sizei w, sizei h)
  // where x and y give the x and y window coordinates of the viewport's width
  // and height
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  // Fill the canvas with solid colour. Default is black
  // If other colour is desirable using function gl.clearColor (r, g, b, a)
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Inform webgl pipeline with pinter of the attribute
  // "aVertexPosition". Still remember it?
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
     vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);
}

function main(){
  startup();
}

window.addEventListener('load', main)