// Define global variables
var gl;
var pwgl = {};
pwgl.ongoingImageLoads = [];
var canvas;

// Variable for the lost contex
var inc = 0;

// Import shaders
import vertexShaderGLSL from '/shaders/vertex-shader-unknown-v2.glsl.js';
import fragmentShaderGLSL from '/shaders/fragment-shader-basic-v2.glsl.js';

import * as glUtils from '/js/glUtils.js';

function setupShaders() {
  // Create vertex and fragment shaders
  var vertexShader = glUtils.loadShader(gl, vertexShaderGLSL, "x-shader/x-vertex");
  var fragmentShader = glUtils.loadShader(gl, fragmentShaderGLSL, "x-shader/x-fragment");

  // Create a WebGL program object
  var shaderProgram = gl.createProgram();

  // Load the shaders to the program object
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  // Link shaders and check linking COMPILE_STATUS
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) && !gl.isContextLost()) {
    alert("Failed to setup shaders");
  }

  // Activate program
  gl.useProgram(shaderProgram);

  pwgl.vertexPositionAttributeLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  pwgl.vertexTextureAttributeLoc = gl.getAttribLocation(shaderProgram, "aTextureCoordinates");
  pwgl.uniformMVMatrixLoc = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  pwgl.uniformProjMatrixLoc = gl.getUniformLocation(shaderProgram, "uPMatrix");
  pwgl.uniformSamplerLoc = gl.getUniformLocation(shaderProgram, "uSampler");

  gl.enableVertexAttribArray(pwgl.vertexPositionAttributeLoc);
  gl.enableVertexAttribArray(pwgl.vertexTextureAttributeLoc);

  pwgl.modelViewMatrix = mat4.create();
  pwgl.projectionMatrix = mat4.create();
  pwgl.modelViewMatrixStack = [];
}

function pushModelViewMatrix() {
  var copyToPush = mat4.create(pwgl.modelViewMatrix);
  pwgl.modelViewMatrixStack.push(copyToPush);
}

function popModelViewMatrix() {
  if (pwgl.modelViewMatrixStack.length == 0) {
    throw "Error popModelViewMatrix() - Stack was empty";
  }
  pwgl.modelViewMatrix = pwgl.modelViewMatrixStack.pop();
}

function setupFloorBuffers() {
  pwgl.floorVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexPositionBuffer);

  var floorVertexPosition = [
    // Plane in y=0
     5.0,  0.0,  5.0, //v0
     5.0,  0.0, -5.0, //v1
    -5.0,  0.0, -5.0, //v2
    -5.0,  0.0,  5.0  //v3
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertexPosition), gl.STATIC_DRAW);
  pwgl.FLOOR_VERTEX_POS_BUF_ITEM_SIZE = 3;
  pwgl.FLOOR_VERTEX_POS_BUF_NUM_ITEMS = 4;

  // Floor index
  pwgl.floorVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.floorVertexIndexBuffer);

  var floorVertexIndices = [0, 1, 2, 3];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorVertexIndices), gl.STATIC_DRAW);
  pwgl.FLOOR_VERTEX_INDEX_BUF_ITEM_SIZE = 1;
  pwgl.FLOOR_VERTEX_INDEX_BUF_NUM_ITEMS = 4;

  // Floor texture coordinates
  pwgl.floorVertexTextureCoordinateBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexTextureCoordinateBuffer);

  // Floor texture coordinates. Note that wrapping is used
  var floorVertexTextureCoordinates = [
    2.0, 0.0,
    2.0, 2.0,
    0.0, 2.0,
    0.0, 0.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertexTextureCoordinates), gl.STATIC_DRAW);
  pwgl.FLOOR_VERTEX_TEX_COORD_BUF_ITEM_SIZE = 2;
  pwgl.FLOOR_VERTEX_TEX_COORD_BUF_NUM_ITEMS = 4;
}

function setupCubeBuffers() {
  pwgl.CUBE = {};

  pwgl.CUBE.VERTEX_POS = glUtils.addCubeVertexPositionBuffers(gl);

  pwgl.CUBE.VERTEX_INDEX = glUtils.addCubeVertexIndexBuffers(gl);

  pwgl.CUBE.VERTEX_TEX_COORD = glUtils.addCubeVertexTextureCoordinateBuffers(gl);
}

function setupTextures() {
  // Texture for the table
  pwgl.woodTexture = gl.createTexture();
  loadImageForTexture("textures/wood_128x128.jpg", pwgl.woodTexture);

  // Texture for the floor
  pwgl.groundTexture = gl.createTexture();
  loadImageForTexture("textures/wood_floor_256.jpg", pwgl.groundTexture);

  // Texture for the floor on the table
  pwgl.boxTexture = gl.createTexture();
  loadImageForTexture("textures/wicker_256.jpg", pwgl.boxTexture);
}

function loadImageForTexture(url, texture) {
  var image = new Image();
  image.onload = function () {
    pwgl.ongoingImageLoads.splice(pwgl.ongoingImageLoads.indexOf(image), 1);
  // The splice() method adds/removes items to/from an array, and returns
  // the removed item(s)
  // Syntax: array.splice(index, howMany, item1, ..., itemX)
  textureFinishedLoading(image, texture);
  }
  pwgl.ongoingImageLoads.push(image);
  image.src = url;
}

