import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

import styles from "../styles/Header.module.css";

interface HeaderProps {
  onHomeClick: () => void;
}

function Header({ onHomeClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Link
        to="/"
        className={styles.container}
        style={{ justifyContent: "flex-start" }}
        onClick={onHomeClick}
      >
        <FontAwesomeIcon icon={faHome} size="2x" className={styles.icon} />
      </Link>

      <Link to="/" className={styles.container} onClick={onHomeClick}>
        <h1>NESTASM</h1>
      </Link>
    </header>
  );
}

export default Header;
