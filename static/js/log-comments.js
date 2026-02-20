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

    document.addEventListener('DOMContentLoaded', function() {
        var logEntries = document.querySelectorAll('.log-entry');

        logEntries.forEach(function(entry) {
            var logPath = entry.getAttribute('data-log-path');
            if (!logPath) return;

            var giscusContainer = entry.querySelector('.log-giscus-container');
            var replyBtn = entry.querySelector('.log-reply-btn');

            if (!giscusContainer || !replyBtn) return;

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
})();
