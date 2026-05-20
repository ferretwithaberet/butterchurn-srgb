# Butterchurn SRGB

Music visualizer effect for [SignalRGB](https://signalrgb.com/) using [Butterchurn](https://github.com/jberg/butterchurn) (WebGL port of Milkdrop, aka Winamp's visualizer).

[![Butterchurn SRGB preview video](https://img.youtube.com/vi/tjAV5tIk_1I/0.jpg)](https://www.youtube.com/watch?v=tjAV5tIk_1I)

Click the above image to preview effect on YouTube.

## Built bundle files

Built bundle files can be found on the SignalRGB discord, in [this thread](https://discord.com/channels/803347488190365737/1466540194126888980). In the future the project might use github releases to publish those files.

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
