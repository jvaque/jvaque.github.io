export function loadShader(gl, shaderScript, shaderType) {
    // If the function is called without passing in a shader script we do an 
    // early exit
    if (!shaderScript) {
        return null;
    }

    // Create a WebGL shader object according to type of shader, i.e.,
    // vertex or fragment shader.
    var shader;
    if (shaderType == "x-shader/x-fragment") {
        // Call WebGL function createShader() to create fragment shader object
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderType == "x-shader/x-vertex") {
        // Call WebGL function createShader() to create vertex shader object
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    // Load the shader source code (shaderScript) to the shader object
    gl.shaderSource(shader, shaderScript);
    // Compile the shader
    gl.compileShader(shader);

    // Check compiling status
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/*
  Creates the WebGL context for the canvas, returning said context
*/
export function createGLContext(canvas) {
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
        alert(`Failed to create WebGL context on ${canvas.id}!`);
    }

    return context;
}

export function addSphereVertexPositionBuffers(gl, sphereParams) {
    // Set sphere vertex position buffers
    const sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);

    var sphereVertexPosition = [];

    var parallelAngle = 0;
    var meridianAngle = 0;
    var x = 0;
    var y = 0;
    var z = 0;

    // radius is temp to see if it breaks stuff
    for (var i = 0; i <= sphereParams.numParallels; i++) {
        parallelAngle = i * 2 * Math.PI / sphereParams.numParallels;
        for (var j = 0; j <= sphereParams.numMeridians; j++) {
            meridianAngle = j * Math.PI / sphereParams.numMeridians;
            // x coordinate for the parallel
            x = Math.sin(meridianAngle) * Math.cos(parallelAngle);
            // y coordinate for the parallel
            y = Math.cos(meridianAngle);
            // z coordinate for the parallel
            z = Math.sin(meridianAngle) * Math.sin(parallelAngle);

            // push to the vertex position array
            sphereVertexPosition.push(x);
            sphereVertexPosition.push(y);
            sphereVertexPosition.push(z);
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertexPosition), gl.STATIC_DRAW);

    return {
        Buffer: sphereVertexPositionBuffer,
        BUF_ITEM_SIZE: 3,
        BUF_NUM_ITEMS: sphereVertexPosition.length
    };
}

export function addSphereVertexIndexBuffers(gl, sphereParams) {
    const sphereVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);

    var sphereVertexIndices = [];

    var v1 = 0;
    var v2 = 0;
    var v3 = 0;
    var v4 = 0;

    for (var i=0; i < sphereParams.numParallels; i++) {
        for (var j=0; j < sphereParams.numMeridians; j++) {
            v1 = i * (sphereParams.numMeridians + 1) + j;   //index of vi,j
            v2 = v1 + 1;                                    //index of vi,j+1
            v3 = v1 + sphereParams.numMeridians + 1;        //index of vi+1,j
            v4 = v3 + 1;                                    //index of vi+1,j+1
            
            // indices of first triangle
            sphereVertexIndices.push(v1);
            sphereVertexIndices.push(v2);
            sphereVertexIndices.push(v3);
            // indices of second triangle
            sphereVertexIndices.push(v3);
            sphereVertexIndices.push(v2);
            sphereVertexIndices.push(v4);
        }
    }

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereVertexIndices), gl.STATIC_DRAW);

    return {
        Buffer: sphereVertexIndexBuffer,
        BUF_ITEM_SIZE: 1,
        BUF_NUM_ITEMS: sphereVertexIndices.length,
    }
}

export function addSphereVertexTextureCoordinateBuffers(gl, sphereParams) {
    // Set sphere vertex texture coordinates buffer
    const sphereVertexTextureCoordinateBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordinateBuffer);

    var sphereVertexTextureCoodinates = [];
    var texX = 0.0;
    var texY = 0.0;
    var incrementParallel = 1/sphereParams.numParallels;
    var incrementMeridian = 1/sphereParams.numMeridians;

    for (var i=0; i <= sphereParams.numParallels; i++) {
        texX = 1 - (i * incrementParallel);
        for (var j=0; j <= sphereParams.numMeridians; j++) {
            texY = 1 - (j * incrementMeridian);
            // push calculated values into the stack
            sphereVertexTextureCoodinates.push(texX, texY);
        }
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertexTextureCoodinates), gl.STATIC_DRAW);

    return {
        Buffer: sphereVertexTextureCoordinateBuffer,
        BUF_ITEM_SIZE: 2,
        BUF_NUM_ITEMS: sphereVertexTextureCoodinates.length,
    }
}

