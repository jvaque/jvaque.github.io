// Define global variables
var gl;
var pwgl = {};
pwgl.ongoingImageLoads = [];
var canvas;

// Import shaders
import vertexShaderGLSL from '/shaders/vertex-shader.glsl.js';
import fragmentShaderGLSL from '/shaders/fragment-shader.glsl.js';

import * as glUtils from '/js/glUtils.js';

// Variables for translations and rotations
var transX = 0;
var transY = 0;
var transZ = 0;

var xRot = 0;
var yRot = 0;
var zRot = 0;

var xOffs = 0;
var yOffs = 0;

var drag = 0;

// Keep track of pressed down keys
pwgl.listOffPressedKeys = [];

// Start of functions
// -----------------------------------------------------------------------------
/*
  Function to set the orbit inclination angle, takes in a angle in degrees and
sets the orbit inclination to that angle converting it to radians
*/
function setInclination(angle) {
  pwgl.orbitInclination = angle * (Math.PI/180);
}

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

  pwgl.uniformNormalMatrixLoc = gl.getUniformLocation(shaderProgram, "uNMatrix");
  pwgl.vertexNormalAttributeLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  pwgl.uniformLighPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");
  pwgl.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");
  pwgl.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  pwgl.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");

  gl.enableVertexAttribArray(pwgl.vertexNormalAttributeLoc);
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

// -----------------------------------------------------------------------------
function setupSphereBuffers() {
  // Sphere attributes
  var sphereParams = {
    numParallels: 200,
    numMeridians: 150
  }

  // Will have to transform the created sphere so that it has a radius of 10 units as
  // addSphereVertexPositionBuffers only creates a unit sphere.

  pwgl.SPHERE = {};

  pwgl.SPHERE.VERTEX_POS = glUtils.addSphereVertexPositionBuffers(gl, sphereParams);

  pwgl.SPHERE.VERTEX_INDEX = glUtils.addSphereVertexIndexBuffers(gl, sphereParams);

  pwgl.SPHERE.VERTEX_TEX_COORD = glUtils.addSphereVertexTextureCoordinateBuffers(gl, sphereParams);

  pwgl.SPHERE.VERTEX_NORMAL = glUtils.addSphereVertexNormalBuffers(gl, sphereParams);
}

