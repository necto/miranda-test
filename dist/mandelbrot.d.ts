/**
 * Mandelbrot set calculation and rendering utilities
 */
export interface Viewport {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}
export interface RenderOptions {
    maxIterations: number;
    colorScheme: 'grayscale' | 'rainbow' | 'fire';
}
/**
 * Calculate the number of iterations for a point to escape the Mandelbrot set
 * @param cx Real component of the complex point
 * @param cy Imaginary component of the complex point
 * @param maxIterations Maximum iterations before considering point as "in the set"
 * @returns Number of iterations before escape (0 to maxIterations)
 */
export declare function calculateMandelbrot(cx: number, cy: number, maxIterations?: number): number;
/**
 * Generate color for a given iteration count
 * @param iteration Iteration count (0 to maxIterations)
 * @param maxIterations Maximum iterations used
 * @param scheme Color scheme to use
 * @returns RGB color object {r, g, b}
 */
export declare function getColor(iteration: number, maxIterations: number, scheme?: RenderOptions['colorScheme']): {
    r: number;
    g: number;
    b: number;
};
/**
 * Convert pixel coordinates to complex plane coordinates
 * @param pixelX Pixel X coordinate
 * @param pixelY Pixel Y coordinate
 * @param width Canvas width in pixels
 * @param height Canvas height in pixels
 * @param viewport The current viewport on the complex plane
 * @returns Complex coordinates {real, imaginary}
 */
export declare function pixelToComplex(pixelX: number, pixelY: number, width: number, height: number, viewport: Viewport): {
    real: number;
    imaginary: number;
};
/**
 * Convert complex plane coordinates to pixel coordinates
 * @param real Real component
 * @param imaginary Imaginary component
 * @param width Canvas width in pixels
 * @param height Canvas height in pixels
 * @param viewport The current viewport on the complex plane
 * @returns Pixel coordinates {x, y}
 */
export declare function complexToPixel(real: number, imaginary: number, width: number, height: number, viewport: Viewport): {
    x: number;
    y: number;
};
/**
 * Render the Mandelbrot set to an ImageData object
 * @param width Canvas width in pixels
 * @param height Canvas height in pixels
 * @param viewport The viewport on the complex plane
 * @param options Rendering options
 * @returns ImageData ready to be put on a canvas
 */
export declare function renderMandelbrot(width: number, height: number, viewport: Viewport, options: RenderOptions): ImageData;
/**
 * Create a new viewport by zooming into a specific region
 * @param currentViewport Current viewport
 * @param x1 Left pixel coordinate of selection
 * @param y1 Top pixel coordinate of selection
 * @param x2 Right pixel coordinate of selection
 * @param y2 Bottom pixel coordinate of selection
 * @param width Canvas width
 * @param height Canvas height
 * @returns New zoomed viewport
 */
export declare function createZoomViewport(currentViewport: Viewport, x1: number, y1: number, x2: number, y2: number, width: number, height: number): Viewport;
/**
 * Create a new viewport by panning
 * @param currentViewport Current viewport
 * @param dx Horizontal pan amount (in pixels, negative = left, positive = right)
 * @param dy Vertical pan amount (in pixels, negative = up, positive = down)
 * @param width Canvas width
 * @param height Canvas height
 * @returns New panned viewport
 */
export declare function panViewport(currentViewport: Viewport, dx: number, dy: number, width: number, height: number): Viewport;
/**
 * Create a zoomed viewport centered on a point
 * @param currentViewport Current viewport
 * @param centerX Pixel X coordinate of center
 * @param centerY Pixel Y coordinate of center
 * @param zoomFactor Zoom factor (> 1 zooms in, < 1 zooms out)
 * @param width Canvas width
 * @param height Canvas height
 * @returns New zoomed viewport
 */
export declare function zoomAtPoint(currentViewport: Viewport, centerX: number, centerY: number, zoomFactor: number, width: number, height: number): Viewport;
/**
 * Reset viewport to default Mandelbrot set view
 */
export declare function getDefaultViewport(): Viewport;
