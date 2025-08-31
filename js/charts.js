/**
 * Initializes the bar chart for comparing deployment platforms (Vercel vs. Netlify).
 */
function initPlatformChart() {
    const ctx = document.getElementById('platformChart')?.getContext('2d');
    if (!ctx) {
        console.error("Platform Chart canvas element not found.");
        return;
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Serverless Invocations (per month)', 'Build Time (minutes/month)'],
            datasets: [{
                label: 'Vercel (Hobby)',
                data: [1000000, 6000], // 1M invocations, 100 hours = 6000 mins
                backgroundColor: 'rgba(224, 122, 95, 0.6)',
                borderColor: 'rgba(224, 122, 95, 1)',
                borderWidth: 1
            }, {
                label: 'Netlify (Free)',
                data: [125000, 300], // 125k invocations, 300 mins
                backgroundColor: 'rgba(61, 64, 91, 0.6)',
                borderColor: 'rgba(61, 64, 91, 1)',
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    // Logarithmic scale is used to properly visualize the large difference in values
                    type: 'logarithmic',
                    ticks: {
                        // Custom callback to format ticks in a more readable way (e.g., 1M, 100k)
                        callback: function (value) {
                            if (value === 1000000) return '1M';
                            if (value === 100000) return '100k';
                            if (value === 10000) return '10k';
                            if (value === 1000) return '1k';
                            if (value === 100) return '100';
                            return null; // Hide other non-standard ticks
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: false // The title is in the HTML, so we disable the chart's native title
                },
                tooltip: {
                    callbacks: {
                        // Custom tooltip to add units to the values
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString();
                                // Add specific units based on the data index
                                if (context.dataIndex === 0) label += ' invocations';
                                if (context.dataIndex === 1) label += ' minutes';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initializes the radar chart for comparing Python PDF libraries.
 */
function initLibraryChart() {
    const ctx = document.getElementById('libraryChart')?.getContext('2d');
    if (!ctx) {
        console.error("Library Chart canvas element not found.");
        return;
    }

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Ease of Deployment', 'Feature Richness', 'Performance', 'Advanced Capability'],
            datasets: [{
                label: 'pypdf',
                data: [5, 3, 3, 2], // Ratings out of 5
                backgroundColor: 'rgba(224, 122, 95, 0.2)',
                borderColor: 'rgba(224, 122, 95, 1)',
                pointBackgroundColor: 'rgba(224, 122, 95, 1)',
            }, {
                label: 'pikepdf',
                data: [3, 4, 5, 4],
                backgroundColor: 'rgba(129, 178, 154, 0.2)',
                borderColor: 'rgba(129, 178, 154, 1)',
                pointBackgroundColor: 'rgba(129, 178, 154, 1)',
            }, {
                label: 'PyMuPDF',
                data: [4, 5, 4, 5],
                backgroundColor: 'rgba(61, 64, 91, 0.2)',
                borderColor: 'rgba(61, 64, 91, 1)',
                pointBackgroundColor: 'rgba(61, 64, 91, 1)',
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                r: { // 'r' is for the radial axis in a radar chart
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        // A simpler tooltip for the radar chart
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initializes all charts on the page.
 * This function is exported and called from main.js.
 */
export function initCharts() {
    initPlatformChart();
    initLibraryChart();
}