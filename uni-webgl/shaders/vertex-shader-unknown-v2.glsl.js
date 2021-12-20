export default `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoordinates;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoordinates;

void main() {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vTextureCoordinates = aTextureCoordinates;
}
`;