// -----------------------------------------------------------------------------
function setupDishBuffers() {
  // Dish attributes
  var radius = 2; //Must be 2 for the coursework
  var numberOfParallels = 50;
  var numberOfMeridians = 25;

  // Set dish vertex position buffers
  pwgl.dishVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.dishVertexPositionBuffer);

  var dishVertexPosition = [];

  var parallelAngle = 0;
  var meridianAngle = 0;
  var x = 0;
  var y = 0;
  var z = 0;

  for (var i = 0; i <= numberOfParallels; i++) {
    parallelAngle = i * 2 * Math.PI / numberOfParallels;
    for (var j = 0; j <= numberOfMeridians; j++) {
      meridianAngle = j * (Math.PI/4) / numberOfMeridians;
      // x coordinate for the parallel
      x = radius * Math.sin(meridianAngle) * Math.cos(parallelAngle);
      // y coordinate for the parallel
      y = radius * Math.cos(meridianAngle);
      // z coordinate for the parallel
      z = radius * Math.sin(meridianAngle) * Math.sin(parallelAngle);

      // push to the vertex position array
      dishVertexPosition.push(x);
      dishVertexPosition.push(y);
      dishVertexPosition.push(z);
    }
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dishVertexPosition), gl.STATIC_DRAW);
  pwgl.DISH_VERTEX_POS_BUF_ITEM_SIZE = 3;
  pwgl.DISH_VERTEX_POS_BUF_NUM_ITEMS = dishVertexPosition.length

  // Set dish vertex indices buffers
  pwgl.dishVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.dishVertexIndexBuffer);

  var dishVertexIndices = [];
  var v1 = 0;
  var v2 = 0;
  var v3 = 0;
  var v4 = 0;

  for (var i=0; i < numberOfParallels; i++) {
    for (var j=0; j < numberOfMeridians; j++) {
      v1 = i*(numberOfMeridians+1) + j;//index of vi,j
      v2 = v1 + 1;     //index of vi,j+1
		  v3 = v1 + numberOfMeridians + 1; //index of vi+1,j
      v4 = v3 + 1;     //index of vi+1,j+1
		  // indices of first triangle
		  dishVertexIndices.push(v1);
		  dishVertexIndices.push(v2);
		  dishVertexIndices.push(v3);
		  // indices of second triangle
		  dishVertexIndices.push(v3);
		  dishVertexIndices.push(v2);
		  dishVertexIndices.push(v4);
	  }
  }

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dishVertexIndices), gl.STATIC_DRAW);
  pwgl.DISH_VERTEX_INDEX_BUF_ITEM_SIZE = 1;
  pwgl.DISH_VERTEX_INDEX_BUF_NUM_ITEMS = dishVertexIndices.length;

  // Set dish vertex texture coordinates buffer
  pwgl.dishVertexTextureCoordinateBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.dishVertexTextureCoordinateBuffer);

  var dishVertexTextureCoodinates = [];
  var texX = 0.0;
  var texY = 0.0;
  var incrementParallel = 1/numberOfParallels;
  var incrementMeridian = 1/numberOfMeridians;

  for (var i=0; i <= numberOfParallels; i++) {
    texX = 1 - (i * incrementParallel);
    for (var j=0; j <= numberOfMeridians; j++) {
      texY = 1 - (j * incrementMeridian);
      // push calculated values into the stack
      dishVertexTextureCoodinates.push(texX, texY);
    }
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dishVertexTextureCoodinates), gl.STATIC_DRAW);
  pwgl.DISH_VERTEX_TEX_COORD_BUF_ITEM_SIZE = 2;
  pwgl.DISH_VERTEX_TEX_COORD_BUF_NUM_ITEMS = dishVertexTextureCoodinates.length;

  // Set dish vertex normals coordinates buffer
  pwgl.dishVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.dishVertexNormalBuffer);

  var dishVertexNormals = [];

  for (var i = 0; i <= numberOfParallels; i++) {
    parallelAngle = i * 2 * Math.PI / numberOfParallels;
    for (var j = 0; j <= numberOfMeridians; j++) {
      meridianAngle = j * (Math.PI/4) / numberOfMeridians;
      // x coordinate for the parallel
      x = Math.sin(meridianAngle) * Math.cos(parallelAngle);
      // y coordinate for the parallel
      y = Math.cos(meridianAngle);
      // z coordinate for the parallel
      z = Math.sin(meridianAngle) * Math.sin(parallelAngle);

      // push to the vertex position array
      dishVertexNormals.push(x);
      dishVertexNormals.push(y);
      dishVertexNormals.push(z);
    }
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dishVertexNormals), gl.STATIC_DRAW);
  pwgl.DISH_VERTEX_NORMAL_BUF_ITEM_SIZE = 3;
  pwgl.DISH_VERTEX_NORMAL_BUF_NUM_ITEMS = dishVertexNormals.length;
}

// -----------------------------------------------------------------------------

function setupCubeBuffers() {
  pwgl.CUBE = {};

  pwgl.CUBE.VERTEX_POS = glUtils.addCubeVertexPositionBuffers(gl);

  pwgl.CUBE.VERTEX_INDEX = glUtils.addCubeVertexIndexBuffers(gl);

  // pwgl.CUBE.VERTEX_TEX_COORD = glUtils.addCubeVertexTextureCoordinateBuffers(gl);
  pwgl.CUBE.VERTEX_TEX_COORD = glUtils.addCubeVertexTextureCoordinateBuffersUniqueSides(gl);

  pwgl.CUBE.VERTEX_NORMAL = glUtils.addCubeVertexNormalBuffers(gl);
}

function setupLights() {
  gl.uniform3fv(pwgl.uniformLighPositionLoc, [25, 43.30127019, 0]);
  gl.uniform3fv(pwgl.uniformAmbientLightColorLoc, [0.2, 0.2, 0.2]);
  gl.uniform3fv(pwgl.uniformDiffuseLightColorLoc, [0.7, 0.7, 0.7]);
  gl.uniform3fv(pwgl.uniformSpecularLightColorLoc, [0.8, 0.8, 0.8]);
}

function uploadNormalMatrixToShader() {
  var normalMatrix = mat3.create();
  mat4.toInverseMat3(pwgl.modelViewMatrix, normalMatrix);
  mat3.transpose(normalMatrix);
  gl.uniformMatrix3fv(pwgl.uniformNormalMatrixLoc, false, normalMatrix);
}

