import { MAX_VIDEO_SIZE_BYTES, resetToolUI, generateSimulatedTranscription, generateSimulatedSummary } from '../utils.js';

/**
 * A helper function to draw text onto a PDF page with line wrapping, page breaks,
 * and simple markdown-like formatting (headings, bolding, bullet points).
 * @param {PDFDocument} pdfDoc - The pdf-lib document instance.
 * @param {PDFPage} page - The current page to draw on.
 * @param {string} text - The full text content to draw.
 * @param {number} yStart - The starting Y coordinate (from top).
 * @param {PDFFont} font - The default font.
 * @param {PDFFont} boldFont - The font to use for bold text.
 * @param {number} size - The default font size.
 * @param {RGB} color - The text color.
 * @returns {Promise<{page: PDFPage, yPos: number}>} - The last page and Y position.
 */
async function drawWrappedText(pdfDoc, page, text, yStart, font, boldFont, size, color) {
    let currentPage = page;
    let currentY = yStart;
    const margin = 50;
    const maxWidth = currentPage.getWidth() - 2 * margin;
    const defaultLineHeight = size * 1.2;

    const lines = text.split('\n');

    for (const line of lines) {
        // Automatically add a new page if the current position is too close to the bottom
        if (currentY < margin) {
            currentPage = pdfDoc.addPage();
            currentY = currentPage.getHeight() - margin;
        }

        // Handle paragraph breaks (empty lines)
        if (line.trim() === '') {
            currentY -= defaultLineHeight;
            continue;
        }

        // Simple Markdown parsing
        let isHeading = line.startsWith('### ');
        let isBullet = line.startsWith('* ');
        let isRule = line.startsWith('---');

        let textToDraw = line;
        let currentFont = font;
        let currentSize = size;
        let xOffset = 0;

        if (isHeading) {
            textToDraw = line.substring(4);
            currentFont = boldFont;
            currentSize = size * 1.4;
            currentY -= defaultLineHeight * 0.5; // Extra space before heading
        } else if (isRule) {
            currentPage.drawLine({
                start: { x: margin, y: currentY - defaultLineHeight / 2 },
                end: { x: currentPage.getWidth() - margin, y: currentY - defaultLineHeight / 2 },
                thickness: 0.5,
                color,
            });
            currentY -= defaultLineHeight * 1.5;
            continue;
        } else if (isBullet) {
            textToDraw = line.substring(2);
            xOffset = 15;
            currentPage.drawText('•', { x: margin, y: currentY, font, size, color });
        }

        // Word wrapping logic
        const words = textToDraw.split(' ');
        let lineBuffer = '';
        for (const word of words) {
            const testLine = lineBuffer === '' ? word : `${lineBuffer} ${word}`;
            // Simple check for bolding within a line
            const isWordBold = word.startsWith('**') && word.endsWith('**');
            const wordToMeasure = isWordBold ? word.replace(/\*\*/g, '') : word;
            const wordFontToUse = isWordBold ? boldFont : currentFont;

            const width = wordFontToUse.widthOfTextAtSize(testLine, currentSize);

            if (width < maxWidth - xOffset) {
                lineBuffer = testLine;
            } else {
                currentPage.drawText(lineBuffer, { x: margin + xOffset, y: currentY, font: currentFont, size: currentSize, color });
                currentY -= defaultLineHeight;
                lineBuffer = word;
                if (currentY < margin) {
                    currentPage = pdfDoc.addPage();
                    currentY = currentPage.getHeight() - margin;
                }
            }
        }

        // Draw the last line of the paragraph
        currentPage.drawText(lineBuffer, { x: margin + xOffset, y: currentY, font: currentFont, size: currentSize, color });
        currentY -= defaultLineHeight;
    }
    return { page: currentPage, yPos: currentY };
}


/**
 * Initializes the event handlers and logic for the Video to PDF Summary tool.
 */
