// Define global variables

var gl;
var canvas;
var shaderProgram;

var pwgl = {};

var sphereVertexPositionBuffer;
var sphereVertexIndexBuffer;

var floorVertexPositionBuffer;
var floorVertexIndexBuffer;
var cubeVertexPositionBuffer;
var cubeVertexIndexBuffer;

var modelViewMatrix;
var projectionMatrix;
var modelViewMatrixStack;



// Create WebGL context. Recall that we have us getContext("2D")
// to create a 2D contex for drawing 2D graphics
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i = 0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch (e) {}
    if (context) {
        break;
      }
  }

  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

// Load shaders from DOM (document object model). This function will be
// called in setupShaders(). The parameters for argument id will be
// "shader-vs" and "shader-fs"
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);

  // If there is no shader scripts, the function exists
  if (!shaderScript) {
    return null;
  }

  // Otherwise loop though the clildren for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) {
      // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild =currentChild.nextSibling;
  }

  // Create a WebGL shader object according to type of shader, i.e.,
  // vertex or fragment shader.
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    // Call WebGL function createShader() to create fragment
    // shader object
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    // Call WebGL function createShader() to create vertex
    // shader object
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  // Load the shader source code (shaderSource) to the shader object
  gl.shaderSource(shader, shaderSource);
  // Compile the shader
  gl.compileShader(shader);

  // Check compiling status
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function setupShaders() {
  // Create vertex and fragment shaders
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");

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

  shaderProgram.uniformMVMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.uniformProjMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");

  // Initialise the matrices
  modelViewMatrix = mat4.create();
  projectionMatrix = mat4.create();
  modelViewMatrixStack = [];

  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
}

function pushModelViewMatrix() {
  var copyToPush = mat4.create(modelViewMatrix);
  modelViewMatrixStack.push(copyToPush);
}

function popModelViewMatrix() {
  if (modelViewMatrixStack.length == 0) {
    throw "Error popModelViewMatrix() - Stack was empty";
  }
  modelViewMatrix = modelViewMatrixStack.pop();
}

function setupFloorBuffers() {
  floorVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);

  var floorVertexPosition = [
    // Plane in y=0
     5.0,  0.0,  5.0, //v0
     5.0,  0.0, -5.0, //v1
    -5.0,  0.0, -5.0, //v2
    -5.0,  0.0,  5.0  //v3
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertexPosition), gl.STATIC_DRAW);
  floorVertexPositionBuffer.itemSize = 3;
  floorVertexPositionBuffer.numberOfItems = 4;

  floorVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVertexIndexBuffer);

  var floorVertexIndices = [0, 1, 2, 3];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorVertexIndices), gl.STATIC_DRAW);
  floorVertexIndexBuffer.itemSize = 1;
  floorVertexIndexBuffer. numberOfItems = 4;
}

function setupSphereBuffers() {
  sphereVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);

  var radius = 4;
  var numberOfParallels = 10;
  var numberOfMeridians = 5;
  var sphereVertexPosition = [];
  // for debuggin purposes
  var tempVertexCoordinates = [];
  var tempVertexIdeces = [];

  var parallelAngle = 0;
  var meridianAngle = 0;
  var x = y = z = 0;

  for (var i = 0; i <= numberOfParallels; i++) {
    parallelAngle = i * 2 * Math.PI / numberOfParallels;
    for (var j = 0; j <= numberOfMeridians; j++) {
      meridianAngle = j * Math.PI / numberOfMeridians;
      // x coordinate for the parallel
      x = radius * Math.sin(meridianAngle) * Math.cos(parallelAngle);
      // y coordinate for the parallel
      y = radius * Math.cos(meridianAngle);
      // z coordinate for the parallel
      z = radius * Math.sin(meridianAngle) * Math.sin(parallelAngle);

      // push to the vertex position array
      sphereVertexPosition.push(x);
      sphereVertexPosition.push(y);
      sphereVertexPosition.push(z);

      // for debuggin purposes
      tempVertexCoordinates.push([x, y, z])
    }
  }
  // debug
  console.log(tempVertexCoordinates);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertexPosition), gl.STATIC_DRAW);
  sphereVertexPositionBuffer.itemSize = 3;
  sphereVertexPositionBuffer.numberOfItems = sphereVertexPosition.length

  sphereVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexIndexBuffer);

  var sphereVertexIndices = [];
  var v1 = v2 = v3 = v4 = 0
