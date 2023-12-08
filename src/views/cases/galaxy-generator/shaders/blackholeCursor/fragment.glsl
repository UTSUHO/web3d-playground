
// Look below at line 23 for realism.

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform sampler2D tDiffuse;
// varying vec2 v_texCoord;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uMass;
uniform float uTime;
uniform float uClickedTime;

vec2 rotate(vec2 mt, vec2 st, float angle) {
	float cos = cos((angle + uClickedTime) * PI); // try replacing * 1.0 with * PI
	float sin = sin(angle * 0.0); // try removing the * 0.0

	// Uncomment these two lines for realism
	//float cos = cos(angle) * (uTime * 0.3);
	//float sin = sin(angle) * (uTime * 0.3);

	float nx = (cos * (st.x - mt.x)) + (sin * (st.y - mt.y)) + mt.x;
	float ny = (cos * (st.y - mt.y)) - (sin * (st.x - mt.x)) + mt.y;
	return vec2(nx, ny);
}

void main() {
	float fragWidth = gl_FragCoord.x / uResolution.x;
	float fragHeight = gl_FragCoord.y / uResolution.y;
	vec2 st = vec2(fragWidth, fragHeight);
	float mouseWidth = uMouse.x / uResolution.x;
	float mouseHeight = uMouse.y / uResolution.y;
	vec2 mt = vec2(mouseWidth, mouseHeight);

	float dx = st.x - mt.x;
	float dy = st.y - mt.y;
// 圆的解析式 dist = r
	float dist = sqrt(dx * dx + dy * dy);
	float pull = uMass / (dist * dist);

	vec3 color = vec3(0.0);

	vec2 r = rotate(mt, st, pull);
	vec4 imgcolor = texture2D(tDiffuse, r);
	color = vec3((imgcolor.x - (pull * 0.25)), (imgcolor.y - (pull * 0.25)), (imgcolor.z - (pull * 0.25)));

	gl_FragColor = vec4(imgcolor.x, imgcolor.y, imgcolor.z, 1.);
		// gl_FragColor = vec4(color, 1.);

}
