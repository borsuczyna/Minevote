uniform mat4 internal_matrix;
attribute vec4 internal_position;
attribute vec2 internal_inTexCoord;
uniform float time;
uniform vec2 internal_inUvSize;

<VertexUniforms>

<VertexStruct>
<PixelStruct>

<PixelVaryings>

<VertexFunctions>

<VertexShaderCode>

void main() {
    <VertexStructAssign>
    
    <PixelStructName> compiler_<PixelStructName> = vertexShaderFunction(compiler_<VertexStructName>);
    
    <PixelVaryingsAssign>
    
    <PixelStructAssignInverted>
}