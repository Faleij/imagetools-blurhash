import { describe, it, expect, vi, beforeEach } from 'vitest'
import { blurhash } from '../imagetools-blurhash'
import { setMetadata } from 'vite-imagetools'
import { createMockImage } from './test-utils'

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

describe('blurhash integration tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('real-world scenarios', () => {
    it('should handle typical web image dimensions', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      // Mock a typical web image (1920x1080)
      const mockImage = createMockImage(1920, 1080)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const result = await transform!(mockImage as any)

      expect(result).toBe(mockImage)
      expect(setMetadata).toHaveBeenCalledWith(mockImage, 'blurhash', mockBlurhash)
    })

    it('should handle mobile image dimensions', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      // Mock a mobile image (375x667)
      const mockImage = createMockImage(375, 667)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const result = await transform!(mockImage as any)

      expect(result).toBe(mockImage)
      expect(setMetadata).toHaveBeenCalledWith(mockImage, 'blurhash', mockBlurhash)
    })

    it('should handle square profile images', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      // Mock a square profile image (300x300)
      const mockImage = createMockImage(300, 300)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const result = await transform!(mockImage as any)

      expect(result).toBe(mockImage)
      expect(setMetadata).toHaveBeenCalledWith(mockImage, 'blurhash', mockBlurhash)
    })

    it('should handle thumbnail images', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      // Mock a small thumbnail (150x100)
      const mockImage = createMockImage(150, 100)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const result = await transform!(mockImage as any)

      expect(result).toBe(mockImage)
      expect(setMetadata).toHaveBeenCalledWith(mockImage, 'blurhash', mockBlurhash)
    })

    it('should handle very wide banner images', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      // Mock a wide banner (1920x400)
      const mockImage = createMockImage(1920, 400)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const result = await transform!(mockImage as any)

      expect(result).toBe(mockImage)
      expect(setMetadata).toHaveBeenCalledWith(mockImage, 'blurhash', mockBlurhash)
    })

    it('should handle very tall images', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      // Mock a tall image (400x1920)
      const mockImage = createMockImage(400, 1920)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const result = await transform!(mockImage as any)

      expect(result).toBe(mockImage)
      expect(setMetadata).toHaveBeenCalledWith(mockImage, 'blurhash', mockBlurhash)
    })
  })

  describe('edge cases', () => {
    it('should handle 1x1 pixel image', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const mockImage = createMockImage(1, 1)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const result = await transform!(mockImage as any)

      expect(result).toBe(mockImage)
      expect(setMetadata).toHaveBeenCalledWith(mockImage, 'blurhash', mockBlurhash)
    })

    it('should handle extremely large images', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      // Mock an extremely large image (8000x6000)
      const mockImage = createMockImage(8000, 6000)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const result = await transform!(mockImage as any)

      expect(result).toBe(mockImage)
      expect(setMetadata).toHaveBeenCalledWith(mockImage, 'blurhash', mockBlurhash)
    })

    it('should handle non-integer dimensions', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      // Mock image with non-integer dimensions
      const mockImage = createMockImage(100.5, 50.3)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const result = await transform!(mockImage as any)

      expect(result).toBe(mockImage)
      expect(setMetadata).toHaveBeenCalledWith(mockImage, 'blurhash', mockBlurhash)
    })
  })

  describe('performance scenarios', () => {
    it('should handle multiple images in sequence', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      const images = [
        createMockImage(100, 100),
        createMockImage(200, 200),
        createMockImage(300, 300)
      ]

      const results = await Promise.all(
        images.map(image => transform!(image as any))
      )

      expect(results).toHaveLength(3)
      expect(setMetadata).toHaveBeenCalledTimes(3)
    })

    it('should handle concurrent image processing', async () => {
      const { encode } = await import('blurhash')
      const mockBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
      vi.mocked(encode).mockReturnValue(mockBlurhash)

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      const images = Array.from({ length: 10 }, (_, i) => 
        createMockImage(100 + i * 10, 100 + i * 10)
      )

      const results = await Promise.all(
        images.map(image => transform!(image as any))
      )

      expect(results).toHaveLength(10)
      expect(setMetadata).toHaveBeenCalledTimes(10)
    })
  })
})
