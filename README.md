# imagetools-blurhash

[![NPM version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![License][license-image]](LICENSE)
[![Donate][donate-image]][donate-url]

A imagetools plugin for generating blurhash placeholders from images.

## What is Blurhash?

Blurhash is a compact representation of a placeholder for an image. It's a string that represents a blurred version of an image, which can be used as a placeholder while the actual image loads. This provides a smooth user experience with progressive image loading.

## Installation

```bash
npm install imagetools-blurhash
```

## Usage

### Basic Setup

Add the plugin to your Vite configuration:

```typescript
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'
import { blurhash } from 'imagetools-blurhash'

export default defineConfig({
  plugins: [
    imagetools({
      extendTransforms: (builtins) => [
        ...builtins,
        blurhash(),
      ]
    })
  ]
})
```

### Using with Images

```typescript
// In your component
import heroImage from './hero.jpg?blurhash'

// The blurhash string will be available in the metadata
console.log(heroImage.blurhash) // "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
```

### Using with Custom Components

Blurhash components control the quality and detail level of the generated blurhash. You can specify components in different formats:

```typescript
// Using different component configurations
import heroImage from './hero.jpg?blurhash=6'           // 6x6 components (36 total)
import bannerImage from './hero.jpg?blurhash=4,3'       // 4x3 components (12 total)
import thumbnailImage from './hero.jpg?blurhash=3 2'    // 3x2 components (6 total)

// Access the blurhash strings
console.log(heroImage.blurhash)     // Higher quality blurhash (longer string)
console.log(bannerImage.blurhash)   // Custom aspect ratio (medium quality)
console.log(thumbnailImage.blurhash) // Lower quality, smaller string
```

**Component Guidelines:**

- **Higher values** = more detail but larger blurhash strings
- **Typical range**: 3-6 components per axis
- **Default**: 4x4 components (16 total)
- **Maximum recommended**: 9x9 components (81 total)

**Component Formats:**

- `?blurhash=4` - Same value for both x and y (4x4 components)
- `?blurhash=4,3` - Different values for x and y (4x3 components)
- `?blurhash=4 3` - Space separator (4x3 components)
- `?blurhash=4-3` - Dash separator (4x3 components)

### Using Default Configuration

When you configure default options, they will be used when no user options are provided:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    imagetools({
      plugins: {
        blurhash: blurhash({
          always: true,            // Enable by default
          components: 6             // Use 6x6 by default
        })
      }
    })
  ]
})
```

```typescript
// In your components - no need to specify blurhash or components
import heroImage from './hero.jpg?blurhash'  // Uses 6x6 components automatically
import bannerImage from './hero.jpg?blurhash=4,3'  // Override to 4x3

console.log(heroImage.blurhash)     // 6x6 components (from default)
console.log(bannerImage.blurhash)   // 4x3 components (user override)
```

## API

### `blurhash(defaultConfig?)`

Creates a blurhash transform factory for vite-imagetools with optional default configuration.

#### Parameters

```typescript
interface BlurhashConfig {
  always?: boolean
  components?: number | [number, number] | string
}
```

- `defaultConfig` (optional): Default configuration options that will be used when no user options are provided

#### Default Configuration Options

- `always`: Controls when blurhash generation is enabled by default
  - `true`: Enable blurhash generation by default
  - `false`: Disable blurhash generation by default (default)
  - When not specified, user must explicitly enable blurhash

- `components`: Controls the default blurhash quality and detail level
  - `number`: Use the same value for both x and y components (e.g., `4` = 4x4 components)
  - `[number, number]`: Specify x and y components separately (e.g., `[4, 3]` = 4x3 components)
  - `string`: Parse components from string format (e.g., `"4,3"`, `"4 3"`, `"4-3"`)
  - Default: `4` (4x4 components)

#### Usage Examples

```typescript
// Basic usage with no defaults
blurhash()

// With default configuration
blurhash({ 
  always: true, 
  components: 6 
})

// User options will override defaults
const factory = blurhash({ components: 6 })
factory({ blurhash: 3 }) // Uses 3x3, not 6x6
```

### Generated Metadata

When you import an image with `?blurhash=true&as=metadata`, the following metadata will be available:

- `blurhash`: The generated blurhash string
- All other standard imagetools metadata (width, height, format, etc.)

## Performance Notes

- The plugin automatically resizes images to a maximum of 32x32 pixels for blurhash generation to ensure good performance
- Blurhash generation is done during build time, not at runtime
- The generated blurhash strings are typically 20-30 characters long

## TypeScript Configuration

To get proper TypeScript support for the blurhash metadata, add the types to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["imagetools-blurhash/types"]
  }
}
```

This will provide TypeScript support for the `blurhash` property in your image metadata imports:

```typescript
import heroImage from './hero.jpg?blurhash&as=metadata'

// TypeScript will now recognize the blurhash property
console.log(heroImage.blurhash) // ✅ TypeScript knows this is a string
```

The types extend the standard vite-imagetools `ImageMetadata` interface to include the `blurhash` property.

**Note:** The TypeScript types are only available when using the `&as=metadata` or `&as=meta` query parameters. Without these parameters, the import will return the standard image metadata without the `blurhash` property. The types will not work with meta specifiers like `as=meta:width:height:blurhash` [TS Issue](https://github.com/microsoft/TypeScript/issues/38638).

## Requirements

- Vite ^7.0.0
- vite-imagetools ^8.0.0

## License

[MIT](LICENSE) © Faleij.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [GitHub Repository](https://github.com/faleij/imagetools-blurhash)
- [Blurhash Algorithm](https://github.com/woltapp/blurhash)
- [Vite Imagetools](https://github.com/JonasKruckenberg/imagetools)

[npm-image]: http://img.shields.io/npm/v/imagetools-blurhash.svg
[npm-url]: https://npmjs.org/package/imagetools-blurhash
[downloads-image]: https://img.shields.io/npm/dm/imagetools-blurhash.svg
[downloads-url]: https://npmjs.org/package/imagetools-blurhash
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[donate-image]: https://img.shields.io/badge/Donate-PayPal-green.svg
[donate-url]: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=faleij%40gmail%2ecom&lc=GB&item_name=faleij&item_number=imagetoolsBlurhash&currency_code=SEK&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted
