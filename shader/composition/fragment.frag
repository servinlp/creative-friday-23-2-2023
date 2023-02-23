precision mediump float;

varying vec2 vUv;

uniform sampler2D uDefaultTexture;
// uniform sampler2D uDistortionTexture;
// uniform vec2 uConvergencePosition;
// uniform float uTime;

#include ../partials/inverseLerp.glsl
#include ../partials/remap.glsl
#include ../partials/random2d.glsl

void main () {

    vec4 color = texture(uDefaultTexture, vUv);
    gl_FragColor = color;
    // // vec4 distortionTexture = texture(uDistortionTexture, vUv);
    // float distortionStrenght = texture(uDistortionTexture, vUv).r;
    // vec2 convergencePoint = uConvergencePosition;
    // // vec2 convergencePoint =  vec2(0.5);
    // vec2 toConvergence = convergencePoint - vUv;
    // vec2 distoredUv = vUv +toConvergence * distortionStrenght;

    // // vec4 color = texture(uDefaultTexture, distoredUv);

    // // Vignette
    // float distanceToCenter = length(vUv - 0.5);
    // float vignetteStrength = remap(distanceToCenter, 0.3, 0.7, 0.0, 1.0);
    // vignetteStrength = smoothstep(0.0, 1.0, vignetteStrength);


    // vec4 baseColor = texture(uDefaultTexture, distoredUv);
    // float r = texture(uDefaultTexture, distoredUv + vec2(sin(0.0), cos(0.0)) * 0.02 * vignetteStrength).r;
    // float g = texture(uDefaultTexture, distoredUv + vec2(sin(2.1), cos(2.1)) * 0.02 * vignetteStrength).g;
    // float b = texture(uDefaultTexture, distoredUv + vec2(sin(-2.1), cos(-2.1)) * 0.02 * vignetteStrength).b;
    // vec4 color = vec4(r,g,b,1.0);


    // // float noise = random2d(vUv + uTime);
    // // noise = noise - 0.5;

    // // float grayscale = r * 0.299 + g * 0.587 + b * 0.114;
    // // noise *= grayscale;

    // // color += noise * 0.5;

    // gl_FragColor = color;
    // // gl_FragColor = vec4(vec3(grayscale), 1.0);
    // // gl_FragColor = vec4(vec3(noise), 1.0);
    // // gl_FragColor = baseColor;
    // // gl_FragColor = vec4(vec3(vignetteStrength), 1.0);
    // // gl_FragColor.r += distortionStrenght;

    // // gl_FragColor = texture(uDistortionTexture, vUv);
}