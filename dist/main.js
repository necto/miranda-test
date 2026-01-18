/**
 * Main application entry point for the Mandelbrot Set Viewer
 */
import { renderMandelbrot, getDefaultViewport, createZoomViewport, zoomAtPoint, panViewport } from './mandelbrot';
class MandelbrotViewer {
    constructor() {
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.canvas = document.getElementById('mandelbrot-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.selectionRect = document.getElementById('selection-rect');
        this.coordDisplay = document.getElementById('coord-display');
        this.viewport = getDefaultViewport();
        this.options = {
            maxIterations: 100,
            colorScheme: 'fire'
        };
        this.initializeControls();
        this.initializeCanvasEvents();
        this.render();
    }
    initializeControls() {
        // Color scheme selector
        const colorSchemeSelect = document.getElementById('color-scheme');
        colorSchemeSelect.addEventListener('change', () => {
            this.options.colorScheme = colorSchemeSelect.value;
            this.render();
        });
        // Iterations slider
        const iterationsSlider = document.getElementById('iterations');
        const iterationsValue = document.getElementById('iterations-value');
        iterationsSlider.addEventListener('input', () => {
            this.options.maxIterations = parseInt(iterationsSlider.value, 10);
            iterationsValue.textContent = iterationsSlider.value;
            this.render();
        });
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.viewport = getDefaultViewport();
            this.options.maxIterations = 100;
            iterationsSlider.value = '100';
            iterationsValue.textContent = '100';
            this.render();
        });
        // Zoom buttons
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        zoomInBtn.addEventListener('click', () => {
            this.viewport = zoomAtPoint(this.viewport, this.canvas.width / 2, this.canvas.height / 2, 2, this.canvas.width, this.canvas.height);
            this.render();
        });
        zoomOutBtn.addEventListener('click', () => {
            this.viewport = zoomAtPoint(this.viewport, this.canvas.width / 2, this.canvas.height / 2, 0.5, this.canvas.width, this.canvas.height);
            this.render();
        });
        // Pan buttons
        const panUpBtn = document.getElementById('pan-up-btn');
        const panDownBtn = document.getElementById('pan-down-btn');
        const panLeftBtn = document.getElementById('pan-left-btn');
        const panRightBtn = document.getElementById('pan-right-btn');
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
    initializeCanvasEvents() {
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
                    this.viewport = createZoomViewport(this.viewport, this.dragStartX, this.dragStartY, e.offsetX, e.offsetY, this.canvas.width, this.canvas.height);
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
            this.viewport = zoomAtPoint(this.viewport, e.offsetX, e.offsetY, 2, this.canvas.width, this.canvas.height);
            this.render();
        });
        // Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.5 : 2;
            this.viewport = zoomAtPoint(this.viewport, e.offsetX, e.offsetY, zoomFactor, this.canvas.width, this.canvas.height);
            this.render();
        });
    }
    updateSelectionRect(x1, y1, x2, y2) {
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        this.selectionRect.style.left = left + 'px';
        this.selectionRect.style.top = top + 'px';
        this.selectionRect.style.width = width + 'px';
        this.selectionRect.style.height = height + 'px';
    }
    updateCoordDisplay() {
        const text = `Re: ${this.viewport.xMin.toFixed(6)} to ${this.viewport.xMax.toFixed(6)} | Im: ${this.viewport.yMin.toFixed(6)} to ${this.viewport.yMax.toFixed(6)}`;
        this.coordDisplay.textContent = text;
    }
    render() {
        const imageData = renderMandelbrot(this.canvas.width, this.canvas.height, this.viewport, this.options);
        this.ctx.putImageData(imageData, 0, 0);
        this.updateCoordDisplay();
    }
}
// Initialize the viewer when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MandelbrotViewer();
});
