import { Status } from "../Enums";

let wasmMemoryBuffer = null;
let terminateFlagView: Int32Array | null = null;

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === Status.INIT_SHARED_MEMORY) {
    wasmMemoryBuffer = payload.wasmMemoryBuffer;
    const offset = payload.terminateFlagOffset;

    terminateFlagView = new Int32Array(wasmMemoryBuffer, offset, 1);
  }

  if (type === Status.CANCEL) {
    if (terminateFlagView) {
      Atomics.store(terminateFlagView, 0, 1);
    } else {
      console.error("Terminate flag view is not initialized.");
    }
  }
};
