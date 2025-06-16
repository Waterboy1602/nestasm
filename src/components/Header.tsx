import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faHome, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import { Config } from "../interfaces/interfaces";

import styles from "../styles/Header.module.css";

interface HeaderProps {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  onHomeClick: () => void;
}

function Header({ config, setConfig, onHomeClick }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const location = useLocation();

  const toggleConfig = () => {
    setShowSettings(!showSettings);
  };

  const cancelConfig = () => {
    setShowSettings(false);
  };

  const saveConfig = () => {
    const form = document.querySelector("form");
    if (form) {
      const formData = new FormData(form);
      const newConfig: Config = {
        cde_config: {
          quadtree_depth: Number(formData.get("quadtreeDepth")) || config.cde_config.quadtree_depth,
          hpg_n_cells: Number(formData.get("hpgNCells")) || config.cde_config.hpg_n_cells,
          item_surrogate_config: {
            pole_coverage_goal:
              Number(formData.get("poleCoverageGoal")) / 100 ||
              config.cde_config.item_surrogate_config.pole_coverage_goal,
            max_poles:
              Number(formData.get("maxPoles")) || config.cde_config.item_surrogate_config.max_poles,
            n_ff_poles:
              Number(formData.get("nFFPoles")) ||
              config.cde_config.item_surrogate_config.n_ff_poles,
            n_ff_piers:
              Number(formData.get("nFFPiers")) ||
              config.cde_config.item_surrogate_config.n_ff_piers,
          },
        },
        poly_simpl_tolerance:
          Number(formData.get("polySimplTolerance")) / 100 || config.poly_simpl_tolerance,
        prng_seed: Number(formData.get("prngSeed")) || config.prng_seed,
        n_samples: Number(formData.get("nSamples")) || config.n_samples,
        ls_frac: Number(formData.get("lsFrac")) / 100 || config.ls_frac,
      };
      setConfig(newConfig);
    }
    setShowSettings(false);
  };

  return (
    <header className={styles.header}>
      {location.pathname !== "/solution" && (
        <Link to="/" className={styles.container} style={{ justifyContent: "flex-start" }}>
          <FontAwesomeIcon icon={faHome} size="2x" className={styles.icon} />
        </Link>
      )}

      {location.pathname === "/solution" && (
        <Link
          to="/input"
          state={{ config, input: location.state?.input }}
          className={styles.container}
          style={{ justifyContent: "flex-start" }}
        >
          <FontAwesomeIcon icon={faFilePen} size="2x" className={styles.icon} />
          <h1>Change input</h1>
        </Link>
      )}

      <Link to="/" className={styles.container} onClick={onHomeClick}>
        <img src="./jaguars_logo.svg" alt="jagua-rs logo" />
        <h1>jagua-rs</h1>
      </Link>

      <div className={`${styles.container}`} style={{ justifyContent: "flex-end" }}>
        <FontAwesomeIcon
          icon={faGear}
          size="2x"
          onClick={toggleConfig}
          className={`${styles.icon} `}
        />
      </div>

      {showSettings && (
        <div className={styles.settingsPanel}>
          <h2>Settings</h2>
          <form>
            <h3>Config of Collision Detection Engine</h3>
            <label>
              <input
                type="number"
                name="quadtreeDepth"
                defaultValue={config.cde_config.quadtree_depth}
                className={styles.input}
              />
              Quadtree depth
            </label>

            <label>
              <input
                type="number"
                name="hpgNCells"
                defaultValue={config.cde_config.hpg_n_cells}
                className={styles.input}
              />
              #Cells of the hazard proximity grid
            </label>

            <h3>Config surrogate item</h3>
            <label>
              <div className={styles.degreeSymbolWrapper}>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  name="poleCoverageGoal"
                  defaultValue={config.cde_config.item_surrogate_config.pole_coverage_goal * 100}
                  className={styles.input}
                />
              </div>
              Pole coverage goal
            </label>

            <label>
              <input
                type="number"
                name="maxPoles"
                defaultValue={config.cde_config.item_surrogate_config.max_poles}
                className={styles.input}
              />
              Max #poles
            </label>

            <label>
              <input
                type="number"
                name="nFFPoles"
                defaultValue={config.cde_config.item_surrogate_config.n_ff_poles}
                className={styles.input}
              />
              #Poles for fail-fast collision detection
            </label>

            <label>
              <input
                type="number"
                name="nFFPiers"
                defaultValue={config.cde_config.item_surrogate_config.n_ff_piers}
                className={styles.input}
              />
              #Piers for fail-fast collision detection
            </label>

            <hr style={{ marginBottom: "10px" }} />

            <label>
              <div className={`${styles.degreeSymbolWrapper} ${styles.float}`}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="polySimplTolerance"
                  defaultValue={config.poly_simpl_tolerance * 100}
                  className={styles.input}
                />
              </div>
              Polygon simplify tolerance
            </label>

            <label>
              <input
                type="number"
                name="prngSeed"
                defaultValue={config.prng_seed}
                className={styles.input}
              />
              PRNG Seed
            </label>

            <label>
              <input
                type="number"
                name="nSamples"
                defaultValue={config.n_samples}
                className={styles.input}
              />
              #Samples
            </label>

            <label>
              <div className={styles.degreeSymbolWrapper}>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  name="lsFrac"
                  defaultValue={config.ls_frac * 100}
                  className={styles.input}
                />
              </div>
              Local search fraction
            </label>

            <div className={styles.buttons}>
              <button type="button" className={styles.cancelButton} onClick={cancelConfig}>
                Cancel
              </button>
              <button type="button" className={styles.saveButton} onClick={saveConfig}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}

export default Header;
