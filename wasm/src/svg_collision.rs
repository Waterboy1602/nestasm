use crate::enums::Status;

use anyhow::Result;
use log::{log, Level};
use serde_wasm_bindgen::{from_value, to_value};
use std::collections::HashMap;
use svg_collision::io::svg_parser::run_cde_wasm;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use web_sys::console;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = postMessage)]
    fn post_message_object_to_js(val: &JsValue);
}

#[wasm_bindgen]
pub fn svg_collision(js_value: JsValue) -> Result<JsValue, JsValue> {
    let moved_element: HashMap<String, Option<String>> = match from_value(js_value) {
        Ok(val) => val,
        Err(e) => return Err(JsValue::from_str(&format!("Error deserializing: {}", e))),
    };
    console::log_1(&"svg_collision_testtttt".into());

    match to_value(&moved_element) {
        Ok(js_val) => {
            console::log_1(&js_val); // log the value to the console.
            return Ok(js_val); // Return the serialized JsValue
        }
        Err(e) => return Err(JsValue::from_str(&format!("Error serializing: {}", e))),
    }
}

#[cfg(feature = "console_error_panic_hook")]
#[wasm_bindgen]
pub fn svg_collision_test(svg_input: JsValue) -> Result<(), JsValue> {
    console_error_panic_hook::set_once();

    log!(Level::Info, "Started SVG collision test");

    let svg_str: String = match from_value(svg_input) {
        Ok(val) => val,
        Err(e) => {
            log!(Level::Error, "Error deserializing SVG input: {}", e);
            return Ok(());
        }
    };
    // console::log_1(&svg_str.clone().into());

    let svg_result = run_cde_wasm(&svg_str);

    match svg_result {
        Ok(svg_result) => {
            let final_obj = js_sys::Object::new();
            js_sys::Reflect::set(
                &final_obj,
                &JsValue::from_str("type"),
                &JsValue::from_str(&Status::Finished.to_string()),
            )
            .unwrap();
            js_sys::Reflect::set(
                &final_obj,
                &JsValue::from_str("result"),
                &JsValue::from_str(&svg_result),
            )
            .unwrap();
            post_message_object_to_js(&final_obj);
        }
        Err(e) => {
            log!(Level::Error, "Error during WASM computation: {}", e);

            return Ok(());
        }
    };

    Ok(())
}
