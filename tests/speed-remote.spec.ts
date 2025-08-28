import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const resultsFilePath = path.join("./", "results", "benchmark_results_wasm.csv");
const url = "http://localhost:4173/nestasm";

/**
 * This test measures the speed of the Wasm optimization process.
 * Without live logs
 * Without preview SVG view
 * With early termination
 * With 3 threads
 */
test(
  "Speed - Config 1",
  {
    tag: ["@1"],
  },
  async ({ page }) => {
    await page.goto(url);

    const showLogsInstantCheckbox = await page.getByTestId("showLogsInstant");
    await expect(showLogsInstantCheckbox).toBeVisible();
    await showLogsInstantCheckbox.uncheck();

    const showPreviewSvgCheckbox = await page.getByTestId("showPreviewSvg");
    await expect(showPreviewSvgCheckbox).toBeVisible();
    await showPreviewSvgCheckbox.uncheck();

    const nWorkersInput = await page.getByTestId("nWorkersInput");
    await expect(nWorkersInput).toBeVisible();
    await nWorkersInput.fill("3");

    await startOptimization(page, 1);
  }
);

/**
 * This test measures the speed of the Wasm optimization process.
 * With live logs
 * Without preview SVG view
 * With early termination
 * With 3 threads
 */
test(
  "Speed - Config 2",
  {
    tag: ["@2"],
  },
  async ({ page }) => {
    await page.goto(url);

    const showLogsInstantCheckbox = await page.getByTestId("showLogsInstant");
    await expect(showLogsInstantCheckbox).toBeVisible();
    await showLogsInstantCheckbox.check();

    const showPreviewSvgCheckbox = await page.getByTestId("showPreviewSvg");
    await expect(showPreviewSvgCheckbox).toBeVisible();
    await showPreviewSvgCheckbox.uncheck();

    const nWorkersInput = await page.getByTestId("nWorkersInput");
    await expect(nWorkersInput).toBeVisible();
    await nWorkersInput.fill("3");

    await startOptimization(page, 2);
  }
);

/**
 * This test measures the speed of the Wasm optimization process.
 * Without live logs
 * With preview SVG view
 * With early termination
 * With 3 threads
 */
test(
  "Speed - Config 3",
  {
    tag: ["@3"],
  },
  async ({ page }) => {
    await page.goto(url);

    const showLogsInstantCheckbox = await page.getByTestId("showLogsInstant");
    await expect(showLogsInstantCheckbox).toBeVisible();
    await showLogsInstantCheckbox.uncheck();

    const showPreviewSvgCheckbox = await page.getByTestId("showPreviewSvg");
    await expect(showPreviewSvgCheckbox).toBeVisible();
    await showPreviewSvgCheckbox.check();

    const nWorkersInput = await page.getByTestId("nWorkersInput");
    await expect(nWorkersInput).toBeVisible();
    await nWorkersInput.fill("3");

    await startOptimization(page, 3);
  }
);

/**
 * This test measures the speed of the Wasm optimization process.
 * With live logs
 * With preview SVG view
 * With early termination
 * With 3 threads
 */
test(
  "Speed - Config 4",
  {
    tag: ["@4"],
  },
  async ({ page }) => {
    await page.goto(url);

    const showLogsInstantCheckbox = await page.getByTestId("showLogsInstant");
    await expect(showLogsInstantCheckbox).toBeVisible();
    await showLogsInstantCheckbox.check();

    const showPreviewSvgCheckbox = await page.getByTestId("showPreviewSvg");
    await expect(showPreviewSvgCheckbox).toBeVisible();
    await showPreviewSvgCheckbox.check();

    const nWorkersInput = await page.getByTestId("nWorkersInput");
    await expect(nWorkersInput).toBeVisible();
    await nWorkersInput.fill("3");

    await startOptimization(page, 4);
  }
);

/**
 * This test measures the speed of the Wasm optimization process.
 * Without live logs
 * Without preview SVG view
 * With early termination
 * With 1 thread
 */
test(
  "Speed - Config 5",
  {
    tag: ["@5"],
  },
  async ({ page }) => {
    await page.goto(url);

    const showLogsInstantCheckbox = await page.getByTestId("showLogsInstant");
    await expect(showLogsInstantCheckbox).toBeVisible();
    await showLogsInstantCheckbox.uncheck();

    const showPreviewSvgCheckbox = await page.getByTestId("showPreviewSvg");
    await expect(showPreviewSvgCheckbox).toBeVisible();
    await showPreviewSvgCheckbox.uncheck();

    const nWorkersInput = await page.getByTestId("nWorkersInput");
    await expect(nWorkersInput).toBeVisible();
    await nWorkersInput.fill("1");

    await startOptimization(page, 5);
  }
);

