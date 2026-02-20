// Toggle tree sidebar with T key, help panel with H key + draggable functionality
(function() {
    const TREE_STORAGE_KEY = 'tree-sidebar-position';
    const HELP_STORAGE_KEY = 'help-panel-position';
    
    let isDragging = false;
    let dragTarget = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    
    let tree = null;
    let help = null;

    function savePosition(element, key) {
        if (!element) return;
        const pos = {
            left: element.style.left,
            top: element.style.top
        };
        localStorage.setItem(key, JSON.stringify(pos));
    }

    function loadPosition(element, key) {
        const saved = localStorage.getItem(key);
        if (saved && element) {
            try {
                const pos = JSON.parse(saved);
                if (pos.left && pos.top) {
                    element.style.left = pos.left;
                    element.style.top = pos.top;
                    element.style.right = 'auto';
                }
            } catch (e) {
                // Invalid JSON, use defaults
            }
        }
    }

    function clampPosition(element) {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        let left = parseInt(element.style.left) || 0;
        let top = parseInt(element.style.top) || 0;
        
        left = Math.max(0, Math.min(left, maxX));
        top = Math.max(0, Math.min(top, maxY));
        
        element.style.left = left + 'px';
        element.style.top = top + 'px';
        element.style.right = 'auto';
    }

    function startDrag(e) {
        // Find which panel we're dragging
        const panel = e.target.closest('.tree-sidebar, .help-panel');
        if (!panel) return;
        
        // Don't drag if clicking a link
        if (e.target.tagName === 'A') return;
        
        isDragging = true;
        dragTarget = panel;
        
        const rect = panel.getBoundingClientRect();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        dragOffsetX = clientX - rect.left;
        dragOffsetY = clientY - rect.top;
        
        panel.style.right = 'auto';
        
        e.preventDefault();
    }

    function doDrag(e) {
        if (!isDragging || !dragTarget) return;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        let newLeft = clientX - dragOffsetX;
        let newTop = clientY - dragOffsetY;
        
        // Clamp to viewport
        const rect = dragTarget.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        newLeft = Math.max(0, Math.min(newLeft, maxX));
        newTop = Math.max(0, Math.min(newTop, maxY));
        
        dragTarget.style.left = newLeft + 'px';
        dragTarget.style.top = newTop + 'px';
    }

    function endDrag() {
        if (isDragging && dragTarget) {
            const key = dragTarget.classList.contains('tree-sidebar') ? TREE_STORAGE_KEY : HELP_STORAGE_KEY;
            savePosition(dragTarget, key);
            isDragging = false;
            dragTarget = null;
        }
    }

    function init() {
        tree = document.querySelector('.tree-sidebar');
        help = document.querySelector('.help-panel');
        
        // Load saved positions
        if (tree) loadPosition(tree, TREE_STORAGE_KEY);
        if (help) loadPosition(help, HELP_STORAGE_KEY);
        
        // Mouse events - drag panels
        document.addEventListener('mousedown', function(e) {
            if (e.target.closest('.tree-sidebar, .help-panel')) {
                startDrag(e);
            }
        });
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', endDrag);
        
        // Touch events
        document.addEventListener('touchstart', function(e) {
            if (e.target.closest('.tree-sidebar, .help-panel')) {
                startDrag(e);
            }
        }, { passive: false });
        document.addEventListener('touchmove', doDrag, { passive: false });
        document.addEventListener('touchend', endDrag);
        
        // Keyboard toggle
        document.addEventListener('keydown', function(e) {
            // Ignore if typing in input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }
            
            // T for tree
            if (e.key === 't' || e.key === 'T') {
                if (tree) {
                    tree.classList.toggle('visible');
                    if (tree.classList.contains('visible')) {
                        clampPosition(tree);
                    }
                }
            }
            
            // H for help
            if (e.key === 'h' || e.key === 'H') {
                if (help) {
                    help.classList.toggle('visible');
                    if (help.classList.contains('visible')) {
                        clampPosition(help);
                    }
                }
            }
            
            // ESC to close all
            if (e.key === 'Escape') {
                if (tree) tree.classList.remove('visible');
                if (help) help.classList.remove('visible');
            }
        });
        
        // Clamp on window resize
        window.addEventListener('resize', function() {
            if (tree && tree.classList.contains('visible')) {
                clampPosition(tree);
                savePosition(tree, TREE_STORAGE_KEY);
            }
            if (help && help.classList.contains('visible')) {
                clampPosition(help);
                savePosition(help, HELP_STORAGE_KEY);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
