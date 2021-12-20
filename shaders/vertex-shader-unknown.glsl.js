export default `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoordinates;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform mat3 uNMatrix;

uniform vec3 uLightPosition;
uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;

varying vec2 vTextureCoordinates;
varying vec3 vLightWeighting;

const float shininess = 32.0;

void main() {
  // Get the vertex position in camera/eye coordinates and convert
  // the homogeneous coordinates back to the usual 3D coordinates
  // for subsequent calculations.
  vec4 vertexPositionEye4 = uMVMatrix * vec4(aVertexPosition, 1.0);
  vec3 vertexPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;
  
  // Calculate the vector (L) to the point light source
  // First, transform the coordinate of light source into
  // eye coordinate system
  vec4 lightPositionEye4 = uMVMatrix * vec4(uLightPosition, 1.0);
  vec3 lightPositionEye3 = lightPositionEye4.xyz / lightPositionEye4.w;
  // Calculate the vector L
  vec3 vectorToLightSource = normalize(lightPositionEye3 - vertexPositionEye3);
  
  // The following line of code provides a different way to calculate
  // vector L. What is the difference between the two approaches?
  // Try it out
  // vec3 vectorToLightSource = normalize(uLightPosition - vertexPositionEye3);
  
  // Transform the normal (N) to eye coordinates
  vec3 normalEye = normalize(uNMatrix * aVertexNormal);
  
  // Calculate N dot L for diffuse lighting
  float diffuseLightWeighting = max(dot(normalEye, vectorToLightSource), 0.0);
  
  // Calculate the reflection vector (R) that is needed for specular
  // light. Function reflect() is the GLSL function for calculation
  // of the reflective vector R.
  vec3 reflectionVector = normalize(reflect(-vectorToLightSource, normalEye));
  
  // In terms of the camera coordinate system, the camera/eye
  // is always located at in the origin (0.0, 0.0, 0.0) (because the
  // coordinate system is rigidly attached to the camera)
  // Calculate view vector (V) in camera coordinates as:
  // (0.0, 0.0, 0.0) - vertexPositionEye3
  vec3 viewVectorEye = -normalize(vertexPositionEye3);
  float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);
  float specularLightWeighting = pow(rdotv, shininess);
  
  // Sum up all three reflection components and send to the fragment
  // shader
  vLightWeighting = uAmbientLightColor +
  uDiffuseLightColor * diffuseLightWeighting +
  uSpecularLightColor * specularLightWeighting;
  
  // Finally transform the geometry
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vTextureCoordinates = aTextureCoordinates;
}
`;
