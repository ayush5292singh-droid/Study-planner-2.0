// State & Onboarding Logic
let currentStep = 0;
const totalSteps = 3;

let userData = JSON.parse(localStorage.getItem('ana_user')) || { name: '', grade: '', age: '' };
let quizzes = JSON.parse(localStorage.getItem('ana_quizzes')) || [];
let tasks = JSON.parse(localStorage.getItem('ana_tasks')) || [{ text: 'Submit Math Project', done: true }];
let notes = JSON.parse(localStorage.getItem('ana_notes')) || [];

let currentQuizIndex = 0;
let userScore = 0;

window.onload = function() {
    if (userData.name) {
        document.getElementById('onboarding-screen').classList.remove('active');
        document.getElementById('main-app').classList.add('active');
        loadUserProfile();
    }
    renderTasks();
    renderNotes();
    initQuizPlay();
};

function nextOnboardingStep() {
    if (currentStep === 0) {
        const name = document.getElementById('input-name').value.trim();
        const grade = document.getElementById('input-class').value.trim();
        const age = document.getElementById('input-age').value.trim();

        if (!name || !grade || !age) {
            alert('Please fill in all details to continue.');
            return;
        }
        userData = { name, grade, age };
        localStorage.setItem('ana_user', JSON.stringify(userData));
    }

    currentStep++;
    if (currentStep < totalSteps) {
        document.querySelectorAll('.onboarding-step').forEach((el, idx) => {
            el.classList.toggle('active', idx === currentStep);
        });
        document.getElementById('progress-fill').style.width = `${((currentStep + 1) / totalSteps) * 100}%`;
        if (currentStep === 2) {
            document.getElementById('next-btn').innerText = "Launch App";
        }
    } else {
        document.getElementById('onboarding-screen').classList.remove('active');
        document.getElementById('main-app').classList.add('active');
        loadUserProfile();
    }
}

function loadUserProfile() {
    document.getElementById('display-username').innerText = userData.name;
    document.getElementById('profile-name-val').innerText = userData.name;
    document.getElementById('profile-class-val').innerText = userData.grade;
    document.getElementById('profile-age-val').innerText = userData.age;
}

// Page Navigation Controller
function switchPage(pageId, btnElement) {
    document.querySelectorAll('.app-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));

    document.getElementById(`page-${pageId}`).classList.add('active');
    btnElement.classList.add('active');
}

// Task Manager Logic
function addTask() {
    const input = document.getElementById('new-task-input');
    if (!input.value.trim()) return;
    tasks.push({ text: input.value.trim(), done: false });
    localStorage.setItem('ana_tasks', JSON.stringify(tasks));
    input.value = '';
    renderTasks();
}

function renderTasks() {
    const container = document.getElementById('task-container');
    container.innerHTML = '';
    tasks.forEach((task, idx) => {
        container.innerHTML += `
            <div class="task-item">
                <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${idx})">
                <span style="${task.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.text}</span>
            </div>
        `;
    });
}

function toggleTask(idx) {
    tasks[idx].done = !tasks[idx].done;
    localStorage.setItem('ana_tasks', JSON.stringify(tasks));
    renderTasks();
}

// Quiz Hub Logic
function switchQuizTab(tab) {
    document.querySelectorAll('.quiz-sub-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.quiz-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));

    if (tab === 'create') {
        document.getElementById('quiz-create-section').classList.add('active');
        event.target.classList.add('active');
    } else {
        document.getElementById('quiz-play-section').classList.add('active');
        event.target.classList.add('active');
        initQuizPlay();
    }
}

function saveQuizQuestion() {
    const question = document.getElementById('quiz-question').value.trim();
    const opt0 = document.getElementById('opt-1').value.trim();
    const opt1 = document.getElementById('opt-2').value.trim();
    const opt2 = document.getElementById('opt-3').value.trim();
    const correct = parseInt(document.getElementById('correct-opt').value);

    if (!question || !opt0 || !opt1 || !opt2) {
        alert('Please fill out all question fields.');
        return;
    }

    quizzes.push({ question, options: [opt0, opt1, opt2], correct });
    localStorage.setItem('ana_quizzes', JSON.stringify(quizzes));
    alert('Quiz question saved successfully!');
    document.getElementById('quiz-question').value = '';
    document.getElementById('opt-1').value = '';
    document.getElementById('opt-2').value = '';
    document.getElementById('opt-3').value = '';
}

function initQuizPlay() {
    const qText = document.getElementById('play-q-text');
    const optContainer = document.getElementById('play-options');
    const submitBtn = document.getElementById('submit-ans-btn');

    if (quizzes.length === 0) {
        qText.innerText = "No custom quizzes found. Create one in the Create tab!";
        optContainer.innerHTML = '';
        submitBtn.style.display = 'none';
        return;
    }

    const currentQ = quizzes[currentQuizIndex];
    qText.innerText = `Q${currentQuizIndex + 1}: ${currentQ.question}`;
    optContainer.innerHTML = '';
    currentQ.options.forEach((opt, idx) => {
        optContainer.innerHTML += `
            <label style="display:flex; align-items:center; gap:8px; margin-top:8px; font-size:13px; cursor:pointer;">
                <input type="radio" name="quiz-opt" value="${idx}"> ${opt}
            </label>
        `;
    });
    submitBtn.style.display = 'block';
}

function submitQuizAnswer() {
    const selected = document.querySelector('input[name="quiz-opt"]:checked');
    if (!selected) {
        alert('Please select an option!');
        return;
    }
    const chosenAnswer = parseInt(selected.value);
    if (chosenAnswer === quizzes[currentQuizIndex].correct) {
        userScore += 10;
        alert('Correct Answer!');
    } else {
        alert('Incorrect Answer.');
    }

    document.getElementById('current-score').innerText = userScore;
    currentQuizIndex = (currentQuizIndex + 1) % quizzes.length;
    initQuizPlay();
}

// Notes & Link Paster Logic
function saveNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const link = document.getElementById('note-link').value.trim();

    if (!title && !content) {
        alert('Please provide a note title or content.');
        return;
    }

    notes.push({ title: title || 'Untitled Note', content, link });
    localStorage.setItem('ana_notes', JSON.stringify(notes));
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    document.getElementById('note-link').value = '';
    renderNotes();
}

function renderNotes() {
    const container = document.getElementById('notes-list-container');
    container.innerHTML = '';
    notes.forEach(note => {
        container.innerHTML += `
            <div class="card glass-card">
                <h4 style="font-size:14px; font-weight:600;">${note.title}</h4>
                <p style="font-size:12px; color:var(--text-muted);">${note.content}</p>
                ${note.link ? `<a href="${note.link}" target="_blank" style="font-size:11px; color:#38bdf8; text-decoration:none;"><i class="fa-solid fa-link"></i> ${note.link}</a>` : ''}
            </div>
        `;
    });
}

function resetAppData() {
    if (confirm('Are you sure you want to reset profile and data?')) {
        localStorage.clear();
        location.reload();
    }
}
