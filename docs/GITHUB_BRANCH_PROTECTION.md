# GitHub Branch Protection Setup

This document describes the GitHub branch protection configuration required for Phase 5.2 CI enforcements.

## Manual Setup in GitHub UI

To enable branch protection on the `main` branch:

1. Go to Repository → Settings → Branches
2. Click "Add rule" under "Branch protection rules"
3. Set branch name pattern to: `main`
4. Enable these protections:
   - [x] **Require a pull request before merging**
     - Require approvals: 1
     - Include administrators: checked
   - [x] **Require status checks to pass before merging**
     - Require branches to be up to date before merging: checked
     - Status checks that must pass:
       - `quality / Lint` (from ci.yml)
       - `quality / Test` (from ci.yml)
       - `quality / Build` (from ci.yml)
   - [x] **Require code reviews**
     - Require at least: 1
     - Dismiss stale pull request approvals: checked
   - [x] **Require conversation resolution before merging**

## Automated Setup Using GitHub CLI

```bash
gh api -X PUT 'repos/{owner}/{repo}/branches/main/protection' \
  -f pattern='main' \
  -f required_status_checks='{"type":"all","contexts":["quality / Lint","quality / Test","quality / Build"]}' \
  -f require_status_checks=true \
  -f required_pull_request_reviews='{"dismissal_restrictions":{},"require_code_owner_reviews":true,"require_last_push_approval":false,"required_approving_review_count":1}' \
  -f require_pull_request_reviews=true \
  -f enforce_admins=true \
  -f required_linear_history=false \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f block_creations=false \
  -f required_conversation_resolution=true
```

Replace `{owner}` and `{repo}` with your GitHub organization/username and repository name.

## Verification

After setup, attempt to merge a PR without CI passing:

- CI jobs must complete successfully
- All three checks (lint, test, build) must pass
- Admins should not be able to bypass without PR approval

## Success Criteria

✅ No PRs can merge to main without:

- All CI checks passing (lint, test, build)
- ≥1 code review approval
- Resolved conversations
