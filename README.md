# NESTASM

## DEVELOPMENT

### WASM-PACK

- [Vite plugin WASM](https://github.com/Menci/vite-plugin-wasm)
- [Rust WASM](https://github.com/rustwasm/wasm-pack)

Install: `cargo install wasm-pack`  
Build: `wasm-pack build --target web`
`cargo watch -s "wasm-pack build --target web"`

Heb `getrandom = { version = "^0.2", features = ["js"] }` moeten toevoegen aan `Cargo.toml` om foutmelding te vermijden  
Ook _Clang_ nodig om foutmelding te vermijden: [LLVM](https://github.com/llvm/llvm-project)

### FRONTEND

- [React TSX](https://react.dev/)
- [Vite](https://vite.dev/)
  - [Vite SVGR](https://www.npmjs.com/package/vite-plugin-svgr): plugin to transform SVG's into React components
- [D3.js](https://d3js.org/): manipulating SVG's

Start development server: `npm run dev`

### BACKEND SERVER (deprecated)

See [README.md](./gui/server/README.md)

## TIPS & TRICKS

### JAGUA-RS

[docs](https://jeroengar.github.io/jagua-rs/jagua_rs/index.html)

### LBF

`cd lbf`  
`cargo run --release -- -i ../assets/swim.json -p spp -c ../assets/config_lbf.json -s ../solutions`

### SPARROW

`cd sparrow`
`cargo run --release -- -i data/input/swim.json`  
`cargo run --release --features=live_svg -- -i data/input/swim.json`
