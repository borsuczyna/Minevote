struct PixelUniforms {
    float angle;
    <colorUniforms>
};

struct VSInput {
    vec4 Position : POSITION0;
    vec2 TexCoord : TEXCOORD0;
    mat4 Matrix : MATRIX;
};

struct PSInput {
    vec4 Position : POSITION0;
    vec2 TexCoord : TEXCOORD0;
};

PSInput vertexShaderFunction(VSInput VS) {
    PSInput PS;

    PS.Position = VS.Matrix * VS.Position;
    PS.TexCoord = VS.TexCoord;

    return PS;
}

vec4 pixelShaderFunction(PSInput PS) {
    vec4 color = vec4(1, 0, 0, 1);
    vec2 U = PS.TexCoord.xy - .5;
    float x = .5 + length(U) * cos( atan(U.y,-U.x) + angle);

    <returnCode>
}