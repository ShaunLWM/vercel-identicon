# vercel-identicon

Deterministic identicon generator for React. Hash a string, get a unique visual back. Same input, same output, every time. 120+ variants across Canvas 2D and WebGL renderers, 17 color schemes. Animated variants respond to hover.

Extracted from [identicon-prototype.labs.vercel.dev](https://identicon-prototype.labs.vercel.dev/).

## Install

```bash
npm install vercel-identicon
```

Requires React 18+.

## Usage

```tsx
import { Identicon } from "vercel-identicon";

<Identicon value="rauno" size={48} variant="bayer-4x4" colorScheme="oklch-mono" />
```

Renders a `<canvas>`. Accepts `className` and `style`.

## Props

| Prop | Type | Default | |
|------|------|---------|---|
| `value` | `string` | required | String to hash |
| `size` | `number` | `32` | Canvas resolution in px |
| `variant` | `string` | `"bayer-4x4"` | Which generator to use |
| `colorScheme` | `ColorScheme` | `"oklch-mono"` | Color palette |
| `className` | `string` | — | Passed to the canvas |
| `style` | `CSSProperties` | — | Passed to the canvas |

## Variants

120+ generators, organized by technique:

- **Bayer dithering** — `bayer-2x2`, `bayer-4x4`, `bayer-8x8`, and scaled variants
- **Error diffusion** — `floyd-steinberg`, `atkinson`, `jarvis-judice-ninke`, `sierra`, `stucki`
- **Pattern** — `white-noise`, `blue-noise`, `halftone-dots`, `diagonal-line`, `spiral`, `radial`, `checkerboard`, `cross`, `diamond`
- **Organic** — `atkinson-blob`, `halftone-field`, `cross-hatch`, `spiral-dither`, `blue-noise-dither`
- **Terminal** — `phosphor-grid`, `ansi-quilt`, `teletext-mosaic`, `matrix-rain`, `raster-bars`
- **Retro** — `crt-rgb`, `vhs-tracking`, `interlace`, `dot-matrix-printer`, `thermal-print`, `lcd-segments`, `glitch-bands`, `dithered-scanlines`, `woodcut`
- **Algorithmic** — `game-of-life`, `maze`, `pixel-sprite`, `sierpinski`, `mandelbrot-slice`, `perlin-terrain`, `truchet-tiles`, `rule-30`, `dragon-curve`
- **Generative** — `reaction-diffusion`, `ascii-matrix`, `barcode`, `flow-field`, `lissajous`, `topographic-contours`
- **Nature** — `agate-slice`, `phyllotaxis`, `cymatics`, `fingerprint`, `tree-rings`, `coral-growth`
- **Textile** — `quilt-block`, `sashiko-stitch`, `woven-fabric`, `kintsugi-crack`, `ikat-bleed`, `tartan`
- **Math** — `clifford-attractor`, `hilbert-curve`, `spiral-galaxy`, `sound-ring`, `erosion-canyon`
- **WebGL scenes** — `aurora-bands`, `layered-ridges`, `ink-drop`, `bokeh`, `silk-fold`, `prism-split`, `angular-gradient`, `faceted-gem`, `tide-pool`, `eclipse`
- **WebGL art** — `rothko-fields`, `mondrian-grid`, `albers-squares`, `lewitt-lines`, `riley-waves`, `kandinsky-circles`, `klee-tiles`, `escher-tessellation`, `pollock-drip`, `malevich-suprematism`, `delaunay-discs`, `agnes-martin-grid`
- **WebGL effects** — `neon-glow`, `caustics`, `metaballs`, `julia-set`, `voronoi-crystal`, `electric-plasma`, `liquid-marble`, `stained-glass`, `topographic-map`, `circuit-board`, `fractal-coral`, `galaxy-spiral`, `bayer-4x4-animated`, `ink-in-water`, `supercell`, `warp-fabric`, `gradient-orb`

Get the full list at runtime:

```ts
import { variantIds } from "vercel-identicon";
// string[]
```

## Color schemes

17 schemes across OKLCH and HSL:

`oklch-mono` `oklch-triadic` `oklch-golden` `oklch-complement` `oklch-analogous` `oklch-split` `oklch-tetrad` `oklch-warmcool` `oklch-vivid` `oklch-pastel` `oklch-cinema` `oklch-sunset` `oklch-earth` `hsl-triadic` `hsl-complement` `hsl-analogous` `hsl-mono`

## How it works

Each string runs through a Murmurhash-style dual 32-bit hash. That hash seeds a mulberry32 PRNG and picks two colors from the chosen scheme. Canvas 2D generators write pixels directly via `ImageData`. WebGL generators compile GLSL fragment shaders, render to an offscreen canvas, then blit to the target. Eight WebGL variants (`aurora-bands`, `ink-drop`, `neon-glow`, `bayer-4x4-animated`, `ink-in-water`, `supercell`, `warp-fabric`, `gradient-orb`) animate on hover via `requestAnimationFrame` and freeze to a static frame on mouse leave.

Everything is deterministic. No network requests, no external state.

## Development

```bash
pnpm install
pnpm dev        # preview app at localhost:5173
pnpm build      # build the library
pnpm lint       # biome check
pnpm lint:fix   # biome check --write
```

## License

MIT
