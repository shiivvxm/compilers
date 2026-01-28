document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       AUTHENTICATION LOGIC
       ========================================= */
    const authView = document.getElementById('auth-view');
    const appView = document.getElementById('app-view');
    const roleSelection = document.getElementById('role-selection');
    const loginFormWrapper = document.getElementById('login-form-wrapper');
    const loginForm = document.getElementById('login-form');
    const loginTitle = document.getElementById('login-title');
    const usernameInput = document.getElementById('username');
    const btnOwner = document.getElementById('btn-owner');
    const btnMember = document.getElementById('btn-member');
    const btnBack = document.getElementById('btn-back');
    const btnLogout = document.getElementById('logout-btn');
    const welcomeBanner = document.getElementById('welcome-message');

    let targetRole = '';

    // Show Login Form
    function showLoginForm(role) {
        targetRole = role;
        loginTitle.textContent = `${role} Login`;
        roleSelection.classList.add('hidden');
        loginFormWrapper.classList.remove('hidden');
        usernameInput.focus();
    }

    // Go Back to Role Selection
    function showRoleSelection() {
        targetRole = '';
        loginFormWrapper.classList.add('hidden');
        roleSelection.classList.remove('hidden');
        loginForm.reset();
    }

    // Handle Login Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        
        if (username) {
            // "Login" success
            completeLogin(username, targetRole);
        }
    });

    // Complete Login & Show Dashboard
    function completeLogin(username, role) {
        authView.classList.add('hidden');
        appView.classList.remove('hidden');
        
        // Set Welcome Message
        welcomeBanner.innerHTML = `<h1>Welcome ${username} (${role})!</h1>`;
    }

    // Handle Logout
    btnLogout.addEventListener('click', () => {
        appView.classList.add('hidden');
        authView.classList.remove('hidden');
        showRoleSelection();
    });

    // Button Listeners
    btnOwner.addEventListener('click', () => showLoginForm('Owner'));
    btnMember.addEventListener('click', () => showLoginForm('Member'));
    btnBack.addEventListener('click', showRoleSelection);


    /* =========================================
       EXISTING APP LOGIC
       ========================================= */
    
    // --- Navigation & Sidebar Logic ---
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('.sidebar nav a');
    const backBtns = document.querySelectorAll('.back-btn');
    const views = document.querySelectorAll('.view');
    const cards = document.querySelectorAll('.card');

    function toggleSidebar() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    function switchPage(pageId) {
        // Only switch within the app view
        const internalViews = appView.querySelectorAll('.view');
        internalViews.forEach(view => view.classList.remove('active'));
        
        // Handle "home", "members", "progress", "practice" mapping
        let targetId = 'home-view'; // default
        if (pageId === 'progress') targetId = 'progress-view';
        if (pageId === 'practice') targetId = 'practice-view';
        
        // Members is part of home view in this layout, so scroll to it
        if (pageId === 'members') {
            document.getElementById('home-view').classList.add('active');
            document.querySelector('.members-section').scrollIntoView({ behavior: 'smooth' });
        } else {
            const targetView = document.getElementById(targetId);
            if (targetView) targetView.classList.add('active');
            else document.getElementById('home-view').classList.add('active');
        }

        // Close sidebar if open
        if (sidebar.classList.contains('open')) toggleSidebar();
    }

    menuBtn.addEventListener('click', toggleSidebar);
    closeBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(e.target.dataset.page);
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', () => switchPage('home'));
    });

    // Card Clicks
    cards.forEach(card => {
        card.addEventListener('click', function() {
            if (this.id === 'progress-card') switchPage('progress');
            if (this.id === 'practice-card') switchPage('practice');
        });
    });


    // --- Members Logic (LocalStorage) ---
    const membersList = document.getElementById('members-list');
    const addMemberBtn = document.getElementById('add-member-btn');

    function loadMembers() {
        const members = JSON.parse(localStorage.getItem('compilers_members')) || [];
        membersList.innerHTML = '';
        members.forEach((member, index) => {
            const li = document.createElement('li');
            li.className = 'member-item';
            li.innerHTML = `
                <span>${member}</span>
                <button class="delete-member-btn" data-index="${index}">&times;</button>
            `;
            membersList.appendChild(li);
        });

        // Add delete listeners
        document.querySelectorAll('.delete-member-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                deleteMember(e.target.dataset.index);
            });
        });
    }

    function addMember() {
        const name = prompt("Enter member name:");
        if (name && name.trim()) {
            const members = JSON.parse(localStorage.getItem('compilers_members')) || [];
            members.push(name.trim());
            localStorage.setItem('compilers_members', JSON.stringify(members));
            loadMembers();
        }
    }

    function deleteMember(index) {
        const members = JSON.parse(localStorage.getItem('compilers_members')) || [];
        members.splice(index, 1);
        localStorage.setItem('compilers_members', JSON.stringify(members));
        loadMembers();
    }

    addMemberBtn.addEventListener('click', addMember);
    loadMembers();


    // --- Progress Todo Logic ---
    const todoList = document.getElementById('todo-list');
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const activeTasksCount = document.getElementById('active-tasks-count');

    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('compilers_todos')) || [];
        if (!todoList) return; // Guard clause
        
        todoList.innerHTML = '';
        let activeCount = 0;

        todos.forEach((todo, index) => {
            if (!todo.completed) activeCount++;
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''} data-index="${index}">
                <span>${todo.text}</span>
            `;
            todoList.appendChild(li);
        });

        if (activeTasksCount) activeTasksCount.textContent = activeCount;

        // Add checkbox listeners
        document.querySelectorAll('.todo-item input[type="checkbox"]').forEach(box => {
            box.addEventListener('change', (e) => {
                toggleTodo(e.target.dataset.index);
            });
        });
    }

    function addTodo() {
        const text = todoInput.value.trim();
        if (text) {
            const todos = JSON.parse(localStorage.getItem('compilers_todos')) || [];
            todos.push({ text, completed: false });
            localStorage.setItem('compilers_todos', JSON.stringify(todos));
            todoInput.value = '';
            loadTodos();
        }
    }

    function toggleTodo(index) {
        const todos = JSON.parse(localStorage.getItem('compilers_todos')) || [];
        todos[index].completed = !todos[index].completed;
        localStorage.setItem('compilers_todos', JSON.stringify(todos));
        loadTodos();
    }

    if (addTodoBtn) addTodoBtn.addEventListener('click', addTodo);
    if (todoInput) {
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
    }
    loadTodos();


    // --- Practice Timer Logic ---
    let timerInterval;
    let seconds = 0;
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const startBtn = document.getElementById('start-timer-btn');
    const stopBtn = document.getElementById('stop-timer-btn');
    const resetBtn = document.getElementById('reset-timer-btn');
    const lastSessionEl = document.getElementById('last-session-time');

    function updateTimerDisplay() {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        minutesEl.textContent = mins.toString().padStart(2, '0');
        secondsEl.textContent = secs.toString().padStart(2, '0');
    }

    function startTimer() {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
        startBtn.disabled = true;
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        startBtn.disabled = false;
        
        // Save last session
        if (seconds > 0) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
            localStorage.setItem('compilers_last_session', timeStr);
            loadLastSession();
        }
    }

    function resetTimer() {
        stopTimer();
        seconds = 0;
        updateTimerDisplay();
    }

    function loadLastSession() {
        const lastSession = localStorage.getItem('compilers_last_session');
        if (lastSession && lastSessionEl) {
            lastSessionEl.textContent = lastSession;
        }
    }

    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (stopBtn) stopBtn.addEventListener('click', stopTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    loadLastSession();
});