function textureFinishedLoading(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.generateMipmap(gl.TEXTURE_2D);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function setupBuffers() {
  setupFloorBuffers();
  setupCubeBuffers();
}

function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(pwgl.uniformMVMatrixLoc, false, pwgl.modelViewMatrix);
}

function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(pwgl.uniformProjMatrixLoc, false, pwgl.projectionMatrix);
}

function drawFloor() {
  // Draw the floor
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexPositionBuffer);
  gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc,
                         pwgl.FLOOR_VERTEX_POS_BUF_ITEM_SIZE,
                         gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexTextureCoordinateBuffer);
  gl.vertexAttribPointer(pwgl.vertexTextureAttributeLoc,
                         pwgl.FLOOR_VERTEX_TEX_COORD_BUF_ITEM_SIZE,
                         gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, pwgl.groundTexture);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.floorVertexIndexBuffer);
  gl.drawElements(gl.TRIANGLE_FAN, pwgl.FLOOR_VERTEX_INDEX_BUF_NUM_ITEMS,
    gl.UNSIGNED_SHORT, 0);
}

function drawCube(texture) {
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.CUBE.VERTEX_POS.Buffer);
  gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc,
                         pwgl.CUBE.VERTEX_POS.BUF_ITEM_SIZE,
                         gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.CUBE.VERTEX_TEX_COORD.Buffer);
  gl.vertexAttribPointer(pwgl.vertexTextureAttributeLoc,
                         pwgl.CUBE.VERTEX_TEX_COORD.BUF_ITEM_SIZE,
                         gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.CUBE.VERTEX_INDEX.Buffer);
  gl.drawElements(gl.TRIANGLES, pwgl.CUBE.VERTEX_INDEX.BUF_NUM_ITEMS,
    gl.UNSIGNED_SHORT, 0);
}

function drawTable() {
  // Draw table top
  pushModelViewMatrix();
  mat4.translate(pwgl.modelViewMatrix, [0.0, 1.0, 0.0], pwgl.modelViewMatrix);
  mat4.scale(pwgl.modelViewMatrix, [2.0, 0.1, 2.0], pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  // Draw the actual cube (now scaled to a cuboid) with woodTexture
  drawCube(pwgl.woodTexture);
  popModelViewMatrix();

  // Draw the table legs
  for (var i = -1; i <= 1; i+=2) {
    for (var j = -1; j <= 1; j+=2) {
      pushModelViewMatrix();
      mat4.translate(pwgl.modelViewMatrix, [i*1.9, -0.1, j*1.9], pwgl.modelViewMatrix);
      mat4.scale(pwgl.modelViewMatrix, [0.1, 1.0, 0.1], pwgl.modelViewMatrix);
      uploadModelViewMatrixToShader();
      drawCube(pwgl.woodTexture);
      popModelViewMatrix();
    }
  }
}

function draw() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(60, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0, pwgl.projectionMatrix);
  mat4.identity(pwgl.modelViewMatrix);
  mat4.lookAt([8, 5, -10], [0, 0, 0], [0, 1, 0], pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  uploadProjectionMatrixToShader();
  gl.uniform1i(pwgl.uniformSamplerLoc, 0);

  // Draw floor
  drawFloor();

  // Draw table
  pushModelViewMatrix();
  mat4.translate(pwgl.modelViewMatrix, [0.0, 1.1, 0.0], pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  drawTable();
  popModelViewMatrix();

  // Draw box on top of the table
  pushModelViewMatrix();
  mat4.translate(pwgl.modelViewMatrix, [0.0, 2.7, 0.0], pwgl.modelViewMatrix);
  mat4.scale(pwgl.modelViewMatrix, [0.5, 0.5, 0.5], pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  drawCube(pwgl.boxTexture);
  popModelViewMatrix();

  pwgl.requestId = requestAnimFrame(draw, canvas);
}

// This function is the entry point of this webgl application
// It is the firts function to be loaded when the html doc is loaded into
function startup() {
  // retrieve html canvas
  canvas = document.getElementById("canvas-web-gl-week-7");
  canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
  canvas.addEventListener('webglcontextlost', handleContextLost, false);
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

  window.addEventListener('mousedown', function () {
    canvas.loseContext();
  });

  gl = glUtils.createGLContext(canvas);
  setupShaders();
  setupBuffers();
  setupTextures();
  // Set the colour to draw width
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  draw();
}

function handleContextLost(event) {
  event.preventDefault();
  cancelRequestAnimFrame(pwgl.requestId);

  // Ignore all onging image loads by removing their onload handler
  for (var i = 0; i < pwgl.ongoingImageLoads.length; i++) {
    pwgl.ongoingImageLoads[i].onload = undefined;
  }
  pwgl.ongoingImageLoads = [];
}

function handleContextRestored(event) {
  setupShaders();
  setupBuffers();
  setupTextures();
  inc = inc + 0.1;
  gl.clearColor(0.0+inc, 0.0+inc, 0.0+inc, 1.0);
  gl.enable(gl.DEPTH_TEST);
  pwgl.requestId = requestAnimFrame(draw, canvas);
}

function main(){
  startup();
}

window.addEventListener('load', main)