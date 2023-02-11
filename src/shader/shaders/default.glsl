struct VSInput {
    vec2 TexCoords : TEXCOORD0;
    vec4 Position : POSITION0;
    vec2 Normal : NORMAL0;
    mat4 Matrix : MATRIX;
};

struct PSInput {
    vec2 TexCoords : TEXCOORD0;
    vec4 Position : POSITION0;
    vec4 Diffuse : DIFFUSE0;
    vec2 Normal;
    vec4 ScreenCoord;
};

PSInput vertexShaderFunction(VSInput VS) {
    PSInput PS;

    PS.TexCoords = VS.TexCoords;
    PS.Position = VS.Matrix * VS.Position;

    PS.ScreenCoord.xy = (PS.Position.xy+1.0)/2.0;
    PS.ScreenCoord.y = 1.0-PS.ScreenCoord.y;

    return PS;
}

vec4 pixelShaderFunction(PSInput PS) {
    vec4 color = texture2D(texture, vec2(PS.TexCoords.x, PS.TexCoords.y));

    color *= PS.Diffuse;
    color.rgb *= color.a;

    return color;
}