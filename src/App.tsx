import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./components/Header.tsx";
import Home from "./components/Home.tsx";
import Solution from "./components/Solution.tsx";
import SVGManipulation from "./components/SVGMani.tsx";

function App() {
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [showChangeInput, setShowChangeInput] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const resetState = () => {
    setSvgResult(null);
    setLogs([]);
    setShowChangeInput(false);
  };

  return (
    <Router basename="/nestasm">
      <Header onHomeClick={resetState} />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                svgResult={svgResult}
                setSvgResult={setSvgResult}
                logs={logs}
                setLogs={setLogs}
                showChangeInput={showChangeInput}
                setShowChangeInput={setShowChangeInput}
              />
            }
          />
          <Route path="/solution" element={<Solution />} />
          <Route path="/svg" element={<SVGManipulation />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
