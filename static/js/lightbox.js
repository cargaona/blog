document.addEventListener('DOMContentLoaded', function() {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    document.body.appendChild(lightbox);

    const lightboxImg = document.createElement('img');
    lightbox.appendChild(lightboxImg);

    // Navigation arrows
    const prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-prev';
    prevBtn.innerHTML = '&#10094;';
    prevBtn.setAttribute('aria-label', 'Previous image');
    lightbox.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-next';
    nextBtn.innerHTML = '&#10095;';
    nextBtn.setAttribute('aria-label', 'Next image');
    lightbox.appendChild(nextBtn);

    // Counter
    const counter = document.createElement('span');
    counter.className = 'lightbox-counter';
    lightbox.appendChild(counter);

    // State for gallery navigation
    let currentImages = [];
    let currentIndex = 0;

    function showImage(index) {
        // Wrap around
        if (index < 0) index = currentImages.length - 1;
        if (index >= currentImages.length) index = 0;
        
        currentIndex = index;
        lightboxImg.src = currentImages[currentIndex];
        
        // Update counter
        if (currentImages.length > 1) {
            counter.textContent = (currentIndex + 1) + ' / ' + currentImages.length;
        }
    }

    function openLightbox(imgElement) {
        const grid = imgElement.closest('.image-grid');
        
        if (grid) {
            // Image is part of a grid - enable gallery mode
            const gridImages = grid.querySelectorAll('img');
            currentImages = Array.from(gridImages).map(img => img.src);
            currentIndex = currentImages.indexOf(imgElement.src);
            
            // Show navigation
            prevBtn.classList.remove('lightbox-nav-hidden');
            nextBtn.classList.remove('lightbox-nav-hidden');
            counter.classList.remove('lightbox-nav-hidden');
        } else {
            // Single image - no gallery
            currentImages = [imgElement.src];
            currentIndex = 0;
            
            // Hide navigation
            prevBtn.classList.add('lightbox-nav-hidden');
            nextBtn.classList.add('lightbox-nav-hidden');
            counter.classList.add('lightbox-nav-hidden');
        }
        
        showImage(currentIndex);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        currentImages = [];
        currentIndex = 0;
    }

    function prevImage() {
        if (currentImages.length > 1) {
            showImage(currentIndex - 1);
        }
    }

    function nextImage() {
        if (currentImages.length > 1) {
            showImage(currentIndex + 1);
        }
    }

    // Click on image in log entry to open lightbox
    document.addEventListener('click', function(e) {
        const target = e.target;
        if (target.tagName === 'IMG' && target.closest('.log-entry')) {
            e.preventDefault();
            openLightbox(target);
        }
    });

    // Click on lightbox background or image to close
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target === lightboxImg) {
            closeLightbox();
        }
    });

    // Arrow button clicks
    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        prevImage();
    });

    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        nextImage();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                nextImage();
            } else {
                // Swipe right - previous image
                prevImage();
            }
        }
    }
});