export function addSphereVertexNormalBuffers(gl, sphereParams) {
    // Set sphere vertex normals coordinates buffer
    const sphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);

    var sphereVertexNormals = [];

    var parallelAngle = 0;
    var meridianAngle = 0;
    var x = 0;
    var y = 0;
    var z = 0;

    for (var i = 0; i <= sphereParams.numParallels; i++) {
        parallelAngle = i * 2 * Math.PI / sphereParams.numParallels;
        for (var j = 0; j <= sphereParams.numMeridians; j++) {
            meridianAngle = j * Math.PI / sphereParams.numMeridians;
            // x coordinate for the parallel
            x = Math.sin(meridianAngle) * Math.cos(parallelAngle);
            // y coordinate for the parallel
            y = Math.cos(meridianAngle);
            // z coordinate for the parallel
            z = Math.sin(meridianAngle) * Math.sin(parallelAngle);

            // push to the vertex position array
            sphereVertexNormals.push(x);
            sphereVertexNormals.push(y);
            sphereVertexNormals.push(z);
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertexNormals), gl.STATIC_DRAW);

    return {
        Buffer: sphereVertexNormalBuffer,
        BUF_ITEM_SIZE: 3,
        BUF_NUM_ITEMS: sphereVertexNormals.length
    }
}

export function addCubeVertexPositionBuffers(gl) {
    const cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

    var cubeVertexPosition = [
        // Front face
         1.0,  1.0,  1.0, //v0
        -1.0,  1.0,  1.0, //v1
        -1.0, -1.0,  1.0, //v2
         1.0, -1.0,  1.0, //v3

        // Back face
         1.0,  1.0, -1.0, //v4
        -1.0,  1.0, -1.0, //v5
        -1.0, -1.0, -1.0, //v6
         1.0, -1.0, -1.0, //v7

        // Left face
        -1.0,  1.0,  1.0, //v8
        -1.0,  1.0, -1.0, //v9
        -1.0, -1.0, -1.0, //v10
        -1.0, -1.0,  1.0, //v11

        // Right face
         1.0,  1.0,  1.0, //v12
         1.0, -1.0,  1.0, //v13
         1.0, -1.0, -1.0, //v14
         1.0,  1.0, -1.0, //v15

        // Top face
         1.0,  1.0,  1.0, //v16
         1.0,  1.0, -1.0, //v17
        -1.0,  1.0, -1.0, //v18
        -1.0,  1.0,  1.0, //v19

        // Bottom face
         1.0, -1.0,  1.0, //v20
         1.0, -1.0, -1.0, //v21
        -1.0, -1.0, -1.0, //v22
        -1.0, -1.0,  1.0, //v23
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexPosition), gl.STATIC_DRAW);

    return {
        Buffer: cubeVertexPositionBuffer,
        BUF_ITEM_SIZE: 3,
        BUF_NUM_ITEMS: 24
    };
}

