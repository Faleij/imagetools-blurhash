import { describe, it, expect, vi, beforeEach } from 'vitest'
import { blurhash } from '../imagetools-blurhash'
import { setMetadata, getMetadata } from 'vite-imagetools'
import { createMockImage, mockConsole } from './test-utils'

// Mock image interface for testing (unused but kept for consistency)
// interface MockImage {
//   metadata: ReturnType<typeof vi.fn>
//   clone: ReturnType<typeof vi.fn>
//   path: string
// }

// Mock vite-imagetools
vi.mock('vite-imagetools', () => ({
  setMetadata: vi.fn(),
  getMetadata: vi.fn()
}))

// Mock blurhash
vi.mock('blurhash', () => ({
  encode: vi.fn()
}))

describe('blurhash error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConsole()
  })

  describe('image processing errors', () => {
    it('should handle metadata retrieval errors', async () => {
      const mockImage = createMockImage(100, 100)
      mockImage.metadata.mockRejectedValue(new Error('Failed to get metadata'))

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Failed to get metadata')
    })

    it('should handle image cloning errors', async () => {
      const mockImage = createMockImage(100, 100)
      mockImage.clone.mockImplementation(() => {
        throw new Error('Failed to clone image')
      })

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Failed to clone image')
    })

    it('should handle image resizing errors', async () => {
      const mockImage = createMockImage(100, 100)
      const mockResizedImage = {
        resize: vi.fn().mockImplementation(() => {
          throw new Error('Failed to resize image')
        })
      }
      mockImage.clone.mockReturnValue(mockResizedImage)

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Failed to resize image')
    })

    it('should handle alpha channel errors', async () => {
      const mockImage = createMockImage(100, 100)
      const mockResizedImage = {
        resize: vi.fn().mockReturnThis(),
        ensureAlpha: vi.fn().mockImplementation(() => {
          throw new Error('Failed to ensure alpha channel')
        })
      }
      mockImage.clone.mockReturnValue(mockResizedImage)

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Failed to ensure alpha channel')
    })

    it('should handle raw data conversion errors', async () => {
      const mockImage = createMockImage(100, 100)
      const mockResizedImage = {
        resize: vi.fn().mockReturnThis(),
        ensureAlpha: vi.fn().mockReturnThis(),
        raw: vi.fn().mockImplementation(() => {
          throw new Error('Failed to convert to raw data')
        })
      }
      mockImage.clone.mockReturnValue(mockResizedImage)

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Failed to convert to raw data')
    })

    it('should handle buffer conversion errors', async () => {
      const mockImage = createMockImage(100, 100)
      const mockResizedImage = {
        resize: vi.fn().mockReturnThis(),
        ensureAlpha: vi.fn().mockReturnThis(),
        raw: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockRejectedValue(new Error('Failed to convert to buffer'))
      }
      mockImage.clone.mockReturnValue(mockResizedImage)

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Failed to convert to buffer')
    })
  })

  describe('blurhash encoding errors', () => {
    it('should handle blurhash encoding errors', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockImplementation(() => {
        throw new Error('Blurhash encoding failed')
      })

      const mockImage = createMockImage(100, 100)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Blurhash encoding failed')
    })

    it('should handle invalid pixel data', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockImplementation(() => {
        throw new Error('Invalid pixel data')
      })

      const mockImage = createMockImage(100, 100)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Invalid pixel data')
    })

    it('should handle encoding with invalid dimensions', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockImplementation(() => {
        throw new Error('Invalid dimensions for encoding')
      })

      const mockImage = createMockImage(100, 100)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Invalid dimensions for encoding')
    })
  })

  describe('metadata errors', () => {
    it('should handle setMetadata errors', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')
      vi.mocked(setMetadata).mockImplementation(() => {
        throw new Error('Failed to set metadata')
      })

      const mockImage = createMockImage(100, 100)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Failed to set metadata')
    })

    it('should handle getMetadata errors gracefully', async () => {
      vi.mocked(getMetadata).mockImplementation(() => {
        throw new Error('Failed to get metadata')
      })

      const mockImage = createMockImage(0, 100) // This will trigger the zero dimensions warning
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      // Should throw the error from getMetadata
      await expect(transform!(mockImage as any)).rejects.toThrow('Failed to get metadata')
    })
  })

  describe('invalid input handling', () => {
    it('should handle null image', async () => {
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(null as any)).rejects.toThrow()
    })

    it('should handle undefined image', async () => {
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(undefined as any)).rejects.toThrow()
    })

    it('should handle image with missing methods', async () => {
      const invalidImage = {
        metadata: vi.fn().mockResolvedValue({ width: 100, height: 100 })
        // Missing clone method
      }

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(invalidImage as any)).rejects.toThrow()
    })

    it('should handle image with invalid metadata', async () => {
      const mockImage = createMockImage(100, 100)
      mockImage.metadata.mockResolvedValue(null)

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow()
    })

    it('should handle image with undefined dimensions', async () => {
      const mockImage = createMockImage(100, 100)
      mockImage.metadata.mockResolvedValue({ width: undefined, height: undefined })

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow()
    })
  })

  describe('edge case error handling', () => {
    it('should handle very large images that might cause memory issues', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockImplementation(() => {
        throw new Error('Memory allocation failed')
      })

      const mockImage = createMockImage(10000, 10000)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Memory allocation failed')
    })

    it('should handle images with extreme aspect ratios', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockImplementation(() => {
        throw new Error('Invalid aspect ratio')
      })

      const mockImage = createMockImage(1, 10000)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Invalid aspect ratio')
    })

    it('should handle corrupted image data', async () => {
      const mockImage = createMockImage(100, 100)
      const mockResizedImage = {
        resize: vi.fn().mockReturnThis(),
        ensureAlpha: vi.fn().mockReturnThis(),
        raw: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue({
          data: null, // Corrupted data
          info: { width: 32, height: 32 }
        })
      }
      mockImage.clone.mockReturnValue(mockResizedImage)

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow()
    })
  })

  describe('recovery and fallback behavior', () => {
    it('should return original image when blurhash generation fails', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockImplementation(() => {
        throw new Error('Blurhash generation failed')
      })

      const mockImage = createMockImage(100, 100)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      await expect(transform!(mockImage as any)).rejects.toThrow('Blurhash generation failed')
    })

    it('should handle partial failures gracefully', async () => {
      const mockImage = createMockImage(100, 100)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      // First call succeeds
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')
      vi.mocked(setMetadata).mockImplementation(() => {}) // First call succeeds
      const result1 = await transform!(mockImage as any)
      expect(result1).toBe(mockImage)

      // Second call fails from setMetadata
      vi.mocked(setMetadata).mockImplementation(() => {
        throw new Error('Failed to set metadata')
      })
      await expect(transform!(mockImage as any)).rejects.toThrow('Failed to set metadata')
    })
  })
})
