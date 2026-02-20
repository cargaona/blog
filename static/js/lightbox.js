document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    document.body.appendChild(lightbox);

    const lightboxImg = document.createElement('img');
    lightbox.appendChild(lightboxImg);

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.addEventListener('click', function(e) {
        const target = e.target;
        if (target.tagName === 'IMG' && target.closest('.log-entry')) {
            e.preventDefault();
            openLightbox(target.src);
        }
    });

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target === lightboxImg) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});