for (var i=0; i < numberOfParallels; i++) {
   for (var j=0; j < numberOfMeridians; j++) {
    v1 = i*(numberOfMeridians+1) + j;//index of vi,j
    v2 = v1 + 1;     //index of vi,j+1
		v3 = v1 + numberOfMeridians + 1; //index of vi+1,j
    // to complete the last vertex indices (close the sphere)
    // need to do some math so it loops back round
    // if (v3 >= numberOfParallels * (numberOfMeridians+1)) {
    //   v3 = v3 - (numberOfParallels * (numberOfMeridians+1));
    // }
    v4 = v3 + 1;     //index of vi+1,j+1
		// indices of first triangle
		sphereVertexIndices.push(v1);
		sphereVertexIndices.push(v2);
		sphereVertexIndices.push(v3);
		// indices of second triangle
		sphereVertexIndices.push(v3);
		sphereVertexIndices.push(v2);
		sphereVertexIndices.push(v4);

    // debuggin purposes
    tempVertexIdeces.push([v1, v2, v3]);
    tempVertexIdeces.push([v3, v2, v4]);
	}
}
// debug
console.log(tempVertexIdeces);

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereVertexIndices), gl.STATIC_DRAW);
  sphereVertexIndexBuffer.itemSize = 1;
  sphereVertexIndexBuffer.numberOfItems = sphereVertexIndices.length;



}

function setupCubeBuffers() {
  cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

  var cubeVertexPosition = [
     1.0,  1.0,  1.0, //v0
    -1.0,  1.0,  1.0, //v1
    -1.0, -1.0,  1.0, //v2
     1.0, -1.0,  1.0, //v3
     1.0,  1.0, -1.0, //v4
    -1.0,  1.0, -1.0, //v5
    -1.0, -1.0, -1.0, //v6
     1.0, -1.0, -1.0  //v7
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexPosition), gl.STATIC_DRAW);

  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numberOfItems = cubeVertexPosition.length;

  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

  // For simplicity, each face will be drawn as gl.TRIANGLES, therefore
  // the indices for each triangle are specified.
  var cubeVertexIndices = [
    0, 1, 3,    0, 2, 3,    // Front face
    4, 6, 5,    4, 7, 6,    // Back face
    1, 5, 6,    1, 6, 2,    // Left
    0, 3, 7,    0, 7, 4,    // Right
    0, 5, 1,    0, 4, 5,    // Top
    3, 2, 6,    3, 6, 7     // Bottom
  ];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numberOfItems = 36;
}

// Buffers are places for data. All data, e.g., vertex coordinates,
// texture coordinates, indices, colours must be stored in their
// buffers. Here, the buffer is for the vertex coordinates of a triangle
function setupBuffers() {
  setupFloorBuffers();
  // setupCubeBuffers();
  setupSphereBuffers();
}

function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.uniformMVMatrix, false, modelViewMatrix);
}

function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.uniformProjMatrix, false, projectionMatrix);
}

function drawFloor(r,g,b,a) {
  // Disable vertex attrib array and use constant color for the floor.
  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
  // Set colour
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, r, g, b, a);

  // Draw the floor
  gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    floorVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVertexIndexBuffer);
  gl.drawElements(gl.TRIANGLE_FAN, floorVertexIndexBuffer.numberOfItems,
    gl.UNSIGNED_SHORT, 0);
}

