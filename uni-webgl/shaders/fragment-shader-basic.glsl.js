export default `
precision mediump float;
varying vec2 vTextureCoordinates;
varying vec3 vLightWeighting;
uniform sampler2D uSampler;

void main() {
  vec4 texelColor = texture2D(uSampler, vTextureCoordinates);
  gl_FragColor = vec4(vLightWeighting.rgb * texelColor.rgb, texelColor.a);
}
`;
