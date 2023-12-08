uniform float uSize;
attribute float aScale;
uniform float uTime;
uniform float uSpeed;
varying vec3 vColor;
attribute vec3 aRandomness;
uniform vec3 uMousePos;
uniform float uBlackholeRadius;
uniform float uFieldForceDivisor;

vec3 forceField(vec3 segment, vec3 transformedObj) {
    vec3 dir = normalize(segment);
    float dist = length(segment);
    float force = clamp(1. / (dist * dist), 0., 1.);
    if(dist < uBlackholeRadius) {
        transformedObj += dir * force/uFieldForceDivisor;
    }
    return transformedObj;
}
void main() {
    // force field
    #include <begin_vertex>
    /**
    * Position
    */
    vec4 modelPosition = modelMatrix * vec4(position, 1.);

    // rotate
    // three.js中y轴为高度
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * uSpeed;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    // // phase1
    // if(modelPosition.x < sqrt(pow(.2, 2.0) - pow(modelPosition.x, 2.0))
    // &&  modelPosition.x > 0.0
    // && modelPosition.z < sqrt(pow(.2, 2.0) - pow(modelPosition.z, 2.0))
    // &&  modelPosition.z > 0.0
    // ) {

    //     modelPosition.x = sqrt(pow(.2, 2.0) - pow(modelPosition.x, 2.0));
    //     modelPosition.z = sqrt(pow(.2, 2.0) - pow(modelPosition.z, 2.0));
    // }
    // // phase2
    // if(modelPosition.x < sqrt(pow(.2, 2.0) - pow(modelPosition.x, 2.0))
    // &&  modelPosition.x > 0.0
    // && modelPosition.z > -sqrt(pow(.2, 2.0) - pow(modelPosition.z, 2.0))
    // &&  modelPosition.z < 0.0
    // ) {

    //     modelPosition.x = sqrt(pow(.2, 2.0) - pow(modelPosition.x, 2.0));
    //     modelPosition.z = -sqrt(pow(.2, 2.0) - pow(modelPosition.z, 2.0));
    // }
    // // phase3
    // if(modelPosition.x > -sqrt(pow(.2, 2.0) - pow(modelPosition.x, 2.0)) 
    // &&  modelPosition.x < 0.0
    // && modelPosition.z > -sqrt(pow(.2, 2.0) - pow(modelPosition.z, 2.0))
    // &&  modelPosition.z < 0.0
    // ) {

    //     modelPosition.x = -sqrt(pow(.2, 2.0) - pow(modelPosition.x, 2.0));
    //     modelPosition.z = -sqrt(pow(.2, 2.0) - pow(modelPosition.z, 2.0));
    // }
    // // phase4
    // if(modelPosition.x > -sqrt(pow(.2, 2.0) - pow(modelPosition.x, 2.0))
    // &&  modelPosition.x < 0.0
    // && modelPosition.z < sqrt(pow(.2, 2.0) - pow(modelPosition.z, 2.0))
    // &&  modelPosition.z > 0.0
    // ) {

    //     modelPosition.x = -sqrt(pow(.2, 2.0) - pow(modelPosition.x, 2.0));
    //     modelPosition.z = sqrt(pow(.2, 2.0) - pow(modelPosition.z, 2.0));
    // }

    modelPosition.xyz += aRandomness;

    vec3 mouseSeg = modelPosition.xyz - uMousePos;
    modelPosition.xyz = forceField(mouseSeg, modelPosition.xyz);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    vColor = color;

    gl_Position = projectedPosition;

            /**
             * Size
             */
    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z);
}