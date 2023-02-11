import defaultShader from './shaders/default.glsl?raw';
import vertexShaderTemplate from './shaders/vertex-template.glsl?raw';
import pixelShaderTemplate from './shaders/pixel-template.glsl?raw';

const vertexShaderRegex = /(\w+) vertexShaderFunction\(([\s\S]+?)?\)\s*\{([\s\S]+)\}/;
const pixelShaderRegex = /(\w+) pixelShaderFunction\(([\s\S]+?)?\)\s*\{([\s\S]+)\}/;
const structVariableRegex = /(\w+)\s+(\w+)(\s+:\s+(\w+))?/;
const vertexUniformsRegex = /struct VertexUniforms\s*\{([\s\S]+?)\}/;
const pixelUniformsRegex = /struct PixelUniforms\s*\{([\s\S]+?)\}/;

function readTypeAndName(variable: string): [string, string] | undefined {
    let types = variable.split(' ');
    if(!types[0] || !types[1]) return;
    return [types[0], types[1]];
}

interface StructVariable {
    type: string;
    name: string;
    assignTo?: string;
};

function matchBody(str: string, pattern: RegExp, n: number) {
    let match = str.match(pattern);
    if (match) {
        let functionBody = match[n];
        let stack = [];
        for (let i = 0; i < functionBody.length; i++) {
            if (functionBody[i] === '{') {
                stack.push('{');
            } else if (functionBody[i] === '}') {
                stack.pop();
                if (stack.length === 0) {
                  return match[n].slice(0, i+1);
                }
            }
        }
        throw new Error('Mismatched brackets in function body');
    } else {
        throw new Error('No match');
    }
}

function readStruct(struct: string): StructVariable[] {
    while(struct.search('  ') != -1) {
        struct = struct.replace('  ', ' ');
    }
    let variables: StructVariable[] = <StructVariable[]>struct.split(';')
        .map(variable => variable.trim())
        .filter(variable => variable.length > 0)
        .map(variable => variable.match(structVariableRegex))
        .filter(variable => variable != undefined && variable)
        .map(variable => {
            if(variable) {
                let structVariable: StructVariable = {
                    type: variable[1],
                    name: variable[2]
                };
                
                if(variable[3] && variable[4]) structVariable.assignTo = variable[4];
                return structVariable;
            } return;
        });

    return variables;
}

interface Definitions {
    [key: string]: string
};

function buildStruct(name: string, variables: StructVariable[], definitions: Definitions): [string, string, string, string, string, string, Definitions] {
    let struct = `struct ${name} {\n`;
    let assignCode = `${name} compiler_${name};\n`;
    let varyingCode = ``;
    let varyingAssignCode = ``;
    let assignCodeInverted = '';
    let loadCode = `${name} compiler_${name};\n`;
    let assignedTo: Definitions = {};
    
    for(let variable of variables) {
        struct += `    ${variable.type} ${variable.name};\n`;
        if(variable.assignTo && definitions[variable.assignTo]) {
            assignCodeInverted += `${definitions[variable.assignTo]} = compiler_${name}.${variable.name};\n`;
            assignCode += `compiler_${name}.${variable.name} = ${definitions[variable.assignTo]};\n`;
        }
        if(variable.assignTo) assignedTo[variable.assignTo] = `compiler_pass_${variable.name}`;
        loadCode += `compiler_${name}.${variable.name} = compiler_pass_${variable.name};\n`;
        varyingCode += `varying ${variable.type} compiler_pass_${variable.name};\n`;
        varyingAssignCode += `compiler_pass_${variable.name} = compiler_${name}.${variable.name};\n`;
    }
    
    struct += '};';
    return [struct, assignCode, varyingCode, varyingAssignCode, assignCodeInverted, loadCode, assignedTo];
}

function replaceAll(code: string, definitions: Definitions): string {
    for(let n in definitions) {
        while(code.search(`<${n}>`) != -1) {
            code = code.replace(`<${n}>`, definitions[n]);
        }
    }
    return code;
}

function assignedVariables(code: string, definitions: Definitions): string {
    const assignedVariableRegex = /<AssignedVariable:(Pixel|Vertex):(\w+)>/;
    code = code.replaceAll(new RegExp(assignedVariableRegex, 'g'), (e) => {
        let matched = e.match(assignedVariableRegex);
        if(matched && matched[2] && definitions[matched[2]]) {
            return definitions[matched[2]];
        }
        throw new Error(`Required "${matched && matched[2] || 'unknown'}" input for pixel shader`);
    });

    return code;
}

