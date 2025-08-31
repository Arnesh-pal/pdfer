import { MAX_PDF_SIZE_BYTES } from '../utils.js';

/**
 * Parses a range string (e.g., "1, 3-5, 8") into an array of page indices (0-based).
 * @param {string} rangeString The string to parse.
 * @param {number} maxPage The total number of pages in the document.
 * @returns {number[]} A sorted array of unique, 0-based page indices.
 */
function parseRangeString(rangeString, maxPage) {
    const pageNumbers = new Set();
    const parts = rangeString.split(',');

    for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('-')) {
            const [start, end] = trimmedPart.split('-').map(num => parseInt(num, 10));
            if (!isNaN(start) && !isNaN(end) && start <= end) {
                for (let i = start; i <= end; i++) {
                    if (i > 0 && i <= maxPage) {
                        pageNumbers.add(i - 1); // Convert to 0-based index
                    }
                }
            }
        } else {
            const num = parseInt(trimmedPart, 10);
            if (!isNaN(num) && num > 0 && num <= maxPage) {
                pageNumbers.add(num - 1); // Convert to 0-based index
            }
        }
    }

    return Array.from(pageNumbers).sort((a, b) => a - b);
}


export function initMergeSplitHandler() {
    // --- Common Elements & State ---
    const mergeTab = document.getElementById('merge-tab');
    const splitTab = document.getElementById('split-tab');
    const mergeContent = document.getElementById('merge-tool-content');
    const splitContent = document.getElementById('split-tool-content');

    // --- Tab Switching Logic ---
    mergeTab.addEventListener('click', () => {
        mergeContent.classList.remove('hidden');
        splitContent.classList.add('hidden');
        mergeTab.classList.add('text-[#E07A5F]', 'border-[#E07A5F]');
        splitTab.classList.remove('text-[#E07A5F]', 'border-[#E07A5F]');
        splitTab.classList.add('text-gray-500', 'border-transparent');
    });

    splitTab.addEventListener('click', () => {
        splitContent.classList.remove('hidden');
        mergeContent.classList.add('hidden');
        splitTab.classList.add('text-[#E07A5F]', 'border-[#E07A5F]');
        mergeTab.classList.remove('text-[#E07A5F]', 'border-[#E07A5F]');
        mergeTab.classList.add('text-gray-500', 'border-transparent');
    });

    // --- MERGE LOGIC (Unchanged) ---
    const mergePdfInput = document.getElementById('mergePdfInput');
    const mergeFileList = document.getElementById('mergeFileList');
    const mergePdfButton = document.getElementById('mergePdfButton');
    const mergePdfLoadingSpinner = document.getElementById('mergePdfLoadingSpinner');
    const mergePdfButtonText = document.getElementById('mergePdfButtonText');
    const mergePdfResult = document.getElementById('mergePdfResult');
    const downloadMergedPdf = document.getElementById('downloadMergedPdf');
    const mergePdfError = document.getElementById('mergePdfError');
    let mergeFiles = [];

    mergePdfInput.addEventListener('change', (event) => {
        mergeFiles = Array.from(event.target.files);
        mergeFileList.innerHTML = '';
        mergePdfError.classList.add('hidden');

        let totalSize = 0;
        mergeFiles.forEach(file => totalSize += file.size);

        if (totalSize > MAX_PDF_SIZE_BYTES * 5) { // Arbitrary 50MB total limit
            mergePdfError.textContent = 'Total file size is too large.';
            mergePdfError.classList.remove('hidden');
            mergePdfButton.disabled = true;
            return;
        }

        mergeFiles.forEach((file, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'p-2 border rounded-md bg-gray-50 text-sm';
            listItem.textContent = `${index + 1}. ${file.name}`;
            mergeFileList.appendChild(listItem);
        });

        mergePdfButton.disabled = mergeFiles.length < 2;
    });

    mergePdfButton.addEventListener('click', async () => {
        mergePdfButton.disabled = true;
        mergePdfLoadingSpinner.classList.remove('hidden');
        mergePdfButtonText.textContent = 'Merging...';
        mergePdfError.classList.add('hidden');
        mergePdfResult.classList.add('hidden');

        try {
            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            for (const file of mergeFiles) {
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            downloadMergedPdf.href = url;
            mergePdfResult.classList.remove('hidden');

        } catch (error) {
            mergePdfError.textContent = `An error occurred: ${error.message}`;
            mergePdfError.classList.remove('hidden');
        } finally {
            mergePdfLoadingSpinner.classList.add('hidden');
            mergePdfButtonText.textContent = 'Merge PDFs';
            mergePdfButton.disabled = false;
        }
    });

    // --- SPLIT LOGIC (Updated) ---
    const splitPdfInput = document.getElementById('splitPdfInput');
    const splitFileName = document.getElementById('splitFileName');
    const splitRangeInput = document.getElementById('splitRangeInput');
    const splitIndividuallyCheckbox = document.getElementById('splitIndividuallyCheckbox'); // <-- Get the checkbox
    const splitPdfButton = document.getElementById('splitPdfButton');
    const splitPdfLoadingSpinner = document.getElementById('splitPdfLoadingSpinner');
    const splitPdfButtonText = document.getElementById('splitPdfButtonText');
    const splitPdfResult = document.getElementById('splitPdfResult');
    const downloadSplitPdfZip = document.getElementById('downloadSplitPdfZip');
    const splitPdfError = document.getElementById('splitPdfError');
    let splitFile = null;

    const checkSplitButtonState = () => {
        splitPdfButton.disabled = !splitFile || splitRangeInput.value.trim() === '';
    };

    splitPdfInput.addEventListener('change', (event) => {
        splitFile = event.target.files[0];
        splitPdfError.classList.add('hidden');
        if (splitFile) {
            if (splitFile.size > MAX_PDF_SIZE_BYTES) {
                splitPdfError.textContent = 'File is too large.';
                splitPdfError.classList.remove('hidden');
                splitFile = null;
                splitFileName.textContent = 'File too large';
            } else {
                splitFileName.textContent = splitFile.name;
            }
        } else {
            splitFileName.textContent = 'No file chosen';
        }
        checkSplitButtonState();
    });

    splitRangeInput.addEventListener('input', checkSplitButtonState);

    splitPdfButton.addEventListener('click', async () => {
        splitPdfButton.disabled = true;
        splitPdfLoadingSpinner.classList.remove('hidden');
        splitPdfButtonText.textContent = 'Splitting...';
        splitPdfError.classList.add('hidden');
        splitPdfResult.classList.add('hidden');

        try {
            const { PDFDocument } = PDFLib;
            const pdfBytes = await splitFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);

            const pageIndices = parseRangeString(splitRangeInput.value, pdfDoc.getPageCount());

            if (pageIndices.length === 0) {
                throw new Error("No valid pages selected. Check your range and the document's page count.");
            }

            const zip = new JSZip();

            // --- NEW LOGIC: Check the state of the checkbox ---
            if (splitIndividuallyCheckbox.checked) {
                // **Optional Behavior:** Create a separate PDF for each page.
                for (const pageIndex of pageIndices) {
                    const newPdf = await PDFDocument.create();
                    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
                    newPdf.addPage(copiedPage);

                    const newPdfBytes = await newPdf.save();
                    zip.file(`page_${pageIndex + 1}.pdf`, newPdfBytes);
                }
            } else {
                // **Default Behavior:** Create one PDF with all selected pages.
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
                copiedPages.forEach((page) => newPdf.addPage(page));

                const newPdfBytes = await newPdf.save();
                const sanitizedRange = splitRangeInput.value.trim().replace(/,/g, '_').replace(/\s/g, '');
                zip.file(`pages_${sanitizedRange}.pdf`, newPdfBytes);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);

            downloadSplitPdfZip.href = url;
            splitPdfResult.classList.remove('hidden');

        } catch (error) {
            splitPdfError.textContent = `An error occurred: ${error.message}`;
            splitPdfError.classList.remove('hidden');
        } finally {
            splitPdfLoadingSpinner.classList.add('hidden');
            splitPdfButtonText.textContent = 'Split PDF';
            splitPdfButton.disabled = false;
        }
    });
}