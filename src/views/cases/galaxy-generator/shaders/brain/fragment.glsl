uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;
varying float vProgress;

void main() {

    vec3 finalColor = mix(uColor, uColor * 0.25, vProgress);
    float hideCornerAside = smoothstep(1., 0.9, vUv.x);
    float hideCornerBSide = smoothstep(0., 0.1, vUv.x);

    gl_FragColor.rgba = vec4(finalColor, hideCornerAside * hideCornerBSide);
}