export function compileShader(code: string = defaultShader): [string, string] {
    let vertexShader = code.match(vertexShaderRegex);
    let pixelShader = code.match(pixelShaderRegex);
    if(!vertexShader) {
        vertexShader = defaultShader.match(vertexShaderRegex);
        if(!vertexShader) throw new Error('Invalid vertex shader');
    };
    if(!pixelShader) throw new Error('Invalid pixel shader');
    
    // Vertex shader
    let vertexShaderCode = vertexShader[0];
    vertexShaderCode = matchBody(vertexShaderCode, /([\s\S]+)/, 0);
    let vertexShaderOutputType = vertexShader[1];
    let vertexShaderInput = readTypeAndName(vertexShader[2]);
    
    // Pixel shader
    let pixelShaderCode = pixelShader[0];
    pixelShaderCode = matchBody(pixelShaderCode, /([\s\S]+)/, 0);
    let pixelShaderOutput = pixelShader[1];
    let pixelShaderInput = readTypeAndName(pixelShader[2]);
    
    // Checks
    if(!vertexShaderInput) throw new Error('Vertex Shader requires an input value');
    if(!vertexShaderOutputType) throw new Error('Vertex Shader needs to return a value');
    if(!pixelShaderInput || pixelShaderInput[0] != vertexShaderOutputType) throw new Error('Pixel Shader requires same type input as Vertex Shader output');
    if(pixelShaderOutput != 'vec4') throw new Error('Pixel shader needs to return vec4 value');
    
    // Vertex Input Struct
    let VSStructRegex = new RegExp('struct ' + vertexShaderInput[0] + '\\s*\\{([\\s\\S]+?)\\}');
    let VSStruct = code.match(VSStructRegex);
    if(!VSStruct) throw new Error('Not found definition for ' + vertexShaderInput[0]);
    let VSStructVariables: StructVariable[] = readStruct(VSStruct[1]);
    let vertexDefinitions = {
        'TEXCOORD0': 'internal_inTexCoord',
        'TEXCOORD1': 'internal_inUvSize',
        'POSITION0': 'internal_position',
        'WORLDPOS': 'internal_worldPosition',
        'WORLDSIZE': 'internal_worldSize',
        'DIFFUSE0': 'internal_diffuse',
        'MATRIX': 'internal_matrix',
    };
    let [VSStructCode, VSAssignCode, VSVaryings, VSVaryingsAssign] = buildStruct(vertexShaderInput[0], VSStructVariables, vertexDefinitions);
    
    
    // Pixel Input Struct
    let PSStructRegex = new RegExp('struct ' + pixelShaderInput[0] + '\\s*\\{([\\s\\S]+?)\\}');
    let PSStruct = code.match(PSStructRegex);
    if(!PSStruct) throw new Error('Not found definition for ' + pixelShaderInput[0]);
    let PSStructVariables: StructVariable[] = readStruct(PSStruct[1]);
    let [PSStructCode, PSAssignCode, PSVaryings, PSVaryingsAssign, PSAssignCodeInverted, PSVaryingsLoad, PSAssignedTo] = buildStruct(pixelShaderInput[0], PSStructVariables, {
        'POSITION0': 'gl_Position',
    });

    // Read uniforms
    let VertexUniforms = code.match(vertexUniformsRegex);
    let VertexUniformsCode = '';
    if(VertexUniforms) {
        let PixelUniformsStruct: StructVariable[] = readStruct(VertexUniforms[1]);
        VertexUniformsCode = PixelUniformsStruct.map(variable => `uniform ${variable.type} ${variable.name};`).join('\n');
    }

    let PixelUniforms = code.match(pixelUniformsRegex);
    let PixelUniformsCode = '';
    if(PixelUniforms) {
        let PixelUniformsStruct: StructVariable[] = readStruct(PixelUniforms[1]);
        PixelUniformsCode = PixelUniformsStruct.map(variable => `uniform ${variable.type} ${variable.name};`).join('\n');
    }
    
    function findAllFunctions(code: string): [string, string] {
        let vertexFunctions: string = '';
        let pixelFunctions: string = '';
        const functionRegex = /(\w+) ([\w.-:]+)\(([\s\S]+?)?\)\s*\{([\s\S]+)\}/;
        while(code.search(functionRegex) != -1) {
            let position = code.search(functionRegex);
            let match = <RegExpMatchArray>code.match(functionRegex);
            let body = matchBody(match[0], functionRegex, 0);
            code = code.slice(position + body.length, code.length);
            
            if(match[2] != 'pixelShaderFunction' && match[2] != 'vertexShaderFunction') {
                let defaultName: string = `${match[1]} ${match[2]}`;
                if(match[2].search(':PIXEL')) pixelFunctions += defaultName.slice(0, defaultName.length - ':PIXEL'.length) + body.slice(defaultName.length, body.length);
                else if(match[2].search(':VERTEX')) pixelFunctions += defaultName.slice(0, defaultName.length - ':VERTEX'.length) + body.slice(defaultName.length, body.length);
                else {
                    pixelFunctions += body;
                    vertexFunctions += body;
                }
            };
        }
        return [vertexFunctions, pixelFunctions];
    }

    let [vertexFunctions, pixelFunctions] = findAllFunctions(code);
    let finalVertexShader = vertexShaderTemplate+''; // just clone it.
    let finalPixelShader = pixelShaderTemplate+''; // just clone it.
    let definitions: Definitions = {
        'VertexShaderCode': vertexShaderCode,
        'PixelShaderCode': pixelShaderCode,
        'VertexStruct':  VSStructCode,
        'PixelStruct': PSStructCode,
        'VertexStructAssign': VSAssignCode,
        'PixelStructAssign': PSAssignCode,
        'PixelStructAssignInverted': PSAssignCodeInverted,
        'VertexVaryings': VSVaryings,
        'PixelVaryings': PSVaryings,
        'VertexStructName': vertexShaderInput[0],
        'PixelStructName': pixelShaderInput[0],
        'VertexVaryingsAssign': VSVaryingsAssign,
        'PixelVaryingsAssign': PSVaryingsAssign,
        'PixelStructLoad': PSVaryingsLoad,
        'VertexUniforms': VertexUniformsCode,
        'PixelUniforms': PixelUniformsCode,
        'VertexFunctions': vertexFunctions,
        'PixelFunctions': pixelFunctions,
    };
    
    finalVertexShader = replaceAll(finalVertexShader, definitions);
    finalPixelShader = replaceAll(finalPixelShader, definitions);
    finalPixelShader = assignedVariables(finalPixelShader, PSAssignedTo);

    return [finalVertexShader, finalPixelShader];
}