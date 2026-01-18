/**
 * Unit tests for Mandelbrot set calculation utilities
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { calculateMandelbrot, getColor, pixelToComplex, complexToPixel, renderMandelbrot, createZoomViewport, panViewport, zoomAtPoint, getDefaultViewport } from './mandelbrot';
// Mock ImageData for Node.js environment
class MockImageData {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint8ClampedArray(width * height * 4);
    }
}
// Set up ImageData global for tests
beforeAll(() => {
    globalThis.ImageData = MockImageData;
});
describe('calculateMandelbrot', () => {
    it('should return maxIterations for origin (known to be in the set)', () => {
        const result = calculateMandelbrot(0, 0, 100);
        expect(result).toBe(100);
    });
    it('should escape quickly for points outside the set', () => {
        const result = calculateMandelbrot(1, 0, 100);
        expect(result).toBeLessThan(10);
    });
    it('should escape quickly for point far outside', () => {
        const result = calculateMandelbrot(2, 2, 100);
        expect(result).toBe(1);
    });
    it('should return maxIterations for a point known to be in the set', () => {
        const result = calculateMandelbrot(-0.5, 0, 100);
        expect(result).toBe(100);
    });
    it('should return maxIterations for -1+0i (in the set)', () => {
        // After iteration 1: z = (-1)^2 + 0 + (-1) = 0, so it stays at origin
        const result = calculateMandelbrot(-1, 0, 100);
        expect(result).toBe(100);
    });
    it('should respect maxIterations parameter', () => {
        const result = calculateMandelbrot(1, 0, 10);
        expect(result).toBeLessThanOrEqual(10);
    });
    it('should handle points that escape after few iterations', () => {
        // 1 + 0.5i escapes quickly
        const result = calculateMandelbrot(1, 0.5, 100);
        expect(result).toBeLessThan(20);
    });
});
describe('getColor', () => {
    it('should return black for points in the set', () => {
        const color = getColor(100, 100, 'grayscale');
        expect(color).toEqual({ r: 0, g: 0, b: 0 });
    });
    it('should return grayscale values for grayscale scheme', () => {
        const color = getColor(0, 100, 'grayscale');
        expect(color.r).toBe(255);
        expect(color.g).toBe(255);
        expect(color.b).toBe(255);
    });
    it('should return black for max iterations in grayscale', () => {
        const color = getColor(100, 100, 'grayscale');
        expect(color).toEqual({ r: 0, g: 0, b: 0 });
    });
    it('should return valid RGB values for rainbow scheme', () => {
        const color = getColor(50, 100, 'rainbow');
        expect(color.r).toBeGreaterThanOrEqual(0);
        expect(color.r).toBeLessThanOrEqual(255);
        expect(color.g).toBeGreaterThanOrEqual(0);
        expect(color.g).toBeLessThanOrEqual(255);
        expect(color.b).toBeGreaterThanOrEqual(0);
        expect(color.b).toBeLessThanOrEqual(255);
    });
    it('should return valid RGB values for fire scheme', () => {
        const color = getColor(50, 100, 'fire');
        expect(color.r).toBeGreaterThanOrEqual(0);
        expect(color.r).toBeLessThanOrEqual(255);
        expect(color.g).toBeGreaterThanOrEqual(0);
        expect(color.g).toBeLessThanOrEqual(255);
        expect(color.b).toBeGreaterThanOrEqual(0);
        expect(color.b).toBeLessThanOrEqual(255);
    });
    it('should return black for all schemes when in set', () => {
        const schemes = ['grayscale', 'rainbow', 'fire'];
        schemes.forEach(scheme => {
            const color = getColor(100, 100, scheme);
            expect(color).toEqual({ r: 0, g: 0, b: 0 });
        });
    });
    it('should return white (255,255,255) for iteration 0 in grayscale', () => {
        const color = getColor(0, 100, 'grayscale');
        expect(color).toEqual({ r: 255, g: 255, b: 255 });
    });
});
describe('pixelToComplex', () => {
    it('should convert top-left corner correctly', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = pixelToComplex(0, 0, 800, 600, viewport);
        expect(result.real).toBeCloseTo(-2.5, 6);
        expect(result.imaginary).toBeCloseTo(-1.5, 6);
    });
    it('should convert bottom-right corner correctly', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = pixelToComplex(800, 600, 800, 600, viewport);
        expect(result.real).toBeCloseTo(1, 6);
        expect(result.imaginary).toBeCloseTo(1.5, 6);
    });
    it('should convert center correctly', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = pixelToComplex(400, 300, 800, 600, viewport);
        expect(result.real).toBeCloseTo(-0.75, 6);
        expect(result.imaginary).toBeCloseTo(0, 6);
    });
});
describe('complexToPixel', () => {
    it('should convert top-left corner correctly', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = complexToPixel(-2.5, -1.5, 800, 600, viewport);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
    });
    it('should convert bottom-right corner correctly', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = complexToPixel(1, 1.5, 800, 600, viewport);
        expect(result.x).toBe(800);
        expect(result.y).toBe(600);
    });
    it('should be inverse of pixelToComplex for center point', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const original = { real: -0.75, imaginary: 0 };
        const pixel = complexToPixel(original.real, original.imaginary, 800, 600, viewport);
        const backToComplex = pixelToComplex(pixel.x, pixel.y, 800, 600, viewport);
        expect(backToComplex.real).toBeCloseTo(original.real, 2);
        expect(backToComplex.imaginary).toBeCloseTo(original.imaginary, 2);
    });
});
describe('createZoomViewport', () => {
    it('should create a smaller viewport when selecting a region', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = createZoomViewport(viewport, 100, 100, 300, 300, 800, 600);
        // The new viewport should be a subset of the original
        expect(result.xMin).toBeGreaterThan(viewport.xMin);
        expect(result.xMax).toBeLessThan(viewport.xMax);
        expect(result.yMin).toBeGreaterThan(viewport.yMin);
        expect(result.yMax).toBeLessThan(viewport.yMax);
    });
    it('should handle reversed selection coordinates', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = createZoomViewport(viewport, 300, 300, 100, 100, 800, 600);
        // Should still work correctly
        expect(result.xMin).toBeLessThan(result.xMax);
        expect(result.yMin).toBeLessThan(result.yMax);
    });
    it('should have valid viewport coordinates', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = createZoomViewport(viewport, 200, 200, 400, 400, 800, 600);
        expect(result.xMin).toBeLessThan(result.xMax);
        expect(result.yMin).toBeLessThan(result.yMax);
        // Should still be within original bounds
        expect(result.xMin).toBeGreaterThanOrEqual(viewport.xMin);
        expect(result.xMax).toBeLessThanOrEqual(viewport.xMax);
    });
});
describe('panViewport', () => {
    it('should shift viewport right when panning positive dx', () => {
        // dx > 0 means panning in positive direction (view moves right, showing new content on left)
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = panViewport(viewport, 50, 0, 800, 600);
        // xMin should be smaller (more left) since we're panning right
        expect(result.xMin).toBeLessThan(viewport.xMin);
        expect(result.xMax).toBeLessThan(viewport.xMax);
        expect(result.yMin).toBe(viewport.yMin);
        expect(result.yMax).toBe(viewport.yMax);
    });
    it('should shift viewport left when panning negative dx', () => {
        // dx < 0 means panning in negative direction (view moves left, showing new content on right)
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = panViewport(viewport, -50, 0, 800, 600);
        // xMin should be larger (more right) since we're panning left
        expect(result.xMin).toBeGreaterThan(viewport.xMin);
        expect(result.xMax).toBeGreaterThan(viewport.xMax);
        expect(result.yMin).toBe(viewport.yMin);
        expect(result.yMax).toBe(viewport.yMax);
    });
    it('should shift viewport down when panning positive dy', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = panViewport(viewport, 0, 50, 800, 600);
        // yMin should be smaller (more up) since we're panning down
        expect(result.yMin).toBeLessThan(viewport.yMin);
        expect(result.yMax).toBeLessThan(viewport.yMax);
    });
    it('should shift viewport up when panning negative dy', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = panViewport(viewport, 0, -50, 800, 600);
        // yMin should be larger (more down) since we're panning up
        expect(result.yMin).toBeGreaterThan(viewport.yMin);
        expect(result.yMax).toBeGreaterThan(viewport.yMax);
    });
});
describe('zoomAtPoint', () => {
    it('should create a smaller viewport when zooming in', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = zoomAtPoint(viewport, 400, 300, 2, 800, 600);
        const originalWidth = viewport.xMax - viewport.xMin;
        const newWidth = result.xMax - result.xMin;
        expect(newWidth).toBeCloseTo(originalWidth / 2, 4);
    });
    it('should center zoom around the specified point', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = zoomAtPoint(viewport, 400, 300, 2, 800, 600);
        // Center should be at the complex coordinate of (400, 300)
        const centerX = (result.xMin + result.xMax) / 2;
        const centerY = (result.yMin + result.yMax) / 2;
        expect(centerX).toBeCloseTo(-0.75, 4);
        expect(centerY).toBeCloseTo(0, 4);
    });
    it('should create a larger viewport when zooming out', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const result = zoomAtPoint(viewport, 400, 300, 0.5, 800, 600);
        const originalWidth = viewport.xMax - viewport.xMin;
        const newWidth = result.xMax - result.xMin;
        expect(newWidth).toBeCloseTo(originalWidth * 2, 4);
    });
});
describe('getDefaultViewport', () => {
    it('should return a viewport covering the main Mandelbrot set', () => {
        const viewport = getDefaultViewport();
        expect(viewport.xMin).toBe(-2.5);
        expect(viewport.xMax).toBe(1);
        expect(viewport.yMin).toBe(-1.5);
        expect(viewport.yMax).toBe(1.5);
    });
});
describe('renderMandelbrot', () => {
    it('should return ImageData with correct dimensions', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const options = { maxIterations: 100, colorScheme: 'grayscale' };
        const result = renderMandelbrot(100, 100, viewport, options);
        expect(result.width).toBe(100);
        expect(result.height).toBe(100);
        expect(result.data.length).toBe(100 * 100 * 4);
    });
    it('should return ImageData with alpha = 255', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const options = { maxIterations: 100, colorScheme: 'grayscale' };
        const result = renderMandelbrot(50, 50, viewport, options);
        // Check every 4th element (alpha channel)
        for (let i = 3; i < result.data.length; i += 4) {
            expect(result.data[i]).toBe(255);
        }
    });
    it('should produce data for all pixels', () => {
        const viewport = { xMin: -2.5, xMax: 1, yMin: -1.5, yMax: 1.5 };
        const options = { maxIterations: 50, colorScheme: 'fire' };
        const result = renderMandelbrot(20, 20, viewport, options);
        // All pixels should have valid RGBA values
        for (let i = 0; i < result.data.length; i++) {
            expect(result.data[i]).toBeTypeOf('number');
        }
    });
});
