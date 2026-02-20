(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Only process links inside .log-entry containers
        var logEntries = document.querySelectorAll('.log-entry');
        
        logEntries.forEach(function(entry) {
            // Find YouTube Music links
            var links = entry.querySelectorAll('a[href*="music.youtube.com/watch"]');
            
            links.forEach(function(link) {
                var url = link.href;
                
                // Extract video ID from URL
                var match = url.match(/[?&]v=([^&]+)/);
                if (!match) return;
                
                var videoId = match[1];
                
                // Create preview card container
                var preview = document.createElement('a');
                preview.href = url;
                preview.className = 'yt-music-preview';
                preview.target = '_blank';
                preview.rel = 'noopener';
                
                // Create album cover container
                var coverWrap = document.createElement('div');
                coverWrap.className = 'yt-music-cover';
                
                // Create thumbnail image (use hqdefault initially, will update from API)
                var img = document.createElement('img');
                img.src = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
                img.alt = 'Album cover';
                img.loading = 'lazy';
                
                // Create play button overlay
                var play = document.createElement('span');
                play.className = 'yt-music-play';
                play.textContent = '▶';
                
                coverWrap.appendChild(img);
                coverWrap.appendChild(play);
                
                // Create info container
                var info = document.createElement('div');
                info.className = 'yt-music-info';
                
                var title = document.createElement('div');
                title.className = 'yt-music-title';
                title.textContent = 'Loading...';
                
                var artist = document.createElement('div');
                artist.className = 'yt-music-artist';
                artist.textContent = '';
                
                var source = document.createElement('div');
                source.className = 'yt-music-source';
                source.textContent = 'music.youtube.com';
                
                info.appendChild(title);
                info.appendChild(artist);
                info.appendChild(source);
                
                // Assemble the preview card
                preview.appendChild(coverWrap);
                preview.appendChild(info);
                
                // Insert preview card after the link
                link.parentNode.insertBefore(preview, link.nextSibling);
                
                // Hide the original link
                link.style.display = 'none';
                
                // Fetch metadata from noembed
                fetch('https://noembed.com/embed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + videoId))
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        // Set title
                        if (data.title) {
                            title.textContent = data.title;
                        } else {
                            title.textContent = 'YouTube Music';
                        }
                        
                        // Set artist from author_name (strip " - Topic" suffix)
                        if (data.author_name) {
                            var artistName = data.author_name.replace(/ - Topic$/, '');
                            artist.textContent = artistName;
                        }
                        
                        // Use higher quality thumbnail if available
                        if (data.thumbnail_url) {
                            img.src = data.thumbnail_url;
                        }
                    })
                    .catch(function() {
                        title.textContent = 'YouTube Music';
                    });
            });
        });
    });
})();
