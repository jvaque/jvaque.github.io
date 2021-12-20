export default `
precision mediump float;
varying vec2 vTextureCoordinates;
uniform sampler2D uSampler;

void main() {
  gl_FragColor = texture2D(uSampler, vTextureCoordinates);
}
`;
