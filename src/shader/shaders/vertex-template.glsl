uniform mat4 internal_matrix;
attribute vec4 internal_position;
attribute vec2 internal_inTexCoord;
uniform float time;

<VertexUniforms>

<VertexStruct>
<PixelStruct>

<PixelVaryings>

<VertexShaderCode>

void main() {
    <VertexStructAssign>
    
    <PixelStructName> compiler_<PixelStructName> = vertexShaderFunction(compiler_<VertexStructName>);
    
    <PixelVaryingsAssign>
    
    <PixelStructAssignInverted>
}