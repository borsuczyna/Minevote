precision mediump float;
uniform sampler2D texture;
uniform float time;

<PixelUniforms>

<PixelStruct>

<PixelVaryings>

<PixelShaderCode>

void main() {
    <PixelStructLoad>

    gl_FragColor = pixelShaderFunction(compiler_<PixelStructName>);
}