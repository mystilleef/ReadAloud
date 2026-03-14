# Plan: Remove Beads Git Worktree

This plan outlines the steps to remove the `beads` git worktree and associated files from the repository.

## Prerequisites
- [x] Verify the existence of the `beads` worktree using `git worktree list`.
- [x] Confirm the location of the worktree: `.git/beads-worktrees/main`.

## Proposed Changes

### 1. Remove the Git Worktree
- Execute `git worktree remove .git/beads-worktrees/main` to unregister and delete the worktree.
- If the command fails because the directory is missing or corrupted, use `git worktree prune`.

### 2. Clean up Beads Data
- Remove the `.beads/` directory in the project root. This directory contains the issue tracking data (`issues.jsonl`, `config.yaml`, etc.).
- **Note**: This will permanently delete all local Beads issues.

### 3. Clean up Git Configuration
- Remove the `merge=beads` configuration from `.gitattributes`.
- Remove the `.beads/last-touched` entry from `.gitignore`.

### 4. Commit Changes
- Stage the removal of `.beads/`, and the updates to `.gitattributes` and `.gitignore`.
- Commit the changes with a descriptive message (e.g., `chore: remove beads issue tracking`).

## Verification Plan

### Manual Verification
1. Run `git worktree list` and confirm only the main worktree remains.
2. Run `ls -d .beads` and confirm the directory does not exist.
3. Run `ls -d .git/beads-worktrees` and confirm it is gone or empty.
4. Check `git status` to ensure the working tree is clean after the commit.
