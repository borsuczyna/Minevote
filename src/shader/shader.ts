import { compileShader } from "./compiler";

let defaultVertexShader = `
vec4 vertexShaderFunction() {
    texCoord = inTexCoord;

    screenCoord = matrix * position;
    screenCoord.xy = (screenCoord.xy+1.0)/2.0;
    screenCoord.y = 1.0-screenCoord.y;

    return matrix * position;
}
`;

let defaultPixelShader = `
float aspectDistance2D(vec2 position0, vec2 position1) {
    float aspectRatio = screenSize.x/screenSize.y;
    float xDistance = length(position0.x - position1.x);
    float yDistance = length(position0.y - position1.y)/aspectRatio;
    return length(vec2(xDistance, yDistance));
}

vec4 applyWorldLight(vec4 color, vec3 lightPosition, vec4 lightColor, float lightSize) {
    float fPower = 1.0-aspectDistance2D(screenCoord.xy, lightPosition.xy/screenSize.xy)/(lightSize/screenSize.x);
    float fNormalPower = 1.0-aspectDistance2D(screenCoord.xy, lightPosition.xy/screenSize.xy)/(lightSize/screenSize.x*2.0);
    vec2 dir = (lightPosition.xy/screenSize.xy) - screenCoord.xy;
    dir = normalize(dir);
    float dotValue = dot(normal.xy, dir.xy);

    vec4 normalColor = mix(
        vec4(1, 1, 1, 1),
        lightColor,
        max(dotValue, 0.0)
    );
    color = mix(color, color*lightColor, max(fPower, 0.0));
    color = mix(color, color*normalColor, max(fNormalPower*3.0, 0.0));
    return color;
}

vec4 applyWorldLights(vec4 color, bool onlySunLight) {
    float dotValue = dot(normal.xy, directionalLightDir.xy);
    color.rgb *= mix(
        vec3(1, 1, 1),
        directionalLightColor.rgb,
        max(dotValue, 0.0)
    );

    for(int i = 0; i < MAX_LIGHTS; i++) {
        if(lightActive[i]) {
            color = applyWorldLight(color, lightPosition[i], lightColor[i], lightSize[i]);
        }
    }

    return color;
}

vec4 pixelShaderFunction() {
    vec4 color = texture2D(texture, vec2(texCoord.x, texCoord.y));
    vec4 normalColor = texture2D(normalTexture, vec2(texCoord.x, texCoord.y));
    
    // vec4 applyWorldLights(vec4 color, bool onlySunLight)
    color = applyWorldLights(color, false);

    color *= diffuse;
    color.rgb *= color.a;
    // color.rgb = lightColor[0].rgb;
    return color;
}`;

declare const webglUtils: {
    [key: string]: any
};

declare const m4: {
    [key: string]: any
};

export default class Shader {
    context: WebGLRenderingContext;
    program: WebGLProgram;
    positionLocation: number;
    texcoordLocation: number;
    matrixLocation: WebGLUniformLocation;
    textureLocation: WebGLUniformLocation;
    normalLocation: WebGLUniformLocation;

    constructor(context: WebGLRenderingContext, vertexShader: string = defaultVertexShader, pixelShader: string = defaultPixelShader) {
        this.context = context;
        
        this.program = webglUtils.createProgramFromSources(context, compileShader(vertexShader, pixelShader));
        this.positionLocation = context.getAttribLocation(this.program, "position");
        this.texcoordLocation = context.getAttribLocation(this.program, "inTexCoord");
        this.matrixLocation = context.getUniformLocation(this.program, "matrix") as WebGLUniformLocation;
        this.textureLocation = context.getUniformLocation(this.program, "texture") as WebGLUniformLocation;
        this.normalLocation = context.getUniformLocation(this.program, "normalTexture") as WebGLUniformLocation;
    }

    setValue(key: string, value: any, type: 'float' | 'matrix' | 'texture' | 'int' | 'vec2' | 'vec3' | 'vec4' | 'bool') {
        const location = this.context.getUniformLocation(this.program, key);
        if (!location) return;
        this.context.useProgram(this.program);
        switch (type) {
            case 'float':
                this.context.uniform1f(location, value);
                break;
            case 'matrix':
                this.context.uniformMatrix3fv(location, false, value);
                break;
            case 'texture':
                // this.context.activeTexture(this.context.TEXTURE1);
                // this.context.bindTexture(this.context.TEXTURE_2D, value);
                // this.context.uniform1i(location, 1);
                break;
            case 'int':
                this.context.uniform1i(location, value);
                break;
            case 'vec2':
                this.context.uniform2f(location, value[0], value[1]);
                break;
            case 'vec3':
                this.context.uniform3f(location, value[0], value[1], value[2]);
                break;
            case 'vec4':
                this.context.uniform4f(location, value[0], value[1], value[2], value[3]);
                break;
            case 'bool':
                this.context.uniform1i(location, value ? 1 : 0);
                break;
        }
    }
}