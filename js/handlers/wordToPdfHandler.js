import { MAX_PDF_SIZE_BYTES } from '../utils.js';

/**
 * Extracts paragraphs of text from the XML content of a .docx file.
 * @param {string} xmlContent - The string content of word/document.xml.
 * @returns {string[]} An array of paragraph strings.
 */
function extractTextFromDocxXml(xmlContent) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    const paragraphs = xmlDoc.getElementsByTagName("w:p");
    const extractedText = [];

    for (let i = 0; i < paragraphs.length; i++) {
        const textNodes = paragraphs[i].getElementsByTagName("w:t");
        let paragraphText = '';
        for (let j = 0; j < textNodes.length; j++) {
            paragraphText += textNodes[j].textContent;
        }
        if (paragraphText.trim() !== '') {
            extractedText.push(paragraphText);
        }
    }
    return extractedText;
}

export function initWordToPdfHandler() {
    // --- Get DOM elements ---
    const wordToPdfInput = document.getElementById('wordToPdfInput');
    const wordToPdfFileName = document.getElementById('wordToPdfFileName');
    const wordToPdfButton = document.getElementById('wordToPdfButton');
    const wordToPdfLoadingSpinner = document.getElementById('wordToPdfLoadingSpinner');
    const wordToPdfButtonText = document.getElementById('wordToPdfButtonText');
    const wordToPdfResult = document.getElementById('wordToPdfResult');
    const downloadWordToPdf = document.getElementById('downloadWordToPdf');
    const wordToPdfError = document.getElementById('wordToPdfError');
    let selectedFile = null;

    // --- Event Listeners ---
    wordToPdfInput.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];
        wordToPdfError.classList.add('hidden');
        if (selectedFile) {
            if (selectedFile.size > MAX_PDF_SIZE_BYTES) {
                wordToPdfError.textContent = 'File is too large.';
                wordToPdfError.classList.remove('hidden');
                selectedFile = null;
                wordToPdfFileName.textContent = 'File too large';
                wordToPdfButton.disabled = true;
            } else {
                wordToPdfFileName.textContent = selectedFile.name;
                wordToPdfButton.disabled = false;
            }
        } else {
            wordToPdfFileName.textContent = 'No file chosen';
            wordToPdfButton.disabled = true;
        }
    });

    wordToPdfButton.addEventListener('click', async () => {
        if (!selectedFile) return;

        wordToPdfButton.disabled = true;
        wordToPdfLoadingSpinner.classList.remove('hidden');
        wordToPdfButtonText.textContent = 'Converting...';
        wordToPdfResult.classList.add('hidden');
        wordToPdfError.classList.add('hidden');

        try {
            // Step 1: Unzip the .docx file and get the XML content
            const fileBytes = await selectedFile.arrayBuffer();
            const zip = await JSZip.loadAsync(fileBytes);
            const contentXml = await zip.file("word/document.xml").async("string");

            // Step 2: Extract text from the XML
            const paragraphs = extractTextFromDocxXml(contentXml);
            if (paragraphs.length === 0) {
                throw new Error("Could not find any text content in the document.");
            }

            // Step 3: Create a new PDF and add the text
            const { PDFDocument, rgb, StandardFonts } = PDFLib;
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            let page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const margin = 50;
            const fontSize = 11;
            const lineHeight = fontSize * 1.2;
            let y = height - margin;

            for (const para of paragraphs) {
                // This is a simplified text wrapping logic
                const words = para.split(' ');
                let line = '';
                for (const word of words) {
                    const testLine = line + word + ' ';
                    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
                    if (textWidth > width - 2 * margin) {
                        page.drawText(line, { x: margin, y, font, size: fontSize, color: rgb(0, 0, 0) });
                        y -= lineHeight;
                        if (y < margin) {
                            page = pdfDoc.addPage();
                            y = height - margin;
                        }
                        line = word + ' ';
                    } else {
                        line = testLine;
                    }
                }
                page.drawText(line, { x: margin, y, font, size: fontSize, color: rgb(0, 0, 0) });
                y -= (lineHeight * 1.5); // Add extra space for paragraph break
                if (y < margin) {
                    page = pdfDoc.addPage();
                    y = height - margin;
                }
            }

            // Step 4: Save the PDF and create a download link
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            downloadWordToPdf.href = url;
            downloadWordToPdf.download = `${selectedFile.name.replace(/\.docx$/, '')}.pdf`;
            wordToPdfResult.classList.remove('hidden');

        } catch (error) {
            wordToPdfError.textContent = `Conversion failed: ${error.message}`;
            wordToPdfError.classList.remove('hidden');
            console.error("Word to PDF error:", error);
        } finally {
            wordToPdfLoadingSpinner.classList.add('hidden');
            wordToPdfButtonText.textContent = 'Convert to PDF';
            wordToPdfButton.disabled = false;
        }
    });
}