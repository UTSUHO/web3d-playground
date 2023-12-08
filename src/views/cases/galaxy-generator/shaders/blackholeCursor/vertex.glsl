attribute vec2 a_position;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;
void main() {
    vec4 viewPosition = viewMatrix * modelMatrix * vec4(position, 1);
    gl_Position = projectionMatrix * viewPosition;
        // v_texCoord = a_texCoord;
}