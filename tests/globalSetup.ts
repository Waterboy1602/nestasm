import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

function getGitCommitHash(): string {
  try {
    const hash = execSync("git rev-parse HEAD").toString().trim();
    return hash;
  } catch (error) {
    console.error("Failed to get git commit hash:", error);
    return "unknown";
  }
}

function createResultsFile() {
  const resultsLocalFilePath = path.join("./", "results", "benchmark_results_local.csv");
  const resultsRemoteFilePath = path.join("./", "results", "benchmark_results_remote.csv");

  fs.mkdirSync(path.dirname(resultsLocalFilePath), { recursive: true });
  fs.mkdirSync(path.dirname(resultsRemoteFilePath), { recursive: true });

  if (!fs.existsSync(resultsLocalFilePath)) {
    const logEntryHeader = `Timestamp;BenchConfiguration;Run;Browser;CommitHash;Max evals/s\n`;
    fs.appendFileSync(resultsLocalFilePath, logEntryHeader);
  }

  if (!fs.existsSync(resultsRemoteFilePath)) {
    const logEntryHeader = `Timestamp;BenchConfiguration;Run;Browser;CommitHash;Max evals/s\n`;
    fs.appendFileSync(resultsRemoteFilePath, logEntryHeader);
  }
}

async function globalSetup() {
  const commitHash = getGitCommitHash();
  process.env.GIT_COMMIT_HASH = commitHash;
  console.log(`Current Git Commit Hash: ${process.env.GIT_COMMIT_HASH}`);

  createResultsFile();
}

export default globalSetup;
