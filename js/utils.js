// File size constants (in bytes) for validation
export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per image
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Resets the UI for a given tool section after a process or on file clear.
 * @param {string} toolId - The prefix for the tool's element IDs (e.g., 'compressPdf').
 */
export function resetToolUI(toolId) {
    const inputElement = document.getElementById(`${toolId}Input`);
    if (inputElement) {
        inputElement.value = '';
    }

    const buttonTextMap = {
        'compressPdf': 'Compress PDF',
        'imageToPdf': 'Convert Images to PDF',
        'videoToPdf': 'Summarize Video'
    };

    document.getElementById(`${toolId}FileName`).textContent = `No ${toolId.includes('Image') ? 'files' : 'file'} chosen`;
    document.getElementById(`${toolId}Button`).disabled = true;
    document.getElementById(`${toolId}Result`).classList.add('hidden');
    document.getElementById(`${toolId}Error`).classList.add('hidden');
    document.getElementById(`${toolId}Error`).textContent = '';
    document.getElementById(`${toolId}LoadingSpinner`).classList.add('hidden');
    document.getElementById(`${toolId}ButtonText`).textContent = buttonTextMap[toolId] || 'Process';

    // Specific reset logic for the video tool
    if (toolId === 'videoToPdf') {
        document.getElementById('videoToPdfProgress').classList.add('hidden');
        document.getElementById('videoToPdfProgressBar').style.width = '0%';
        document.getElementById('videoSummaryText').value = '';
    }
}

/**
 * Generates a simulated AI-generated transcription for a video.
 * @param {string} videoName - The name of the video file.
 * @returns {string} - A formatted transcription string.
 */
export function generateSimulatedTranscription(videoName) {
    return `
[00:00:00] Speaker 1: Good morning, everyone. Welcome to our quarterly business review. Today, we're going to dive deep into our performance over the last three months, highlighting both our successes and areas for improvement. Our focus remains on sustainable growth and market expansion.

[00:00:45] Speaker 2: Looking at the sales figures for Q2, we've seen a remarkable 15% increase in revenue compared to the previous quarter. This growth is primarily driven by strong performance in the EMEA region, particularly our new product line launched in April. Customer acquisition rates have also exceeded our projections by 8%.

[00:01:30] Speaker 1: That's excellent news. What about the challenges we faced? Were there any significant roadblocks in production or supply chain management that impacted our delivery schedules or costs?

[00:02:05] Speaker 3: Indeed, we encountered some unexpected delays in raw material procurement from our Asian suppliers due to recent geopolitical events. This led to a temporary slowdown in production for about two weeks. However, our team quickly diversified our supplier base and implemented a just-in-time inventory system to mitigate future risks. We've also optimized our logistics, reducing shipping costs by 5%.

[00:02:50] Speaker 2: From a marketing perspective, our digital campaigns have been incredibly effective. The recent social media outreach program generated a 25% increase in web traffic, converting 10% of new visitors into qualified leads. Our content marketing strategy, focusing on long-form articles and webinars, has also significantly boosted our brand authority.

[00:03:35] Speaker 1: Impressive. Let's discuss the financial outlook. What are our projections for Q3, and what strategic investments are planned to support continued growth?

[00:04:10] Speaker 4: For Q3, we project a conservative 10% revenue growth, accounting for potential market fluctuations. We plan strategic investments in R&D, particularly in developing AI-driven solutions for customer service, and expanding our presence in the APAC market. Our liquidity remains strong, and we're exploring opportunities for strategic partnerships to accelerate our innovation pipeline.

[00:04:55] Speaker 1: Thank you, team. Your hard work and dedication are evident in these results. We're on a solid trajectory. Let's ensure we maintain this momentum and continue to innovate.

[00:05:15] Speaker 2: Just to add, our customer feedback scores have also reached an all-time high, indicating strong product satisfaction and loyalty. This is a direct result of our enhanced customer support initiatives.

[00:05:40] Speaker 1: Fantastic. Any final questions or points before we conclude?

[00:05:55] Speaker 3: One quick point: we've identified a new potential market segment in Latin America that aligns perfectly with our product roadmap. We'll be conducting a feasibility study next quarter.

[00:06:10] Speaker 1: Excellent. Let's factor that into our long-term strategy. Thank you all for your valuable contributions. This concludes our Q2 review.
        `;
}


/**
 * Generates a simulated structured summary based on a transcription.
 * @param {string} videoName - The name of the video file.
 * @param {string} transcriptionContent - The full transcription text.
 * @returns {string} - A formatted, structured summary string.
 */
export function generateSimulatedSummary(videoName, transcriptionContent) {
    return `
**Comprehensive AI Summary: Q2 Business Review of "${videoName}"**

This AI-generated summary provides a structured overview of the recent quarterly business review, highlighting key performance indicators, challenges, strategic initiatives, and future outlook. The full transcription served as the basis for this detailed analysis.

---

### 1. Executive Summary
The company demonstrated strong performance in Q2, with significant revenue growth primarily driven by EMEA and new product lines. Despite supply chain challenges, operational efficiencies were achieved. Marketing efforts proved highly effective, leading to increased web traffic and qualified leads. Strategic investments in R&D and APAC expansion are planned for Q3.

---

### 2. Key Performance Indicators (KPIs)
* **Revenue Growth:** Achieved a **15% increase** in revenue compared to Q1. (00:00:45)
* **Customer Acquisition:** Exceeded projections by **8%**. (00:01:00)
* **Web Traffic:** Digital campaigns generated a **25% increase** in web traffic. (00:02:50)
* **Lead Conversion:** Converted **10%** of new visitors into qualified leads. (00:03:05)
* **Shipping Costs:** Optimized logistics reduced shipping costs by **5%**. (00:02:30)
* **Customer Satisfaction:** Feedback scores reached an **all-time high**. (00:05:15)

---

### 3. Challenges and Solutions
* **Challenge:** Unexpected delays in raw material procurement from Asian suppliers due to recent geopolitical events, causing a 2-week production slowdown. (00:02:05)
* **Solution:** Diversified supplier base and implemented a just-in-time inventory system. (00:02:20)

---

### 4. Strategic Initiatives & Future Outlook
* **Q3 Projection:** Conservative 10% revenue growth. (00:04:10)
* **R&D Investment:** Focus on developing AI-driven solutions for customer service. (00:04:25)
* **Market Expansion:** Plans to expand presence in the APAC market. (00:04:35)
* **Partnerships:** Exploring strategic partnerships to accelerate innovation. (00:04:45)
* **New Market Segment:** Identified potential in Latin America; feasibility study planned for next quarter. (00:05:55)

---

### 5. Conclusion
Q2 showcased robust growth and effective mitigation of challenges. The company is on a solid trajectory, emphasizing innovation, market expansion, and customer satisfaction. The planned strategic investments and exploration of new markets position the company for continued success.
        `;
}