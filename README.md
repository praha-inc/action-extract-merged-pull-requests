# action-extract-merged-pull-requests

[![license](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/praha-inc/action-extract-merged-pull-requests/blob/main/LICENSE)
[![Github](https://img.shields.io/github/followers/praha-inc?label=Follow&logo=github&style=social)](https://github.com/orgs/praha-inc/followers)

Extracts a list of merged pull requests between the specified base and head commit.

## 👏 Usage

Create a workflow file under ```.github/workflows``` directory.

```yaml
name: Write PR description

on:
  pull_request:
    types: [opened, synchronize]
    branches: [main]

jobs:
  restrict-pr-label:
    runs-on: ubuntu-latest
    steps:
       - uses: actions/checkout@v4
         with:
          fetch-depth: 0 # important. This is required to fetch git history.

      - uses: praha-inc/action-extract-merged-pull-requests@v1
        id: extract-merged-pull-requests
        with:
          base-ref: ${{ github.event.pull_request.base.sha }}

      - uses: actions/github-script@v7
        with:
          script: |
            const mergedPullRequests = JSON.parse('${{ steps.extract-merged-prs.outputs.pull-requests }}');

            const body = [
              '## What\'s Changes',
              '',
              ...mergedPullRequests.map((pr) => `- #${pr.number}`),
            ].join('\n');

            await github.rest.pulls.update({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.payload.pull_request.number,
              body,
            });
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome.

Feel free to check [issues page](https://github.com/praha-inc/action-extract-merged-pull-requests/issues) if you want to contribute.

## 📝 License

Copyright © 2024 [PrAha](https://www.praha-inc.com/).

This project is [```MIT```](https://github.com/praha-inc/action-extract-merged-pull-requests/blob/main/LICENSE) licensed.
