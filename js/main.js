import { initUI } from './ui.js';
import { initCharts } from './charts.js';
import { initCompressHandler } from './handlers/compressHandler.js';
import { initImageHandler } from './handlers/imageHandler.js';
import { initVideoHandler } from './handlers/videoHandler.js';
import { initMergeSplitHandler } from './handlers/mergeSplitHandler.js';
import { initWordToPdfHandler } from './handlers/wordToPdfHandler.js';

/**
 * The main entry point for the application.
 * This script waits for the entire HTML document to be loaded and parsed
 * before initializing the application's components.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all parts of the application
    initUI();
    initCharts();

    // Initialize the specific handlers for each interactive tool
    initCompressHandler();
    initImageHandler();
    initVideoHandler();
    initMergeSplitHandler();
    initWordToPdfHandler();

    console.log("PDF Tool Blueprint Initialized 🚀");
});