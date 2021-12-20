// Define global variables
var gl;
var canvas;
var shaderProgram;
var vertexBuffer;
var triangleVertexBuffer;
var triangleVertexColorBuffer;

// Import shaders
import vertexShaderGLSL from '/shaders/vertex-shader-unknown-v4.glsl.js';
import fragmentShaderGLSL from '/shaders/fragment-shader-uniform-color.glsl.js';

import * as glUtils from '/js/glUtils.js';

// This function is the entry point of this webgl application
// It is the firts function to be loaded when the html doc is loaded into
function startup() {
  // retrieve html canvas
  canvas = document.getElementById("canvas-web-gl-week-4-ex2");
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
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
}

// Buffers are places for data. All data, e.g., vertex coordinates,
// texture coordinates, indices, colours must be stored in their
// buffers. Here, the buffer is for the vertex coordinates of a triangle
function setupBuffers() {
  // triangle vertices
  triangleVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
  // The vertex coordinatesand colours are interleaved
  var triangleVertices = [
    // (x    y    z )   (r    g    b    a )
    // ----------------------------------
      0.0,  0.5, 0.0,  255,   0,   0, 255, //v0
     -0.5, -0.5, 0.0,    0, 255,   6, 255, //v1
      0.5, -0.5, 0.0,    0,   0, 255, 255, //v2
  ];

  var nbrOfVertices = 3; // Total nubmber of vertices

  // Calculate how many bytes that are needed for one vertex element
  // that consists of (x,y,z) + (r,g,b,a)
  var vertexSizeInBytes = 3 * Float32Array.BYTES_PER_ELEMENT + 4 * Uint8Array.BYTES_PER_ELEMENT;
  var vertexSizeInFloats =vertexSizeInBytes / Float32Array.BYTES_PER_ELEMENT;

  // Allocate the buffer
  var buffer = new ArrayBuffer(nbrOfVertices * vertexSizeInBytes);

  // Map the buffer to a Float32Array view to access the position
  var positionView = new Float32Array(buffer)

  // Map the sama buffer to a Uint8Array to access the colour
  var colorView = new Uint8Array(buffer)

  // Populate the ArrayBufferfrom the JavaScript Array
  var positionOffsetInFloats = 0;
  var colorOffsetInBytes = 12;

  var k = 0; // Index to JavaScript Array
  for (var i = 0; i < nbrOfVertices; i++) {
    positionView[positionOffsetInFloats]   = triangleVertices[k];   // x
    positionView[1+positionOffsetInFloats] = triangleVertices[k+1]; // y
    positionView[2+positionOffsetInFloats] = triangleVertices[k+2]; // z

    colorView[colorOffsetInBytes]   = triangleVertices[k+3];        // R
    colorView[1+colorOffsetInBytes] = triangleVertices[k+4];        // G
    colorView[2+colorOffsetInBytes] = triangleVertices[k+5];        // B
    colorView[3+colorOffsetInBytes] = triangleVertices[k+6];        // A

    positionOffsetInFloats += vertexSizeInFloats;
    colorOffsetInBytes += vertexSizeInBytes;

    k += 7;
  }

  gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
  triangleVertexBuffer.positionSize = 3;
  triangleVertexBuffer.colorSize = 4;
  triangleVertexBuffer.numberOfItems = 3;
}

function draw() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Bind the buffer containing both position and colour
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);

  // Describe how the positions are organized in the vertex array
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
     triangleVertexBuffer.positionSize, gl.FLOAT, false, 16, 0);

  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
     triangleVertexBuffer.colorSize, gl.UNSIGNED_BYTE, true, 16, 12);

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexBuffer.numberOfItems);
}

function main(){
  startup();
}

window.addEventListener('load', main)