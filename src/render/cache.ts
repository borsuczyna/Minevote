export interface TextureInfo {
    url: string;
    width: number;
    height: number;
    texture: WebGLTexture;
};

export default class Cache {
    emptyTexture?: TextureInfo;
    context: WebGLRenderingContext;
    cache: TextureInfo[] = [];

    constructor(context: WebGLRenderingContext) {
        this.context = context;
    }

    loadImageAndCreateTextureInfo(url: string, wrapMode: 'clamp' | 'wrap' = 'wrap'): TextureInfo {
        let tex: WebGLTexture = this.context.createTexture() as WebGLTexture;
        if(!tex) throw new Error(`Failed to create texture '${url}'`);
    
        this.context.bindTexture(this.context.TEXTURE_2D, tex);
        // Fill the texture with a 1x1 blue pixel.
        this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, 1, 1, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

        // set wrap mode based on argument
        let wrapS, wrapT;
        if (wrapMode === 'clamp') {
            wrapS = this.context.CLAMP_TO_EDGE;
            wrapT = this.context.CLAMP_TO_EDGE;
        } else {
            wrapS = this.context.REPEAT;
            wrapT = this.context.REPEAT;
        }
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, wrapS);
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, wrapT);
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);

        let textureInfo: TextureInfo = {
            url: url,
            width: 1,
            height: 1,
            texture: tex,
        };

        let img = new Image();
        img.addEventListener('load', () => {
            textureInfo.width = img.width;
            textureInfo.height = img.height;

            this.context.bindTexture(this.context.TEXTURE_2D, textureInfo.texture);
            this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, img);
        });
        img.src = url;

        return textureInfo;
    }

    getTextureFromCache(url: string | [string, 'wrap' | 'clamp']): TextureInfo {
        let textureCache: TextureInfo | undefined = this.cache.find(texture => texture.url === url);
        if (!textureCache) {
            textureCache = this.loadImageAndCreateTextureInfo(typeof url == 'string' ? url : url[0], typeof url != 'string' ? url[1] : 'wrap');
            this.cache.push(textureCache);
        }
        return textureCache;
    }

    getEmptyTexture(): TextureInfo { // if not this.emptyTexture then create empty 1x1 white texture and return it
        if(!this.emptyTexture) {
           let tex: WebGLTexture = this.context.createTexture() as WebGLTexture;
           if(!tex) throw new Error(`Failed to create texture 'empty'`);
   
           this.context.bindTexture(this.context.TEXTURE_2D, tex);
           // Fill the texture with a 1x1 white pixel.
           this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, 1, 1, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, new Uint8Array([255*.5, 255*.5, 255*.5, 255]));
           this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.REPEAT);
           this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.REPEAT);
           this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
           this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);

           this.emptyTexture = {
               url: 'empty',
               width: 1,
               height: 1,
               texture: tex,
           };
       }

       return this.emptyTexture;
   }
}