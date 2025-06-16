use crate::enums::Status;
use anyhow::{Context, Result};
use jagua_rs::io::import::Importer;
use jagua_rs::io::svg::s_layout_to_svg;
use jagua_rs::probs::spp;
use jagua_rs::probs::spp::io::ext_repr::ExtSPInstance;
use lbf::config::LBFConfig;
use lbf::opt::lbf_spp::LBFOptimizerSP;
use log::{log, Level};
use rand::prelude::SmallRng;
use rand::SeedableRng;
use serde_wasm_bindgen::from_value;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = postMessage)]
    fn post_message_object_to_js(val: &JsValue);
}

#[cfg(feature = "console_error_panic_hook")]
#[wasm_bindgen]
pub fn run_lbf(json_input: JsValue) -> Result<(), JsValue> {
    console_error_panic_hook::set_once();

    log!(Level::Info, "Started LBF optimization");

    let json_str: String = match from_value(json_input) {
        Ok(val) => val,
        Err(e) => {
            log!(Level::Error, "Error deserializing JSON input: {}", e);

            return Ok(());
        }
    };

    let config = LBFConfig::default();

    let ext_sp_instance: ExtSPInstance = serde_json::from_str(&json_str)
        .context("not a valid strip packing instance (ExtSPInstance)")
        .unwrap();

    let importer = Importer::new(
        config.cde_config,
        config.poly_simpl_tolerance,
        config.min_item_separation,
    );
    let rng = match config.prng_seed {
        Some(seed) => SmallRng::seed_from_u64(seed),
        None => SmallRng::from_os_rng(),
    };
    let instance = spp::io::import(&importer, &ext_sp_instance).unwrap();
    let sol = LBFOptimizerSP::new(instance.clone(), config, rng).solve();

    let svg_result =
        s_layout_to_svg(&sol.layout_snapshot, &instance, config.svg_draw_options, "").to_string();

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

    Ok(())
}
