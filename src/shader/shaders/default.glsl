struct VSInput {
    vec2 TexCoord : TEXCOORD0;
    vec4 Position : POSITION0;
    mat4 Matrix : MATRIX;
};

struct PSInput {
    vec2 TexCoord : TEXCOORD0;
    vec4 Position : POSITION0;
    vec2 Normal : NORMAL0;

    vec4 Diffuse;
    vec4 ScreenCoord;
};

PSInput vertexShaderFunction(VSInput VS) {
    PSInput PS;

    PS.TexCoord = VS.TexCoord;
    PS.Position = VS.Matrix * VS.Position;

    PS.ScreenCoord.xy = (PS.Position.xy+1.0)/2.0;
    PS.ScreenCoord.y = 1.0-PS.ScreenCoord.y;

    return PS;
}

vec4 pixelShaderFunction(PSInput PS) {
    vec4 color = texture2D(texture, vec2(PS.TexCoord.x, PS.TexCoord.y));

    color *= PS.Diffuse;
    color.rgb *= color.a;
    color = applyWorldLights(color, PS.Normal, PS.ScreenCoord, false);

    return color;
}