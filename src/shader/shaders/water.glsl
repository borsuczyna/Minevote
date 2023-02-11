struct VSInput {
    vec2 TexCoord : TEXCOORD0;
    vec4 Position : POSITION0;
    vec3 WorldPos : WORLDPOS;
    vec2 WorldSize : WORLDSIZE;
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
    vec4 position = VS.Position;
    position.y += sin(VS.WorldPos.x + (VS.TexCoord.x * VS.WorldSize.x) + time/200.0)/10.0;
    PS.Position = VS.Matrix * position;

    PS.ScreenCoord.xy = (PS.Position.xy+1.0)/2.0;
    PS.ScreenCoord.y = 1.0-PS.ScreenCoord.y;

    return PS;
}

vec4 pixelShaderFunction(PSInput PS) {
    vec4 color = texture2D(texture, vec2(PS.TexCoord.x, PS.TexCoord.y));

    color *= PS.Diffuse;
    color.rgb *= color.a;
    vec4 newColor = applyWorldLights(color, PS.Normal, PS.ScreenCoord, false);
    color.rgb += (newColor.rgb - color.rgb)/3.0;
    // color.a /= 0.5;
    
    return color;
}