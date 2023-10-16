varying float vSize;
uniform vec3 uColor;

void main() {
    if(vSize <= 0.0) {
        gl_FragColor = vec4(1, 0, 0, 0);
    } else {
        gl_FragColor = vec4(uColor, 1);
    }
}