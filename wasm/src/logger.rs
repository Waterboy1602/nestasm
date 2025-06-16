use crate::enums::Status;
use log::{log, Level, LevelFilter};
use wasm_bindgen::prelude::*;
use web_sys::*;
use web_time::Instant;

lazy_static::lazy_static! {
    static ref EPOCH: Instant = Instant::now();
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_name = postMessage)]
    fn post_message_to_js(s: &str);

    #[wasm_bindgen(js_name = postMessage)]
    fn post_message_object_to_js(val: &JsValue);
}

#[wasm_bindgen]
pub fn init_logger(level_filter_u8: u8) -> Result<(), JsValue> {
    let level_filter = match level_filter_u8 {
        0 => LevelFilter::Off,
        1 => LevelFilter::Error,
        2 => LevelFilter::Warn,
        3 => LevelFilter::Info,
        4 => LevelFilter::Debug,
        5 => LevelFilter::Trace,
        _ => {
            let error_msg = format!("Invalid LevelFilter value: {}", level_filter_u8);
            console::error_1(&error_msg.into());
            return Ok(());
        }
    };

    fern::Dispatch::new()
        .level(level_filter)
        .chain(fern::Output::call(|record| {
            let duration = EPOCH.elapsed();
            let sec = duration.as_secs() % 60;
            let min = (duration.as_secs() / 60) % 60;
            let hours = (duration.as_secs() / 60) / 60;

            let prefix = format!(
                "[{}] [{:0>2}:{:0>2}:{:0>2}]",
                record.level(),
                hours,
                min,
                sec
            );

            let full_log_message = format!("{prefix:<27}{}", record.args());

            let log_obj = js_sys::Object::new();
            js_sys::Reflect::set(
                &log_obj,
                &JsValue::from_str("type"),
                &JsValue::from_str(&Status::Processing.to_string()),
            )
            .unwrap();
            js_sys::Reflect::set(
                &log_obj,
                &JsValue::from_str("level"),
                &JsValue::from_str(&record.level().to_string()),
            )
            .unwrap();
            js_sys::Reflect::set(
                &log_obj,
                &JsValue::from_str("message"),
                &JsValue::from_str(&full_log_message.to_string()),
            )
            .unwrap();

            post_message_object_to_js(&log_obj.into());
        }))
        .apply()
        .map_err(|e| JsValue::from_str(&format!("Failed to apply logger: {}", e)))?;

    log!(Level::Info, "Epoch: {}", EPOCH.elapsed().as_secs_f64());
    Ok(())
}
