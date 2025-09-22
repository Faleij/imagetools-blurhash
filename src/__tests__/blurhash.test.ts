import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { blurhash, type BlurhashOptions, type BlurhashConfig } from '../imagetools-blurhash'
import { setMetadata, getMetadata } from 'vite-imagetools'

// Mock vite-imagetools
vi.mock('vite-imagetools', () => ({
  setMetadata: vi.fn(),
  getMetadata: vi.fn(),
  TransformFactory: vi.fn()
}))

// Mock blurhash
vi.mock('blurhash', () => ({
  encode: vi.fn()
}))

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {})
}

describe('blurhash plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('plugin factory', () => {
    it('should return undefined when blurhash is empty string', () => {
      const factory = blurhash()
      const result = factory({ blurhash: '' }, {} as any)
      expect(result).toBeUndefined()
    })

    it('should return undefined when blurhash is false', () => {
      const factory = blurhash()
      const result = factory({ blurhash: 'false' as any }, {} as any)
      expect(result).toBeUndefined()
    })

    it('should return transform function when blurhash is true', () => {
      const factory = blurhash()
      const result = factory({ blurhash: 'true' }, {} as any)
      expect(typeof result).toBe('function')
    })

    it('should return undefined when no config provided and always is false', () => {
      const factory = blurhash()
      const result = factory({}, {} as any)
      expect(result).toBeUndefined()
    })

    it('should use provided default configuration', () => {
      const factory = blurhash({ always: true, components: 6 })
      const result = factory({}, {} as any)
      expect(typeof result).toBe('function')
    })

    it('should merge user options with defaults', () => {
      const factory = blurhash({ components: 6 })
      const result = factory({ blurhash: 'true' }, {} as any)
      expect(typeof result).toBe('function')
    })

    it('should use always option for default blurhash generation', () => {
      const factory = blurhash({ always: true })
      const result = factory({}, {} as any)
      expect(typeof result).toBe('function')
    })

    it('should not generate blurhash when always is false and user explicitly disables', () => {
      const factory = blurhash({ always: false })
      const result = factory({ blurhash: 'false' as any }, {} as any)
      expect(result).toBeUndefined()
    })

  })

  describe('transform function', () => {
    let mockImage: any
    let mockMetadata: any
    let mockResizedImage: any
    let mockBuffer: any

    beforeEach(() => {
      // Mock image object
      mockImage = {
        metadata: vi.fn(),
        clone: vi.fn(),
        resize: vi.fn(),
        ensureAlpha: vi.fn(),
        raw: vi.fn(),
        toBuffer: vi.fn()
      }

      // Mock metadata
      mockMetadata = {
        width: 100,
        height: 50
      }

      // Mock resized image
      mockResizedImage = {
        resize: vi.fn(),
        ensureAlpha: vi.fn(),
        raw: vi.fn(),
        toBuffer: vi.fn()
      }

      // Mock buffer data
      mockBuffer = {
        data: new Uint8Array(800), // 100 * 50 * 4 (RGBA)
        info: {
          width: 32,
          height: 16
        }
      }

      // Setup mock chain
      mockImage.metadata.mockResolvedValue(mockMetadata)
      mockImage.clone.mockReturnValue(mockResizedImage)
      mockResizedImage.resize.mockReturnValue(mockResizedImage)
      mockResizedImage.ensureAlpha.mockReturnValue(mockResizedImage)
      mockResizedImage.raw.mockReturnValue(mockResizedImage)
      mockResizedImage.toBuffer.mockResolvedValue(mockBuffer)

      // Mock getMetadata
      vi.mocked(getMetadata).mockReturnValue('/test/image.jpg')
    })

    it('should generate blurhash for valid image', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      expect(transform).toBeDefined()

      const result = await transform!(mockImage)

      expect(mockImage.metadata).toHaveBeenCalled()
      expect(mockImage.clone).toHaveBeenCalled()
      expect(mockResizedImage.resize).toHaveBeenCalledWith(32, 16, { kernel: 'nearest' })
      expect(mockResizedImage.ensureAlpha).toHaveBeenCalled()
      expect(mockResizedImage.raw).toHaveBeenCalled()
      expect(mockResizedImage.toBuffer).toHaveBeenCalledWith({ resolveWithObject: true })
      expect(encode).toHaveBeenCalledWith(expect.any(Uint8ClampedArray), 32, 16, 4, 4)
      expect(setMetadata).toHaveBeenCalledWith(mockImage, 'blurhash', mockBlurhash)
      expect(result).toBe(mockImage)
    })

    it('should handle zero width image', async () => {
      mockMetadata.width = 0
      mockMetadata.height = 50
      mockImage.metadata.mockResolvedValue(mockMetadata)
      
      // Ensure getMetadata is mocked for this test
      vi.mocked(getMetadata).mockReturnValue('/test/image.jpg')

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      const result = await transform!(mockImage)

      // Should return the original image without processing
      expect(result).toBe(mockImage)
      expect(setMetadata).not.toHaveBeenCalled()
    })

    it('should handle zero height image', async () => {
      mockMetadata.width = 100
      mockMetadata.height = 0
      mockImage.metadata.mockResolvedValue(mockMetadata)
      
      // Ensure getMetadata is mocked for this test
      vi.mocked(getMetadata).mockReturnValue('/test/image.jpg')

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      const result = await transform!(mockImage)

      // Should return the original image without processing
      expect(result).toBe(mockImage)
      expect(setMetadata).not.toHaveBeenCalled()
    })

    it('should handle very small images', async () => {
      mockMetadata.width = 1
      mockMetadata.height = 1

      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      await transform!(mockImage)

      expect(mockResizedImage.resize).toHaveBeenCalledWith(1, 1, { kernel: 'nearest' })
    })

    it('should handle very large images', async () => {
      mockMetadata.width = 1000
      mockMetadata.height = 500

      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      await transform!(mockImage)

      // Should resize to max 32x32
      expect(mockResizedImage.resize).toHaveBeenCalledWith(32, 16, { kernel: 'nearest' })
    })

    it('should handle square images', async () => {
      mockMetadata.width = 200
      mockMetadata.height = 200

      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      await transform!(mockImage)

      expect(mockResizedImage.resize).toHaveBeenCalledWith(32, 32, { kernel: 'nearest' })
    })

    it('should handle tall images', async () => {
      mockMetadata.width = 50
      mockMetadata.height = 200

      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      await transform!(mockImage)

      expect(mockResizedImage.resize).toHaveBeenCalledWith(8, 32, { kernel: 'nearest' })
    })

    it('should handle wide images', async () => {
      mockMetadata.width = 200
      mockMetadata.height = 50

      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      await transform!(mockImage)

      expect(mockResizedImage.resize).toHaveBeenCalledWith(32, 8, { kernel: 'nearest' })
    })

    it('should ensure minimum size of 1x1', async () => {
      mockMetadata.width = 0.5
      mockMetadata.height = 0.5

      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      await transform!(mockImage)

      expect(mockResizedImage.resize).toHaveBeenCalledWith(1, 1, { kernel: 'nearest' })
    })

    it('should handle encode errors gracefully', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockImplementation(() => {
        throw new Error('Encode failed')
      })

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage)).rejects.toThrow('Encode failed')
    })

    it('should handle image processing errors gracefully', async () => {
      mockImage.metadata.mockRejectedValue(new Error('Metadata failed'))

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage)).rejects.toThrow('Metadata failed')
    })
  })

  describe('BlurhashOptions interface', () => {
    it('should accept valid options', () => {
      const options: BlurhashOptions = { blurhash: 'true' }
      expect(options.blurhash).toBe('true')
    })

    it('should accept empty string', () => {
      const options: BlurhashOptions = { blurhash: '' }
      expect(options.blurhash).toBe('')
    })

    it('should accept blurhash as number', () => {
      const options: BlurhashOptions = { blurhash: 6 }
      expect(options.blurhash).toBe(6)
    })

    it('should accept blurhash as string', () => {
      const options: BlurhashOptions = { blurhash: '4,3' }
      expect(options.blurhash).toBe('4,3')
    })

  })

  describe('blurhash argument parsing', () => {
    let mockImage: any
    let mockMetadata: any
    let mockResizedImage: any
    let mockBuffer: any

    beforeEach(() => {
      // Mock image object
      mockImage = {
        metadata: vi.fn(),
        clone: vi.fn(),
        resize: vi.fn(),
        ensureAlpha: vi.fn(),
        raw: vi.fn(),
        toBuffer: vi.fn()
      }

      // Mock metadata
      mockMetadata = {
        width: 100,
        height: 50
      }

      // Mock resized image
      mockResizedImage = {
        resize: vi.fn(),
        ensureAlpha: vi.fn(),
        raw: vi.fn(),
        toBuffer: vi.fn()
      }

      // Mock buffer data
      mockBuffer = {
        data: new Uint8Array(800), // 100 * 50 * 4 (RGBA)
        info: {
          width: 32,
          height: 16
        }
      }

      // Setup mock chain
      mockImage.metadata.mockResolvedValue(mockMetadata)
      mockImage.clone.mockReturnValue(mockResizedImage)
      mockResizedImage.resize.mockReturnValue(mockResizedImage)
      mockResizedImage.ensureAlpha.mockReturnValue(mockResizedImage)
      mockResizedImage.raw.mockReturnValue(mockResizedImage)
      mockResizedImage.toBuffer.mockResolvedValue(mockBuffer)

      // Mock getMetadata
      vi.mocked(getMetadata).mockReturnValue('/test/image.jpg')
    })

    it('should use number components for both x and y', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: 6 } as any, {} as any)
      await transform!(mockImage)

      expect(encode).toHaveBeenCalledWith(expect.any(Uint8ClampedArray), 32, 16, 6, 6)
    })

    it('should parse string components with comma separator', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: '5,2' } as any, {} as any)
      await transform!(mockImage)

      expect(encode).toHaveBeenCalledWith(expect.any(Uint8ClampedArray), 32, 16, 5, 2)
    })

    it('should parse string components with space separator', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: '3 4' } as any, {} as any)
      await transform!(mockImage)

      expect(encode).toHaveBeenCalledWith(expect.any(Uint8ClampedArray), 32, 16, 3, 4)
    })

    it('should parse string components with dash separator', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: '2-5' } as any, {} as any)
      await transform!(mockImage)

      expect(encode).toHaveBeenCalledWith(expect.any(Uint8ClampedArray), 32, 16, 2, 5)
    })

    it('should handle string components with extra whitespace', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: ' 3 , 2 ' } as any, {} as any)
      await transform!(mockImage)

      expect(encode).toHaveBeenCalledWith(expect.any(Uint8ClampedArray), 32, 16, 3, 2)
    })

    it('should throw error for invalid string format', () => {
      expect(() => {
        const factory = blurhash()
        factory({ blurhash: 'invalid' } as any, {} as any)
      }).toThrow('Invalid blurhashComponents string format: "invalid". Expected format: "x,y" or "x y" or "x-y"')
    })

    it('should use default components when blurhash is true', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash()
      const transform = factory({ blurhash: 'true' }, {} as any)
      await transform!(mockImage)

      expect(encode).toHaveBeenCalledWith(expect.any(Uint8ClampedArray), 32, 16, 4, 4)
    })

    it('should use default configuration components when blurhash is true', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash({ components: 6 })
      const transform = factory({ blurhash: 'true' }, {} as any)
      await transform!(mockImage)

      expect(encode).toHaveBeenCalledWith(expect.any(Uint8ClampedArray), 32, 16, 6, 6)
    })

    it('should override default configuration with user options', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash({ components: 6 })
      const transform = factory({ blurhash: 3 } as any, {} as any)
      await transform!(mockImage)

      expect(encode).toHaveBeenCalledWith(expect.any(Uint8ClampedArray), 32, 16, 3, 3)
    })

    it('should return undefined when blurhash is empty', () => {
      const factory = blurhash()
      const result = factory({ blurhash: '' }, {} as any)
      expect(result).toBeUndefined()
    })
  })
})
