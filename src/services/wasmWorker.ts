import { FileType, Status, OptimizationAlgo } from "../Enums";

import initWasm, * as wasm from "../wasm/wasm_jagua_rs";

let wasmInitialized = false;
let wasmThreadPoolInitialized = false;
const numThreads = navigator.hardwareConcurrency || 3;

self.onmessage = async (event) => {
  if (!wasmInitialized) {
    try {
      await initWasm();
      wasmInitialized = true;

      try {
        // Level of logging to apply in the WASM module.`
        // 0 => Off,
        // 1 => Error,
        // 2 => Warn,
        // 3 => Info,
        // 4 => Debug,
        // 5 => Trace,
        await wasm.init_logger(5);
        self.postMessage({
          type: Status.PROCESSING,
          message: `Wasm logger successfully initialized`,
        });
      } catch (logger_err) {
        console.error("Failed to apply WASM logger:", logger_err);
      }

      try {
        await wasm.initThreadPool(numThreads);
        wasmThreadPoolInitialized = true;
      } catch (thread_err) {
        console.error("Failed to initialize WASM thread pool:", thread_err);
        self.postMessage({
          type: Status.PROCESSING,
          message: `Failed to initialize WASM thread pool: ${thread_err}`,
        });
      }
    } catch (e) {
      self.postMessage({ type: Status.ERROR, message: "Wasm initialization failed: " + e });
      return;
    }
  }

  const { type, payload } = event.data;

  if (type === Status.START) {
    if (wasmThreadPoolInitialized) {
      self.postMessage({
        type: Status.PROCESSING,
        message: `Wasm thread pool successfully initialized with ${numThreads} threads`,
      });
    }
    self.postMessage({ type: Status.PROCESSING, message: `Wasm computation started` });
    const input = payload.input;
    try {
      if (payload.fileType === FileType.SVG) {
        await wasm.svg_collision_test(input);
      } else if (payload.fileType === FileType.JSON) {
        if (payload.optimizationAlgo === OptimizationAlgo.LBF) {
          await wasm.run_lbf(input);
        } else if (payload.optimizationAlgo === OptimizationAlgo.SPARROW) {
          await wasm.run_sparrow(input);
        }
      }
    } catch (e) {
      self.postMessage({ type: Status.ERROR, message: `Wasm computation failed: ` + e });
    }
  }
};
