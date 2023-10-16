// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;

// attribute vec3 position;

attribute float aRandom;
varying float vRandom;
uniform vec2 uFrequency;
uniform float uTime;

// attribute vec2 uv;
varying vec2 vUv;
varying float vElevation;


void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.z += sin(modelPosition.x * 10.0) * 0.1;
    // modelPosition.z += aRandom * 0.1;
    // float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    // elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

    // modelPosition.z += elevation;

    // vElevation = elevation;

    // vRandom = aRandom;
    vUv = uv;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}