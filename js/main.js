/* ==========================================================================
   MachVive Main JavaScript
   ========================================================================== */

// Mobile Navigation Handler
document.addEventListener('DOMContentLoaded', function() {
    initMobileNavigation();
});

function initMobileNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavDrawer = document.querySelector('.mobile-nav-drawer');
    const body = document.body;
    
    if (!mobileMenuBtn || !mobileNavDrawer) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    body.appendChild(overlay);
    
    function toggleMobileMenu() {
        mobileMenuBtn.classList.toggle('active');
        mobileNavDrawer.classList.toggle('open');
        overlay.classList.toggle('active');
        body.style.overflow = mobileNavDrawer.classList.contains('open') ? 'hidden' : '';
    }
    
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    overlay.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking on mobile nav links
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNavDrawer.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // Close menu when user scrolls
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (mobileNavDrawer.classList.contains('open')) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                toggleMobileMenu();
            }, 100); // Small delay to avoid closing on accidental micro-scrolls
        }
    });
}