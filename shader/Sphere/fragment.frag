precision mediump float;

varying vec2 vUv;

uniform vec3 uColor;

void main () {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
    gl_FragColor = vec4(vec3(uColor), 1.0);
}