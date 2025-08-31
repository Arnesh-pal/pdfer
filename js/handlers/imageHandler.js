import { MAX_IMAGE_SIZE_BYTES, resetToolUI } from '../utils.js';

/**
 * Initializes the event handlers and logic for the Image to PDF conversion tool.
 */
export function initImageHandler() {
    // --- Get all necessary DOM elements ---
    const imageToPdfInput = document.getElementById('imageToPdfInput');
    const imageToPdfFileName = document.getElementById('imageToPdfFileName');
    const fitImageToPageCheckbox = document.getElementById('fitImageToPageCheckbox'); // <-- Get the new checkbox
    const imageToPdfButton = document.getElementById('imageToPdfButton');
    const imageToPdfLoadingSpinner = document.getElementById('imageToPdfLoadingSpinner');
    const imageToPdfButtonText = document.getElementById('imageToPdfButtonText');
    const imageToPdfResult = document.getElementById('imageToPdfResult');
    const downloadImageToPdf = document.getElementById('downloadImageToPdf');
    const imageToPdfError = document.getElementById('imageToPdfError');

    // --- State variable ---
    let selectedImageFiles = [];

    // --- Attach Event Listeners ---

    // Listen for file selection
    imageToPdfInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) {
            resetToolUI('imageToPdf');
            selectedImageFiles = [];
            return;
        }

        // Validate each selected file
        for (const file of files) {
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                imageToPdfError.textContent = `One or more images are too large. Max size per image is ${(MAX_IMAGE_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB.`;
                imageToPdfError.classList.remove('hidden');
                imageToPdfButton.disabled = true;
                imageToPdfFileName.textContent = 'File(s) too large';
                selectedImageFiles = []; // Clear selection
                return;
            }
        }

        // If all files are valid, update the UI
        selectedImageFiles = files;
        const fileNames = selectedImageFiles.map(f => f.name).join(', ');
        imageToPdfFileName.textContent = `${selectedImageFiles.length} file(s) chosen: ${fileNames}`;
        imageToPdfButton.disabled = false;
        imageToPdfResult.classList.add('hidden');
        imageToPdfError.classList.add('hidden');
    });

    // Listen for the convert button click
    imageToPdfButton.addEventListener('click', async () => {
        if (selectedImageFiles.length === 0) return;

        // --- Set UI to loading state ---
        imageToPdfButton.disabled = true;
        imageToPdfLoadingSpinner.classList.remove('hidden');
        imageToPdfButtonText.textContent = 'Converting...';
        imageToPdfResult.classList.add('hidden');
        imageToPdfError.classList.add('hidden');

        try {
            // Get the PDFDocument class from the global pdf-lib object
            const { PDFDocument } = PDFLib;

            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();

            for (const file of selectedImageFiles) {
                const imageBytes = await file.arrayBuffer();

                let image;
                if (file.type === 'image/jpeg') {
                    image = await pdfDoc.embedJpg(imageBytes);
                } else if (file.type === 'image/png') {
                    image = await pdfDoc.embedPng(imageBytes);
                } else {
                    console.warn(`Unsupported image type: ${file.type}. Skipping file: ${file.name}`);
                    continue;
                }

                // --- NEW LOGIC: Choose page creation method based on checkbox ---
                if (fitImageToPageCheckbox.checked) {
                    // **Optional Behavior:** Fit image on a standard A4 page with margins.
                    const page = pdfDoc.addPage(); // Adds a standard A4 page
                    const { width: pageWidth, height: pageHeight } = page.getSize();
                    const imageDims = image.scaleToFit(pageWidth - 100, pageHeight - 100); // 50px margin

                    page.drawImage(image, {
                        x: (pageWidth - imageDims.width) / 2,
                        y: (pageHeight - imageDims.height) / 2,
                        width: imageDims.width,
                        height: imageDims.height,
                    });
                } else {
                    // **Default Behavior:** Create a page with the exact dimensions of the image.
                    const page = pdfDoc.addPage([image.width, image.height]);
                    page.drawImage(image, {
                        x: 0,
                        y: 0,
                        width: image.width,
                        height: image.height,
                    });
                }
            }

            if (pdfDoc.getPageCount() === 0) {
                throw new Error("No supported images were found to convert.");
            }

            const pdfBytes = await pdfDoc.save();
            const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(pdfBlob);

            // --- Update UI with success message and download link ---
            downloadImageToPdf.href = url;
            const firstImageName = selectedImageFiles[0].name.split('.')[0];
            downloadImageToPdf.download = `${firstImageName}_converted.pdf`;
            imageToPdfResult.classList.remove('hidden');

        } catch (error) {
            // --- Update UI with error message ---
            imageToPdfError.textContent = `An error occurred during conversion: ${error.message}. Please try again.`;
            imageToPdfError.classList.remove('hidden');
            console.error('Image to PDF error:', error);
        } finally {
            // --- Reset UI from loading state ---
            imageToPdfLoadingSpinner.classList.add('hidden');
            imageToPdfButton.disabled = false;
            imageToPdfButtonText.textContent = 'Convert Again';
        }
    });
}