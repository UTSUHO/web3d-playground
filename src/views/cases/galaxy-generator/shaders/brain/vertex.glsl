varying vec2 vUv;
varying float vProgress;
uniform float uTime;
void main() {
    vUv = uv;
    vProgress = smoothstep(-1.,1.,sin(vUv.x * 8. + uTime*3.));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}