function setupTextures() {
  // Test texture
  pwgl.testTexture = gl.createTexture();
  loadImageForTexture("textures/test_image.jpg", pwgl.testTexture);

  // Texture for the connecting rods
  pwgl.goldenTexture = gl.createTexture();
  loadImageForTexture("textures/gold_foil.jpg", pwgl.goldenTexture);

  // Texture for the solar panel
  pwgl.solarTexture = gl.createTexture();
  loadImageForTexture("textures/solar_panel.jpg", pwgl.solarTexture);

  // Texture for the body of the satelite
  pwgl.sateliteTexture = gl.createTexture();
  loadImageForTexture("textures/satelite_body.jpg", pwgl.sateliteTexture);

  pwgl.sphereTexture = gl.createTexture();
  loadImageForTexture("textures/earth.jpg", pwgl.sphereTexture);
  // loadImageForTexture("textures/land_ocean_ice_cloud_2048.jpg", pwgl.sphereTexture);
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function setupBuffers() {
  setupCubeBuffers();
  setupSphereBuffers();
  setupDishBuffers();
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
// -----------------------------------------------------------------------------
function drawSphere(texture) {
  // Draw the sphere
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.SPHERE.VERTEX_POS.Buffer);
  gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc,
                         pwgl.SPHERE.VERTEX_POS.BUF_ITEM_SIZE,
                         gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.SPHERE.VERTEX_NORMAL.Buffer);
  gl.vertexAttribPointer(pwgl.vertexNormalAttributeLoc,
                        pwgl.SPHERE.VERTEX_NORMAL.BUF_ITEM_SIZE,
                        gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.SPHERE.VERTEX_TEX_COORD.Buffer);
  gl.vertexAttribPointer(pwgl.vertexTextureAttributeLoc,
                         pwgl.SPHERE.VERTEX_TEX_COORD.BUF_ITEM_SIZE,
                         gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.SPHERE.VERTEX_INDEX.Buffer);
  gl.drawElements(gl.TRIANGLES, pwgl.SPHERE.VERTEX_INDEX.BUF_NUM_ITEMS,
    gl.UNSIGNED_SHORT, 0);
}

// -----------------------------------------------------------------------------
function drawDish(texture) {
  // Draw the dish
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.dishVertexPositionBuffer);
  gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc,
                         pwgl.DISH_VERTEX_POS_BUF_ITEM_SIZE,
                         gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.dishVertexNormalBuffer);
  gl.vertexAttribPointer(pwgl.vertexNormalAttributeLoc,
                         pwgl.DISH_VERTEX_NORMAL_BUF_ITEM_SIZE,
                         gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.dishVertexTextureCoordinateBuffer);
  gl.vertexAttribPointer(pwgl.vertexTextureAttributeLoc,
                         pwgl.DISH_VERTEX_TEX_COORD_BUF_ITEM_SIZE,
                         gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.dishVertexIndexBuffer);
  gl.drawElements(gl.TRIANGLES, pwgl.DISH_VERTEX_INDEX_BUF_NUM_ITEMS,
    gl.UNSIGNED_SHORT, 0);
}

