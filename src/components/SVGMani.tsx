import { useEffect, useRef } from "react";
import * as d3 from "d3";

import SVG from "./../assets/1.svg?react";

import styles from "../styles/SVGMani.module.css";

const movedElement = new Map<string, string | null>();

function convertTitleToId(input: string) {
  const regex = /item, id: (\d+), transf: \[r: (-?\d+\.\d+)°, t: \((\d+\.\d+), (\d+\.\d+)\)\]/;
  const match = input.match(regex);

  if (match) {
    const id = match[1];
    const rotation = match[2];
    const translateX = match[3];
    const translateY = match[4];

    return `${id};${rotation};${translateX};${translateY}`;
  } else {
    throw new Error("Input string does not match the expected format.");
  }
}

const SVGManipulation = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isRKeyPressedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "r" || event.key === "R") {
        isRKeyPressedRef.current = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "r" || event.key === "R") {
        isRKeyPressedRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const uses = svgElement.querySelectorAll("g > use");

    uses.forEach((use) => {
      const element = d3.select(use);
      let elementId: string;

      const titleElement = use.querySelector("title");
      if (titleElement) {
        const titleText = titleElement.textContent;
        if (!titleText) return;
        elementId = convertTitleToId(titleText.toString());
      }

      let transform = null;
      let translateMatch: number[] = [];
      let isElementSelected = false;

      const elementSelected = (event: d3.D3DragEvent<SVGUseElement, unknown, unknown>) => {
        const rotateElement = () => {
          if (isElementSelected && isRKeyPressedRef.current) {
            transform = element.attr("transform");
            translateMatch = transform.match(/[-+]?\d*\.?\d+/g)?.map(Number) || [];
            if (translateMatch) {
              translateMatch[2] = (translateMatch[2] + 1) % 360; // Increment rotation
              element.attr(
                "transform",
                `translate(${event.x}, ${event.y}) rotate(${translateMatch[2]})`
              );
            }

            requestAnimationFrame(rotateElement);
          }
        };

        rotateElement();
      };

      const drag = d3
        .drag()
        .subject(function () {
          transform = element.attr("transform");
          translateMatch = transform.match(/[-+]?\d*\.?\d+/g)?.map(Number) || [];
          if (translateMatch) {
            return {
              x: translateMatch[0],
              y: translateMatch[1],
            };
          }
          return { x: 0, y: 0 };
        })
        .on("start", function (event) {
          isElementSelected = true;
          elementSelected(event);

          movedElement.set(elementId, null);
        })
        .on("drag", function (event) {
          element.attr(
            "transform",
            `translate(${event.x}, ${event.y}), rotate(${translateMatch[2]})`
          );
        })
        .on("end", function () {
          isElementSelected = false;
          movedElement.set(elementId, element.attr("transform") || null);

          console.log(movedElement);
        });

      element.call(drag);
    });
  }, []);

  function changeContainerSize(increase: boolean) {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const containerElement = d3.select(svgElement).select("g");
    const containerId = containerElement.attr("id");
    const currentScale = containerElement.attr("transform")?.match(/scale\(([^,]+),\s*([^)]+)\)/);
    let scaleX = currentScale ? parseFloat(currentScale[1]) : 1;
    const scaleY = currentScale ? parseFloat(currentScale[2]) : 1;
    if (increase) {
      scaleX += 0.1; // Increase scale by 0.1
    } else {
      scaleX = Math.max(0.1, scaleX - 0.1); // Decrease scale by 0.1, but not below 0.1
    }

    containerElement.attr("transform", `scale(${scaleX}, ${scaleY})`);
    movedElement.set(containerId, containerElement.attr("transform") || null);
  }

  return (
    <div>
      <div className={`${styles.rust}`}>
        <h1>SVG Manipulation</h1>
        <div id="testBox" className={`green`}></div>
      </div>

      <div className={`${styles.changeStrip}`}>
        <h1>Change size of strip</h1>
        <button
          id="increaseStrip"
          className={styles.button}
          onClick={() => changeContainerSize(true)}
        >
          +
        </button>
        <button
          id="decreaseStrip"
          className={styles.button}
          onClick={() => changeContainerSize(false)}
        >
          -
        </button>
      </div>

      <div className={`${styles.svg}`}>
        <SVG width="100%" height="100%" ref={svgRef} />
      </div>
    </div>
  );
};

export default SVGManipulation;