function drawSphere(r,g,b,a) {
  // Disable vertex attrib array and use constant color for the cube.
  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
  // Set colour
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, r, g, b, a);
  // gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
  // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
  //    sphereVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Draw the floor
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
  // gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numberOfItems,
  //   gl.UNSIGNED_SHORT, 0);
  // gl.drawArrays(gl.LINE_STRIP, 0, sphereVertexIndexBuffer.numberOfItems);
  gl.drawElements(gl.LINE_STRIP, sphereVertexIndexBuffer.numberOfItems,
    gl.UNSIGNED_SHORT, 0);
}

function drawCube(r,g,b,a) {
  // Disable vertex attrib array and use constant color for the cube.
  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
  // Set colour
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, r, g, b, a);

  // Draw the floor
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numberOfItems,
    gl.UNSIGNED_SHORT, 0);
}


function draw() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(60, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0, projectionMatrix);
  mat4.identity(modelViewMatrix);
  // looking down
  // mat4.lookAt([0, 10, 0], [0, 0, 0], [1, 0, 0], modelViewMatrix);

  // mat4.lookAt([10, 1, 10], [0, 0, 0], [0, 1, 0], modelViewMatrix);
  mat4.lookAt([5, 5, -5], [0, 0, 0], [0, 1, 0], modelViewMatrix);

  uploadModelViewMatrixToShader();
  uploadProjectionMatrixToShader();

  // Draw floor in red color
  // drawFloor(1.0, 0.0, 0.0, 1.0);

  // // Draw box on top of the table
  // pushModelViewMatrix();
  // mat4.translate(modelViewMatrix, [0.0, 4.0, 0.0], modelViewMatrix);
  // mat4.scale(modelViewMatrix, [2.5, 2.5, 2.5], modelViewMatrix);
  // uploadModelViewMatrixToShader();
  // drawCube(0.0, 0.0, 1.0, 1.0);
  // popModelViewMatrix();

  pushModelViewMatrix();
  // mat4.scale(modelViewMatrix, [5, 2.0, 2.6], modelViewMatrix);
  uploadModelViewMatrixToShader();
  drawSphere(0.0, 0.0, 1.0, 1.0);
  popModelViewMatrix();
}


// This function is the entry point of this webgl application
// It is the firts function to be loaded when the html doc is loaded into
function startup() {
  // retrieve html canvas
  canvas = document.getElementById("myGlCanvas");
  // Create webgl contex. Here, the debuggin context is created by calling
  // a functin in the library (createGLContext(canvas))
  gl = WebGLDebugUtils.makeDebugContext(createGLContext(canvas));
  setupShaders();
  setupBuffers();
  // Set the colour to draw width
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(60, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0, projectionMatrix);
  mat4.identity(modelViewMatrix);
  // looking down
  mat4.lookAt([0, 10, 0], [0, 0, 0], [1, 0, 0], modelViewMatrix);

  // mat4.lookAt([10, 1, 10], [0, 0, 0], [0, 1, 0], modelViewMatrix);
  // mat4.lookAt([5, 5, -5], [0, 0, 0], [0, 1, 0], modelViewMatrix);

  uploadModelViewMatrixToShader();
  uploadProjectionMatrixToShader();

  // Draw floor in red color
  // drawFloor(1.0, 0.0, 0.0, 1.0);

  // // Draw box on top of the table
  // pushModelViewMatrix();
  // mat4.translate(modelViewMatrix, [0.0, 4.0, 0.0], modelViewMatrix);
  // mat4.scale(modelViewMatrix, [2.5, 2.5, 2.5], modelViewMatrix);
  // uploadModelViewMatrixToShader();
  // drawCube(0.0, 0.0, 1.0, 1.0);
  // popModelViewMatrix();

  // pushModelViewMatrix();
  // // mat4.scale(modelViewMatrix, [5, 2.0, 2.6], modelViewMatrix);
  // uploadModelViewMatrixToShader();
  // drawSphere(0.0, 0.0, 1.0, 1.0);
  // popModelViewMatrix();
  draw();
}
