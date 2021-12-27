export default `
precision mediump float;
varying vec2 vTextureCoordinates;
varying vec3 vNormalEye;
varying vec3 vPositionEye3;

uniform vec3 uLightPosition;
uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;
uniform sampler2D uSampler;

const float shininess = 64.0;

void main() {
    // Calculate the vector (L) to the light source
    vec3 vectorToLightSource = normalize(uLightPosition - vPositionEye3);

    // Calculate N dot L for diffuse lighting
    float diffuseLightWeighting = max(dot(vNormalEye, vectorToLightSource), 0.0);

    // Calculate the reflection vector (R) that is needed for specular light
    vec3 reflectionVector = normalize(reflect(-vectorToLightSource, vNormalEye));

    // Calculate view vector (V) in eye coordinates as
    // (0.0, 0.0, 0.0) - vPositionEye3
    vec3 viewVectorEye = -normalize(vPositionEye3);
    float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);
    float specularLightWeighting = pow(rdotv, shininess);

    // Sum up all three reflection components
    vec3 lightWeighting = uAmbientLightColor +
    uDiffuseLightColor * diffuseLightWeighting +
    uSpecularLightColor * specularLightWeighting;

    // Sample the texture
    vec4 texelColor = texture2D(uSampler, vTextureCoordinates);

    // Modulate texel color with lightweighthing and write as final color
    gl_FragColor = vec4(lightWeighting.rgb * texelColor.rgb, texelColor.a);
}
`;
