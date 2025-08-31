import { MAX_PDF_SIZE_BYTES, resetToolUI } from '../utils.js';

/**
 * Initializes the event handlers and logic for the Compress PDF tool.
 */
export function initCompressHandler() {
    // --- Get all necessary DOM elements ---
    const compressPdfInput = document.getElementById('compressPdfInput');
    const compressPdfFileName = document.getElementById('compressFileName');
    const compressPdfButton = document.getElementById('compressPdfButton');
    const compressPdfLoadingSpinner = document.getElementById('compressPdfLoadingSpinner');
    const compressPdfButtonText = document.getElementById('compressPdfButtonText');
    const compressPdfResult = document.getElementById('compressPdfResult');
    const downloadCompressedPdf = document.getElementById('downloadCompressedPdf');
    const compressPdfError = document.getElementById('compressPdfError');
    const compressPdfSizeInfo = document.getElementById('compressPdfSizeInfo');
    const compressionLevelRadios = document.querySelectorAll('input[name="compressionLevel"]');
    const customCompressionPercentInput = document.getElementById('customCompressionPercent');

    // --- State variables ---
    let selectedCompressFile = null;
    let currentCompressionRatio = 0.5; // Default to medium (results in 50% of original size)

    /**
     * Updates the compression ratio based on the user's selection.
     */
    function updateCompressionRatio() {
        const selectedLevel = document.querySelector('input[name="compressionLevel"]:checked').value;
        customCompressionPercentInput.disabled = (selectedLevel !== 'custom');

        switch (selectedLevel) {
            case 'low':
                currentCompressionRatio = 0.8; // 20% reduction
                break;
            case 'medium':
                currentCompressionRatio = 0.5; // 50% reduction
                break;
            case 'high':
                currentCompressionRatio = 0.2; // 80% reduction
                break;
            case 'custom':
                let customPercent = parseFloat(customCompressionPercentInput.value);
                if (isNaN(customPercent) || customPercent < 0 || customPercent > 99) {
                    customPercent = 50; // Default if invalid
                }
                currentCompressionRatio = (100 - customPercent) / 100;
                break;
        }
    }

    // --- Attach Event Listeners ---

    // Listen for changes in compression options
    compressionLevelRadios.forEach(radio => radio.addEventListener('change', updateCompressionRatio));
    customCompressionPercentInput.addEventListener('input', updateCompressionRatio);

    // Listen for file selection
    compressPdfInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size
            if (file.size > MAX_PDF_SIZE_BYTES) {
                compressPdfError.textContent = `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max size is ${(MAX_PDF_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB.`;
                compressPdfError.classList.remove('hidden');
                compressPdfButton.disabled = true;
                compressPdfFileName.textContent = 'File too large';
                selectedCompressFile = null;
                return;
            }
            // Update UI if file is valid
            selectedCompressFile = file;
            compressPdfFileName.textContent = file.name;
            compressPdfButton.disabled = false;
            compressPdfResult.classList.add('hidden');
            compressPdfError.classList.add('hidden');
        } else {
            resetToolUI('compressPdf');
            selectedCompressFile = null;
        }
    });

    // Listen for the compress button click
    compressPdfButton.addEventListener('click', async () => {
        if (!selectedCompressFile) return;

        // --- Set UI to loading state ---
        compressPdfButton.disabled = true;
        compressPdfLoadingSpinner.classList.remove('hidden');
        compressPdfButtonText.textContent = 'Compressing...';
        compressPdfResult.classList.add('hidden');
        compressPdfError.classList.add('hidden');

        try {
            // Read the original PDF file as raw data (ArrayBuffer)
            const originalPdfBytes = await selectedCompressFile.arrayBuffer();

            // Simulate a 2-second backend API call for compression
            await new Promise(resolve => setTimeout(resolve, 2000));

            // --- SIMULATION LOGIC ---
            // In a real application, you would send `originalPdfBytes` to a server.
            // Here, we just pretend the compression happened and use the original bytes for the download.
            const originalSizeKB = (selectedCompressFile.size / 1024).toFixed(2);
            const simulatedCompressedSizeKB = (originalSizeKB * currentCompressionRatio).toFixed(2);

            // Create a Blob from the file data to generate a download link
            const pdfBlob = new Blob([originalPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(pdfBlob);

            // --- Update UI with success message and download link ---
            downloadCompressedPdf.href = url;
            downloadCompressedPdf.download = `compressed_${selectedCompressFile.name}`;
            compressPdfSizeInfo.textContent = `Original size: ${originalSizeKB} KB, New size: ~${simulatedCompressedSizeKB} KB`;
            compressPdfResult.classList.remove('hidden');

        } catch (error) {
            // --- Update UI with error message ---
            compressPdfError.textContent = `An unexpected error occurred: ${error.message}. Please try again.`;
            compressPdfError.classList.remove('hidden');
            console.error('Compress PDF error:', error);
        } finally {
            // --- Reset UI from loading state ---
            compressPdfLoadingSpinner.classList.add('hidden');
            compressPdfButton.disabled = false;
            compressPdfButtonText.textContent = 'Compress Again';
        }
    });

    // Set the initial compression ratio on page load
    updateCompressionRatio();
}