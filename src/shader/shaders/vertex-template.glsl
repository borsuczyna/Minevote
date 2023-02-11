uniform mat4 internal_matrix;
attribute vec4 internal_position;
attribute vec2 internal_inTexCoord;
uniform float time;
uniform vec2 internal_inUvSize;
uniform vec3 internal_worldPosition;
uniform vec2 internal_worldSize;

<VertexUniforms>

<VertexStruct>
<PixelStruct>

<PixelVaryings>

<VertexFunctions>

<VertexShaderCode>

void main() {
    vec2 internal_worldSize_final = internal_worldSize;
    <VertexStructAssign>
    
    <PixelStructName> compiler_<PixelStructName> = vertexShaderFunction(compiler_<VertexStructName>);
    
    <PixelVaryingsAssign>
    
    <PixelStructAssignInverted>
}