# NESTASM

Run nesting algorithm [Sparrow](https://github.com/JeroenGar/sparrow) or _LBF_ in the browser with the use of [WebAssembly](https://webassembly.org)

_STILL NEED SOME CLEAN UP WORK!_

## Prerequisites

- Rust
- Node.js
- wasm-pack & npm packages: `cargo install wasm-pack && npm install`

## Build and Run

Clone repo, including submodules

```shell
cd wasm
wasm-pack build --release --target web --out-dir ../src/wasm
cd ..
npm run build
npm run preview -- --host
```

## Acknowledgements

Uses the following repos of @JeroenGar

- [jagua-rs](https://github.com/JeroenGar/jagua-rs)
- [sparrow](https://github.com/JeroenGar/sparrow)

Created in function of masterthesis for Industrial Sciences - Software Engineering at KU Leuven
