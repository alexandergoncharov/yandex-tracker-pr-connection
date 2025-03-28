import axios from "axios";
import * as github from "@actions/github";

declare var process: {
  env: {
    API_TOKEN: string;
    ORG_ID: string;
  };
};
const { API_TOKEN, ORG_ID } = process.env;

const prTitle = github.context.payload.pull_request?.title;
const prNumber = github.context.payload.pull_request?.number;
const repoFullName = github.context.payload.repository?.full_name;

const API_URL = "https://api.tracker.yandex.net/v2/issues";

const headers = {
  headers: {
    Authorization: `OAuth ${API_TOKEN}`,
    "Content-Type": "application/json",
    "X-Cloud-Org-ID": ORG_ID,
  },
};

interface Comment {
  text: string;
}

const regexForTaskId = /\b(LALA-\d+)\b/g;

async function sendPrComment(): Promise<void> {
  try {
    const taskId = getTaskId();
    const comments: Comment[] = await getComments(taskId);
    const prCommentText = `[${prTitle}](https://github.com/${repoFullName}/pull/${prNumber})`;

    if (isPrCommentExist(comments, prCommentText)) {
      console.log(`PR comment already exist`);
      return;
    }

    await addComment(prCommentText, taskId);
  } catch (error: any) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

function isPrCommentExist(comments: Comment[], commentText: string) {
  const foundPrComments = comments.filter((comment) =>
    comment.text.includes(commentText)
  );
  if (foundPrComments.length > 0) {
    return true;
  }

  return false;
}

async function getComments(issueId: string): Promise<Comment[]> {
  const response = await axios.get(`${API_URL}/${issueId}/comments`, headers);

  return response.data;
}

async function addComment(commentText: string, taskId: string) {
  await axios.post(
    `${API_URL}/${taskId}/comments`,
    { text: commentText },
    headers
  );
}

function getTaskId() {
  const regExpResult = prTitle.toUpperCase().match(regexForTaskId);
  if (!regExpResult || regExpResult.length > 1) {
    throw new Error(`Wrong title for ${prTitle}`);
  }
  return regExpResult[0];
}

sendPrComment();
