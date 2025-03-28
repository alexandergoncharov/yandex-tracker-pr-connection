import axios from "axios";

declare var process: {
  env: {
    TITLE: string;
    PR_NUMBER: string;
    REPO_NAME: string;
    API_TOKEN: string;
    ORG_ID: string;
  };
};
const { TITLE, PR_NUMBER, REPO_NAME, API_TOKEN, ORG_ID } = process.env;

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
    // const prCommentText = `[${TITLE}](https://github.lmru.tech/${REPO_NAME}/pull/${PR_NUMBER})`;
    const prCommentText = `[${TITLE}](https://github.com/${REPO_NAME}/pull/${PR_NUMBER})`;

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
  const regExpResult = TITLE.toUpperCase().match(regexForTaskId);
  if (!regExpResult || regExpResult.length > 1) {
    throw new Error(`Wrong title for ${TITLE}`);
  }
  return regExpResult[0];
}

sendPrComment();
