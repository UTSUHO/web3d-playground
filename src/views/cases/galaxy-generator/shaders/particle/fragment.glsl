uniform float uTime;
uniform vec3 uColor;
void main() {
    float dist = length(gl_PointCoord.xy - vec2(0.5));
    float opacity = .5 * smoothstep(0.5, 0.4, dist);
    vec3 color = mix(vec3(0.0), uColor, opacity);
    gl_FragColor = vec4(color, 1.);
}