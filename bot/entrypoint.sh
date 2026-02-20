#!/bin/sh
set -e

# Configure git identity
git config --global user.name "Blog Bot"
git config --global user.email "bot@charlei.xyz"

# Configure SSH for git
export GIT_SSH_COMMAND="ssh -i /app/deploy-key -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=/dev/null"

# Ensure repo exists
if [ ! -d "$BLOG_REPO_PATH/.git" ]; then
    echo "Cloning repository..."
    git clone "$GIT_REPO_URL" "$BLOG_REPO_PATH"
else
    echo "Pulling latest changes..."
    git -C "$BLOG_REPO_PATH" stash || true
    git -C "$BLOG_REPO_PATH" pull --rebase || true
    git -C "$BLOG_REPO_PATH" stash pop || true
fi

echo "Starting blog bot..."
exec /app/blog-bot
