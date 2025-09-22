import { vi } from 'vitest'

/**
 * Creates a mock image object for testing
 */
export function createMockImage(width: number, height: number, path = '/test/image.jpg') {
  const mockResizedImage = {
    ensureAlpha: vi.fn().mockReturnThis(),
    raw: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue({
      data: new Uint8Array(width * height * 4), // RGBA
      info: { 
        width: Math.min(32, Math.max(1, Math.round(width * 32 / Math.max(width, height)))), 
        height: Math.min(32, Math.max(1, Math.round(height * 32 / Math.max(width, height))))
      }
    })
  }

  return {
    metadata: vi.fn().mockResolvedValue({ width, height }),
    clone: vi.fn().mockReturnValue({
      resize: vi.fn().mockReturnValue(mockResizedImage)
    }),
    path
  } as any // Type assertion to avoid Sharp interface requirements
}

/**
 * Creates a mock blurhash encoder
 */
export function createMockBlurhashEncoder(returnValue = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4') {
  return vi.fn().mockReturnValue(returnValue)
}

/**
 * Creates a mock vite-imagetools module
 */
export function createMockViteImagetools() {
  return {
    setMetadata: vi.fn(),
    getMetadata: vi.fn().mockReturnValue('/test/image.jpg'),
    TransformFactory: vi.fn()
  }
}

/**
 * Creates test data for different image scenarios
 */
export const testImageScenarios = {
  // Common web image dimensions
  web: [
    { width: 1920, height: 1080, name: 'Full HD' },
    { width: 1280, height: 720, name: 'HD' },
    { width: 800, height: 600, name: 'Standard' },
    { width: 640, height: 480, name: 'VGA' }
  ],
  
  // Mobile image dimensions
  mobile: [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11' },
    { width: 360, height: 640, name: 'Android Standard' }
  ],
  
  // Square images
  square: [
    { width: 300, height: 300, name: 'Profile Medium' },
    { width: 150, height: 150, name: 'Profile Small' },
    { width: 600, height: 600, name: 'Profile Large' }
  ],
  
  // Banner/wide images
  banner: [
    { width: 1920, height: 400, name: 'Wide Banner' },
    { width: 1200, height: 300, name: 'Medium Banner' },
    { width: 800, height: 200, name: 'Small Banner' }
  ],
  
  // Thumbnail images
  thumbnail: [
    { width: 150, height: 100, name: 'Thumbnail Standard' },
    { width: 200, height: 150, name: 'Thumbnail Large' },
    { width: 100, height: 75, name: 'Thumbnail Small' }
  ],
  
  // Edge cases
  edge: [
    { width: 1, height: 1, name: '1x1 Pixel' },
    { width: 0, height: 100, name: 'Zero Width' },
    { width: 100, height: 0, name: 'Zero Height' },
    { width: 8000, height: 6000, name: 'Very Large' },
    { width: 100.5, height: 50.3, name: 'Non-integer' }
  ]
}

/**
 * Creates a test suite for a specific image scenario
 */
export function createImageTestSuite(scenario: { width: number; height: number; name: string }) {
  return {
    name: scenario.name,
    width: scenario.width,
    height: scenario.height,
    mockImage: createMockImage(scenario.width, scenario.height)
  }
}

/**
 * Mock console methods for testing
 */
export function mockConsole() {
  return {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {})
  }
}

/**
 * Creates a mock blurhash result
 */
export function createMockBlurhashResult(components = 4) {
  // Generate a realistic-looking blurhash string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const length = Math.floor((components * components + 3) / 4) * 4 + 4
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Creates test data for different aspect ratios
 */
export const aspectRatioTests = [
  { width: 16, height: 9, ratio: 16/9, name: '16:9' },
  { width: 4, height: 3, ratio: 4/3, name: '4:3' },
  { width: 1, height: 1, ratio: 1, name: '1:1' },
  { width: 3, height: 2, ratio: 3/2, name: '3:2' },
  { width: 21, height: 9, ratio: 21/9, name: '21:9' },
  { width: 2, height: 1, ratio: 2, name: '2:1' },
  { width: 1, height: 2, ratio: 0.5, name: '1:2' }
]

/**
 * Performance test utilities
 */
export class PerformanceTestUtils {
  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
    const start = performance.now()
    const result = await fn()
    const time = performance.now() - start
    return { result, time }
  }

  static async measureMultiple<T>(
    fn: () => Promise<T>, 
    iterations: number = 10
  ): Promise<{ results: T[]; averageTime: number; minTime: number; maxTime: number }> {
    const times: number[] = []
    const results: T[] = []

    for (let i = 0; i < iterations; i++) {
      const { result, time } = await this.measureTime(fn)
      results.push(result)
      times.push(time)
    }

    return {
      results,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times)
    }
  }
}
