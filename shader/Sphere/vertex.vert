varying vec2 vUv;

uniform float uTime;
uniform float uStrengthX;
uniform float uStrengthY;

void main() {
    vec3 newPosition = position;
    newPosition.x += sin((uTime / 10.0) * uStrengthX);
    newPosition.y += cos((uTime / 10.0) * uStrengthY);
    gl_Position = projectionMatrix * modelViewMatrix* vec4(newPosition, 1.0);
    vUv = uv;
}