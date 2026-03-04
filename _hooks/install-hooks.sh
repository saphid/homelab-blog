#!/bin/bash
# Install git hooks from _hooks/ into .git/hooks/
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$REPO_DIR/.git/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "Error: .git/hooks directory not found. Are you in a git repo?"
  exit 1
fi

cp "$SCRIPT_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"
echo "Installed pre-commit hook."
echo "It will scan for secrets, PII, and sensitive data before each commit."
