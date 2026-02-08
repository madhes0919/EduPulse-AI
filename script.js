import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0';

let aiPoints = [];

document.getElementById('pdfInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('loaderArea').style.display = "block";
    document.getElementById('resultSection').style.display = "none";
    
    if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (ev) => { processDeepLearning(ev.target.result); };
        reader.readAsText(file);
    } else if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(s => s.str).join(' ');
            }
            processDeepLearning(fullText);
        };
        reader.readAsArrayBuffer(file);
    } else if (file.type.startsWith("image/")) {
        Tesseract.recognize(file, 'eng').then(({ data: { text } }) => { processDeepLearning(text); });
    }
});

async function processDeepLearning(text) {
    // Advanced sentence extraction for detailed learning
    const cleanedText = text.replace(/\s+/g, ' ');
    const rawSentences = cleanedText.split(/[.!?]+/).filter(s => s.trim().length > 35);
    
    // Select top 12-15 meaningful sentences
    aiPoints = rawSentences.slice(0, 15);

    const container = document.getElementById('summaryContent');
    container.innerHTML = "";
    
    aiPoints.forEach((point, index) => {
        container.innerHTML += `
            <p class="animate__animated animate__fadeInLeft" style="animation-delay: ${index * 0.1}s">
                <span style="color: var(--primary-purple);">✦</span> ${point.trim()}.
            </p>`;
    });

    document.getElementById('loaderArea').style.display = "none";
    document.getElementById('resultSection').style.display = "block";
}

document.getElementById('startQuizBtn').onclick = () => {
    document.getElementById('summaryArea').style.display = "none";
    document.getElementById('quizArea').style.display = "block";
    generateMasterQuiz(aiPoints);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function generateMasterQuiz(points) {
    const container = document.getElementById('quizContainer');
    container.innerHTML = "";
    for (let i = 0; i < 10; i++) {
        let sentence = points[i % points.length];
        let words = sentence.split(' ').filter(w => w.length > 7);
        let target = words[Math.floor(Math.random() * words.length)].replace(/[^\w]/g, '');
        let display = sentence.replace(target, "__________");

        container.innerHTML += `
            <div class="quiz-item">
                <p><strong>Concept Q${i+1}:</strong> ${display}</p>
                <input type="text" class="quiz-ans" data-correct="${target}" placeholder="Enter key term...">
                <p class="feedback" style="display:none; margin-top:10px;"></p>
            </div>`;
    }
}

document.getElementById('submitQuiz').onclick = () => {
    let score = 0;
    const items = document.querySelectorAll('.quiz-item');
    items.forEach(item => {
        const input = item.querySelector('.quiz-ans');
        const feedback = item.querySelector('.feedback');
        const correct = input.getAttribute('data-correct');
        feedback.style.display = "block";
        if (input.value.toLowerCase().trim() === correct.toLowerCase()) {
            score++;
            input.style.borderColor = "#2ecc71";
            feedback.innerHTML = "✅ Correct Mastery!";
            feedback.style.color = "#2ecc71";
        } else {
            input.style.borderColor = "#e74c3c";
            feedback.innerHTML = `❌ Key was: ${correct}`;
            feedback.style.color = "#e74c3c";
        }
    });
    document.getElementById('scoreText').innerText = `Your Mastery Score: ${score} / 10`;
    document.getElementById('summaryArea').style.display = "block";
};