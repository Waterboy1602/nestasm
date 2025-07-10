import { useState, Dispatch, SetStateAction, useEffect, useRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.css";
import { FileType, Status, OptimizationAlgo } from "../Enums";
import ChangeInputFile from "./InputOverview";
import { Config } from "../interfaces/interfaces";

interface HomeProps {
  svgResult: string | null;
  setSvgResult: Dispatch<SetStateAction<string | null>>;
  logs: string[];
  setLogs: Dispatch<SetStateAction<string[]>>;
  showChangeInput: boolean;
  setShowChangeInput: Dispatch<SetStateAction<boolean>>;
  config: Config;
}
// interface ParsedJson {
//   [key: string]: unknown;
// }
//
// interface NavigateState {
//   input: ParsedJson;
// }

interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & { files: FileList };
}

let algorithmWorker: Worker | null = null;
let cancelWorker: Worker | null = null;

function Home({
  svgResult,
  setSvgResult,
  logs,
  setLogs,
  showChangeInput,
  setShowChangeInput,
}: HomeProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useDemoFile, setUseDemoFile] = useState(true);
  const [changeInputFile, setChangeInputFile] = useState(false);
  const [optimizationAlgo, setOptimizationAlgo] = useState(OptimizationAlgo.SPARROW);
  const [loading, setLoading] = useState(false);
  const [compressingPhase, setCompressingPhase] = useState(false);
  const logBoxRef = useRef<HTMLDivElement>(null);
  const fileContent = useRef<string | null>(null);

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
    algorithmWorker = new Worker(new URL("../services/algorithmWorker.ts", import.meta.url), {
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

      if (type === Status.FINISHED) {
        setSvgResult(result);
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
      } else {
        if (cancelWorker) {
          cancelWorker.postMessage({ type: Status.CANCEL, payload: {} });
          setCompressingPhase(true);
        }
      }
    }
  };

  const initCancelWorker = (sharedArrayBuffer: SharedArrayBuffer, offset: number): void => {
    cancelWorker = new Worker(new URL("../services/cancelWorker.ts", import.meta.url), {
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

        // try {
        //   if (file.type === "image/svg+xml") {
        //     startOptimization(optimizationAlgo, fileContent.current, FileType.SVG);
        //   }

        //   if (file.type === "application/json") {
        //     // const parsedInput: ParsedJson = JSON.parse(fileContent);

        //     // navigate("/input", {
        //     //   state: { input: parsedInput } as NavigateState,
        //     // });

        //     startOptimization(optimizationAlgo, fileContent.current, FileType.JSON);
        //   }
        // } catch (wasmError) {
        //   setError("WASM processing error: " + wasmError);
        // }
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
        <div
          dangerouslySetInnerHTML={{ __html: svgResult }}
          style={{ width: "50%", marginLeft: "auto", marginRight: "auto" }}
        />

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
  );
}

export default Home;
