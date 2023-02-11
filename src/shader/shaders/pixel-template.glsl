precision mediump float;
uniform vec2 internal_inTexCoord;
uniform sampler2D texture;
uniform float time;
uniform vec4 internal_diffuse_tl, internal_diffuse_tr, internal_diffuse_bl, internal_diffuse_br;

<PixelUniforms>

<PixelStruct>

<PixelVaryings>

<PixelShaderCode>

void main() {
    vec4 internal_diffuse_top = mix(internal_diffuse_tl, internal_diffuse_tr, mod(<AssignedVariable:Pixel:TEXCOORD0>.x, 1.0));
    vec4 internal_diffuse_bottom = mix(internal_diffuse_bl, internal_diffuse_br, mod(<AssignedVariable:Pixel:TEXCOORD0>.x, 1.0));
    vec4 compiler_pass_Diffuse = mix(internal_diffuse_top, internal_diffuse_bottom, smoothstep(0., 1., mod(<AssignedVariable:Pixel:TEXCOORD0>.y, 1.0)));

    <PixelStructLoad>

    gl_FragColor = pixelShaderFunction(compiler_<PixelStructName>);
}