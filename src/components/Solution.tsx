import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

import styles from "../styles/Solution.module.css";

function Result() {
  const location = useLocation();
  const response: string = location.state.data;

  const server: string = "http://localhost:8000/";

  console.log(response);

  const svgPath = response[0];
  const jsonPath = response[1][0];

  return (
    <div className={`${styles.container} ${styles.result}`}>
      <h1>Solution</h1>

      <a href={`${server}${jsonPath}`} download="solution.json" className={styles.btn}>
        <FontAwesomeIcon icon={faDownload} />
        &nbsp;&nbsp;JSON
      </a>

      <div className={`${styles.container} ${styles.solution}`}>
        <img src={`${server}${svgPath[0]}`} />
      </div>
    </div>
  );
}

export default Result;
