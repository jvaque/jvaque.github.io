export default `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoordinates;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform mat3 uNMatrix;

varying vec2 vTextureCoordinates;
varying vec3 vNormalEye;
varying vec3 vPositionEye3;

void main() {
    // Get the vertex position in camera/eye coordinates and send
    // to the fragment shader
    vec4 vertexPositionEye4 = uMVMatrix * vec4(aVertexPosition, 1.0);
    vPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;

    // Transform the normal to eye coordinates and send to fragment shader
    vNormalEye = normalize(uNMatrix * aVertexNormal);

    // Transform the geometry
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoordinates = aTextureCoordinates;
}
`;
