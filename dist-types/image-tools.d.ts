import type { ImageMetadata as ImageMetadataVite } from 'vite-imagetools';

export interface ImageMetadata extends ImageMetadataVite {
    src?: string;
    blurhash?: string;
}

declare global {
    /** This will expose ImageMetadata type on all imports that have ?as=metadata, but will not work for more arguments like ?as=metadata:blurhash:width:height if you know how to fix this, please open a PR, probably not possible until https://github.com/microsoft/TypeScript/issues/38638 is resolved */
    declare module '*as=metadata' {
        export default {} as ImageMetadata;
    }
    declare module '*as=meta' {
        export default {} as ImageMetadata;
    }
}