export function initVideoHandler() {
    // --- Get all necessary DOM elements ---
    const videoToPdfInput = document.getElementById('videoToPdfInput');
    const videoFileName = document.getElementById('videoFileName');
    const videoToPdfButton = document.getElementById('videoToPdfButton');
    const videoToPdfLoadingSpinner = document.getElementById('videoToPdfLoadingSpinner');
    const videoToPdfButtonText = document.getElementById('videoToPdfButtonText');
    const videoToPdfProgress = document.getElementById('videoToPdfProgress');
    const videoToPdfProgressText = document.getElementById('videoToPdfProgressText');
    const videoToPdfProgressBar = document.getElementById('videoToPdfProgressBar');
    const videoToPdfResult = document.getElementById('videoToPdfResult');
    const videoSummaryText = document.getElementById('videoSummaryText');
    const downloadVideoSummaryPdf = document.getElementById('downloadVideoSummaryPdf');
    const videoToPdfError = document.getElementById('videoToPdfError');

    // --- State variable ---
    let selectedVideoFile = null;

    // --- Attach Event Listeners ---

    // Listen for file selection
    videoToPdfInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > MAX_VIDEO_SIZE_BYTES) {
                videoToPdfError.textContent = `Video file is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max size is ${(MAX_VIDEO_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB.`;
                videoToPdfError.classList.remove('hidden');
                videoToPdfButton.disabled = true;
                videoFileName.textContent = 'File too large';
                selectedVideoFile = null;
                return;
            }
            selectedVideoFile = file;
            videoFileName.textContent = file.name;
            videoToPdfButton.disabled = false;
            videoToPdfResult.classList.add('hidden');
            videoToPdfProgress.classList.add('hidden');
            videoToPdfError.classList.add('hidden');
        } else {
            resetToolUI('videoToPdf');
            selectedVideoFile = null;
        }
    });

    // Listen for the summarize button click
    videoToPdfButton.addEventListener('click', async () => {
        if (!selectedVideoFile) return;

        // --- Set UI to loading/progress state ---
        videoToPdfButton.disabled = true;
        videoToPdfLoadingSpinner.classList.remove('hidden');
        videoToPdfButtonText.textContent = 'Processing...';
        videoToPdfResult.classList.add('hidden');
        videoToPdfError.classList.add('hidden');
        videoToPdfProgress.classList.remove('hidden');
        videoToPdfProgressBar.style.width = '0%';

        try {
            // --- Simulate multi-step AI pipeline ---
            const steps = [
                { text: 'Extracting audio from video...', duration: 1500, progress: 25 },
                { text: 'Transcribing audio to text (STT)...', duration: 3000, progress: 60 },
                { text: 'Summarizing content with AI...', duration: 2500, progress: 95 },
                { text: 'Generating PDF document...', duration: 1000, progress: 100 }
            ];

            for (const step of steps) {
                videoToPdfProgressText.textContent = step.text;
                videoToPdfProgressBar.style.width = `${step.progress}%`;
                await new Promise(resolve => setTimeout(resolve, step.duration));
            }

            // --- Generate simulated content ---
            const transcription = generateSimulatedTranscription(selectedVideoFile.name);
            const summary = generateSimulatedSummary(selectedVideoFile.name, transcription);

            // --- Generate PDF using pdf-lib ---
            const { PDFDocument, rgb, StandardFonts } = PDFLib;
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            let page = pdfDoc.addPage();
            let yPos = page.getHeight() - 50;

            // Use the helper to draw the formatted summary
            await drawWrappedText(pdfDoc, page, summary, yPos, font, boldFont, 10, rgb(0.1, 0.1, 0.1));

            const pdfBytes = await pdfDoc.save();
            const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(pdfBlob);

            // --- Update UI with final result ---
            videoSummaryText.value = summary;
            downloadVideoSummaryPdf.href = url;
            downloadVideoSummaryPdf.download = `summary_${selectedVideoFile.name.split('.')[0]}.pdf`;
            videoToPdfResult.classList.remove('hidden');
            videoToPdfProgress.classList.add('hidden');

        } catch (error) {
            videoToPdfError.textContent = `An error occurred: ${error.message}. Please try again.`;
            videoToPdfError.classList.remove('hidden');
            videoToPdfProgress.classList.add('hidden');
            console.error('Video to PDF Summary error:', error);
        } finally {
            videoToPdfLoadingSpinner.classList.add('hidden');
            videoToPdfButton.disabled = false;
            videoToPdfButtonText.textContent = 'Summarize Again';
        }
    });
}