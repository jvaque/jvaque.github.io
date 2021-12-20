export default `
precision mediump float;
varying vec2 vTextureCoordinates;
varying vec3 vNormalEye;
varying vec3 vPositionEye3;

uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;
uniform vec3 uLightPosition;
uniform vec3 uSpotDirection;
uniform sampler2D uSampler;

const float shininess = 32.0;
const float spotExponent = 40.0;

// cutoff angle for spot light
const float spotCosCutoff = 0.97; // Corresponds to 14 degrees

vec3 lightWeighting = vec3(0.0, 0.0, 0.0);

void main() {
    // Calculate the vector (L) to the light source
    vec3 vectorToLightSource = normalize(uLightPosition - vPositionEye3);

    // Calculate N dot L for diffuse lighting
    float diffuseLightWeighting = max(dot(vNormalEye, vectorToLightSource), 0.0);

    // We only do spot and specular light calculations if we
    // have diffuse light term.
    if (diffuseLightWeighting > 0.0) {
        // Calculate the intensity of spot light in the direction of
        // vectorToLightSource.
        float spotEffect = dot(normalize(uSpotDirection), normalize(-vectorToLightSource));

        // Check that we are inside the spot light cone
        if (spotEffect > spotCosCutoff) {
        spotEffect = pow(spotEffect, spotExponent);

        // Calculate the reflection vector (R) needed for specular light
        vec3 reflectionVector = normalize(reflect(-vectorToLightSource, vNormalEye));

        // Calculate view vector (V) in eye coordinates as
        // (0.0, 0.0, 0.0) - vPositionEye3
        vec3 viewVectorEye = -normalize(vPositionEye3);
        float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);
        float specularLightWeighting = pow(rdotv, shininess);
        lightWeighting =
            spotEffect * uDiffuseLightColor * diffuseLightWeighting +
            spotEffect * uSpecularLightColor * specularLightWeighting;
        }
    }

    // Always ass the ambient light
    lightWeighting += uAmbientLightColor;

    // Sample the texture
    vec4 texelColor = texture2D(uSampler, vTextureCoordinates);

    // Modulate texel color with lightweighthing and write as final color
    gl_FragColor = vec4(lightWeighting.rgb * texelColor.rgb, texelColor.a);
}
`;
