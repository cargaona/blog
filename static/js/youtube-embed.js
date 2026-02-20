(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Only process links inside .log-entry containers
        const logEntries = document.querySelectorAll('.log-entry');
        
        logEntries.forEach(function(entry) {
            // Find YouTube Music links
            const links = entry.querySelectorAll('a[href*="music.youtube.com/watch"]');
            
            links.forEach(function(link) {
                const url = link.href;
                
                // Extract video ID from URL
                const match = url.match(/[?&]v=([^&]+)/);
                if (!match) return;
                
                const videoId = match[1];
                const thumbnailUrl = 'https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg';
                
                // Create preview card container
                const preview = document.createElement('a');
                preview.href = url;
                preview.className = 'yt-music-preview';
                preview.target = '_blank';
                preview.rel = 'noopener';
                
                // Create album cover container
                const coverWrap = document.createElement('div');
                coverWrap.className = 'yt-music-cover';
                
                // Create thumbnail image
                const img = document.createElement('img');
                img.src = thumbnailUrl;
                img.alt = 'Album cover';
                img.loading = 'lazy';
                
                // Create play button overlay
                const play = document.createElement('span');
                play.className = 'yt-music-play';
                play.textContent = '▶';
                
                coverWrap.appendChild(img);
                coverWrap.appendChild(play);
                
                // Create info container
                const info = document.createElement('div');
                info.className = 'yt-music-info';
                
                const title = document.createElement('div');
                title.className = 'yt-music-title';
                title.textContent = 'Loading...';
                
                const artist = document.createElement('div');
                artist.className = 'yt-music-artist';
                artist.textContent = '';
                
                info.appendChild(title);
                info.appendChild(artist);
                
                // Assemble the preview card
                preview.appendChild(coverWrap);
                preview.appendChild(info);
                
                // Insert preview card after the link
                link.parentNode.insertBefore(preview, link.nextSibling);
                
                // Fetch metadata from noembed
                fetch('https://noembed.com/embed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + videoId))
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        if (data.title) {
                            // Try to parse "Artist - Song" format
                            var parts = data.title.split(' - ');
                            if (parts.length >= 2) {
                                artist.textContent = parts[0].trim();
                                title.textContent = parts.slice(1).join(' - ').trim();
                            } else {
                                title.textContent = data.title;
                                artist.textContent = '';
                            }
                        } else {
                            title.textContent = 'YouTube Music';
                        }
                    })
                    .catch(function() {
                        title.textContent = 'YouTube Music';
                    });
            });
        });
    });
})();
