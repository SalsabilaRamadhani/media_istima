// FORCE LOAD VOICES
window.speechSynthesis.getVoices();
setTimeout(() => {
    window.speechSynthesis.getVoices();
}, 500);

// =======================
// DATA MATERI
// =======================
const lessons = [
    {
        id: 1,
        title: "Salam",
        arabic: "السَّلَامُ عَلَيْكُمْ",
        translation: "Assalamu'alaikum",
        choices: [
            { id: "a", text: "Selamat pagi", correct: false },
            { id: "b", text: "Assalamu'alaikum", correct: true },
            { id: "c", text: "Terima kasih", correct: false }
        ]
    }
];

// index materi
let currentLessonIndex = 0;
let score = 0;

// =======================
// AMBIL ELEMEN HTML
// =======================
const lessonTitle = document.getElementById("lesson-title");
const arabicText = document.getElementById("arabic-text");
const btnPlay = document.getElementById("btn-play");
const btnRecord = document.getElementById("btn-record");
const srResult = document.getElementById("sr-result");
const choicesContainer = document.getElementById("choices");
const btnCheck = document.getElementById("btn-check");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");

// =======================
// LOAD MATERI KE HALAMAN
// =======================
function loadLesson(i) {
    const lesson = lessons[i];

    lessonTitle.textContent = `Materi ${lesson.id}: ${lesson.title}`;
    arabicText.textContent = lesson.arabic;

    // render pilihan
    choicesContainer.innerHTML = "";
    lesson.choices.forEach(c => {
        const btn = document.createElement("button");
        btn.textContent = `${c.id.toUpperCase()}. ${c.text}`;
        btn.dataset.choiceId = c.id;

        btn.addEventListener("click", () => {
            Array.from(choicesContainer.children).forEach(ch => {
                ch.style.background = "#f1f2f6";
            });
            btn.style.background = "#dcdcff";
            choicesContainer.dataset.selected = c.id;
        });

        choicesContainer.appendChild(btn);
    });
}

loadLesson(currentLessonIndex);

// =======================
// TEXT TO SPEECH (TTS)
// =======================
function speakArabic(text) {
    if (!("speechSynthesis" in window)) {
        alert("Browser tidak mendukung TTS!");
        return;
    }

  function speakArabic(text) {
    const voices = window.speechSynthesis.getVoices();
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ar-SA";

    // coba cari voice Arabic
    const arabVoice = voices.find(v => v.lang.startsWith("ar"));
    if (arabVoice) utter.voice = arabVoice;

    utter.rate = 1;

    window.speechSynthesis.cancel(); // HAPUS antrian suara sebelumnya
    window.speechSynthesis.speak(utter);
    
}
}

btnPlay.addEventListener("click", () => {
    const lesson = lessons[currentLessonIndex];
    speakArabic(lesson.arabic);
});

// =======================
// SPEECH RECOGNITION (SR)
// =======================
window.SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;

if (window.SpeechRecognition) {
    recognition = new window.SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.interimResults = false;

    recognition.onresult = event => {
        const hasil = event.results[0][0].transcript;
        srResult.textContent = hasil;
        autoCheckSR(hasil);
    };

} else {
    btnRecord.disabled = true;
    btnRecord.textContent = "SR Tidak Didukung";
}

btnRecord.addEventListener("click", () => {
    if (!recognition) return;

    btnRecord.textContent = "Merekam...";
    recognition.start();

    setTimeout(() => {
        try { recognition.stop(); } catch (e) {}
        btnRecord.textContent = "🎤 Rekam (SR)";
    }, 5000);
});

// =======================
// CEK KEC0C0KAN SR
// =======================
function autoCheckSR(transcript) {
    const lesson = lessons[currentLessonIndex];
    const correctText = lesson.translation.toLowerCase();

    const normalized = transcript.toLowerCase();

    if (normalized.includes("السلام") || normalized.includes(correctText)) {
        feedback.textContent = "Pelafalan BENAR! +1 skor";
        score++;
        scoreEl.textContent = score;
    } else {
        feedback.textContent = "Pelafalan kurang tepat, coba lagi.";
    }
}

// =======================
// CEK JAWABAN PILIHAN GANDA
// =======================
btnCheck.addEventListener("click", () => {
    const selected = choicesContainer.dataset.selected;
    if (!selected) {
        feedback.textContent = "Pilih jawaban dulu.";
        return;
    }

    const lesson = lessons[currentLessonIndex];
    const chosen = lesson.choices.find(c => c.id === selected);

    if (chosen.correct) {
        feedback.textContent = "Jawaban BENAR! +1 skor";
        score++;
        scoreEl.textContent = score;
    } else {
        feedback.textContent = "Jawaban salah.";
    }
});
