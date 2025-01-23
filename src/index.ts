import * as core from "@actions/core";
import * as github from "@actions/github";

async function run(): Promise<void> {
  try {
    const name = core.getInput("name");
    core.info(`Hello, ${name}!`);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
