// Authentication Functions
let currentUser = null;

function showLogin() {
    document.getElementById('loginCard').classList.remove('hidden');
    document.getElementById('registerCard').classList.add('hidden');
}

function showRegister() {
    document.getElementById('loginCard').classList.add('hidden');
    document.getElementById('registerCard').classList.remove('hidden');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await AuthAPI.login(email, password);
        
        // Save token and user data
        localStorage.setItem('eduplay_token', response.token);
        localStorage.setItem('eduplay_user', JSON.stringify(response.user));
        
        currentUser = response.user;
        showToast('Login successful! Welcome back!', 'success');
        
        // Show app
        showApp();
    } catch (error) {
        showToast(error.message || 'Login failed', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await AuthAPI.register(username, email, password);
        
        // Save token and user data
        localStorage.setItem('eduplay_token', response.token);
        localStorage.setItem('eduplay_user', JSON.stringify(response.user));
        
        currentUser = response.user;
        showToast('Account created successfully! Welcome to EduPlay!', 'success');
        
        // Show app
        showApp();
    } catch (error) {
        showToast(error.message || 'Registration failed', 'error');
    }
}

function logout() {
    localStorage.removeItem('eduplay_token');
    localStorage.removeItem('eduplay_user');
    currentUser = null;
    
    // Hide app, show auth
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('navLinks').classList.add('hidden');
    
    showToast('Logged out successfully', 'success');
}

function checkAuth() {
    const token = localStorage.getItem('eduplay_token');
    const userData = localStorage.getItem('eduplay_user');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        return true;
    }
    return false;
}

function showApp() {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.getElementById('navLinks').classList.remove('hidden');
    
    // Update UI with user info
    document.getElementById('usernameDisplay').textContent = `👤 ${currentUser.username}`;
    document.getElementById('welcomeName').textContent = currentUser.username;
    
    // Update skill levels display
    updateSkillLevelDisplay();
    
    // Load home section data
    loadHomeData();
}

function updateSkillLevelDisplay() {
    if (currentUser && currentUser.skillLevels) {
        document.getElementById('mathLevel').textContent = `Level: ${currentUser.skillLevels.mathReflex || 1}`;
        document.getElementById('memoryLevel').textContent = `Level: ${currentUser.skillLevels.memoryBoost || 1}`;
        document.getElementById('logicLevel').textContent = `Level: ${currentUser.skillLevels.logicPuzzles || 1}`;
        document.getElementById('wordLevel').textContent = `Level: ${currentUser.skillLevels.wordBuilder || 1}`;
        document.getElementById('patternLevel').textContent = `Level: ${currentUser.skillLevels.patternMatch || 1}`;
        document.getElementById('quizLevel').textContent = `Level: ${currentUser.skillLevels.quickQuiz || 1}`;
        document.getElementById('colorLevel').textContent = `Level: ${currentUser.skillLevels.colorHunt || 1}`;
        document.getElementById('shapeLevel').textContent = `Level: ${currentUser.skillLevels.shapeEscape || 1}`;
    }
}
