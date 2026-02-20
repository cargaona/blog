(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Only process links inside .log-entry containers
        var logEntries = document.querySelectorAll('.log-entry');
        
        logEntries.forEach(function(entry) {
            // Find all YouTube links (youtube.com, music.youtube.com, youtu.be)
            var links = entry.querySelectorAll('a[href*="youtube.com/watch"], a[href*="music.youtube.com/watch"], a[href*="youtu.be/"]');
            
            links.forEach(function(link) {
                var url = link.href;
                var videoId = extractVideoId(url);
                if (!videoId) return;
                
                // Determine source domain for display
                var sourceDomain = getSourceDomain(url);
                
                // Create preview card container (div, not anchor, for click-to-play)
                var preview = document.createElement('div');
                preview.className = 'yt-video-preview';
                preview.setAttribute('role', 'button');
                preview.setAttribute('tabindex', '0');
                preview.setAttribute('aria-label', 'Play video');
                preview.dataset.videoId = videoId;
                preview.dataset.originalUrl = url;
                
                // Create thumbnail container
                var coverWrap = document.createElement('div');
                coverWrap.className = 'yt-video-cover';
                
                // Create thumbnail image (use maxresdefault with fallback)
                var img = document.createElement('img');
                img.src = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
                img.alt = 'Video thumbnail';
                img.loading = 'lazy';
                
                // Create play button overlay
                var play = document.createElement('span');
                play.className = 'yt-video-play';
                play.innerHTML = '<svg viewBox="0 0 68 48" width="68" height="48"><path fill="#212121" fill-opacity="0.8" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"></path><path fill="#fff" d="M 45,24 27,14 27,34"></path></svg>';
                
                coverWrap.appendChild(img);
                coverWrap.appendChild(play);
                
                // Create info container
                var info = document.createElement('div');
                info.className = 'yt-video-info';
                
                var title = document.createElement('div');
                title.className = 'yt-video-title';
                title.textContent = 'Loading...';
                
                var channel = document.createElement('div');
                channel.className = 'yt-video-channel';
                channel.textContent = '';
                
                var source = document.createElement('div');
                source.className = 'yt-video-source';
                source.textContent = sourceDomain;
                
                info.appendChild(title);
                info.appendChild(channel);
                info.appendChild(source);
                
                // Assemble the preview card
                preview.appendChild(coverWrap);
                preview.appendChild(info);
                
                // Insert preview card after the link
                link.parentNode.insertBefore(preview, link.nextSibling);
                
                // Hide the original link
                link.style.display = 'none';
                
                // Add click handler for inline playback
                preview.addEventListener('click', function() {
                    embedVideo(preview, videoId);
                });
                
                // Add keyboard support (Enter/Space)
                preview.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        embedVideo(preview, videoId);
                    }
                });
                
                // Fetch metadata from noembed
                fetch('https://noembed.com/embed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + videoId))
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        // Set title
                        if (data.title) {
                            title.textContent = data.title;
                            preview.setAttribute('aria-label', 'Play: ' + data.title);
                        } else {
                            title.textContent = 'YouTube Video';
                        }
                        
                        // Set channel from author_name (strip " - Topic" suffix for music)
                        if (data.author_name) {
                            var channelName = data.author_name.replace(/ - Topic$/, '');
                            channel.textContent = channelName;
                        }
                        
                        // Use higher quality thumbnail if available
                        if (data.thumbnail_url) {
                            img.src = data.thumbnail_url;
                        }
                    })
                    .catch(function() {
                        title.textContent = 'YouTube Video';
                    });
            });
        });
    });

    /**
     * Extract video ID from various YouTube URL formats
     */
    function extractVideoId(url) {
        // youtube.com/watch?v=VIDEO_ID or music.youtube.com/watch?v=VIDEO_ID
        var match = url.match(/[?&]v=([^&]+)/);
        if (match) return match[1];
        
        // youtu.be/VIDEO_ID
        match = url.match(/youtu\.be\/([^?&]+)/);
        if (match) return match[1];
        
        return null;
    }

    /**
     * Get display-friendly source domain
     */
    function getSourceDomain(url) {
        if (url.includes('music.youtube.com')) {
            return 'music.youtube.com';
        } else if (url.includes('youtu.be')) {
            return 'youtu.be';
        } else {
            return 'youtube.com';
        }
    }

    /**
     * Replace preview card with embedded iframe player
     */
    function embedVideo(preview, videoId) {
        // Create iframe container for 16:9 aspect ratio
        var iframeWrap = document.createElement('div');
        iframeWrap.className = 'yt-video-iframe-wrap';
        
        // Create iframe
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('title', 'YouTube video player');
        
        iframeWrap.appendChild(iframe);
        
        // Add playing class and replace content
        preview.classList.add('yt-video-playing');
        preview.innerHTML = '';
        preview.appendChild(iframeWrap);
        
        // Remove button role since it's now a player
        preview.removeAttribute('role');
        preview.removeAttribute('tabindex');
        preview.removeAttribute('aria-label');
    }
})();
