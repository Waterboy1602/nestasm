import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Config, Strip, Shape, Item } from "../interfaces/interfaces";

import styles from "../styles/Input.module.css";

interface InputProps {
  config: Config;
  setConfig?: React.Dispatch<React.SetStateAction<Config>>;
}

const makeInput = (name: string, items: Item[], selected: boolean[], strip: Strip): string => {
  const jsonObj: { Name?: string; Items?: Item[]; Strip?: Strip } = {
    Name: "",
    Items: [],
    Strip: { Height: 0 },
  };

  jsonObj["Name"] = name;
  jsonObj["Items"] = [];

  for (let i = 0; i < selected.length; i++) {
    if (selected[i]) {
      jsonObj["Items"].push(items[i]);
    }
  }
  jsonObj["Strip"] = strip;

  return JSON.stringify(jsonObj);
};

function Input({ config }: InputProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const input = location.state?.input;

  const [items, setItems] = useState<Item[]>(input.Items);
  const [selected, setSelected] = useState<boolean[]>(new Array(input.Items.length).fill(true));
  const [stripHeight, setStripHeight] = useState<Strip>(input.Strip);

  const handleSubmit = () => {
    const configJson: string = JSON.stringify(config);
    const inputJson: string = makeInput(input.Name, items, selected, stripHeight);

    console.log(configJson);
    console.log(inputJson);

    axios
      .post("http://localhost:8000/json", {
        config: configJson,
        input: inputJson,
      })
      .then((response) => {
        console.log(response);
        navigate("/solution", { state: { data: response.data, input } });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleCheckboxChange = (index: number) => {
    const newSelected = [...selected];
    newSelected[index] = !newSelected[index];
    setSelected(newSelected);
  };

  const calcScaleShape = (items: Item[]) => {
    let maxWidth = 0;
    let maxHeight = 0;

    items.map((item) => {
      const maxX = Math.max(...item.Shape.Data.map((p) => p[0]));
      const maxY = Math.max(...item.Shape.Data.map((p) => p[1]));
      const minX = Math.min(...item.Shape.Data.map((p) => p[0]));
      const minY = Math.min(...item.Shape.Data.map((p) => p[1]));

      if (maxX - minX > maxWidth) maxWidth = maxX - minX;
      if (maxY - minY > maxHeight) maxHeight = maxY - minY;
    });

    return [maxWidth, maxHeight];
  };

  const SvgComponent = ({ shape, svgScale }: { shape: Shape; svgScale: number[] }) => {
    const maxX = Math.max(...shape.Data.map((p) => p[0]));
    const maxY = Math.max(...shape.Data.map((p) => p[1]));
    const minX = Math.min(...shape.Data.map((p) => p[0]));
    const minY = Math.min(...shape.Data.map((p) => p[1]));
    const points = shape.Data.map((p) => `${p[0]},${p[1]}`).join(" ");

    console.log(maxX, maxY, minX, minY);
    return (
      <div className={styles.svgContainer}>
        <div>
          <p>Shape:</p>

          <div className={styles.shape}>
            <ul>
              {shape.Data.map((point: number[], index: number) => (
                <li key={index}>
                  ({point[0]}, {point[1]})
                </li>
              ))}
            </ul>
          </div>
        </div>
        <svg
          viewBox={`
                        ${minX - 50} 
                        ${minY - 50} 
                        ${svgScale[0] + 75} 
                        ${svgScale[1] + 75}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <polyline
            points={points}
            fill="none"
            stroke="black"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    );
  };

  const renderItems = (items: Item[], selected: boolean[]) => {
    const svgScale = calcScaleShape(items);
    return items.map((item, index: number) => (
      <div key={`item-${index}`}>
        <div
          className={styles.item}
          style={{
            outline: selected[index] ? "3px solid black" : "1px solid black",
          }}
        >
          <div className={styles.checkboxContainer} onClick={() => handleCheckboxChange(index)}>
            <input
              className={styles.boolean}
              type="checkbox"
              checked={selected[index]}
              onChange={() => handleCheckboxChange(index)}
              style={{ marginRight: "10px" }}
            />

            <h3>Item {index + 1}</h3>
          </div>

          <hr />

          <div className={styles.itemValue}>
            <p>Demand:</p>
            <input
              className={styles.number}
              type="number"
              value={item.Demand}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].Demand = parseInt(e.target.value);
                setItems(newItems);
              }}
            />
          </div>

          <div className={styles.itemValue}>
            <p>Orientations:</p>
            <div>
              {item.AllowedOrientations.map((orientation: number, idx: number) => (
                <div className={styles.degreeSymbolWrapper} key={`orientation-${index}-${idx}`}>
                  <input
                    className={styles.number}
                    type="number"
                    value={orientation}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].AllowedOrientations[index] = parseInt(e.target.value);
                      setItems(newItems);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <SvgComponent key={`svg-${index}`} shape={item.Shape} svgScale={svgScale} />
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h1>{input.Name}.json</h1>

        <button className={styles.submit} type="submit" onClick={handleSubmit}>
          Calculate
        </button>
      </div>

      <div className={styles.items}>
        <div
          className={styles.item}
          style={{
            border: "3px solid black",
            boxSizing: "border-box",
          }}
        >
          <div className={`${styles.checkboxContainer} ${styles.strip}`}>
            <h3>{input.Strip ? "Strip" : "Bin"}</h3>
          </div>
          <hr />
          <div>
            <b>Height: </b>
            <input
              className={`${styles.number} ${styles.strip}`}
              type="number"
              value={stripHeight.Height}
              onChange={(e) => {
                setStripHeight({
                  Height: parseInt(e.target.value),
                });
              }}
            />
          </div>
        </div>
        {renderItems(input.Items, selected)}
      </div>
    </div>
  );
}

export default Input;
