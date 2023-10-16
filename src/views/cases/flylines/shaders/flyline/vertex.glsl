attribute float aIndex;

uniform float uTime;
uniform vec3 uColor;

varying float vSize;

void main() {
    vec4 viewPosition = viewMatrix * modelMatrix * vec4(position, 1);
    gl_Position = projectionMatrix * viewPosition;

    if(aIndex < uTime + 100.0 && aIndex > uTime - 100.0) {
        vSize = (aIndex + 100.0 - uTime) / 60.0;
    }
    gl_PointSize = vSize;
}
