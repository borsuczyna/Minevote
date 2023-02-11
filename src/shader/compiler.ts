let vertexShaderTemplate = `
attribute vec4 position;
attribute vec2 inTexCoord;

uniform mat4 matrix;

varying vec2 texCoord;
varying vec4 screenCoord;
uniform vec2 screenSize;

<vertexShaderFunction>

void main() {
    gl_Position = vertexShaderFunction();
}`;

let pixelShaderTemplate = `
// Definitions
#define MAX_LIGHTS 16

precision mediump float;

varying vec2 texCoord;
uniform vec2 screenSize;
varying vec4 screenCoord;
uniform vec4 diffuse_tl, diffuse_tr, diffuse_bl, diffuse_br;
uniform float uw, uh;

// Lights
uniform vec2 directionalLightDir;
uniform vec4 directionalLightColor;
uniform vec3 lightPosition[MAX_LIGHTS];
uniform vec4 lightColor[MAX_LIGHTS];
uniform float lightSize[MAX_LIGHTS];
uniform bool lightActive[MAX_LIGHTS];

// Textures
uniform sampler2D texture;
uniform sampler2D normalTexture;
uniform float time;

// Variables for pixel shader
vec4 diffuse;
vec2 normal;

<pixelShaderFunction>

void main() {
    // Diffuse
    vec4 diffuseTop = mix(diffuse_tl, diffuse_tr, mod(texCoord.x/uw, 1.0));
    vec4 diffuseBottom = mix(diffuse_bl, diffuse_br, mod(texCoord.x/uw, 1.0));
    diffuse = mix(diffuseTop, diffuseBottom, smoothstep(0., 1., mod(texCoord.y/uh, 1.0)));

    // Normals
    vec4 normalColor = texture2D(normalTexture, vec2(texCoord.x, texCoord.y));
    normal = vec2(
        -(normalColor.x - 0.5)*2.0,
        -(normalColor.y - 0.5)*2.0
    );

    // Call pixel shader function
    gl_FragColor = pixelShaderFunction();
}`;

export function compileShader(vertex: string, pixel: string): [string, string] {
    let compiledVertex = vertexShaderTemplate.replace('<vertexShaderFunction>', vertex);
    let compiledPixel = pixelShaderTemplate.replace('<pixelShaderFunction>', pixel);

    return [compiledVertex, compiledPixel];
}