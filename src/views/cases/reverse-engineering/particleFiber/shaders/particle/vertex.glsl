varying vec2 vUv;
varying float vProgress;
uniform float uTime;
attribute float randoms;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = randoms*2. * (1. / -mvPosition.z);
}