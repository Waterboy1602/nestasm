import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./styles/App.module.css";
import { FileType, Status, OptimizationAlgo } from "./Enums";
import ChangeInputFile from "./components/InputOverview";

import Header from "./components/Header.tsx";

let cancelWorker: Worker | null = null;
let algorithmWorker: Worker | null = null;

interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & { files: FileList };
}

function App() {
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [showChangeInput, setShowChangeInput] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useDemoFile, setUseDemoFile] = useState(true);
  const [changeInputFile, setChangeInputFile] = useState(false);
  const [optimizationAlgo, setOptimizationAlgo] = useState(OptimizationAlgo.SPARROW);
  const [loading, setLoading] = useState(false);
  const [compressingPhase, setCompressingPhase] = useState(false);
  const logBoxRef = useRef<HTMLDivElement>(null);
  const fileContent = useRef<string | null>(null);

  const resetState = () => {
    setSvgResult(null);
    setLogs([]);
    setShowChangeInput(false);
  };

  const getMaxEval = useCallback((logs: string[]): string | null => {
    const regex = /evals\/s:\s*(\d+\.?\d*)/;
    let maxEvalPerSecond = 0;

    logs.forEach((log) => {
      if (log.includes("evals/s")) {
        const value = log.match(regex);
        if (value && parseFloat(value[1]) > maxEvalPerSecond) {
          maxEvalPerSecond = parseFloat(value[1]);
        }
      }
    });

    return maxEvalPerSecond > 0 ? maxEvalPerSecond.toFixed(2) : null;
  }, []);

  useEffect(() => {
    algorithmWorker = new Worker(new URL("./services/algorithmWorker.ts", import.meta.url), {
      type: "module",
    });

    algorithmWorker.onmessage = (event) => {
      if (Array.isArray(event.data)) {
        setLogs((prevLogs: string[]) => [
          ...prevLogs,
          ...event.data.map((entry: { message?: string }) => entry.message ?? String(entry)),
        ]);

        return;
      }

      const { type, message, result } = event.data;

      if (type === Status.INIT_SHARED_MEMORY) {
        initCancelWorker(result.sharedArrayBuffer, result.terminateFlagOffset);

        return;
      }

      if (type === Status.INTERMEDIATE) {
        setSvgResult(result);

        return;
      }

      if (type === Status.FINISHED) {
        setLogs((prevLogs) => {
          const logs = [...prevLogs, `Finished`];

          const maxEval = getMaxEval(logs);
          if (maxEval) {
            logs.push(`Max evals/s: ${maxEval} K`);
          }

          return logs;
        });

        setLoading(false);
        setCompressingPhase(false);

        return;
      }

      if (type === Status.ERROR) {
        setLogs((prevLogs) => [...prevLogs, `Error: ${message}`]);
        return;
      }

      setLogs((prevLogs) => [...prevLogs, message]);
    };

    return () => {
      if (algorithmWorker) {
        algorithmWorker.terminate();
        algorithmWorker = null;
      }
    };
  }, [setLogs, setSvgResult, getMaxEval]);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  const startOptimization = (
    optimizationAlgo: OptimizationAlgo,
    input: string,
    fileType: FileType
  ): void => {
    if (algorithmWorker) {
      if (!loading) {
        algorithmWorker.postMessage({
          type: Status.START,
          payload: {
            optimizationAlgo: optimizationAlgo,
            input: input,
            fileType: fileType,
          },
        });

        setLoading(true);
      }
    }
  };

  const initCancelWorker = (sharedArrayBuffer: SharedArrayBuffer, offset: number): void => {
    cancelWorker = new Worker(new URL("./services/cancelWorker.ts", import.meta.url), {
      type: "module",
    });

    cancelWorker.postMessage({
      type: Status.INIT_SHARED_MEMORY,
      payload: {
        wasmMemoryBuffer: sharedArrayBuffer,
        terminateFlagOffset: offset,
      },
    });
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (useDemoFile) {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}/assets/swim.json`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        fileContent.current = await response.text();

        if (changeInputFile) {
          setShowChangeInput(true);
        } else {
          startOptimization(optimizationAlgo, fileContent.current, FileType.JSON);
        }
      } catch (e) {
        setError("Failed to load demo file: " + e);
      }

      return;
    }

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        fileContent.current = e.target?.result as string;
      };

      reader.onerror = () => {
        setError("Error reading the file. Please try again.");
      };

      reader.readAsText(file);
      setShowChangeInput(true);
    } else {
      setError("Please upload a file.");
    }
  };

  const handleCancel = (): void => {
    if (cancelWorker) {
      cancelWorker.postMessage({ type: Status.CANCEL, payload: {} });
      setCompressingPhase(true);
    }
  };

  const handleFileChange = (event: FileChangeEvent): void => {
    const uploadedFile: File | null = event.target.files[0];
    if (uploadedFile) {
      if (uploadedFile.type === "image/svg+xml" || uploadedFile.type === "application/json") {
        setFile(uploadedFile);
        setError(null);
      } else {
        setError("Please upload a valid SVG or JSON file.");
        setFile(null);
      }
    } else {
      setFile(null);
      setError(null);
    }
  };

  const handleUseDemoChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      setUseDemoFile(true);
    } else {
      setUseDemoFile(false);
    }
  };

  const handleChangeInputFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      setChangeInputFile(true);
    } else {
      setChangeInputFile(false);
    }
  };

  const buttonTextContent = () => {
    if (changeInputFile) {
      return "Upload file";
    }

    if (compressingPhase) {
      return (
        <>
          <span className={styles.loader} /> Cancel compressing
        </>
      );
    }

    if (loading) {
      return (
        <>
          <span className={styles.loader} /> Cancel exploring
        </>
      );
    }

    return "Start optimization";
  };

  if (svgResult) {
    return (
      <>
        <Header onHomeClick={resetState} />
        <div dangerouslySetInnerHTML={{ __html: svgResult }} className={styles.svgBox} />
        {loading && (
          <div className={styles.processing}>
            <button
              type="submit"
              className={styles.button}
              onClick={() => handleCancel()}
              style={{ marginTop: "0" }}
            >
              {!compressingPhase ? (
                <>
                  <span className={styles.loader} /> Cancel exploring
                </>
              ) : (
                <>
                  <span className={styles.loader} /> Cancel compressing
                </>
              )}
            </button>
          </div>
        )}
        {!loading && (
          <div className={styles.processing}>
            <button type="submit" className={styles.button} onClick={() => setSvgResult(null)}>
              Start over
            </button>
          </div>
        )}
        {logs.length > 0 && (
          <div className={styles.logBox} ref={logBoxRef}>
            <h4>Logs</h4>
            <ul>
              {logs.map((log, idx) => (
                <li key={idx}>{log}</li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  }

  if (showChangeInput) {
    return (
      <>
        <Header onHomeClick={resetState} />
        <ChangeInputFile fileContent={fileContent.current} startOptimization={startOptimization} />
        {logs.length > 0 && (
          <div className={styles.logBox} ref={logBoxRef}>
            <h4>Logs</h4>
            <ul>
              {logs.map((log, idx) => (
                <li key={idx}>{log}</li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Header onHomeClick={resetState} />
      <div className={styles.home}>
        <div className={styles.forms}>
          <div>
            <form onSubmit={(event) => handleUpload(event)} className={styles.form}>
              <label className={styles.label}>Upload an input file</label>
              <label className={styles.subLabel}>SVG or JSON</label>
              <input
                type="file"
                accept="image/svg+xml, application/json"
                onChange={handleFileChange}
                className={styles.inputFile}
              />

              <label className={styles.demoCheckboxWrapper}>
                <input
                  type="checkbox"
                  defaultChecked={useDemoFile}
                  onChange={handleUseDemoChange}
                  className={styles.demoCheckbox}
                />
                <span className={styles.demoLabel}>Use JSON demo file</span>
              </label>

              <label className={styles.demoCheckboxWrapper}>
                <input
                  type="checkbox"
                  defaultChecked={changeInputFile}
                  onChange={handleChangeInputFile}
                  className={styles.demoCheckbox}
                />
                <span className={styles.demoLabel}>Edit input file</span>
              </label>

              {!changeInputFile && (
                <>
                  <label className={styles.label} htmlFor="dropdown">
                    Algorithm
                  </label>

                  <select
                    id="optAlgoDropdown"
                    className={styles.algoDropdown}
                    value={optimizationAlgo}
                    onChange={(e) => setOptimizationAlgo(e.target.value as OptimizationAlgo)}
                  >
                    <option value={OptimizationAlgo.LBF}>LBF</option>
                    <option value={OptimizationAlgo.SPARROW} defaultChecked>
                      SPARROW
                    </option>
                  </select>
                </>
              )}

              <button type="submit" className={styles.button}>
                {buttonTextContent()}
              </button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </div>

        {logs.length > 0 && (
          <div className={styles.logBox} ref={logBoxRef}>
            <h4>Logs</h4>
            <ul>
              {logs.map((log, idx) => (
                <li key={idx}>{log}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
