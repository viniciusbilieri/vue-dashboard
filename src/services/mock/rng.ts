/**
 * Random Number Generator with seed support
 * Provides deterministic random data generation
 */
import seedrandom from 'seedrandom'

class RNGService {
  private rng: seedrandom.PRNG

  constructor(seed: string = 'vue-dashboard-seed') {
    this.rng = seedrandom(seed)
  }

  /**
   * Generate random number between min and max (inclusive)
   */
  random(min: number = 0, max: number = 1): number {
    return this.rng() * (max - min) + min
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max + 1))
  }

  /**
   * Pick random element from array
   */
  randomChoice<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)]
  }

  /**
   * Generate random boolean
   */
  randomBoolean(): boolean {
    return this.random() > 0.5
  }

  /**
   * Generate random date between start and end
   */
  randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + this.random() * (end.getTime() - start.getTime()))
  }

  /**
   * Generate array of random numbers
   */
  randomArray(length: number, min: number = 0, max: number = 100): number[] {
    return Array.from({ length }, () => this.random(min, max))
  }

  /**
   * Generate random string
   */
  randomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return Array.from({ length }, () => this.randomChoice(chars.split(''))).join('')
  }

  /**
   * Set new seed
   */
  setSeed(seed: string): void {
    this.rng = seedrandom(seed)
  }
}

// Export singleton instance
export const rng = new RNGService()
export default RNGService
