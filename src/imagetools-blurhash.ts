import { setMetadata, getMetadata, TransformFactory } from 'vite-imagetools';
import { encode } from 'blurhash';

export interface BlurhashOptions {
  blurhash?: '' | 'true' | number | [number, number] | string;
}

// Helper type to bypass ImageConfig intersection
type BlurhashTransformFactory = (options: BlurhashOptions, ctx?: any) => ReturnType<TransformFactory<any>>;

export interface BlurhashConfig {
  always?: boolean;
  components?: number | [number, number] | string;
}

/**
 * Parses blurhashComponents from various formats:
 * - number: uses the same value for both x and y components
 * - [number, number]: uses the provided x and y components
 * - string: parses "x,y" or "x y" or "x-y" format
 * 
 * @param components - The components to parse
 * @returns A tuple of [xComponents, yComponents]
 */
function parseBlurhashComponents(components: number | [number, number] | string): [number, number] {
  if (typeof components === 'number') {
    return [components, components];
  }
  
  if (Array.isArray(components)) {
    if (components.length !== 2) {
      throw new Error('blurhashComponents array must have exactly 2 elements');
    }
    return [components[0], components[1]];
  }
  
  if (typeof components === 'string') {
    // Parse string format like "4,3" or "4 3" or "4-3"
    const match = components.match(/^\s*(\d+)\s*[,-\s]\s*(\d+)\s*$/);
    if (!match) {
      throw new Error(`Invalid blurhashComponents string format: "${components}". Expected format: "x,y" or "x y" or "x-y"`);
    }
    return [parseInt(match[1], 10), parseInt(match[2], 10)];
  }
  
  throw new Error(`Invalid blurhashComponents type: ${typeof components}`);
}

/**
 * Creates a blurhash transform factory with default configuration options.
 * 
 * @param defaultConfig - Default configuration options for blurhash generation
 * @returns A transform factory function that can be used with vite-imagetools
 */
export function blurhash(defaultConfig: BlurhashConfig = {}): BlurhashTransformFactory {
  return ((options: BlurhashOptions) => {
    // Convert numbers to strings for compatibility
    const blurhash = typeof options.blurhash === 'number' 
      ? `${options.blurhash},${options.blurhash}` 
      : options.blurhash;
    // Merge user options with defaults
    const finalBlurhash = blurhash ?? (defaultConfig.always ? 'true' : undefined);
    

    // Check if blurhash is disabled
    if (finalBlurhash === undefined || finalBlurhash === 'false') {
      return;
    }

    // Parse components from blurhash parameter
    let finalComponents: number | [number, number] | string;
    
    if (finalBlurhash === 'true' || finalBlurhash === '') {
      // Use default components when blurhash is 'true' or empty string
      finalComponents = defaultConfig.components ?? 4;
    } else {
      // Use the blurhash value as components
      finalComponents = finalBlurhash;
    }

    // Parse blurhashComponents to get x and y components
    const [xComponents, yComponents] = parseBlurhashComponents(finalComponents);

    return async function blurhashTransform(image) {
      // Get image metadata to determine dimensions
      const metadata = await image.metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;

      if (width === 0 || height === 0) {
        console.warn(`Cannot generate blurhash for image ${getMetadata(image, 'path')} with zero dimensions`);
        return image;
      }

      // Resize to a smaller size for blurhash generation (max 32x32 for performance)
      const maxSize = 32;
      const aspectRatio = width / height;
      let resizeWidth: number;
      let resizeHeight: number;

      if (aspectRatio > 1) {
        resizeWidth = Math.min(maxSize, width);
        resizeHeight = Math.round(resizeWidth / aspectRatio);
      } else {
        resizeHeight = Math.min(maxSize, height);
        resizeWidth = Math.round(resizeHeight * aspectRatio);
      }

      // Ensure minimum size of 1x1
      resizeWidth = Math.max(1, resizeWidth);
      resizeHeight = Math.max(1, resizeHeight);

      // Resize and get raw pixel data in RGBA format
      const resizedImage = image.clone().resize(resizeWidth, resizeHeight, { kernel: 'nearest' });
      const { data, info } = await resizedImage.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

      // Convert to Uint8ClampedArray for blurhash encoding
      const pixels = new Uint8ClampedArray(data);

      // Generate blurhash with specified components
      const blurhashString = encode(pixels, info.width, info.height, xComponents, yComponents);

      // Store blurhash in metadata
      setMetadata(image, 'blurhash', blurhashString);

      return image;
    };
  });
}
