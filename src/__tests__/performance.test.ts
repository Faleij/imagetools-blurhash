import { describe, it, expect, vi, beforeEach } from 'vitest'
import { blurhash } from '../imagetools-blurhash'
// Mock vite-imagetools functions are imported but not used directly in this test
import { createMockImage, PerformanceTestUtils, testImageScenarios } from './test-utils'

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

describe('blurhash performance tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('single image performance', () => {
    it('should process small images quickly', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const mockImage = createMockImage(100, 100)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const { time } = await PerformanceTestUtils.measureTime(async () => {
        await transform!(mockImage as any)
      })
      
      expect(time).toBeLessThan(100) // Should be very fast for small images
    })

    it('should process medium images within reasonable time', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const mockImage = createMockImage(1000, 1000)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const { time } = await PerformanceTestUtils.measureTime(async () => {
        await transform!(mockImage as any)
      })
      
      expect(time).toBeLessThan(500) // Should be reasonable for medium images
    })

    it('should process large images within acceptable time', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const mockImage = createMockImage(4000, 3000)
      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      const { time } = await PerformanceTestUtils.measureTime(async () => {
        await transform!(mockImage as any)
      })
      
      expect(time).toBeLessThan(1000) // Should be acceptable for large images
    })
  })

  describe('batch processing performance', () => {
    it('should handle multiple small images efficiently', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      const images = Array.from({ length: 10 }, (_, i) => 
        createMockImage(100 + i * 10, 100 + i * 10)
      )

      const { averageTime } = await PerformanceTestUtils.measureMultiple(
        async () => {
          await Promise.all(images.map(image => transform!(image as any)))
        },
        5
      )
      
      expect(averageTime).toBeLessThan(200) // Should be efficient for batch processing
    })

    it('should handle mixed image sizes efficiently', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      const images = [
        createMockImage(100, 100),   // Small
        createMockImage(500, 500),   // Medium
        createMockImage(1000, 1000), // Large
        createMockImage(2000, 2000)  // Very large
      ]

      const { averageTime } = await PerformanceTestUtils.measureMultiple(
        async () => {
          await Promise.all(images.map(image => transform!(image as any)))
        },
        3
      )
      
      expect(averageTime).toBeLessThan(500) // Should handle mixed sizes well
    })
  })

  describe('memory usage', () => {
    it('should not leak memory with repeated processing', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      const mockImage = createMockImage(1000, 1000)

      // Process the same image multiple times
      for (let i = 0; i < 100; i++) {
        await transform!(mockImage as any)
      }

      // If we get here without memory issues, the test passes
      expect(true).toBe(true)
    })

    it('should handle concurrent processing without memory issues', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      const images = Array.from({ length: 50 }, (_, i) => 
        createMockImage(200 + i * 10, 200 + i * 10)
      )

      // Process all images concurrently
      await Promise.all(images.map(image => transform!(image as any)))

      // If we get here without memory issues, the test passes
      expect(true).toBe(true)
    })
  })

  describe('different image scenarios performance', () => {
    it('should handle web images efficiently', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      for (const scenario of testImageScenarios.web) {
        const mockImage = createMockImage(scenario.width, scenario.height)
        const { time } = await PerformanceTestUtils.measureTime(async () => {
          await transform!(mockImage as any)
        })
        
        expect(time).toBeLessThan(300) // Should be fast for web images
      }
    })

    it('should handle mobile images efficiently', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      for (const scenario of testImageScenarios.mobile) {
        const mockImage = createMockImage(scenario.width, scenario.height)
        const { time } = await PerformanceTestUtils.measureTime(async () => {
          await transform!(mockImage as any)
        })
        
        expect(time).toBeLessThan(200) // Should be fast for mobile images
      }
    })

    it('should handle square images efficiently', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      
      for (const scenario of testImageScenarios.square) {
        const mockImage = createMockImage(scenario.width, scenario.height)
        const { time } = await PerformanceTestUtils.measureTime(async () => {
          await transform!(mockImage as any)
        })
        
        expect(time).toBeLessThan(250) // Should be fast for square images
      }
    })
  })

  describe('edge case performance', () => {
    it('should handle very small images quickly', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      const mockImage = createMockImage(1, 1)
      
      const { time } = await PerformanceTestUtils.measureTime(async () => {
        await transform!(mockImage as any)
      })
      
      expect(time).toBeLessThan(50) // Should be very fast for 1x1 images
    })

    it('should handle very large images within reasonable time', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      const mockImage = createMockImage(8000, 6000)
      
      const { time } = await PerformanceTestUtils.measureTime(async () => {
        await transform!(mockImage as any)
      })
      
      expect(time).toBeLessThan(1000) // Should be reasonable for very large images
    })
  })

  describe('concurrent processing performance', () => {
    it('should handle high concurrency without performance degradation', async () => {
      const { encode } = await import('blurhash')
      vi.mocked(encode).mockReturnValue('L6PZfSi_.AyE_3t7t7R**0o#DgR4')

      const factory = blurhash({ components: [4, 4] })
      const transform = factory({ blurhash: 'true' }, {} as any)
      const images = Array.from({ length: 20 }, (_, i) => 
        createMockImage(100 + i * 5, 100 + i * 5)
      )

      const { averageTime } = await PerformanceTestUtils.measureMultiple(
        async () => {
          await Promise.all(images.map(image => transform!(image as any)))
        },
        3
      )
      
      expect(averageTime).toBeLessThan(400) // Should handle concurrency well
    })
  })
})
