(function() {
    'use strict';

    // Giscus configuration
    var GISCUS_CONFIG = {
        repo: 'cargaona/blog',
        repoId: 'R_kgDOI8QgZw',
        category: 'Comments',
        categoryId: 'DIC_kwDOI8QgZ84C22s6',
        mapping: 'specific',
        strict: '0',
        reactionsEnabled: '1',
        emitMetadata: '0',
        inputPosition: 'bottom',
        theme: 'https://blog.charlei.xyz/css/giscus-cyber.css',
        lang: 'en'
    };

    // GitHub GraphQL endpoint
    var GITHUB_GRAPHQL = 'https://api.github.com/graphql';

    // Maximum nesting depth for visual indentation
    var MAX_NEST_DEPTH = 3;

    document.addEventListener('DOMContentLoaded', function() {
        var logEntries = document.querySelectorAll('.log-entry');

        logEntries.forEach(function(entry) {
            var logPath = entry.getAttribute('data-log-path');
            if (!logPath) return;

            var repliesContainer = entry.querySelector('.log-replies');
            var giscusContainer = entry.querySelector('.log-giscus-container');
            var replyBtn = entry.querySelector('.log-reply-btn');

            if (!repliesContainer || !giscusContainer || !replyBtn) return;

            // Fetch and render existing comments
            fetchDiscussionComments(logPath, repliesContainer);

            // Handle reply button click - toggle Giscus accordion
            var giscusLoaded = false;
            replyBtn.addEventListener('click', function() {
                var isHidden = giscusContainer.hasAttribute('hidden');

                if (isHidden) {
                    giscusContainer.removeAttribute('hidden');
                    replyBtn.classList.add('active');

                    // Load Giscus on first open
                    if (!giscusLoaded) {
                        loadGiscus(giscusContainer, logPath);
                        giscusLoaded = true;
                    }
                } else {
                    giscusContainer.setAttribute('hidden', '');
                    replyBtn.classList.remove('active');
                }
            });
        });
    });

    /**
     * Fetch discussion comments from GitHub API
     * Uses the public REST API to search for discussions by title
     */
    function fetchDiscussionComments(logPath, container) {
        // GitHub REST API for discussions (no auth needed for public repos)
        // We search for discussions where the title matches the log path
        var searchUrl = 'https://api.github.com/repos/cargaona/blog/discussions';

        fetch(searchUrl, {
            headers: {
                'Accept': 'application/vnd.github+json'
            }
        })
        .then(function(response) {
            if (!response.ok) {
                // GitHub Discussions API requires authentication
                // Fall back to showing nothing until Giscus creates the discussion
                return null;
            }
            return response.json();
        })
        .then(function(discussions) {
            if (!discussions) return;

            // Find discussion matching this log path
            var discussion = discussions.find(function(d) {
                return d.title && d.title.indexOf(logPath) !== -1;
            });

            if (discussion && discussion.comments > 0) {
                fetchDiscussionCommentsById(discussion.number, container);
            }
        })
        .catch(function(err) {
            // Silently fail - comments will be available via Giscus
            console.log('Could not fetch discussions:', err.message);
        });
    }

    /**
     * Fetch comments for a specific discussion by number
     */
    function fetchDiscussionCommentsById(discussionNumber, container) {
        var commentsUrl = 'https://api.github.com/repos/cargaona/blog/discussions/' + 
            discussionNumber + '/comments';

        fetch(commentsUrl, {
            headers: {
                'Accept': 'application/vnd.github+json'
            }
        })
        .then(function(response) {
            if (!response.ok) return null;
            return response.json();
        })
        .then(function(comments) {
            if (!comments || comments.length === 0) return;
            renderComments(comments, container, 0);
        })
        .catch(function(err) {
            console.log('Could not fetch comments:', err.message);
        });
    }

    /**
     * Render comments as a nested thread
     */
    function renderComments(comments, container, depth) {
        comments.forEach(function(comment) {
            var replyEl = document.createElement('div');
            replyEl.className = 'log-reply';

            // Add nesting class based on depth (max 3 levels)
            if (depth > 0 && depth <= MAX_NEST_DEPTH) {
                replyEl.classList.add('log-reply-nested');
                replyEl.classList.add('log-reply-depth-' + Math.min(depth, MAX_NEST_DEPTH));
            } else if (depth > MAX_NEST_DEPTH) {
                replyEl.classList.add('log-reply-nested');
                replyEl.classList.add('log-reply-depth-' + MAX_NEST_DEPTH);
            }

            // Author
            var authorEl = document.createElement('a');
            authorEl.className = 'log-reply-author';
            authorEl.href = comment.user ? comment.user.html_url : '#';
            authorEl.target = '_blank';
            authorEl.rel = 'noopener';
            authorEl.textContent = '@' + (comment.user ? comment.user.login : 'unknown');

            // Body
            var bodyEl = document.createElement('div');
            bodyEl.className = 'log-reply-body';
            bodyEl.innerHTML = comment.body_html || escapeHtml(comment.body || '');

            // Date
            var dateEl = document.createElement('time');
            dateEl.className = 'log-reply-date';
            if (comment.created_at) {
                var date = new Date(comment.created_at);
                dateEl.textContent = formatDate(date);
                dateEl.setAttribute('datetime', comment.created_at);
            }

            replyEl.appendChild(authorEl);
            replyEl.appendChild(bodyEl);
            replyEl.appendChild(dateEl);

            container.appendChild(replyEl);

            // Recursively render nested replies if present
            if (comment.replies && comment.replies.length > 0) {
                renderComments(comment.replies, container, depth + 1);
            }
        });
    }

    /**
     * Load Giscus widget into container
     */
    function loadGiscus(container, logPath) {
        var script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', GISCUS_CONFIG.repo);
        script.setAttribute('data-repo-id', GISCUS_CONFIG.repoId);
        script.setAttribute('data-category', GISCUS_CONFIG.category);
        script.setAttribute('data-category-id', GISCUS_CONFIG.categoryId);
        script.setAttribute('data-mapping', GISCUS_CONFIG.mapping);
        script.setAttribute('data-term', logPath);
        script.setAttribute('data-strict', GISCUS_CONFIG.strict);
        script.setAttribute('data-reactions-enabled', GISCUS_CONFIG.reactionsEnabled);
        script.setAttribute('data-emit-metadata', GISCUS_CONFIG.emitMetadata);
        script.setAttribute('data-input-position', GISCUS_CONFIG.inputPosition);
        script.setAttribute('data-theme', GISCUS_CONFIG.theme);
        script.setAttribute('data-lang', GISCUS_CONFIG.lang);
        script.crossOrigin = 'anonymous';
        script.async = true;

        container.appendChild(script);
    }

    /**
     * Format date for display
     */
    function formatDate(date) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var month = months[date.getMonth()];
        var day = date.getDate();
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;

        return month + ' ' + day + ', ' + year + ' · ' + hours + ':' + minutes;
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
