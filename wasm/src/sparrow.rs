use log::{log, Level};
use wasm_bindgen::prelude::*;

#[cfg(feature = "console_error_panic_hook")]
#[wasm_bindgen]
pub fn run_sparrow(json_input: JsValue) -> Result<(), JsValue> {
    log!(Level::Info, "Sparrow not yet implemented");

    Ok(())
}
