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
export function calculateMandelbrot(cx: number, cy: number, maxIterations: number = 100): number {
  let x = 0;
  let y = 0;
  let iteration = 0;

  // Use long arithmetic to avoid unnecessary square root calculations
  while (x * x + y * y <= 4 && iteration < maxIterations) {
    const xTemp = x * x - y * y + cx;
    y = 2 * x * y + cy;
    x = xTemp;
    iteration++;
  }

  return iteration;
}

/**
 * Generate color for a given iteration count
 * @param iteration Iteration count (0 to maxIterations)
 * @param maxIterations Maximum iterations used
 * @param scheme Color scheme to use
 * @returns RGB color object {r, g, b}
 */
export function getColor(
  iteration: number,
  maxIterations: number,
  scheme: RenderOptions['colorScheme'] = 'grayscale'
): { r: number; g: number; b: number } {
  if (iteration === maxIterations) {
    // Point is in the Mandelbrot set - render as black
    return { r: 0, g: 0, b: 0 };
  }

  const t = iteration / maxIterations;

  switch (scheme) {
    case 'grayscale':
      const gray = Math.floor(255 * (1 - t));
      return { r: gray, g: gray, b: gray };

    case 'rainbow':
      return {
        r: Math.max(0, Math.min(255, Math.floor(255 * Math.sin(Math.PI * t * 3)))),
        g: Math.max(0, Math.min(255, Math.floor(255 * Math.sin(Math.PI * t * 3 + (2 * Math.PI) / 3)))),
        b: Math.max(0, Math.min(255, Math.floor(255 * Math.sin(Math.PI * t * 3 + (4 * Math.PI) / 3))))
      };

    case 'fire':
      // Fire color ramp: black -> red -> yellow -> white
      const ramp = t * 4;
      let r: number, g: number, b: number;

      if (ramp <= 1) {
        r = Math.floor(255 * ramp);
        g = 0;
        b = 0;
      } else if (ramp <= 2) {
        r = 255;
        g = Math.floor(255 * (ramp - 1));
        b = 0;
      } else if (ramp <= 3) {
        r = 255;
        g = 255;
        b = Math.floor(255 * (ramp - 2));
      } else {
        r = 255;
        g = 255;
        b = Math.floor(255 * Math.min(1, 4 - ramp));
      }

      return { r: Math.max(0, Math.min(255, r)), g: Math.max(0, Math.min(255, g)), b: Math.max(0, Math.min(255, b)) };

    default:
      return { r: 0, g: 0, b: 0 };
  }
}

/**
 * Convert pixel coordinates to complex plane coordinates
 * @param pixelX Pixel X coordinate
 * @param pixelY Pixel Y coordinate
 * @param width Canvas width in pixels
 * @param height Canvas height in pixels
 * @param viewport The current viewport on the complex plane
 * @returns Complex coordinates {real, imaginary}
 */
export function pixelToComplex(
  pixelX: number,
  pixelY: number,
  width: number,
  height: number,
  viewport: Viewport
): { real: number; imaginary: number } {
  const scaleX = (viewport.xMax - viewport.xMin) / width;
  const scaleY = (viewport.yMax - viewport.yMin) / height;

  return {
    real: viewport.xMin + pixelX * scaleX,
    imaginary: viewport.yMin + pixelY * scaleY
  };
}

/**
 * Convert complex plane coordinates to pixel coordinates
 * @param real Real component
 * @param imaginary Imaginary component
 * @param width Canvas width in pixels
 * @param height Canvas height in pixels
 * @param viewport The current viewport on the complex plane
 * @returns Pixel coordinates {x, y}
 */
export function complexToPixel(
  real: number,
  imaginary: number,
  width: number,
  height: number,
  viewport: Viewport
): { x: number; y: number } {
  const scaleX = width / (viewport.xMax - viewport.xMin);
  const scaleY = height / (viewport.yMax - viewport.yMin);

  return {
    x: Math.round((real - viewport.xMin) * scaleX),
    y: Math.round((imaginary - viewport.yMin) * scaleY)
  };
}

/**
 * Render the Mandelbrot set to an ImageData object
 * @param width Canvas width in pixels
 * @param height Canvas height in pixels
 * @param viewport The viewport on the complex plane
 * @param options Rendering options
 * @returns ImageData ready to be put on a canvas
 */
export function renderMandelbrot(
  width: number,
  height: number,
  viewport: Viewport,
  options: RenderOptions
): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const { real, imaginary } = pixelToComplex(px, py, width, height, viewport);
      const iteration = calculateMandelbrot(real, imaginary, options.maxIterations);
      const color = getColor(iteration, options.maxIterations, options.colorScheme);

      const index = (py * width + px) * 4;
      data[index] = color.r;
      data[index + 1] = color.g;
      data[index + 2] = color.b;
      data[index + 3] = 255; // Alpha channel
    }
  }

  return imageData;
}

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
export function createZoomViewport(
  currentViewport: Viewport,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  height: number
): Viewport {
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);

  const topLeft = pixelToComplex(left, top, width, height, currentViewport);
  const bottomRight = pixelToComplex(right, bottom, width, height, currentViewport);

  return {
    xMin: topLeft.real,
    xMax: bottomRight.real,
    yMin: topLeft.imaginary,
    yMax: bottomRight.imaginary
  };
}

/**
 * Create a new viewport by panning
 * @param currentViewport Current viewport
 * @param dx Horizontal pan amount (in pixels, negative = left, positive = right)
 * @param dy Vertical pan amount (in pixels, negative = up, positive = down)
 * @param width Canvas width
 * @param height Canvas height
 * @returns New panned viewport
 */
export function panViewport(
  currentViewport: Viewport,
  dx: number,
  dy: number,
  width: number,
  height: number
): Viewport {
  const deltaReal = dx * ((currentViewport.xMax - currentViewport.xMin) / width);
  const deltaImaginary = dy * ((currentViewport.yMax - currentViewport.yMin) / height);

  return {
    xMin: currentViewport.xMin - deltaReal,
    xMax: currentViewport.xMax - deltaReal,
    yMin: currentViewport.yMin - deltaImaginary,
    yMax: currentViewport.yMax - deltaImaginary
  };
}

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
export function zoomAtPoint(
  currentViewport: Viewport,
  centerX: number,
  centerY: number,
  zoomFactor: number,
  width: number,
  height: number
): Viewport {
  const center = pixelToComplex(centerX, centerY, width, height, currentViewport);
  const currentWidth = currentViewport.xMax - currentViewport.xMin;
  const currentHeight = currentViewport.yMax - currentViewport.yMin;

  const newWidth = currentWidth / zoomFactor;
  const newHeight = currentHeight / zoomFactor;

  return {
    xMin: center.real - newWidth / 2,
    xMax: center.real + newWidth / 2,
    yMin: center.imaginary - newHeight / 2,
    yMax: center.imaginary + newHeight / 2
  };
}

/**
 * Reset viewport to default Mandelbrot set view
 */
export function getDefaultViewport(): Viewport {
  return {
    xMin: -2.5,
    xMax: 1,
    yMin: -1.5,
    yMax: 1.5
  };
}
