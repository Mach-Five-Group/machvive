/* ==========================================================================
   Documentation JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile sidebar toggle functionality
    const mobileToggle = document.querySelector('.docs-mobile-toggle');
    const sidebar = document.querySelector('.docs-sidebar');
    const body = document.body;
    
    if (mobileToggle && sidebar) {
        // Create overlay for mobile
        const overlay = document.createElement('div');
        overlay.className = 'docs-mobile-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 99;
            display: none;
        `;
        body.appendChild(overlay);
        
        function toggleSidebar() {
            mobileToggle.classList.toggle('active');
            sidebar.classList.toggle('open');
            
            if (sidebar.classList.contains('open')) {
                overlay.style.display = 'block';
                setTimeout(() => {
                    overlay.style.opacity = '1';
                    overlay.style.visibility = 'visible';
                }, 10);
                body.style.overflow = 'hidden';
            } else {
                overlay.style.opacity = '0';
                overlay.style.visibility = 'hidden';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 300);
                body.style.overflow = '';
            }
        }
        
        mobileToggle.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
        
        // Close sidebar when clicking on navigation links (mobile)
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                    toggleSidebar();
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
                toggleSidebar();
            }
        });
        
        // Show mobile toggle on small screens
        function updateMobileToggleVisibility() {
            if (window.innerWidth <= 768) {
                overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
            } else {
                overlay.style.display = 'none';
                if (sidebar.classList.contains('open')) {
                    toggleSidebar();
                }
            }
        }
        
        window.addEventListener('resize', updateMobileToggleVisibility);
        updateMobileToggleVisibility();
    }
});