// -----------------------------------------------------------------------------
function drawCube(texture) {
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.CUBE.VERTEX_POS.Buffer);
  gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc,
                         pwgl.CUBE.VERTEX_POS.BUF_ITEM_SIZE,
                         gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.CUBE.VERTEX_NORMAL.Buffer);
  gl.vertexAttribPointer(pwgl.vertexNormalAttributeLoc,
                          pwgl.CUBE.VERTEX_NORMAL.BUF_ITEM_SIZE,
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

function drawEarth() {
  pushModelViewMatrix();
  // Sphere radius must be 10 units for coursework
  mat4.scale(pwgl.modelViewMatrix, [10, 10, 10], pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  drawSphere(pwgl.sphereTexture);
  popModelViewMatrix();
}

function drawSatelite() {
  pushModelViewMatrix();
  uploadModelViewMatrixToShader();
  // drawCube(pwgl.testTexture);
  drawCube(pwgl.sateliteTexture);
  popModelViewMatrix();

  pushModelViewMatrix(); //Connenting rod 1
  mat4.translate(pwgl.modelViewMatrix, [0.0, 0.0, 1.25], pwgl.modelViewMatrix);
  mat4.scale(pwgl.modelViewMatrix, [0.1, 0.1, 0.25], pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  drawCube(pwgl.goldenTexture);
  popModelViewMatrix()

  pushModelViewMatrix(); //Connenting rod 2
  mat4.translate(pwgl.modelViewMatrix, [0.0, 0.0, -1.25], pwgl.modelViewMatrix);
  mat4.scale(pwgl.modelViewMatrix, [0.1, 0.1, 0.25], pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  drawCube(pwgl.goldenTexture);
  popModelViewMatrix()

  pushModelViewMatrix(); //Solar panel 1
  mat4.translate(pwgl.modelViewMatrix, [0.0, 0.0, 2.5], pwgl.modelViewMatrix);
  // mat4.scale(pwgl.modelViewMatrix, [0, 0.5, 1.0], pwgl.modelViewMatrix);
  mat4.scale(pwgl.modelViewMatrix, [0.5, 0.0, 1.0], pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  drawCube(pwgl.solarTexture);
  popModelViewMatrix()

  pushModelViewMatrix(); //Solar panel 2
  mat4.translate(pwgl.modelViewMatrix, [0.0, 0.0, -2.5], pwgl.modelViewMatrix);
  // mat4.scale(pwgl.modelViewMatrix, [0, 0.5, 1.0], pwgl.modelViewMatrix);
  mat4.scale(pwgl.modelViewMatrix, [0.5, 0.0, 1.0], pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  drawCube(pwgl.solarTexture);
  popModelViewMatrix()

  pushModelViewMatrix(); //Connenting rod 3
  mat4.translate(pwgl.modelViewMatrix, [-1.2, 0.0, 0.0], pwgl.modelViewMatrix);
  mat4.scale(pwgl.modelViewMatrix, [0.2, 0.1, 0.1 ], pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  drawCube(pwgl.goldenTexture);
  popModelViewMatrix()

  pushModelViewMatrix(); //Satelite dish
  mat4.translate(pwgl.modelViewMatrix, [-3.4, 0.0, 0.0], pwgl.modelViewMatrix);
  mat4.rotateZ(pwgl.modelViewMatrix, Math.PI*3/2, pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  drawDish(pwgl.goldenTexture);
  popModelViewMatrix()
}

function init() {
  // Initialization that is performed during first startup and when the
  // event webglcontextrestored is received is concluded in this function
  setupShaders();
  setupBuffers();
  setupLights();
  setupTextures();
  // gl.clearColor(0.9, 0.9, 0.9, 1.0); //Someting that is not black or white
  // gl.clearColor(1.0, 1.0, 1.0, 1.0); //White background
  gl.clearColor(0.0, 0.0, 0.0, 1.0); //Black background
  gl.enable(gl.DEPTH_TEST);

  // Initialize some variables for the satelite
  pwgl.x = 0.0;
  pwgl.y = 0.0;
  pwgl.z = 0.0;
  pwgl.orbitRadius = 20.0;
  pwgl.orbitInclination = 0.0;
  pwgl.sateliteSpeed = 30.0;

  // Earth rotation period in miliseconds
  pwgl.earthPeriod = 24000;

  // Initialize some variables related to the animation
  pwgl.animationStartTime = undefined;
  pwgl.nbrOfFramesForFPS = 0;
  pwgl.previousFrameTimeStamp = Date.now();

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(60, gl.viewportWidth/gl.viewportHeight, 1, 100.0, pwgl.projectionMatrix);
  mat4.identity(pwgl.modelViewMatrix);
  // Camera
  // mat4.lookAt([-5, 2, 0], [0, 0, 0], [0, 1, 0], pwgl.modelViewMatrix); //Closeup for the satelite
  // mat4.lookAt([7, 0, 0], [0, 0, 0], [0, 1, 0], pwgl.modelViewMatrix);
  // mat4.lookAt([0, 0, 40], [0, 0, 0], [0, 1, 0], pwgl.modelViewMatrix); //Front view
  // mat4.lookAt([25, 43.30127019, 0], [0, 0, 0], [0, 1, 0], pwgl.modelViewMatrix); //View from light source
  // mat4.lookAt([0, 30, 0], [0, 0, 0], [-1, 0, 0], pwgl.modelViewMatrix); //Top down
  // mat4.lookAt([7, 5, 7], [0, 0, 0], [0, 1, 0], pwgl.modelViewMatrix);
  mat4.lookAt([25, 20, 25], [0, 0, 0], [0, 1, 0], pwgl.modelViewMatrix); //Good view
  // mat4.lookAt([0, 11, 0], [0, 0, 0], [0, 0, 1], pwgl.modelViewMatrix);
}

function draw() {
  pwgl.requestId = requestAnimFrame(draw);

  var currentTime = Date.now();

  handlePressedDownKeys();

  // Update FPS if a second or more has passed since the last FPS update
  if(currentTime - pwgl.previousFrameTimeStamp >= 1000) {
    pwgl.fpsCounter.innerHTML = pwgl.nbrOfFramesForFPS;
    pwgl.nbrOfFramesForFPS = 0;
    pwgl.previousFrameTimeStamp = currentTime;
  }
  // Update the rest of the screen variables
  pwgl.speed.innerHTML = pwgl.sateliteSpeed;
  pwgl.circleRadius.innerHTML = pwgl.orbitRadius;
  pwgl.orbitPeriod.innerHTML = pwgl.satelitePeriod;
  pwgl.orbitAngle.innerHTML = pwgl.orbitInclination * 180/Math.PI;

  // console.log("1   xRot= " + xRot + "   yRot= " + yRot + "   t= " + transl);
  mat4.translate(pwgl.modelViewMatrix, [transX, transY, transZ],  pwgl.modelViewMatrix);
  mat4.rotateX(pwgl.modelViewMatrix, xRot/50, pwgl.modelViewMatrix);
  mat4.rotateY(pwgl.modelViewMatrix, yRot/50, pwgl.modelViewMatrix);
  mat4.rotateZ(pwgl.modelViewMatrix, zRot/50, pwgl.modelViewMatrix);
  yRot = xRot = zRot = transX = transY = transZ = 0;

  uploadModelViewMatrixToShader();
  uploadProjectionMatrixToShader();
  uploadNormalMatrixToShader();
  // Note: in uniform1i next line "1" is "one" not "L"!! Check WebGL for
  // unifrorm2i, 2v, 3i, 3v
  gl.uniform1i(pwgl.uniformSamplerLoc, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw earth
  pushModelViewMatrix();
  if (currentTime === undefined) {
    currentTime = Date.now();
  }
  if (pwgl.animationStartTime === undefined) {
    pwgl.animationStartTime = currentTime;
  }
  pwgl.earthAngle = -(currentTime - pwgl.animationStartTime)/pwgl.earthPeriod*2*Math.PI % (2*Math.PI);
  mat4.rotateY(pwgl.modelViewMatrix, -pwgl.earthAngle, pwgl.modelViewMatrix);
  uploadModelViewMatrixToShader();
  uploadNormalMatrixToShader();
  drawEarth();
  popModelViewMatrix();

  // // Draw Satelite (just to get the elements of in in place)
  // // Delete for the final version
  // pushModelViewMatrix();
  // uploadModelViewMatrixToShader();
  // uploadNormalMatrixToShader();
  // drawSatelite();
  // popModelViewMatrix();

  // Draw orbiting satelite.
  pushModelViewMatrix();
  if (currentTime === undefined) {
    currentTime = Date.now();
  }
  if (pwgl.animationStartTime === undefined) {
    pwgl.animationStartTime = currentTime;
  }

  pwgl.satelitePeriod = (2*Math.PI*pwgl.orbitRadius*1000)/(pwgl.sateliteSpeed);
  pwgl.sateliteAngle = -(currentTime - pwgl.animationStartTime)/pwgl.satelitePeriod*2*Math.PI % (2*Math.PI);
  pwgl.x = Math.cos(pwgl.sateliteAngle) * pwgl.orbitRadius;
  pwgl.z = Math.sin(pwgl.sateliteAngle) * pwgl.orbitRadius;

  mat4.rotateZ(pwgl.modelViewMatrix, pwgl.orbitInclination, pwgl.modelViewMatrix);
  mat4.translate(pwgl.modelViewMatrix, [pwgl.x, pwgl.y, pwgl.z], pwgl.modelViewMatrix);
  mat4.rotateY(pwgl.modelViewMatrix, -pwgl.sateliteAngle, pwgl.modelViewMatrix);
  mat4.scale(pwgl.modelViewMatrix, [0.5, 0.5, 0.5], pwgl.modelViewMatrix);

  uploadModelViewMatrixToShader();
  uploadNormalMatrixToShader();
  drawSatelite();
  popModelViewMatrix();

  pwgl.nbrOfFramesForFPS++;
}

function handleKeyDown(event) {
  pwgl.listOffPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
  pwgl.listOffPressedKeys[event.keyCode] = false;
}

function handlePressedDownKeys() {
  if (pwgl.listOffPressedKeys[39]) {
    // Arrow right, increase radius of circle
    pwgl.orbitRadius += 0.1;
  }
  if (pwgl.listOffPressedKeys[37]) {
    // Arrow left, decrease radius of circle
    pwgl.orbitRadius -= 0.1;
    if (pwgl.orbitRadius < 0) {
      pwgl.orbitRadius = 0;
    }
  }
  if (pwgl.listOffPressedKeys[38]) {
    // Arrow up, increase speed of orbit
    pwgl.sateliteSpeed += 1;
  }
  if (pwgl.listOffPressedKeys[40]) {
    pwgl.sateliteSpeed -= 1;
    if (pwgl.sateliteSpeed < 0) {
      pwgl.sateliteSpeed = 0;
    }
  }
  if (pwgl.listOffPressedKeys[87]) {
    // "w", increase orbit angle
    pwgl.orbitInclination += 0.01;
    pwgl.orbitInclination %= Math.PI*2;
  }
  if (pwgl.listOffPressedKeys[83]) {
    // "s", decrease orbit angle
    pwgl.orbitInclination -= 0.01;
    pwgl.orbitInclination %= Math.PI*2;
    if (pwgl.orbitInclination < 0) {
      pwgl.orbitInclination += Math.PI*2;
    }
  }
}

function mymousedown(ev) {
  drag = 1;
  xOffs = ev.clientX;
  yOffs = ev.clientY;
}

function mymouseup(ev) {
  drag = 0;
}

function mymousemove(ev) {
  if (drag == 0) return;
  if (ev.shiftKey) {
    transX = (ev.clientY - yOffs)/10;
  } else if (ev.altKey) {
    transY = -(ev.clientY - yOffs)/10;
  } else if (ev.ctrlKey) {
    zRot = ( yOffs - ev.clientY)/10;
  } else {
    yRot = (- xOffs + ev.clientX)/10;
    xRot = (- yOffs + ev.clientY)/10;
    // console.log("xOffs= "+xOffs+"   yOffs="+yOffs);
  }
}

function wheelHandler(ev) {
  if (ev.altKey) transY = -ev.detail/10;
  else if (ev.shiftKey) transX = -ev.detail/10;
  else transZ = ev.detail/10;
  // console.log("delta = "+ev.detail);
  ev.preventDefault();
}

// This function is the entry point of this webgl application
// It is the firts function to be loaded when the html doc is loaded into
function startup() {
  // retrieve html canvas
  canvas = document.getElementById("myGlCanvas");
  canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
  canvas.addEventListener('webglcontextlost', handleContextLost, false);
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

  document.addEventListener('keydown', handleKeyDown, false);
  document.addEventListener('keyup', handleKeyUp, false);
  canvas.addEventListener('mousemove', mymousemove, false);
  canvas.addEventListener('mousedown', mymousedown, false);
  canvas.addEventListener('mouseup', mymouseup, false);
  canvas.addEventListener('mousewheel', wheelHandler, false);
  canvas.addEventListener('DOMMouseScroll', wheelHandler, false);

  gl = glUtils.createGLContext(canvas);

  init();

  pwgl.fpsCounter = document.getElementById("fps");
  pwgl.speed = document.getElementById("speed");
  pwgl.circleRadius = document.getElementById("circleRadius");
  pwgl.orbitPeriod = document.getElementById("satelitePeriod");
  pwgl.orbitAngle = document.getElementById("orbitAngle");
  // Draw the complete scene
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
  init();
  pwgl.requestId = requestAnimFrame(draw, canvas);
}

function main(){
  startup();
}

window.addEventListener('load', main)