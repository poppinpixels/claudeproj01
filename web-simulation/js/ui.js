// UI interaction functionality
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggling
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const body = document.body;

    // Function to toggle dark/light mode
    function toggleTheme() {
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    }

    // Apply saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    }

    // Add event listeners for theme toggling
    themeToggle.addEventListener('click', toggleTheme);
    mobileThemeToggle.addEventListener('click', toggleTheme);

    // Mobile menu functionality
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const closeMenu = document.querySelector('.close-menu');
    const appContainer = document.querySelector('.app-container');

    hamburgerMenu.addEventListener('click', function() {
        appContainer.classList.add('mobile-menu-active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    closeMenu.addEventListener('click', function() {
        appContainer.classList.remove('mobile-menu-active');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close mobile menu when clicking on the overlay
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    mobileNavOverlay.addEventListener('click', function(e) {
        if (e.target === mobileNavOverlay) {
            appContainer.classList.remove('mobile-menu-active');
            document.body.style.overflow = '';
        }
    });

    // Language switching logic
    const languageButtons = document.querySelectorAll('[data-lang]');
    
    languageButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            
            if (lang === 'en') {
                window.location.href = 'index.html';
            } else if (lang === 'dk') {
                window.location.href = 'index-dk.html';
            }
        });
    });

    // Ball type buttons interaction
    const ballTypeButtons = document.querySelectorAll('.ball-type-btn');
    
    ballTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            ballTypeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update the current mode text
            const ballType = this.getAttribute('data-type');
            const currentModeText = document.getElementById('current-mode');
            
            // Get the correct label based on language
            const isEnglish = document.documentElement.lang === 'en';
            if (isEnglish) {
                currentModeText.textContent = `Mode: Add ${this.querySelector('.label').textContent} Balls`;
            } else {
                currentModeText.textContent = `Tilstand: Tilføj ${this.querySelector('.label').textContent} Bolde`;
            }
            
            // If in pop mode, exit pop mode
            popModeBtn.classList.remove('active');
            
            // Set the current ball type in the simulation
            if (window.simulation) {
                window.simulation.setCurrentBallType(ballType);
            }
        });
    });

    // Pop mode button
    const popModeBtn = document.getElementById('pop-mode-btn');
    
    popModeBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        
        // Update the current mode text
        const currentModeText = document.getElementById('current-mode');
        const isEnglish = document.documentElement.lang === 'en';
        
        if (this.classList.contains('active')) {
            currentModeText.textContent = isEnglish ? 'Mode: Pop Balls' : 'Tilstand: Fjern Bolde';
        } else {
            const activeButton = document.querySelector('.ball-type-btn.active');
            const ballType = activeButton.querySelector('.label').textContent;
            currentModeText.textContent = isEnglish ? 
                `Mode: Add ${ballType} Balls` : 
                `Tilstand: Tilføj ${ballType} Bolde`;
        }
        
        // Update the simulation mode
        if (window.simulation) {
            window.simulation.setPopMode(this.classList.contains('active'));
        }
    });

    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    
    resetBtn.addEventListener('click', function() {
        if (window.simulation) {
            window.simulation.reset();
            
            // Update ball count
            const ballCount = document.getElementById('ball-count');
            ballCount.textContent = isEnglish ? 'Balls: 0' : 'Bolde: 0';
        }
    });
});