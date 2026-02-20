#!/bin/bash

set -e

BLOG_DIR="${BLOG_DIR:-/home/char/projects/personal/code/blog}"
TIMESTAMP=$(date +%Y-%m-%d_%H%M)
TEMP_FILE=$(mktemp /tmp/quick-log-XXXXXX.md)

cleanup() {
    rm -f "$TEMP_FILE"
}
trap cleanup EXIT

cat > "$TEMP_FILE" << EOF
$TIMESTAMP

Write your log...
EOF

${EDITOR:-vim} -c 'normal gg' -c 'startinsert' "$TEMP_FILE"

BODY=$(tail -n +3 "$TEMP_FILE" | sed '/^$/d' | xargs)

if [ -z "$BODY" ] || [ "$BODY" = "Write your log..." ]; then
    notify-send "Quick Log" "Cancelled - no content" -u low
    exit 0
fi

SLUG="$TIMESTAMP"

if [ -f "$BLOG_DIR/content/log/$SLUG.md" ]; then
    SLUG="${SLUG}-$(date +%s)"
fi

DATE=$(date -Iseconds | sed 's/+00:00/-03:00/')

cat > "$BLOG_DIR/content/log/$SLUG.md" << EOF
---
title: "$TIMESTAMP"
date: $DATE
draft: false
---

$BODY
EOF

cd "$BLOG_DIR"
git add "content/log/$SLUG.md"
git commit -m "log: $TIMESTAMP" || { notify-send "Quick Log" "Commit failed" -u critical; exit 1; }
git push || { notify-send "Quick Log" "Push failed" -u critical; exit 1; }

notify-send "Quick Log" "Posted: $TIMESTAMP"
