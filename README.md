# Mandelbrot Set Viewer

A browser-only TypeScript application that renders the Mandelbrot set fractal with interactive zoom and pan controls.

## Running Locally

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or pnpm

### Setup and Run

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to the URL shown in the terminal (typically `http://localhost:5173`).

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Running Tests

```bash
npm run test
```

This will run the unit tests using Vitest.

## Features

- **Interactive zooming**: Click and drag to select a region to zoom in, or use the mouse wheel
- **Multiple color schemes**: Grayscale, Rainbow, and Fire
- **Adjustable iterations**: Control the level of detail (50-1000 iterations)
- **Pan navigation**: Use arrow buttons or drag the canvas
- **Coordinate display**: Shows the current viewport coordinates in the complex plane

## Controls

| Action | Control |
|--------|---------|
| Zoom in (region select) | Click and drag on the canvas |
| Zoom in (at point) | Double-click |
| Zoom in | Mouse wheel up |
| Zoom out | Mouse wheel down |
| Pan | Use arrow buttons or click and drag outside selection |

## Project Structure

```
mandelbrot-viewer/
├── index.html          # Main HTML page
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── src/
    ├── main.ts         # Application entry point
    ├── mandelbrot.ts   # Core Mandelbrot calculation
    └── mandelbrot.test.ts  # Unit tests
```