/**
 * This test measures the speed of the Wasm optimization process.
 * Without live logs
 * Without preview SVG view
 * With early termination
 * With 2 threads
 */
test(
  "Speed - Config 6",
  {
    tag: ["@6"],
  },
  async ({ page }) => {
    await page.goto(url);

    const showLogsInstantCheckbox = await page.getByTestId("showLogsInstant");
    await expect(showLogsInstantCheckbox).toBeVisible();
    await showLogsInstantCheckbox.uncheck();

    const showPreviewSvgCheckbox = await page.getByTestId("showPreviewSvg");
    await expect(showPreviewSvgCheckbox).toBeVisible();
    await showPreviewSvgCheckbox.uncheck();

    const nWorkersInput = await page.getByTestId("nWorkersInput");
    await expect(nWorkersInput).toBeVisible();
    await nWorkersInput.fill("2");

    await startOptimization(page, 6);
  }
);

/**
 * This test measures the speed of the Wasm optimization process.
 * Without live logs
 * Without preview SVG view
 * With early termination
 * With 3 threads
 */
test(
  "Speed - Config 7",
  {
    tag: ["@7"],
  },
  async ({ page }) => {
    await page.goto(url);

    const showLogsInstantCheckbox = await page.getByTestId("showLogsInstant");
    await expect(showLogsInstantCheckbox).toBeVisible();
    await showLogsInstantCheckbox.uncheck();

    const showPreviewSvgCheckbox = await page.getByTestId("showPreviewSvg");
    await expect(showPreviewSvgCheckbox).toBeVisible();
    await showPreviewSvgCheckbox.uncheck();

    const nWorkersInput = await page.getByTestId("nWorkersInput");
    await expect(nWorkersInput).toBeVisible();
    await nWorkersInput.fill("3");

    await startOptimization(page, 7);
  }
);

/**
 * This test measures the speed of the Wasm optimization process.
 * Without live logs
 * Without preview SVG view
 * With early termination
 * With 4 threads
 */
test(
  "Speed - Config 8",
  {
    tag: ["@8"],
  },
  async ({ page }) => {
    await page.goto(url);

    const showLogsInstantCheckbox = await page.getByTestId("showLogsInstant");
    await expect(showLogsInstantCheckbox).toBeVisible();
    await showLogsInstantCheckbox.uncheck();

    const showPreviewSvgCheckbox = await page.getByTestId("showPreviewSvg");
    await expect(showPreviewSvgCheckbox).toBeVisible();
    await showPreviewSvgCheckbox.uncheck();

    const nWorkersInput = await page.getByTestId("nWorkersInput");
    await expect(nWorkersInput).toBeVisible();
    await nWorkersInput.fill("4");

    await startOptimization(page, 8);
  }
);

const startOptimization = async (page, configNumber) => {
  console.log("SharedArrayBuffer available?", typeof SharedArrayBuffer);
  const earlyTermination = await page.getByTestId("earlyTerminationInput");
  await expect(earlyTermination).toBeVisible();
  await earlyTermination.check();

  const seed = await page.getByTestId("seedInput");
  await expect(seed).toBeVisible();
  await seed.fill("42");

  const startButton = await page.getByRole("button", { name: "Start optimization" });
  await expect(startButton).toBeVisible();
  await startButton.click();

  const logBox = await page.getByTestId("logBox");
  await expect(logBox).toBeVisible();
  await expect(logBox).toContainText("Wasm logger successfully initialized");

  try {
    await expect(logBox).toContainText("Wasm thread pool successfully initialized");
  } catch {
    test.fail(
      true,
      "Wasm thread pool initialization failed. This might be due to the environment not supporting Web Workers."
    );
  }
  await expect(logBox).toContainText("Wasm computation started");
  const startTime = Date.now();

  await expect(logBox).toContainText("Finished", { timeout: 900000000 });
  const elapsedTime = Date.now() - startTime;

  await expect(logBox).toContainText("Max evals");
  const logBoxText = await page.getByTestId("logBox").textContent();

  if (!logBoxText) {
    test.fail(true, 'Log box text is empty. Could not extract "Max evals/s" value.');
    return;
  }

  const timestamp = new Date().toISOString();
  const branchName = process.env.GIT_BRANCH_NAME || "unknown";
  const commitHash = process.env.GIT_COMMIT_HASH || "unknown";
  const cpuModel = process.env.CPU_MODEL || "unknown";
  const logEntry = `${timestamp},${configNumber},${test.info().repeatEachIndex + 1},${
    test.info().project.name
  },${cpuModel},${branchName},${commitHash},${elapsedTime}\n`;

  console.log(logEntry);

  fs.appendFileSync(resultsFilePath, logEntry);

  expect(elapsedTime).toBeGreaterThan(0);
};