export function addCubeVertexIndexBuffers(gl) {
    const cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

    // For simplicity, each face will be drawn as gl.TRIANGLES, therefore
    // the indices for each triangle are specified.
    var cubeVertexIndices = [
         0,  1,  2,    0,  2,  3,    // Front face
         4,  6,  5,    4,  7,  6,    // Back face
         8,  9, 10,    8, 10, 11,    // Left face
        12, 13, 14,   12, 14, 15,    // Right face
        16, 17, 18,   16, 18, 19,    // Top face
        20, 22, 21,   20, 23, 22     // Bottom face
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

    return {
        Buffer: cubeVertexIndexBuffer,
        BUF_ITEM_SIZE: 1,
        BUF_NUM_ITEMS: 36,
    }
}

export function addCubeVertexTextureCoordinateBuffers(gl) {
    // Setup buffer with texture coordinates
    const cubeVertexTextureCoordinateBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordinateBuffer);

    // Think about how the coordinates are asigned. Ref. vertex coords.
    var textureCoodinates = [
        // Front face
        0.0, 0.0, //v0
        1.0, 0.0, //v1
        1.0, 1.0, //v2
        0.0, 1.0, //v3

        // Back face
        0.0, 1.0, //v4
        1.0, 1.0, //v5
        1.0, 0.0, //v6
        0.0, 0.0, //v7

        // Left face
        0.0, 1.0, //v1
        1.0, 1.0, //v5
        1.0, 0.0, //v6
        0.0, 0.0, //v2

        // Right face
        0.0, 1.0, //v0
        1.0, 1.0, //v3
        1.0, 0.0, //v7
        0.0, 0.0, //v4

        // Top face
        0.0, 1.0, //v0
        1.0, 1.0, //v4
        1.0, 0.0, //v5
        0.0, 0.0, //v1

        // Bottom face
        0.0, 1.0, //v3
        1.0, 1.0, //v7
        1.0, 0.0, //v6
        0.0, 0.0  //v2
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoodinates), gl.STATIC_DRAW);

    return {
        Buffer: cubeVertexTextureCoordinateBuffer,
        BUF_ITEM_SIZE: 2,
        BUF_NUM_ITEMS: 24,
    }
}

export function addCubeVertexTextureCoordinateBuffersUniqueSides(gl) {
    // Setup buffer with texture coordinates
    const cubeVertexTextureCoordinateBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordinateBuffer);

    // Think about how the coordinates are asigned. Ref. vertex coords.
    var textureCoodinates = [
        // Front face
        0.0, 0.5, //v0
        1/3, 0.5, //v1
        1/3, 1.0, //v2
        0.0, 1.0, //v3

        // Back face
        1/3, 1.0, //v4
        2/3, 1.0, //v5
        2/3, 0.5, //v6
        1/3, 0.5, //v7

        // Left face
        2/3, 1.0, //v1
        1.0, 1.0, //v5
        1.0, 0.5, //v6
        2/3, 0.5, //v2

        // Right face
        0.0, 0.5, //v0
        1/3, 0.5, //v3
        1/3, 0.0, //v7
        0.0, 0.0, //v4

        // Top face
        1/3, 0.5, //v0
        2/3, 0.5, //v4
        2/3, 0.0, //v5
        1/3, 0.0, //v1

        // Bottom face
        2/3, 0.5, //v3
        1.0, 0.5, //v7
        1.0, 0.0, //v6
        2/3, 0.0  //v2
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoodinates), gl.STATIC_DRAW);

    return {
        Buffer: cubeVertexTextureCoordinateBuffer,
        BUF_ITEM_SIZE: 2,
        BUF_NUM_ITEMS: 24,
    }
}

export function addCubeVertexNormalBuffers(gl){
    // Setup normal buffer for lighting calculations
    const cubeVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);

    var cubeVertexNormals = [
        // Front face
         0.0,  0.0,  1.0, //v0
         0.0,  0.0,  1.0, //v1
         0.0,  0.0,  1.0, //v2
         0.0,  0.0,  1.0, //v3

        // Back face
         0.0,  0.0, -1.0, //v4
         0.0,  0.0, -1.0, //v5
         0.0,  0.0, -1.0, //v6
         0.0,  0.0, -1.0, //v7

        // Left face
        -1.0,  0.0,  0.0, //v1
        -1.0,  0.0,  0.0, //v5
        -1.0,  0.0,  0.0, //v6
        -1.0,  0.0,  0.0, //v2

        // Right face
         1.0,  0.0,  0.0, //v0
         1.0,  0.0,  0.0, //v3
         1.0,  0.0,  0.0, //v7
         1.0,  0.0,  0.0, //v4

        // Top face
         0.0,  1.0,  0.0, //v0
         0.0,  1.0,  0.0, //v4
         0.0,  1.0,  0.0, //v5
         0.0,  1.0,  0.0, //v1

        // Bottom face
         0.0, -1.0,  0.0, //v3
         0.0, -1.0,  0.0, //v7
         0.0, -1.0,  0.0, //v6
         0.0, -1.0,  0.0, //v2
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexNormals), gl.STATIC_DRAW);

    return {
        Buffer: cubeVertexNormalBuffer,
        BUF_ITEM_SIZE: 3,
        BUF_NUM_ITEMS: 24,
    }
}
