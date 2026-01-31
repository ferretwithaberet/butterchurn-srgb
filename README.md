# Butterchurn SRGB

Music visualizer effect for [SignalRGB](https://signalrgb.com/) using [Butterchurn](https://github.com/jberg/butterchurn) (WebGL port of Milkdrop, aka Winamp's visualizer).

<img height="400" alt="image" src="https://github.com/user-attachments/assets/e1688e1d-79e9-412b-9d09-ce0d23bce243" />

## Building

### Prerequisites

- Node.js
- pnpm

I recommend using [mise](https://mise.jdx.dev/) for managing the Node.js version and [corepack](https://github.com/nodejs/corepack) for managing pnpm.

With mise you can do `mise install` in the project directory and it will make sure to install the Node.js version from the `mise.toml` file.

With corepack you can do `corepack install` in the project directory and it will make sure to download the proper pnpm version listed in `package.json` under the `packageManager` key.

### Building the project

1. Run `pnpm i` to make sure you have the dependencies installed.
2. Run `pnpm build`, this will create a `dist/` folder where you can find the built HTML file.

### Development

1. Run `pnpm i` to make sure you have the dependencies installed.
2. Run `pnpm dev`, this will open a development HTTP server.
3. Go to [http://localhost:5173/butterchurn-srgb.html](http://localhost:5173/butterchurn-srgb.html) in your browser.

## Contributing

To contribute to this effect, fork this repository, make your changes and open a pull request on this repository.
