/**
 * Main application entry point for the Mandelbrot Set Viewer
 */

import {
  renderMandelbrot,
  getDefaultViewport,
  Viewport,
  RenderOptions,
  createZoomViewport,
  zoomAtPoint,
  panViewport
} from './mandelbrot';

class MandelbrotViewer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private selectionRect: HTMLDivElement;
  private coordDisplay: HTMLElement;

  private viewport: Viewport;
  private options: RenderOptions;

  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  constructor() {
    this.canvas = document.getElementById('mandelbrot-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.selectionRect = document.getElementById('selection-rect') as HTMLDivElement;
    this.coordDisplay = document.getElementById('coord-display')!;

    this.viewport = getDefaultViewport();
    this.options = {
      maxIterations: 100,
      colorScheme: 'fire'
    };

    this.initializeControls();
    this.initializeCanvasEvents();
    this.render();
  }

  private initializeControls(): void {
    // Color scheme selector
    const colorSchemeSelect = document.getElementById('color-scheme') as HTMLSelectElement;
    colorSchemeSelect.addEventListener('change', () => {
      this.options.colorScheme = colorSchemeSelect.value as RenderOptions['colorScheme'];
      this.render();
    });

    // Iterations slider
    const iterationsSlider = document.getElementById('iterations') as HTMLInputElement;
    const iterationsValue = document.getElementById('iterations-value')!;
    iterationsSlider.addEventListener('input', () => {
      this.options.maxIterations = parseInt(iterationsSlider.value, 10);
      iterationsValue.textContent = iterationsSlider.value;
      this.render();
    });

    // Reset button
    const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
    resetBtn.addEventListener('click', () => {
      this.viewport = getDefaultViewport();
      this.options.maxIterations = 100;
      iterationsSlider.value = '100';
      iterationsValue.textContent = '100';
      this.render();
    });

    // Zoom buttons
    const zoomInBtn = document.getElementById('zoom-in-btn') as HTMLButtonElement;
    const zoomOutBtn = document.getElementById('zoom-out-btn') as HTMLButtonElement;

    zoomInBtn.addEventListener('click', () => {
      this.viewport = zoomAtPoint(
        this.viewport,
        this.canvas.width / 2,
        this.canvas.height / 2,
        2,
        this.canvas.width,
        this.canvas.height
      );
      this.render();
    });

    zoomOutBtn.addEventListener('click', () => {
      this.viewport = zoomAtPoint(
        this.viewport,
        this.canvas.width / 2,
        this.canvas.height / 2,
        0.5,
        this.canvas.width,
        this.canvas.height
      );
      this.render();
    });

    // Pan buttons
    const panUpBtn = document.getElementById('pan-up-btn') as HTMLButtonElement;
    const panDownBtn = document.getElementById('pan-down-btn') as HTMLButtonElement;
    const panLeftBtn = document.getElementById('pan-left-btn') as HTMLButtonElement;
    const panRightBtn = document.getElementById('pan-right-btn') as HTMLButtonElement;

    const panAmount = 50;
    panUpBtn.addEventListener('click', () => {
      this.viewport = panViewport(this.viewport, 0, -panAmount, this.canvas.width, this.canvas.height);
      this.render();
    });

    panDownBtn.addEventListener('click', () => {
      this.viewport = panViewport(this.viewport, 0, panAmount, this.canvas.width, this.canvas.height);
      this.render();
    });

    panLeftBtn.addEventListener('click', () => {
      this.viewport = panViewport(this.viewport, -panAmount, 0, this.canvas.width, this.canvas.height);
      this.render();
    });

    panRightBtn.addEventListener('click', () => {
      this.viewport = panViewport(this.viewport, panAmount, 0, this.canvas.width, this.canvas.height);
      this.render();
    });
  }

  private initializeCanvasEvents(): void {
    // Mouse events for drag selection
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.offsetX;
      this.dragStartY = e.offsetY;
      this.selectionRect.style.display = 'block';
      this.updateSelectionRect(e.offsetX, e.offsetY, e.offsetX, e.offsetY);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.updateSelectionRect(this.dragStartX, this.dragStartY, e.offsetX, e.offsetY);
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.selectionRect.style.display = 'none';

        // Only zoom if the selection is significant (at least 10 pixels)
        const minSize = 10;
        if (Math.abs(e.offsetX - this.dragStartX) >= minSize && Math.abs(e.offsetY - this.dragStartY) >= minSize) {
          this.viewport = createZoomViewport(
            this.viewport,
            this.dragStartX,
            this.dragStartY,
            e.offsetX,
            e.offsetY,
            this.canvas.width,
            this.canvas.height
          );
          this.render();
        }
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.selectionRect.style.display = 'none';
      }
    });

    // Double-click to zoom at point
    this.canvas.addEventListener('dblclick', (e) => {
      this.viewport = zoomAtPoint(
        this.viewport,
        e.offsetX,
        e.offsetY,
        2,
        this.canvas.width,
        this.canvas.height
      );
      this.render();
    });

    // Mouse wheel zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.5 : 2;
      this.viewport = zoomAtPoint(
        this.viewport,
        e.offsetX,
        e.offsetY,
        zoomFactor,
        this.canvas.width,
        this.canvas.height
      );
      this.render();
    });
  }

  private updateSelectionRect(x1: number, y1: number, x2: number, y2: number): void {
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    this.selectionRect.style.left = left + 'px';
    this.selectionRect.style.top = top + 'px';
    this.selectionRect.style.width = width + 'px';
    this.selectionRect.style.height = height + 'px';
  }

  private updateCoordDisplay(): void {
    const text = `Re: ${this.viewport.xMin.toFixed(6)} to ${this.viewport.xMax.toFixed(6)} | Im: ${this.viewport.yMin.toFixed(6)} to ${this.viewport.yMax.toFixed(6)}`;
    this.coordDisplay.textContent = text;
  }

  private render(): void {
    const imageData = renderMandelbrot(
      this.canvas.width,
      this.canvas.height,
      this.viewport,
      this.options
    );
    this.ctx.putImageData(imageData, 0, 0);
    this.updateCoordDisplay();
  }
}

// Initialize the viewer when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MandelbrotViewer();
});
