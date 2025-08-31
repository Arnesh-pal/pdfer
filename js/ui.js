// Data for the feature cards, linking them to their respective tool sections
const featuresData = [
    {
        title: 'Compress PDF',
        icon: '🗜️',
        description: 'Efficiently reduce PDF file size.',
        targetSection: 'tool-compress-pdf'
    },
    {
        title: 'Merge & Split PDF',
        icon: '🧬',
        description: 'Combine multiple PDFs or split one into many.',
        targetSection: 'tool-merge-split-pdf'
    },
    {
        title: 'Edit PDF Text',
        icon: '✏️',
        description: 'Modify text content within a PDF.',
        targetSection: 'tool-edit-pdf-text'
    },
    {
        title: 'Add Images',
        icon: '🖼️',
        description: 'Insert images into PDF documents.',
        targetSection: 'tool-add-images'
    },
    {
        title: 'Edit Page Layout',
        icon: '🎨',
        description: 'Rearrange, rotate, and crop pages.',
        targetSection: 'tool-edit-page-layout'
    },
    {
        title: 'Word to PDF',
        icon: '🔄',
        description: 'Convert .docx files to PDF.',
        targetSection: 'tool-word-to-pdf'
    },
    {
        title: 'Image to PDF',
        icon: '📸',
        description: 'Convert JPG, PNG, etc., to PDF.',
        targetSection: 'tool-image-to-pdf'
    },
    {
        title: 'Video to PDF Summary',
        icon: '🤖',
        description: 'AI-powered summary of video content.',
        targetSection: 'tool-video-to-pdf-summary'
    }
];

/**
 * Dynamically creates and injects the feature cards into the grid.
 */
function createFeatureCards() {
    const featuresGrid = document.getElementById('features-grid');
    if (!featuresGrid) return;

    featuresData.forEach(feature => {
        const card = document.createElement('div');
        card.className = 'feature-card bg-white p-6 rounded-lg shadow-md cursor-pointer text-center';
        card.innerHTML = `
            <div class="text-5xl mb-4">${feature.icon}</div>
            <h3 class="text-xl font-semibold mb-2">${feature.title}</h3>
            <p class="text-gray-500">${feature.description}</p>
        `;
        // Add click listener to smoothly scroll to the corresponding tool section
        card.addEventListener('click', () => {
            const targetElement = document.getElementById(feature.targetSection);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
        featuresGrid.appendChild(card);
    });
}

/**
 * Sets up the event listeners for the mobile navigation menu.
 */
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenuButton || !mobileMenu) return;

    // Toggle menu visibility on button click
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Hide menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

/**
 * Sets up the IntersectionObserver to highlight the active navigation link on scroll.
 */
function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a.nav-link');
    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    // Check if the link's href matches the intersecting section's id
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        // This threshold triggers when the section is centered in the viewport
        rootMargin: '-50% 0px -50% 0px'
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Initializes all general UI components.
 * This function is exported and called from main.js.
 */
export function initUI() {
    createFeatureCards();
    setupMobileMenu();
    setupScrollSpy();
}