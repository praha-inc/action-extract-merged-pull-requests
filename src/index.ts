import * as core from '@actions/core';
import * as github from '@actions/github';
import { simpleGit } from 'simple-git';

void (async () => {
  const githubToken = core.getInput('github-token', { required: true });
  const baseRef = core.getInput('base-ref', { required: true });
  const headRef = core.getInput('head-ref', { required: true });

  const git = simpleGit();
  const gitMergedLogs = await git.log(['--merges', '--reverse', `${baseRef}..${headRef}`]);

  const pullRequestNumbers = gitMergedLogs.all
    .filter((commit) => /^Merge pull request #\d+/.test(commit.message))
    .map((commit) => /#(\d+)/.exec(commit.message)![1]!);

  const outputs = [];
  const octokit = github.getOctokit(githubToken);
  for (const pullRequestNumber of pullRequestNumbers) {
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: Number(pullRequestNumber),
    });

    outputs.push({
      number: pullRequest.number,
      title: pullRequest.title,
      user: pullRequest.user.login,
      labels: pullRequest.labels.map((label) => label.name),
    });
  }
  core.setOutput('pull-requests', JSON.stringify(outputs));
})()
  .catch((error: unknown) => core.setFailed(new Error('An unexpected error occurred', { cause: error }))); // eslint-disable-line unicorn/prefer-top-level-await
