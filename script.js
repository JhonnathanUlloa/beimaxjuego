/* ==============================================
   BEIMAX - SCRIPT PRINCIPAL
   Juego educativo de aprendizaje de idiomas
============================================== */

// ========== ESTADO DEL JUEGO ==========
const gameState = {
    user: null,
    token: null,
    selectedGender: null,
    selectedRobotType: 'classic',
    robotType: 'classic',
    languageDifficulty: 'medium',
    nativeLanguage: null,
    learningLanguage: null,
    currentCategory: null,
    coins: 0,
    level: 1,
    experience: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalGames: 0,
    totalCorrect: 0,
    totalWrong: 0,
    charName: 'BeiBot',
    // Image mode state
    imgWords: [],
    imgIndex: 0,
    imgScore: 0,
    imgLives: 3,
    imgCoins: 0,
    // Timer state
    timerInterval: null,
    timerSeconds: 20,
    timerMax: 20,
    questionStartTime: null,
    // Study mode state
    studyWords: [],
    studyIndex: 0,
    // AI coaching state
    imgMistakes: [],
    cameraAttempts: 0,
    cameraCorrect: 0,
    cameraMistakes: [],
    // Camera mode
    cameraStream: null,
    mode1Score: 0,
    requestedObj: null,
    // Shop preview state
    shopPreview: null, // {type, value, price}
    shopPreviousCustomization: null,
    // Customization
    customization: {
        bodyColor: '#E74856',
        eyeColor: '#E74856',
        hat: 'none',
        glasses: 'none',
        bowtie: 'none',
        earring: 'none',
        shoes: 'none',
        outfit: 'none'
    },
    // Inventory system
    inventory: {
        outfits: ['none'],
        hats: ['none'],
        glasses: ['none'],
        accessories: ['none'],
        earrings: ['none'],
        shoes: ['none'],
        bodyColors: ['#E74856'],
        eyeColors: ['#E74856']
    },
    // Battle system
    battleInventory: { weapons: [], shields: [], modules: [] },
    battleEquipment: { weapon: null, shield: null, module: null },
    selectedBattleMoves: [],
    battleStats: { wins: 0, losses: 0, elo: 1000 }
};

const langNames = {
    es: 'Español', en: 'English', fr: 'Français'
};

const DIFFICULTY_LABELS = {
    easy: 'Fácil',
    medium: 'Media',
    hard: 'Difícil'
};

const DIFFICULTY_REWARDS = {
    easy: {
        imageBaseCoins: 5,
        timeBonusFast: 5,
        timeBonusMid: 3,
        timeBonusSlow: 2,
        xpPerPoint: 20,
        cameraCoins: 5,
        cameraXp: 20
    },
    medium: {
        imageBaseCoins: 8,
        timeBonusFast: 7,
        timeBonusMid: 5,
        timeBonusSlow: 3,
        xpPerPoint: 30,
        cameraCoins: 8,
        cameraXp: 30
    },
    hard: {
        imageBaseCoins: 12,
        timeBonusFast: 10,
        timeBonusMid: 7,
        timeBonusSlow: 5,
        xpPerPoint: 45,
        cameraCoins: 12,
        cameraXp: 45
    }
};

const onlineEnglishState = {
    ws: null,
    manualClose: false,
    connected: false,
    reconnectTimer: null,
    reconnectAttempts: 0,
    reconnectUntil: 0,
    keepAliveTimer: null,
    searching: false,
    categoryMode: 'roulette',
    fixedCategory: 'kitchen',
    nativeLanguage: 'es',
    learningLanguage: 'en',
    matchId: null,
    playerIndex: 0,
    opponentName: 'Rival',
    totalRounds: 0,
    currentRound: 0,
    scores: [0, 0],
    rouletteRotation: 0,
    deadline: 0,
    timerInterval: null,
    rouletteInterval: null,
    submittedRound: null,
    matchFinished: false
};

function getOutfitInfo(value) {
    if (typeof getOutfitData === 'function') return getOutfitData(value);
    return { bodyColor: '#E74856', hat: 'none', glasses: 'none', bowtie: 'none' };
}

// ========== AUTH FUNCTIONS ==========

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

const ROBOT_GENDER_MAP = {
    male: ['classic', 'athletic', 'tank'],
    female: ['classic', 'slim', 'cute'],
    other: ['classic', 'athletic', 'slim', 'tank', 'cute']
};

function selectGender(gender) {
    gameState.selectedGender = gender;
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.gender-btn[data-gender="${gender}"]`).classList.add('selected');
    filterRobotTypesByGender(gender);
}

function filterRobotTypesByGender(gender) {
    const allowed = ROBOT_GENDER_MAP[gender] || ROBOT_GENDER_MAP.other;
    const btns = document.querySelectorAll('.register-robot-selector .robot-type-btn');
    let firstVisible = null;
    btns.forEach(btn => {
        const type = btn.getAttribute('data-robot');
        if (allowed.includes(type)) {
            btn.style.display = '';
            if (!firstVisible) firstVisible = type;
        } else {
            btn.style.display = 'none';
            btn.classList.remove('selected');
        }
    });
    // If current selection is hidden, select first visible
    if (!allowed.includes(gameState.selectedRobotType) && firstVisible) {
        selectRobotType(firstVisible);
    }
}

function selectRobotType(type) {
    gameState.selectedRobotType = type;
    document.querySelectorAll('.register-robot-selector .robot-type-btn').forEach(b => b.classList.remove('selected'));
    const btn = document.querySelector(`.register-robot-selector .robot-type-btn[data-robot="${type}"]`);
    if (btn) btn.classList.add('selected');
}

function applyRobotType(robotEl, robotType) {
    if (!robotEl) return;
    // Remove all type classes
    robotEl.classList.remove('robot-type-classic', 'robot-type-athletic', 'robot-type-slim', 'robot-type-tank', 'robot-type-cute');
    // Add current type
    if (robotType && robotType !== 'classic') {
        robotEl.classList.add(`robot-type-${robotType}`);
    }
}

function applyAllRobotTypes() {
    const t = gameState.robotType || 'classic';
    ['dashRobot', 'wardrobeRobot', 'shopRobot', 'cameraRobot', 'imageRobot', 'battleMenuRobot', 'battlePlayerRobot', 'battleOpponentRobot'].forEach(id => {
        applyRobotType(document.getElementById(id), t);
    });
    // Update wardrobe type selector highlight
    document.querySelectorAll('.wardrobe-type-selector .type-switch-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.wardrobe-type-selector .type-switch-btn[data-type="${t}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

const ROBOT_TYPE_NAMES = {
    classic: 'Clásico',
    athletic: 'Fuerte',
    slim: 'Femenina',
    tank: 'Mecha',
    cute: 'Alien'
};

async function changeRobotType(type) {
    gameState.robotType = type;
    applyAllRobotTypes();
    applyRobotCustomization('wardrobe');
    applyRobotCustomization('dash');
    try {
        await updateRobotType(gameState.token, type);
        showNotif('🤖', `Robot cambiado a: ${ROBOT_TYPE_NAMES[type] || type}`);
    } catch(e) {
        console.error('Error al cambiar tipo de robot:', e);
    }
}

async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!username || !password) return showNotif('⚠️', 'Completa todos los campos');

    try {
        const res = await loginUser(username, password);
        gameState.token = res.token;
        gameState.user = res.user;
        const remember = document.getElementById('rememberMe')?.checked !== false;
        if (remember) {
            localStorage.setItem('beimax_token', res.token);
            sessionStorage.removeItem('beimax_token');
        } else {
            sessionStorage.setItem('beimax_token', res.token);
            localStorage.removeItem('beimax_token');
        }
        await loadProfile();
        // Check-in diario para rachas
        const checkin = await dailyCheckin(gameState.token);
        if (checkin) {
            gameState.currentStreak = checkin.currentStreak;
            gameState.longestStreak = checkin.longestStreak;
            if (checkin.checkedIn && checkin.currentStreak > 1) {
                showNotif('🔥', checkin.message);
            }
        }
        showDashboard();
        showNotif('👋', `¡Bienvenido, ${gameState.charName}!`);
    } catch (e) {
        showNotif('❌', e.message || 'Error al iniciar sesión');
    }
}

async function handleRegister() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const charName = document.getElementById('registerCharName').value.trim();
    const age = document.getElementById('registerAge').value;
    const gender = gameState.selectedGender;
    const robotType = gameState.selectedRobotType || 'classic';

    if (!username || !email || !password || !charName || !age || !gender) {
        return showNotif('⚠️', 'Completa todos los campos');
    }
    if (password.length < 6) return showNotif('⚠️', 'La contraseña debe tener al menos 6 caracteres');

    try {
        const res = await registerUser(username, email, password, charName, parseInt(age), gender, robotType);
        gameState.token = res.token;
        gameState.user = res.user;
        gameState.charName = charName;
        gameState.robotType = robotType;
        localStorage.setItem('beimax_token', res.token);
        await loadProfile();
        showDashboard();
        showNotif('🎉', `¡Cuenta creada! Bienvenido, ${charName}`);
    } catch (e) {
        showNotif('❌', e.message || 'Error al registrarse');
    }
}

function handleLogout() {
    gameState.token = null;
    gameState.user = null;
    localStorage.removeItem('beimax_token');
    showNavBar(false);
    showScreen('authScreen');
}

// ========== PROFILE ==========

async function loadProfile() {
    try {
        const profile = await getUserProfile(gameState.token);
        gameState.coins = profile.coins || 0;
        gameState.level = profile.level || 1;
        gameState.experience = profile.experience || 0;
        gameState.currentStreak = profile.current_streak || 0;
        gameState.longestStreak = profile.longest_streak || 0;
        gameState.totalGames = profile.total_games_played || 0;
        gameState.totalCorrect = profile.total_correct_answers || 0;
        gameState.totalWrong = profile.total_wrong_answers || 0;
        gameState.charName = profile.character_name || gameState.user?.username || 'BeiBot';
        gameState.nativeLanguage = profile.native_language || null;
        gameState.learningLanguage = profile.learning_language || null;
        gameState.robotType = profile.robot_type || 'classic';
        if (profile.customization) {
            gameState.customization = {
                bodyColor: profile.customization.body_color || '#E74856',
                eyeColor: profile.customization.eye_color || '#E74856',
                hat: profile.customization.hat || 'none',
                glasses: profile.customization.glasses || 'none',
                bowtie: profile.customization.bowtie || 'none',
                earring: profile.customization.earring || 'none',
                shoes: profile.customization.shoes || 'none',
                outfit: profile.customization.outfit || 'none'
            };
        }
        // Load inventory if available
        if (profile.inventory) {
            try {
                gameState.inventory = JSON.parse(profile.inventory);
            } catch(e) {
                // inventory malformed, usar defaults
            }
        }
        // Check-in diario para rachas
        const checkin = await dailyCheckin(gameState.token);
        if (checkin) {
            gameState.currentStreak = checkin.currentStreak;
            gameState.longestStreak = checkin.longestStreak;
        }
        updateDashboard();
        // Load battle data if available
        if (typeof loadBattleData === 'function') loadBattleData();
    } catch (e) {
        console.error('Error loading profile:', e);
    }
}

function updateDashboard() {
    const s = gameState;
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setText('dashUserName', s.charName);
    setText('dashLevel', s.level);
    setText('dashStreak', s.currentStreak);
    setText('dashCoins', s.coins);
    setText('dashCharName', s.charName);

    const xpNeeded = s.level * 100;
    const pct = Math.min((s.experience / xpNeeded) * 100, 100);
    setText('dashXp', s.experience);
    setText('dashXpMax', xpNeeded);
    const xpBar = document.getElementById('dashXpBar');
    if (xpBar) xpBar.style.width = pct + '%';

    applyAllRobotTypes();
    applyRobotCustomization('dash');
}

// ========== NAVIGATION ==========

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
}

// Navigation back map
const backNavigation = {
    'languageScreen': 'dashboardScreen',
    'categoryScreen': 'languageScreen',
    'gameModeScreen': 'categoryScreen',
    'imageModeScreen': 'gameModeScreen',
    'studyModeScreen': 'gameModeScreen',
    'gameMode1Screen': 'gameModeScreen',
    'shopScreen': 'dashboardScreen',
    'wardrobeScreen': 'dashboardScreen',
    'statsScreen': 'dashboardScreen',
    'battleScreen': 'dashboardScreen',
    'onlineBattleScreen': 'dashboardScreen',
    'onlineEnglishLobbyScreen': 'gameModeScreen',
    'onlineEnglishMatchScreen': 'onlineEnglishLobbyScreen'
};

function goBack() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen) return;
    const nextScreen = backNavigation[currentScreen.id];
    if (nextScreen) {
        if (nextScreen === 'dashboardScreen') showDashboard();
        else showScreen(nextScreen);
    }
}

function showDashboard() {
    updateDashboard();
    showScreen('dashboardScreen');
    showNavBar(true);
    updateNavBar('dashboard');
    initAllRobotTilts();
}

function showLanguageScreen() {
    showScreen('languageScreen');
    if (gameState.nativeLanguage) highlightLangBtn('native', gameState.nativeLanguage);
    if (gameState.learningLanguage) highlightLangBtn('learning', gameState.learningLanguage);
    checkLanguageReady();
}

function showCategoryScreen() { showScreen('categoryScreen'); }

function showShopScreen() {
    document.getElementById('shopCoins').textContent = gameState.coins;
    // Reset preview state
    gameState.shopPreview = null;
    gameState.shopPreviousCustomization = null;
    document.getElementById('shopPreviewActions').style.display = 'none';
    document.getElementById('shopPreviewLabel').textContent = 'Vista previa';
    document.querySelector('.shop-preview-area').classList.remove('previewing');
    document.querySelectorAll('.shop-item').forEach(i => i.classList.remove('previewing'));
    // Generate shop items dynamically from SKINS catalog
    if (typeof generateShop === 'function') generateShop();
    // Mark owned/equipped items
    markOwnedItems();
    // Apply current customization to shop robot
    applyAllRobotTypes();
    applyRobotCustomization('shop');
    showScreen('shopScreen');
    updateNavBar('shop');
}

function exitShop() {
    // Cancel any pending preview
    if (gameState.shopPreview) {
        cancelPreview();
    }
    showDashboard();
}

function showWardrobe() {
    applyAllRobotTypes();
    applyRobotCustomization('wardrobe');
    populateWardrobe();
    showScreen('wardrobeScreen');
    updateNavBar('wardrobe');
    setTimeout(() => initRobotTilt('wardrobeRobotScene'), 50);
}

function showStatsScreen() {
    document.getElementById('statGames').textContent = gameState.totalGames;
    document.getElementById('statCorrect').textContent = gameState.totalCorrect;
    document.getElementById('statBestStreak').textContent = gameState.longestStreak;
    document.getElementById('statLevel').textContent = gameState.level;
    showScreen('statsScreen');
    updateNavBar('stats');
}

// ========== LANGUAGE SELECTION ==========

function selectNativeLanguage(lang) {
    gameState.nativeLanguage = lang;
    highlightLangBtn('native', lang);
    checkLanguageReady();
}

function selectLearningLanguage(lang) {
    gameState.learningLanguage = lang;
    highlightLangBtn('learning', lang);
    checkLanguageReady();
}

function highlightLangBtn(type, lang) {
    const col = type === 'native' ? 0 : 1;
    const cols = document.querySelectorAll('.language-column');
    if (!cols[col]) return;
    cols[col].querySelectorAll('.language-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.lang === lang);
    });
}

function checkLanguageReady() {
    const btn = document.getElementById('confirmLanguagesBtn');
    const ready = gameState.nativeLanguage && gameState.learningLanguage &&
                  gameState.nativeLanguage !== gameState.learningLanguage;
    btn.disabled = !ready;
}

function selectCategory(cat) {
    gameState.currentCategory = cat;
    showScreen('gameModeScreen');
}

function setLanguageDifficulty(level) {
    if (!DIFFICULTY_LABELS[level]) return;
    gameState.languageDifficulty = level;
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.difficulty-btn[data-difficulty="${level}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    showNotif('🎯', `Dificultad: ${DIFFICULTY_LABELS[level]}`);
}

function getDifficultyRewardConfig() {
    return DIFFICULTY_REWARDS[gameState.languageDifficulty] || DIFFICULTY_REWARDS.medium;
}

function inferWordDifficulty(item, lang) {
    const raw = (item?.[lang] || '').trim();
    const normalized = normalizeStr(raw);
    const wordCount = normalized.split(/\s+/).filter(Boolean).length;
    const charCount = normalized.replace(/[^a-z]/g, '').length;
    const hasHyphenOrApostrophe = /[-'’]/.test(raw);

    if (wordCount >= 3 || charCount >= 12 || (wordCount >= 2 && hasHyphenOrApostrophe)) return 'hard';
    if (wordCount === 2 || charCount >= 8 || hasHyphenOrApostrophe) return 'medium';
    return 'easy';
}

function getCategoryItemsByDifficulty(categoryKey) {
    const allItems = categoryData[categoryKey]?.items || [];
    const lang = gameState.learningLanguage || 'en';
    const selected = gameState.languageDifficulty || 'medium';
    let filtered = allItems.filter(item => inferWordDifficulty(item, lang) === selected);

    if (filtered.length < 12 && selected === 'easy') {
        filtered = allItems.filter(item => {
            const d = inferWordDifficulty(item, lang);
            return d === 'easy' || d === 'medium';
        });
    }
    if (filtered.length < 12 && selected === 'hard') {
        filtered = allItems.filter(item => {
            const d = inferWordDifficulty(item, lang);
            return d === 'hard' || d === 'medium';
        });
    }
    if (filtered.length < 12) filtered = allItems;

    return filtered;
}

// ========== ONLINE ENGLISH DUEL ==========

const QUIZ_ROULETTE_LABELS = ['Cocina', 'Oficina', 'Taller', 'Hogar', 'Libre'];
const QUIZ_CATEGORY_LABELS = {
    kitchen: 'Cocina',
    office: 'Oficina',
    workshop: 'Taller',
    home: 'Hogar'
};
const ONLINE_ENGLISH_RECONNECT_WINDOW_MS = 60000;

function normalizeDeg(value) {
    const normalized = Number(value) % 360;
    return normalized < 0 ? normalized + 360 : normalized;
}

function getRouletteLabelAtPointer(rotationDeg) {
    const labels = QUIZ_ROULETTE_LABELS;
    if (!labels.length) return 'Libre';

    const slice = 360 / labels.length;
    const pointerDeg = 270;
    const wheelRotation = normalizeDeg(rotationDeg);
    const wheelDegUnderPointer = normalizeDeg(pointerDeg - wheelRotation);
    const idx = Math.floor(wheelDegUnderPointer / slice) % labels.length;
    return labels[idx];
}

function getWsUrl() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${location.host}`;
}

function onOnlineQuizCategoryModeChange() {
    const modeEl = document.getElementById('onlineQuizCategoryMode');
    const fixedEl = document.getElementById('onlineQuizFixedCategory');
    if (!modeEl || !fixedEl) return;
    fixedEl.style.display = modeEl.value === 'fixed' ? '' : 'none';
}

function getOnlineQuizCategorySelection() {
    const modeEl = document.getElementById('onlineQuizCategoryMode');
    const fixedEl = document.getElementById('onlineQuizFixedCategory');
    const mode = modeEl?.value === 'fixed' ? 'fixed' : 'roulette';
    const fixedCategory = fixedEl?.value || 'kitchen';
    return { mode, fixedCategory };
}

function setupQuizRouletteWheel() {
    const wheel = document.getElementById('quizRouletteWheel');
    if (!wheel) return;

    wheel.querySelectorAll('.quiz-roulette-label').forEach(el => el.remove());
    const slices = QUIZ_ROULETTE_LABELS.length;
    const step = 360 / slices;
    const wheelSize = wheel.clientWidth || 300;
    const radiusPx = Math.round(wheelSize * 0.34);

    QUIZ_ROULETTE_LABELS.forEach((label, idx) => {
        const mid = idx * step + step / 2;
        const text = document.createElement('div');
        text.className = 'quiz-roulette-label';
        text.textContent = label;
        text.style.transform = `translate(-50%, -50%) rotate(${mid}deg) translate(0, -${radiusPx}px) rotate(${-mid}deg)`;
        wheel.appendChild(text);
    });
}

function setQuizQuestionVisibility(visible) {
    const area = document.getElementById('quizQuestionArea');
    if (!area) return;
    area.classList.toggle('is-hidden', !visible);
}

function hideOnlineEnglishResultPanel() {
    const panel = document.getElementById('quizMatchSummary');
    if (!panel) return;
    panel.classList.add('is-hidden');
}

function showOnlineEnglishResultPanel(data) {
    const panel = document.getElementById('quizMatchSummary');
    if (!panel) return;

    const myIdx = onlineEnglishState.playerIndex || 0;
    const oppIdx = myIdx === 0 ? 1 : 0;

    const scores = Array.isArray(data.scores) ? data.scores : [0, 0];
    const corrects = Array.isArray(data.correctAnswers) ? data.correctAnswers : [0, 0];
    const wrongs = Array.isArray(data.wrongAnswers) ? data.wrongAnswers : [0, 0];

    const myScore = scores[myIdx] || 0;
    const oppScore = scores[oppIdx] || 0;
    const myGood = corrects[myIdx] || 0;
    const myBad = wrongs[myIdx] || 0;
    const oppGood = corrects[oppIdx] || 0;
    const oppBad = wrongs[oppIdx] || 0;
    const myTotal = myGood + myBad;
    const myAccuracy = myTotal > 0 ? Math.round((myGood / myTotal) * 100) : 0;

    const resultText = data.winnerIndex === null
        ? '🤝 Empate'
        : data.youAreWinner ? '🏆 ¡Ganaste!' : '🥈 Buen intento';

    const titleEl = document.getElementById('quizSummaryTitle');
    const lineEl = document.getElementById('quizSummaryLine');
    const myPointsEl = document.getElementById('quizSummaryMyPoints');
    const oppPointsEl = document.getElementById('quizSummaryOppPoints');
    const myGoodEl = document.getElementById('quizSummaryMyGood');
    const myBadEl = document.getElementById('quizSummaryMyBad');
    const oppGoodEl = document.getElementById('quizSummaryOppGood');
    const oppBadEl = document.getElementById('quizSummaryOppBad');
    const accEl = document.getElementById('quizSummaryAccuracy');
    const rewardEl = document.getElementById('quizSummaryRewards');

    if (titleEl) titleEl.textContent = resultText;
    if (lineEl) lineEl.textContent = `${myScore} - ${oppScore}`;
    if (myPointsEl) myPointsEl.textContent = `${myScore} pts`;
    if (oppPointsEl) oppPointsEl.textContent = `${oppScore} pts`;
    if (myGoodEl) myGoodEl.textContent = String(myGood);
    if (myBadEl) myBadEl.textContent = String(myBad);
    if (oppGoodEl) oppGoodEl.textContent = String(oppGood);
    if (oppBadEl) oppBadEl.textContent = String(oppBad);
    if (accEl) accEl.textContent = `${myAccuracy}%`;
    if (rewardEl) rewardEl.textContent = `Recompensa: +${data.coinsAward || 0} monedas | +${data.xpAward || 0} XP`;

    panel.classList.remove('is-hidden');
}

function replayOnlineEnglishMatch() {
    hideOnlineEnglishResultPanel();
    setQuizQuestionVisibility(false);
    showScreen('onlineEnglishLobbyScreen');
    resetOnlineEnglishMatchState();

    if (!onlineEnglishState.ws || onlineEnglishState.ws.readyState !== WebSocket.OPEN) {
        setOnlineEnglishStatus('🔌 Reconectando para buscar rival...');
        connectOnlineEnglishSocket();
        return;
    }

    setOnlineEnglishStatus('🔄 Buscando nueva partida...');
    searchOnlineEnglishMatch();
}

function spinRouletteToLabel(selectedLabel, durationMs = 2200) {
    const wheel = document.getElementById('quizRouletteWheel');
    const resultEl = document.getElementById('quizRouletteResult');
    if (!wheel) return;

    const labels = QUIZ_ROULETTE_LABELS;
    const idx = Math.max(0, labels.findIndex(l => l.toLowerCase() === String(selectedLabel || '').toLowerCase()));
    const slice = 360 / labels.length;
    const centerDeg = idx * slice + slice / 2;
    const pointerDeg = 270;
    const currentNorm = normalizeDeg(onlineEnglishState.rouletteRotation);
    const desiredNorm = normalizeDeg(pointerDeg - centerDeg);
    const deltaToTarget = normalizeDeg(desiredNorm - currentNorm);
    const extraTurns = 360 * (4 + Math.floor(Math.random() * 3));
    onlineEnglishState.rouletteRotation += extraTurns + deltaToTarget;

    wheel.classList.add('is-spinning');
    wheel.style.transitionDuration = `${Math.max(1200, durationMs)}ms`;
    wheel.style.setProperty('--rotation', `${onlineEnglishState.rouletteRotation}deg`);
    if (resultEl) resultEl.textContent = 'Girando ruleta...';

    setTimeout(() => {
        wheel.classList.remove('is-spinning');
        const landedLabel = getRouletteLabelAtPointer(onlineEnglishState.rouletteRotation);
        if (resultEl) resultEl.textContent = `Resultado: ${landedLabel}`;
    }, Math.max(1200, durationMs) + 100);
}

function setOnlineEnglishStatus(text) {
    const status = document.getElementById('onlineEnglishStatus');
    if (status) status.innerHTML = text;
}

function setOnlineEnglishMatchButton({ text, disabled, handler }) {
    const btn = document.getElementById('onlineEnglishMatchBtn');
    if (!btn) return;
    btn.textContent = text;
    btn.disabled = !!disabled;
    btn.onclick = handler;
}

function clearOnlineEnglishIntervals() {
    if (onlineEnglishState.timerInterval) {
        clearInterval(onlineEnglishState.timerInterval);
        onlineEnglishState.timerInterval = null;
    }
    if (onlineEnglishState.rouletteInterval) {
        clearInterval(onlineEnglishState.rouletteInterval);
        onlineEnglishState.rouletteInterval = null;
    }
}

function stopOnlineEnglishKeepAlive() {
    if (onlineEnglishState.keepAliveTimer) {
        clearInterval(onlineEnglishState.keepAliveTimer);
        onlineEnglishState.keepAliveTimer = null;
    }
}

function clearOnlineEnglishReconnectTimer() {
    if (onlineEnglishState.reconnectTimer) {
        clearTimeout(onlineEnglishState.reconnectTimer);
        onlineEnglishState.reconnectTimer = null;
    }
}

function scheduleOnlineEnglishReconnect() {
    if (onlineEnglishState.manualClose) return;

    const now = Date.now();
    if (!onlineEnglishState.reconnectUntil || now > onlineEnglishState.reconnectUntil) {
        onlineEnglishState.reconnectUntil = now + ONLINE_ENGLISH_RECONNECT_WINDOW_MS;
        onlineEnglishState.reconnectAttempts = 0;
    }

    const remainingMs = onlineEnglishState.reconnectUntil - now;
    if (remainingMs <= 0) {
        clearOnlineEnglishReconnectTimer();
        setOnlineEnglishStatus('❌ Desconectado del servidor. Pulsa Reconectar para continuar.');
        setOnlineEnglishMatchButton({ text: 'Reconectar', disabled: false, handler: connectOnlineEnglishSocket });
        return;
    }

    onlineEnglishState.reconnectAttempts += 1;
    const delay = Math.min(1000 * onlineEnglishState.reconnectAttempts, 5000);
    const secsLeft = Math.ceil(remainingMs / 1000);

    setOnlineEnglishStatus(`🔄 Reconectando... intento ${onlineEnglishState.reconnectAttempts} (queda ${secsLeft}s)`);
    setOnlineEnglishMatchButton({ text: 'Reconectando...', disabled: true, handler: null });

    clearOnlineEnglishReconnectTimer();
    onlineEnglishState.reconnectTimer = setTimeout(() => {
        connectOnlineEnglishSocket();
    }, delay);
}

function resetOnlineEnglishMatchState() {
    clearOnlineEnglishIntervals();
    clearOnlineEnglishReconnectTimer();
    onlineEnglishState.matchId = null;
    onlineEnglishState.currentRound = 0;
    onlineEnglishState.totalRounds = 0;
    onlineEnglishState.scores = [0, 0];
    onlineEnglishState.deadline = 0;
    onlineEnglishState.submittedRound = null;
    onlineEnglishState.matchFinished = false;
    onlineEnglishState.reconnectAttempts = 0;
    onlineEnglishState.reconnectUntil = 0;
}

function disconnectOnlineEnglishSocket() {
    clearOnlineEnglishIntervals();
    clearOnlineEnglishReconnectTimer();
    stopOnlineEnglishKeepAlive();
    onlineEnglishState.connected = false;
    onlineEnglishState.searching = false;
    onlineEnglishState.manualClose = true;

    if (onlineEnglishState.ws) {
        try {
            if (onlineEnglishState.ws.readyState === WebSocket.OPEN) {
                onlineEnglishState.ws.send(JSON.stringify({ type: 'leave_quiz_queue' }));
            }
            onlineEnglishState.ws.close();
        } catch (e) {
            console.warn('No se pudo cerrar socket de duelo inglés:', e);
        }
    }

    onlineEnglishState.ws = null;
    resetOnlineEnglishMatchState();
}

function showOnlineEnglishLobby() {
    if (!gameState.nativeLanguage || !gameState.learningLanguage) {
        showNotif('⚠️', 'Primero selecciona idiomas para jugar');
        showLanguageScreen();
        return;
    }

    if (gameState.nativeLanguage === gameState.learningLanguage) {
        showNotif('⚠️', 'Selecciona idiomas diferentes para nativo y aprendizaje');
        showLanguageScreen();
        return;
    }

    onlineEnglishState.nativeLanguage = gameState.nativeLanguage;
    onlineEnglishState.learningLanguage = gameState.learningLanguage;

    const selection = getOnlineQuizCategorySelection();
    onlineEnglishState.categoryMode = selection.mode;
    onlineEnglishState.fixedCategory = selection.fixedCategory;

    showScreen('onlineEnglishLobbyScreen');
    hideOnlineEnglishResultPanel();
    setQuizQuestionVisibility(false);
    setupQuizRouletteWheel();
    onOnlineQuizCategoryModeChange();
    setOnlineEnglishStatus('🔌 Conectando al servidor...');
    setOnlineEnglishMatchButton({ text: 'Conectando...', disabled: true, handler: null });
    connectOnlineEnglishSocket();
}

function exitOnlineEnglishLobby() {
    disconnectOnlineEnglishSocket();
    hideOnlineEnglishResultPanel();
    showScreen('gameModeScreen');
}

function exitOnlineEnglishMatch() {
    disconnectOnlineEnglishSocket();
    hideOnlineEnglishResultPanel();
    showScreen('gameModeScreen');
    showNotif('🛑', 'Saliste del duelo online');
}

function connectOnlineEnglishSocket() {
    const wsUrl = getWsUrl();
    onlineEnglishState.manualClose = false;

    if (onlineEnglishState.ws && (onlineEnglishState.ws.readyState === WebSocket.OPEN || onlineEnglishState.ws.readyState === WebSocket.CONNECTING)) {
        return;
    }

    if (onlineEnglishState.ws) {
        try { onlineEnglishState.ws.close(); } catch (e) {}
        onlineEnglishState.ws = null;
    }

    try {
        const ws = new WebSocket(wsUrl);
        onlineEnglishState.ws = ws;

        ws.onopen = () => {
            onlineEnglishState.connected = true;
            onlineEnglishState.reconnectAttempts = 0;
            onlineEnglishState.reconnectUntil = 0;
            clearOnlineEnglishReconnectTimer();
            stopOnlineEnglishKeepAlive();

            onlineEnglishState.keepAliveTimer = setInterval(() => {
                if (onlineEnglishState.ws && onlineEnglishState.ws.readyState === WebSocket.OPEN) {
                    onlineEnglishState.ws.send(JSON.stringify({ type: 'ping' }));
                }
            }, 15000);

            setOnlineEnglishStatus('✅ Conectado. Listo para buscar rival.');
            setOnlineEnglishMatchButton({
                text: '🔍 Buscar Rival',
                disabled: false,
                handler: searchOnlineEnglishMatch
            });
        };

        ws.onclose = () => {
            onlineEnglishState.connected = false;
            stopOnlineEnglishKeepAlive();
            if (onlineEnglishState.ws === ws) {
                onlineEnglishState.ws = null;
            }

            if (onlineEnglishState.manualClose) {
                onlineEnglishState.manualClose = false;
                return;
            }

            const activeScreen = document.querySelector('.screen.active')?.id;
            const shouldReconnect =
                activeScreen === 'onlineEnglishLobbyScreen' ||
                activeScreen === 'onlineEnglishMatchScreen' ||
                onlineEnglishState.searching ||
                !!onlineEnglishState.matchId ||
                onlineEnglishState.matchFinished;

            if (shouldReconnect) {
                scheduleOnlineEnglishReconnect();
                return;
            }

            setOnlineEnglishStatus('❌ Desconectado del servidor');
            setOnlineEnglishMatchButton({ text: 'Reconectar', disabled: false, handler: connectOnlineEnglishSocket });
        };

        ws.onerror = () => {
            setOnlineEnglishStatus('❌ Error de conexión. Verifica backend en ejecución.');
            setOnlineEnglishMatchButton({ text: 'Reintentar', disabled: false, handler: connectOnlineEnglishSocket });
        };

        ws.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (e) {
                return;
            }
            handleOnlineEnglishMessage(data);
        };
    } catch (e) {
        setOnlineEnglishStatus('❌ Tu navegador no pudo abrir WebSocket.');
        setOnlineEnglishMatchButton({ text: 'Reintentar', disabled: false, handler: connectOnlineEnglishSocket });
    }
}

function searchOnlineEnglishMatch() {
    if (!onlineEnglishState.ws || onlineEnglishState.ws.readyState !== WebSocket.OPEN) {
        setOnlineEnglishStatus('🔌 Reconectando antes de buscar rival...');
        connectOnlineEnglishSocket();
        return;
    }

    onlineEnglishState.searching = true;
    const selection = getOnlineQuizCategorySelection();
    onlineEnglishState.categoryMode = selection.mode;
    onlineEnglishState.fixedCategory = selection.fixedCategory;

    const nativeLabel = langNames[gameState.nativeLanguage] || gameState.nativeLanguage;
    const learnLabel = langNames[gameState.learningLanguage] || gameState.learningLanguage;
    setOnlineEnglishStatus('🔍 Buscando rival para duelo de inglés...');
    setOnlineEnglishMatchButton({
        text: 'Cancelar búsqueda',
        disabled: false,
        handler: cancelOnlineEnglishSearch
    });

    onlineEnglishState.ws.send(JSON.stringify({
        type: 'join_quiz_queue',
        name: gameState.charName || gameState.user || 'Jugador',
        level: gameState.level || 1,
        nativeLanguage: gameState.nativeLanguage,
        learningLanguage: gameState.learningLanguage,
        categoryMode: selection.mode,
        fixedCategory: selection.fixedCategory
    }));

    setOnlineEnglishStatus(`🔍 Buscando rival (${nativeLabel} → ${learnLabel})...`);
}

function cancelOnlineEnglishSearch() {
    if (!onlineEnglishState.ws || onlineEnglishState.ws.readyState !== WebSocket.OPEN) return;
    onlineEnglishState.searching = false;
    onlineEnglishState.ws.send(JSON.stringify({ type: 'leave_quiz_queue' }));
    setOnlineEnglishStatus('⏹️ Búsqueda cancelada.');
    setOnlineEnglishMatchButton({
        text: '🔍 Buscar Rival',
        disabled: false,
        handler: searchOnlineEnglishMatch
    });
}

function updateOnlineEnglishScoreboard() {
    const myIdx = onlineEnglishState.playerIndex;
    const oppIdx = myIdx === 0 ? 1 : 0;
    const myScore = onlineEnglishState.scores[myIdx] || 0;
    const oppScore = onlineEnglishState.scores[oppIdx] || 0;
    const myScoreEl = document.getElementById('quizYouScore');
    const oppScoreEl = document.getElementById('quizOppScore');
    if (myScoreEl) myScoreEl.textContent = `${myScore} pts`;
    if (oppScoreEl) oppScoreEl.textContent = `${oppScore} pts`;
}

function startOnlineEnglishRoulette(selectedCategory, durationMs) {
    setupQuizRouletteWheel();
    setQuizQuestionVisibility(false);
    const input = document.getElementById('quizAnswerInput');
    const submit = document.getElementById('quizSubmitBtn');
    if (input) {
        input.value = '';
        input.disabled = true;
    }
    if (submit) submit.disabled = true;
    spinRouletteToLabel(selectedCategory || 'Libre', durationMs || 2200);
}

function startOnlineEnglishRound(data) {
    onlineEnglishState.currentRound = data.round;
    onlineEnglishState.totalRounds = data.totalRounds;
    onlineEnglishState.deadline = data.deadline || (Date.now() + (data.durationMs || 15000));
    onlineEnglishState.submittedRound = null;

    const roundText = document.getElementById('quizRoundText');
    const category = document.getElementById('quizCategoryLabel');
    const promptLang = document.getElementById('quizPromptLang');
    const promptWord = document.getElementById('quizPromptWord');
    const feedback = document.getElementById('quizFeedback');
    const input = document.getElementById('quizAnswerInput');
    const submit = document.getElementById('quizSubmitBtn');

    setQuizQuestionVisibility(true);

    if (roundText) roundText.textContent = `Ronda ${data.round}/${data.totalRounds}`;
    if (category) category.textContent = `🎯 ${data.category}`;
    if (promptLang) {
        const from = langNames[data.promptLang] || String(data.promptLang || '').toUpperCase();
        const to = langNames[data.answerLang] || String(data.answerLang || '').toUpperCase();
        promptLang.textContent = `${from} → ${to}`;
    }
    if (promptWord) promptWord.textContent = data.prompt || '...';
    if (feedback) feedback.textContent = 'Escribe rápido y suma más puntos.';

    if (input) {
        input.value = '';
        input.disabled = false;
        const to = langNames[data.answerLang] || String(data.answerLang || '').toUpperCase();
        input.placeholder = `Escribe en ${to}`;
        input.focus();
    }
    if (submit) submit.disabled = false;

    updateOnlineEnglishTimer();
    if (onlineEnglishState.timerInterval) clearInterval(onlineEnglishState.timerInterval);
    onlineEnglishState.timerInterval = setInterval(updateOnlineEnglishTimer, 200);
}

function updateOnlineEnglishTimer() {
    const timerEl = document.getElementById('quizTimerText');
    if (!timerEl) return;

    const leftMs = Math.max(0, onlineEnglishState.deadline - Date.now());
    const leftSec = Math.ceil(leftMs / 1000);
    timerEl.textContent = `${leftSec}s`;

    if (leftSec <= 4) {
        timerEl.style.color = 'var(--neon-red)';
    } else if (leftSec <= 8) {
        timerEl.style.color = 'var(--neon-gold)';
    } else {
        timerEl.style.color = 'var(--neon-green)';
    }

    if (leftMs <= 0 && onlineEnglishState.timerInterval) {
        clearInterval(onlineEnglishState.timerInterval);
        onlineEnglishState.timerInterval = null;
    }
}

function submitOnlineEnglishAnswer() {
    if (!onlineEnglishState.ws || onlineEnglishState.ws.readyState !== WebSocket.OPEN) return;
    if (!onlineEnglishState.matchId) return;
    if (onlineEnglishState.submittedRound === onlineEnglishState.currentRound) return;

    const input = document.getElementById('quizAnswerInput');
    const submit = document.getElementById('quizSubmitBtn');
    const feedback = document.getElementById('quizFeedback');
    const value = (input?.value || '').trim();
    if (!value) {
        const learn = langNames[onlineEnglishState.learningLanguage] || 'idioma objetivo';
        showNotif('⚠️', `Escribe tu respuesta en ${learn}`);
        return;
    }

    onlineEnglishState.ws.send(JSON.stringify({
        type: 'quiz_answer',
        matchId: onlineEnglishState.matchId,
        round: onlineEnglishState.currentRound,
        answer: value
    }));

    onlineEnglishState.submittedRound = onlineEnglishState.currentRound;
    if (input) input.disabled = true;
    if (submit) submit.disabled = true;
    if (feedback) feedback.textContent = '📤 Respuesta enviada. Esperando resultado...';
}

async function applyOnlineEnglishRewards(matchData) {
    const earnedCoins = matchData.coinsAward || 0;
    const earnedXp = matchData.xpAward || 0;
    const myIdx = onlineEnglishState.playerIndex || 0;
    const correct = Array.isArray(matchData.correctAnswers) ? (matchData.correctAnswers[myIdx] || 0) : 0;
    const wrong = Array.isArray(matchData.wrongAnswers) ? (matchData.wrongAnswers[myIdx] || 0) : 0;

    gameState.coins += earnedCoins;
    addExperience(earnedXp);
    gameState.totalGames += 1;
    gameState.totalCorrect += correct;
    gameState.totalWrong += wrong;
    updateDashboard();

    try {
        await saveGameResult(gameState.token, {
            coins: gameState.coins,
            experience: gameState.experience,
            level: gameState.level,
            category: 'online_english_duel',
            correct,
            wrong
        });
    } catch (e) {
        console.error('Error guardando recompensas de duelo inglés:', e);
    }
}

function handleOnlineEnglishMessage(data) {
    const feedback = document.getElementById('quizFeedback');

    switch (data.type) {
        case 'quiz_queue_joined': {
            setOnlineEnglishStatus(`🔎 En cola... posición ${data.position || 1}`);
            break;
        }
        case 'quiz_queue_left': {
            onlineEnglishState.searching = false;
            setOnlineEnglishStatus('✅ Conectado. Listo para buscar rival.');
            setOnlineEnglishMatchButton({ text: '🔍 Buscar Rival', disabled: false, handler: searchOnlineEnglishMatch });
            break;
        }
        case 'quiz_queue_timeout': {
            onlineEnglishState.searching = false;
            setOnlineEnglishStatus(`⌛ ${data.message || 'Tiempo de espera agotado'}`);
            setOnlineEnglishMatchButton({ text: '🔍 Buscar Rival', disabled: false, handler: searchOnlineEnglishMatch });
            break;
        }
        case 'quiz_match_found': {
            onlineEnglishState.searching = false;
            onlineEnglishState.matchId = data.matchId;
            onlineEnglishState.playerIndex = data.playerIndex || 0;
            onlineEnglishState.totalRounds = data.totalRounds || 6;
            onlineEnglishState.currentRound = 0;
            onlineEnglishState.scores = [0, 0];
            onlineEnglishState.opponentName = data.opponent?.name || 'Rival';
            onlineEnglishState.nativeLanguage = data.nativeLanguage || gameState.nativeLanguage;
            onlineEnglishState.learningLanguage = data.learningLanguage || gameState.learningLanguage;
            onlineEnglishState.categoryMode = data.categoryMode || 'roulette';
            onlineEnglishState.fixedCategory = data.fixedCategory || 'kitchen';

            const youName = document.getElementById('quizYouName');
            const oppName = document.getElementById('quizOppName');
            const round = document.getElementById('quizRoundText');
            const timer = document.getElementById('quizTimerText');

            if (youName) youName.textContent = gameState.charName || gameState.user || 'Jugador';
            if (oppName) oppName.textContent = onlineEnglishState.opponentName;
            if (round) round.textContent = `Ronda 0/${onlineEnglishState.totalRounds}`;
            if (timer) timer.textContent = '15s';
            if (feedback) feedback.textContent = 'Rival encontrado. Comienza la ruleta...';
            hideOnlineEnglishResultPanel();
            setQuizQuestionVisibility(false);
            onlineEnglishState.matchFinished = false;

            const nativeLabel = langNames[onlineEnglishState.nativeLanguage] || onlineEnglishState.nativeLanguage;
            const learningLabel = langNames[onlineEnglishState.learningLanguage] || onlineEnglishState.learningLanguage;
            setOnlineEnglishStatus(`⚔️ Emparejado: ${nativeLabel} → ${learningLabel}`);

            updateOnlineEnglishScoreboard();
            showScreen('onlineEnglishMatchScreen');
            break;
        }
        case 'quiz_roulette': {
            startOnlineEnglishRoulette(data.selectedCategory || 'Libre', data.durationMs || 2200);
            if (feedback) feedback.textContent = `🎰 Ruleta girando... ronda ${data.round}/${data.totalRounds}`;
            break;
        }
        case 'quiz_round_start': {
            startOnlineEnglishRound(data);
            break;
        }
        case 'quiz_answer_received': {
            if (feedback) feedback.textContent = '📤 Respuesta enviada. Esperando al rival...';
            break;
        }
        case 'quiz_opponent_answered': {
            if (feedback && onlineEnglishState.submittedRound !== onlineEnglishState.currentRound) {
                feedback.textContent = '⏱️ El rival ya respondió. ¡Envía tu respuesta!';
            }
            break;
        }
        case 'quiz_round_result': {
            clearOnlineEnglishIntervals();
            if (Array.isArray(data.scores)) {
                onlineEnglishState.scores = data.scores;
            }
            updateOnlineEnglishScoreboard();

            const input = document.getElementById('quizAnswerInput');
            const submit = document.getElementById('quizSubmitBtn');
            if (input) input.disabled = true;
            if (submit) submit.disabled = true;

            if (feedback) {
                const state = data.you?.correct ? '✅ Correcto' : '❌ Incorrecto';
                const pts = data.you?.points || 0;
                feedback.textContent = `${state} | +${pts} pts | Respuesta: ${data.expectedAnswer}`;
            }
            break;
        }
        case 'quiz_opponent_disconnected': {
            if (feedback) feedback.textContent = '🏁 El rival se desconectó. Se cerrará la partida.';
            break;
        }
        case 'quiz_match_end': {
            clearOnlineEnglishIntervals();
            applyOnlineEnglishRewards(data).finally(() => {
                const myIdx = onlineEnglishState.playerIndex || 0;
                const myScore = Array.isArray(data.scores) ? (data.scores[myIdx] || 0) : 0;
                const oppScore = Array.isArray(data.scores) ? (data.scores[myIdx === 0 ? 1 : 0] || 0) : 0;
                const resultText = data.winnerIndex === null
                    ? '🤝 Empate'
                    : data.youAreWinner ? '🏆 ¡Ganaste!' : '🥈 Buen intento';

                showNotif('🎯', `${resultText} +${data.coinsAward || 0} 🪙 y +${data.xpAward || 0} XP`);
                setOnlineEnglishStatus(`${resultText} | ${myScore} - ${oppScore}`);
                setOnlineEnglishMatchButton({ text: '🔍 Buscar Rival', disabled: false, handler: searchOnlineEnglishMatch });
                setQuizQuestionVisibility(false);
                showOnlineEnglishResultPanel(data);
                onlineEnglishState.matchFinished = true;
            });
            break;
        }
        case 'error': {
            setOnlineEnglishStatus(`❌ ${data.message || 'Error en duelo online'}`);
            break;
        }
    }
}

// ========== TEXT-TO-SPEECH (VOZ ROBÓTICA) ==========

const TTS_LANG_MAP = {
    es: 'es-ES',
    en: 'en-US',
    fr: 'fr-FR'
};

function speakWord(word, lang) {
    if (!('speechSynthesis' in window)) {
        showNotif('⚠️', 'Tu navegador no soporta síntesis de voz');
        return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = TTS_LANG_MAP[lang] || 'en-US';
    // Robotic voice settings
    utterance.rate = 0.85;   // Slightly slow for learning
    utterance.pitch = 0.7;   // Lower pitch = more robotic
    utterance.volume = 1.0;

    // Try to find a voice for the language
    const voices = window.speechSynthesis.getVoices();
    const langCode = TTS_LANG_MAP[lang] || 'en-US';
    const voiceForLang = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (voiceForLang) utterance.voice = voiceForLang;

    // Visual feedback on the button that triggered it
    utterance.onstart = () => {
        document.querySelectorAll('.btn-speak').forEach(b => b.classList.add('speaking'));
    };
    utterance.onend = () => {
        document.querySelectorAll('.btn-speak').forEach(b => b.classList.remove('speaking'));
    };
    utterance.onerror = () => {
        document.querySelectorAll('.btn-speak').forEach(b => b.classList.remove('speaking'));
    };

    window.speechSynthesis.speak(utterance);
}

function speakCurrentWord() {
    const s = gameState;
    const item = s.imgWords[s.imgIndex];
    if (item) speakWord(item[s.learningLanguage], s.learningLanguage);
}

function speakStudyWord() {
    const s = gameState;
    const item = s.studyWords[s.studyIndex];
    if (item) speakWord(item[s.learningLanguage], s.learningLanguage);
}

function speakCameraWord() {
    if (gameState.requestedObj) {
        speakWord(gameState.requestedObj[gameState.learningLanguage], gameState.learningLanguage);
    }
}

// ========== ROBOT ASISTENTE DE CÁMARA ==========

const LANG_FLAGS = { es: '🇪🇸', en: '🇬🇧', fr: '🇫🇷' };
const LANG_NAMES = { es: 'Español', en: 'English', fr: 'Français' };

function resetCameraRobotSpeech() {
    const bubble = document.getElementById('cameraSpeechBubble');
    if (bubble) {
        bubble.className = 'camera-speech-bubble';
    }
    const hint = document.getElementById('robotHint');
    if (hint) { hint.style.display = 'none'; hint.innerHTML = ''; }
    const pron = document.getElementById('robotPronunciation');
    if (pron) { pron.style.display = 'none'; pron.innerHTML = ''; }
}

function setCameraRobotState(state) {
    const robot = document.getElementById('cameraRobot');
    if (!robot) return;
    robot.classList.remove('robot-celebrate', 'robot-thinking', 'robot-sad');
    if (state) robot.classList.add(state);
}

function setCameraBubbleState(state) {
    const bubble = document.getElementById('cameraSpeechBubble');
    if (!bubble) return;
    bubble.classList.remove('bubble-correct', 'bubble-wrong', 'bubble-thinking');
    if (state) bubble.classList.add(state);
}

/**
 * El robot habla mostrando traducciones y pronunciación interactiva
 */
function robotSpeakResult(item, isCorrect) {
    const hint = document.getElementById('robotHint');
    const pron = document.getElementById('robotPronunciation');
    if (!hint || !pron || !item) return;

    if (isCorrect) {
        // Mostrar traducciones del objeto
        const nativeLang = gameState.nativeLanguage || 'es';
        const learnLang = gameState.learningLanguage || 'en';
        const langs = ['es', 'en', 'fr'].filter(l => item[l]);

        hint.innerHTML = `
            <span class="hint-label">🎓 ¡Así se dice!</span>
            ${langs.map(l => `<div>${LANG_FLAGS[l] || '🌐'} <strong>${LANG_NAMES[l]}:</strong> ${item[l]}</div>`).join('')}
        `;
        hint.style.display = 'block';

        // Tarjetas de pronunciación clicables
        pron.innerHTML = langs.map(l => `
            <div class="pronunciation-card" onclick="speakWord('${item[l].replace(/'/g, "\\'")}', '${l}')">
                <span class="lang-flag">${LANG_FLAGS[l] || '🔊'}</span>
                <span class="lang-word">${item[l]}</span>
                <span class="lang-phonetic">🔊</span>
            </div>
        `).join('');
        pron.style.display = 'flex';

        // Auto-pronunciar en el idioma de aprendizaje
        setTimeout(() => speakWord(item[learnLang], learnLang), 500);
    } else {
        // Dar pista sin revelar la respuesta completa
        const learnLang = gameState.learningLanguage || 'en';
        const word = item[learnLang];
        const firstLetter = word ? word.charAt(0).toUpperCase() : '?';
        hint.innerHTML = `
            <span class="hint-label">💡 Pista</span>
            <div>Empieza con: <strong>"${firstLetter}..."</strong></div>
            <div style="font-size:0.82rem;margin-top:4px;opacity:0.7;">Intenta encontrar el objeto correcto</div>
        `;
        hint.style.display = 'block';
        pron.style.display = 'none';
    }
}

/**
 * Mensajes del robot según la situación
 */
const ROBOT_MESSAGES = {
    request: [
        '¡Muéstrame este objeto! 👀',
        '¡Busca este objeto! 🔍',
        '¿Puedes encontrar esto? 🤔',
        '¡Veamos si lo encuentras! 🎯'
    ],
    correct: [
        '🎉 ¡Excelente! ¡Lo encontraste!',
        '✨ ¡Perfecto! ¡Eres increíble!',
        '🌟 ¡Muy bien! ¡Sigue así!',
        '🎊 ¡Genial! ¡Lo lograste!'
    ],
    wrong: [
        '🤔 Mmm... eso no es lo que busco',
        '😅 ¡Casi! Intenta con otro objeto',
        '🔄 No es eso, ¡vuelve a intentar!',
        '👀 Sigue buscando...'
    ],
    noDetect: [
        '👀 No veo nada claro... acerca el objeto',
        '📷 Asegúrate de que el objeto se vea bien',
        '🔍 No detecto nada, ¡pon más luz!'
    ],
    thinking: [
        '🧠 Analizando...',
        '🔍 Déjame ver...',
        '👀 Observando...'
    ]
};

function getRandomMessage(type) {
    const msgs = ROBOT_MESSAGES[type];
    return msgs ? msgs[Math.floor(Math.random() * msgs.length)] : '';
}

// Preload voices (some browsers need this)
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

// ========== ROBOT ASISTENTE MODO IMAGEN ==========

const IMAGE_ROBOT_MESSAGES = {
    question: [
        '✍️ ¡Escribe la traducción!',
        '🧠 ¡Piensa bien! ¿Cómo se dice?',
        '📝 ¡Vamos, tú puedes!',
        '🎯 ¡Escribe rápido para más puntos!'
    ],
    correct: [
        '🎉 ¡Excelente! ¡Lo sabías!',
        '✨ ¡Perfecto! ¡Eres un crack!',
        '🌟 ¡Muy bien! ¡Sigue así!',
        '🎊 ¡Genial! ¡Qué vocabulario!'
    ],
    wrong: [
        '😅 ¡Casi! Mira la respuesta correcta',
        '💪 No te rindas, ¡practica más!',
        '🔄 Fíjate bien y memoriza',
        '👀 La próxima lo consigues'
    ],
    timeout: [
        '⏰ ¡Se acabó el tiempo! Mira la respuesta',
        '⏳ ¡Hay que ser más rápido!',
        '🏃 ¡Intenta escribir más rápido!'
    ]
};

function getImageRobotMessage(type) {
    const msgs = IMAGE_ROBOT_MESSAGES[type];
    return msgs ? msgs[Math.floor(Math.random() * msgs.length)] : '';
}

function resetImageRobotSpeech() {
    const bubble = document.getElementById('imageSpeechBubble');
    if (bubble) bubble.className = 'image-speech-bubble';
    const hint = document.getElementById('imageRobotHint');
    if (hint) { hint.style.display = 'none'; hint.innerHTML = ''; }
    const pron = document.getElementById('imageRobotPronunciation');
    if (pron) { pron.style.display = 'none'; pron.innerHTML = ''; }
}

function setImageRobotState(state) {
    const robot = document.getElementById('imageRobot');
    if (!robot) return;
    robot.classList.remove('robot-celebrate', 'robot-thinking', 'robot-sad');
    if (state) robot.classList.add(state);
}

function setImageBubbleState(state) {
    const bubble = document.getElementById('imageSpeechBubble');
    if (!bubble) return;
    bubble.classList.remove('bubble-correct', 'bubble-wrong', 'bubble-thinking');
    if (state) bubble.classList.add(state);
}

function imageRobotSpeak(item, isCorrect) {
    const hint = document.getElementById('imageRobotHint');
    const pron = document.getElementById('imageRobotPronunciation');
    if (!hint || !pron || !item) return;

    if (isCorrect) {
        const langs = ['es', 'en', 'fr'].filter(l => item[l]);
        hint.innerHTML = `
            <span class="hint-label">🎓 ¡Así se dice!</span>
            ${langs.map(l => `<div>${LANG_FLAGS[l] || '🌐'} <strong>${LANG_NAMES[l]}:</strong> ${item[l]}</div>`).join('')}
        `;
        hint.style.display = 'block';

        pron.innerHTML = langs.map(l => `
            <div class="pronunciation-card" onclick="speakWord('${item[l].replace(/'/g, "\\'")}', '${l}')">
                <span class="lang-flag">${LANG_FLAGS[l] || '🔊'}</span>
                <span class="lang-word">${item[l]}</span>
                <span class="lang-phonetic">🔊</span>
            </div>
        `).join('');
        pron.style.display = 'flex';

        // Auto-pronunciar
        const learnLang = gameState.learningLanguage || 'en';
        setTimeout(() => speakWord(item[learnLang], learnLang), 500);
    } else {
        // Mostrar la palabra correcta y traducciones para aprender
        const learnLang = gameState.learningLanguage || 'en';
        const langs = ['es', 'en', 'fr'].filter(l => item[l]);
        hint.innerHTML = `
            <span class="hint-label">📖 Aprende esta palabra</span>
            ${langs.map(l => `<div>${LANG_FLAGS[l] || '🌐'} <strong>${LANG_NAMES[l]}:</strong> ${item[l]}</div>`).join('')}
        `;
        hint.style.display = 'block';

        pron.innerHTML = langs.map(l => `
            <div class="pronunciation-card" onclick="speakWord('${item[l].replace(/'/g, "\\'")}', '${l}')">
                <span class="lang-flag">${LANG_FLAGS[l] || '🔊'}</span>
                <span class="lang-word">${item[l]}</span>
                <span class="lang-phonetic">🔊</span>
            </div>
        `).join('');
        pron.style.display = 'flex';

        setTimeout(() => speakWord(item[learnLang], learnLang), 500);
    }
}

// ========== IMAGE MODE (CON CRONÓMETRO) ==========

function startImageMode() {
    const cat = gameState.currentCategory;
    const items = getCategoryItemsByDifficulty(cat);
    if (!items) return showNotif('❌', 'Categoría no encontrada');

    gameState.imgWords = shuffleArray([...items]);
    gameState.imgIndex = 0;
    gameState.imgScore = 0;
    gameState.imgLives = 3;
    gameState.imgCoins = 0;
    gameState.imgMistakes = [];

    showScreen('imageModeScreen');
    document.getElementById('imgTotal').textContent = gameState.imgWords.length;

    // Inicializar robot asistente de modo imagen
    applyRobotType(document.getElementById('imageRobot'), gameState.robotType || 'classic');
    applyRobotCustomization('image');
    resetImageRobotSpeech();

    showImageQuestion();
}

function startTimer() {
    stopTimer();
    gameState.timerSeconds = gameState.timerMax;
    gameState.questionStartTime = Date.now();
    updateTimerDisplay();

    const timerBar = document.getElementById('timerBarFill');
    timerBar.style.width = '100%';
    timerBar.className = 'timer-bar-fill';

    const timerStat = document.getElementById('timerStat');
    timerStat.className = 'game-stat timer';

    gameState.timerInterval = setInterval(() => {
        gameState.timerSeconds--;
        updateTimerDisplay();

        // Update timer bar
        const pct = (gameState.timerSeconds / gameState.timerMax) * 100;
        timerBar.style.width = pct + '%';

        // Warning colors
        if (gameState.timerSeconds <= 5) {
            timerBar.className = 'timer-bar-fill danger';
            timerStat.className = 'game-stat timer danger';
        } else if (gameState.timerSeconds <= 10) {
            timerBar.className = 'timer-bar-fill warning';
            timerStat.className = 'game-stat timer warning';
        }

        if (gameState.timerSeconds <= 0) {
            stopTimer();
            timerExpired();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimerDisplay() {
    document.getElementById('imgTimer').textContent = gameState.timerSeconds;
}

function timerExpired() {
    // Time's up! Count as wrong answer
    const s = gameState;
    const item = s.imgWords[s.imgIndex];
    const learning = s.learningLanguage;

    s.imgLives--;
    s.imgMistakes.push({
        native: item[s.nativeLanguage],
        expected: item[learning],
        user: '(sin respuesta)',
        reason: 'tiempo'
    });

    let details = `<strong>⏰ ¡Se acabó el tiempo!</strong><br>`;
    details += `<strong>Palabra correcta:</strong> ${item[learning]}<br>`;
    details += `<small>🔊 Presiona el botón para escuchar la pronunciación</small>`;

    document.getElementById('imgResultIcon').textContent = '⏰';
    document.getElementById('imgResultText').textContent = '¡Tiempo agotado!';
    document.getElementById('imgResultText').className = 'result-main result-wrong';
    document.getElementById('imgResultDetails').innerHTML = details;
    document.getElementById('imgLives').textContent = s.imgLives;

    document.getElementById('imgAnswerSection').style.display = 'none';
    document.getElementById('imgResult').style.display = 'block';

    // Scroll para que el resultado sea visible
    document.getElementById('imgResult').scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Robot: triste + mostrar traducciones para aprender
    setImageRobotState('robot-sad');
    setImageBubbleState('bubble-wrong');
    const tMsgEl = document.getElementById('imageRobotMessage');
    if (tMsgEl) tMsgEl.innerHTML = getImageRobotMessage('timeout');
    imageRobotSpeak(item, false);

    // Auto-avanzar después de 4.5 segundos
    if (gameState.imgAutoAdvance) clearTimeout(gameState.imgAutoAdvance);
    gameState.imgAutoAdvance = setTimeout(() => {
        nextImageQuestion();
    }, 4500);
}

function getTimeBonus() {
    const cfg = getDifficultyRewardConfig();
    const elapsed = (Date.now() - gameState.questionStartTime) / 1000;
    if (elapsed < 5) return { coins: cfg.timeBonusFast, label: `⚡ Rapidísimo +${cfg.timeBonusFast} 🪙` };
    if (elapsed < 10) return { coins: cfg.timeBonusMid, label: `🏃 Rápido +${cfg.timeBonusMid} 🪙` };
    if (elapsed < 15) return { coins: cfg.timeBonusSlow, label: `👍 Bien +${cfg.timeBonusSlow} 🪙` };
    return { coins: 0, label: '' };
}

function showImageQuestion() {
    const s = gameState;
    if (s.imgIndex >= s.imgWords.length || s.imgLives <= 0) {
        return endImageMode();
    }

    const item = s.imgWords[s.imgIndex];
    const native = s.nativeLanguage;
    const learning = s.learningLanguage;
    const catName = categoryData[s.currentCategory].name[native] || s.currentCategory;
    const total = s.imgWords.length;

    document.getElementById('imgCategoryLabel').textContent = catName;
    document.getElementById('imgWordNumber').textContent = `${s.imgIndex + 1} / ${total}`;
    document.getElementById('imgObjectImage').textContent = item.emoji;
    document.getElementById('imgNativeWord').textContent = item[native];
    document.getElementById('imgLangName').textContent = langNames[learning];
    document.getElementById('imgCoins').textContent = s.imgCoins;
    document.getElementById('imgScore').textContent = s.imgScore;
    document.getElementById('imgLives').textContent = s.imgLives;
    document.getElementById('imgProgressFill').style.width = ((s.imgIndex / total) * 100) + '%';

    document.getElementById('imgAnswerName').value = '';
    document.getElementById('imgAnswerSection').style.display = 'block';
    document.getElementById('imgResult').style.display = 'none';
    document.getElementById('imgObjectCard').style.animation = 'none';
    setTimeout(() => document.getElementById('imgObjectCard').style.animation = 'cardPop 0.4s ease', 10);
    document.getElementById('imgAnswerName').focus();

    // Robot: pedir al jugador que escriba
    resetImageRobotSpeech();
    setImageRobotState(null);
    const msgEl = document.getElementById('imageRobotMessage');
    if (msgEl) {
        const nativeW = item[native];
        const learnW = item[learning];
        msgEl.innerHTML = `${getImageRobotMessage('question')}<br><strong>${nativeW}</strong> ${item.emoji} → <span style="color:var(--accent)">¿?</span>`;
    }

    // Start timer
    startTimer();
}

function checkImageAnswer() {
    stopTimer();

    const s = gameState;
    const rewardCfg = getDifficultyRewardConfig();
    const item = s.imgWords[s.imgIndex];
    const learning = s.learningLanguage;

    const userWord = document.getElementById('imgAnswerName').value.trim().toLowerCase();

    if (!userWord) return showNotif('⚠️', 'Escribe la palabra');

    const correctWord = item[learning].toLowerCase();

    // Check for synonyms
    const synonyms = wordSynonyms[learning]?.[correctWord] || [correctWord];
    const wordCorrect = synonyms.some(syn => similarEnough(normalizeStr(userWord), normalizeStr(syn)));

    let points = 0;
    let coinReward = 0;
    let resultIcon, resultText, resultClass;
    let timeBonus = { coins: 0, label: '' };

    if (wordCorrect) {
        points = 1;
        coinReward = rewardCfg.imageBaseCoins;
        timeBonus = getTimeBonus();
        resultIcon = '🌟'; resultText = '¡Correcto!'; resultClass = 'result-correct';
        showFloatingPoints(coinReward + timeBonus.coins, true);

        // Robot: celebrar
        setImageRobotState('robot-celebrate');
        setImageBubbleState('bubble-correct');
        const cMsgEl = document.getElementById('imageRobotMessage');
        if (cMsgEl) cMsgEl.innerHTML = getImageRobotMessage('correct');
        imageRobotSpeak(item, true);
    } else {
        s.imgLives--;
        s.imgMistakes.push({
            native: item[s.nativeLanguage],
            expected: item[learning],
            user: userWord || '(vacio)',
            reason: 'incorrecta'
        });
        resultIcon = '❌'; resultText = 'Incorrecto'; resultClass = 'result-wrong';
        showFloatingPoints(-1, false);

        // Robot: triste + mostrar respuesta correcta
        setImageRobotState('robot-sad');
        setImageBubbleState('bubble-wrong');
        const wMsgEl = document.getElementById('imageRobotMessage');
        if (wMsgEl) wMsgEl.innerHTML = getImageRobotMessage('wrong');
        imageRobotSpeak(item, false);
    }

    coinReward += timeBonus.coins;
    s.imgScore += points;
    s.imgCoins += coinReward;

    let details = `<strong>Palabra correcta:</strong> ${item[learning]}<br>`;
    if (!wordCorrect) {
        details += `<em>Tu respuesta: "${userWord}"</em><br>`;
    }
    if (timeBonus.label) {
        details += `<br>${timeBonus.label}`;
    }
    if (coinReward > 0) {
        details += `<br>+${coinReward} 🪙 | +${points * rewardCfg.xpPerPoint} XP`;
    }
    details += `<br><small>🔊 Presiona el botón para escuchar la pronunciación</small>`;

    document.getElementById('imgResultIcon').textContent = resultIcon;
    document.getElementById('imgResultText').textContent = resultText;
    document.getElementById('imgResultText').className = 'result-main ' + resultClass;
    document.getElementById('imgResultDetails').innerHTML = details;
    document.getElementById('imgLives').textContent = s.imgLives;
    document.getElementById('imgScore').textContent = s.imgScore;
    document.getElementById('imgCoins').textContent = s.imgCoins;

    document.getElementById('imgAnswerSection').style.display = 'none';
    document.getElementById('imgResult').style.display = 'block';

    // Scroll para que el resultado sea visible
    document.getElementById('imgResult').scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Show speak button
    const speakBtn = document.getElementById('imgSpeakBtn');
    if (speakBtn) speakBtn.style.display = '';

    // Auto-avanzar a la siguiente palabra después de 4 segundos
    if (gameState.imgAutoAdvance) clearTimeout(gameState.imgAutoAdvance);
    gameState.imgAutoAdvance = setTimeout(() => {
        nextImageQuestion();
    }, 4500);
}

function nextImageQuestion() {
    if (gameState.imgAutoAdvance) {
        clearTimeout(gameState.imgAutoAdvance);
        gameState.imgAutoAdvance = null;
    }
    gameState.imgIndex++;
    showImageQuestion();
}

async function generateAIStudyPlan({ mode, total, correct, wrong, category, difficulty, mistakes }) {
    if (typeof chatWithAI !== 'function') {
        throw new Error('chatWithAI no disponible');
    }

    const safeMistakes = (mistakes || []).slice(0, 10).map(m => ({
        native: m.native || '', expected: m.expected || '', user: m.user || '', reason: m.reason || ''
    }));

    const systemPrompt = 'Eres tutor de idiomas para ninos. Responde en espanol, breve y accionable. Sin markdown.';
    const userPrompt = `Genera un mini plan de estudio personalizado para hoy con este desempeno:\n- modo: ${mode}\n- categoria: ${category}\n- dificultad: ${difficulty}\n- aciertos: ${correct}/${total}\n- errores: ${wrong}\n- errores concretos: ${JSON.stringify(safeMistakes)}\n\nFormato estricto:\n1) Debilidad principal: ...\n2) Objetivo hoy (10 min): ...\n3) 3 palabras a practicar: ...\n4) 2 ejercicios concretos: ...\n5) Consejo de pronunciacion: ...`;

    return await chatWithAI(userPrompt, systemPrompt, {
        temperature: 0.2,
        max_tokens: 280
    });
}

function appendAIPlanToImageResult(planText, sourceLabel, sourceReason) {
    const detailsEl = document.getElementById('imgResultDetails');
    if (!detailsEl) return;
    const pretty = (planText || 'No se pudo generar el plan ahora. Intenta de nuevo.').replace(/\n/g, '<br>');
    const source = sourceLabel || 'Origen no especificado';
    detailsEl.innerHTML += `
        <hr style="margin:12px 0;border:none;border-top:1px solid rgba(255,255,255,.2)">
        <strong>AI Plan de estudio personalizado</strong><br>
        <small style="opacity:.85">Fuente: ${source}</small><br>
        <div style="margin-top:6px;line-height:1.45">${pretty}</div>
    `;
}

async function generateImageModeStudyPlan(total, wrong) {
    const detailsEl = document.getElementById('imgResultDetails');
    if (detailsEl) detailsEl.innerHTML += '<br><br><em>Generando plan de estudio IA...</em>';

    try {
        const planText = await generateAIStudyPlan({
            mode: 'image',
            total,
            correct: gameState.imgScore,
            wrong,
            category: gameState.currentCategory,
            difficulty: gameState.languageDifficulty,
            mistakes: gameState.imgMistakes
        });
        appendAIPlanToImageResult(planText, 'IA real del servidor');
    } catch (e) {
        try {
            // Segundo intento con prompt mas corto para reducir rechazos en modelos free
            const shortPrompt = `Plan breve de estudio para ${gameState.currentCategory}, dificultad ${gameState.languageDifficulty}, aciertos ${gameState.imgScore}/${total}, errores ${wrong}. Dame exactamente 5 lineas numeradas 1-5 en espanol.`;
            const shortSystem = 'Tutor de idiomas. Respuesta breve y accionable, sin markdown.';
            const secondTry = await chatWithAI(shortPrompt, shortSystem, { temperature: 0.0, max_tokens: 140 });
            appendAIPlanToImageResult(secondTry, 'IA real del servidor (reintento compacto)');
        } catch (e2) {
            const reason = e2?.message || e?.message || 'error desconocido';
            const fallback = [
                `1) Debilidad principal: vocabulario de ${categoryData[gameState.currentCategory]?.name?.[gameState.nativeLanguage] || gameState.currentCategory}.`,
                '2) Objetivo hoy (10 min): repasar 8 palabras con audio y escritura.',
                `3) 3 palabras a practicar: ${(gameState.imgMistakes || []).slice(0, 3).map(m => m.expected).join(', ') || 'las que fallaste en la ronda'}.`,
                '4) 2 ejercicios concretos: escribir 5 veces cada palabra y decirla en voz alta.',
                '5) Consejo de pronunciacion: habla lento, separando silabas y luego fluido.'
            ].join('<br>');
            appendAIPlanToImageResult(fallback, 'Respaldo local (sin IA)', reason);
        }
    }
}

async function generateCameraModeStudyPlan() {
    const total = gameState.cameraAttempts || 0;
    if (total <= 0) return;

    const wrong = Math.max(0, total - (gameState.cameraCorrect || 0));
    try {
        const planText = await generateAIStudyPlan({
            mode: 'camera',
            total,
            correct: gameState.cameraCorrect || 0,
            wrong,
            category: gameState.currentCategory,
            difficulty: gameState.languageDifficulty,
            mistakes: gameState.cameraMistakes
        });
        alert(`Plan IA de practica (IA real del servidor)\n\n${planText}`);
    } catch (e) {
        alert('Plan de practica de respaldo local (sin IA en ese intento).');
    }
}

function endImageMode() {
    stopTimer();
    if (gameState.imgAutoAdvance) {
        clearTimeout(gameState.imgAutoAdvance);
        gameState.imgAutoAdvance = null;
    }
    const s = gameState;
    const total = s.imgWords.length;
    const rewardCfg = getDifficultyRewardConfig();

    gameState.coins += s.imgCoins;
    const xpEarned = s.imgScore * rewardCfg.xpPerPoint;
    addExperience(xpEarned);
    gameState.totalGames++;
    gameState.totalCorrect += s.imgScore;

    saveProgress();

    document.getElementById('imgObjectCard').style.display = 'none';
    document.getElementById('imgAnswerSection').style.display = 'none';

    // Hide timer
    document.getElementById('timerStat').style.display = 'none';
    document.querySelector('.timer-bar-wrapper').style.display = 'none';

    const pct = Math.round((s.imgScore / total) * 100);
    const wrong = Math.max(0, total - s.imgScore);
    let emoji = '🏆';
    if (pct < 30) emoji = '😢';
    else if (pct < 60) emoji = '😊';
    else if (pct < 90) emoji = '🎉';

    document.getElementById('imgResultIcon').textContent = emoji;
    document.getElementById('imgResultText').textContent = `¡Partida terminada!`;
    document.getElementById('imgResultText').className = 'result-main';
    document.getElementById('imgResultDetails').innerHTML = `
        <strong>Puntuación:</strong> ${s.imgScore} / ${total}<br>
        <strong>Porcentaje:</strong> ${pct}%<br>
        <strong>Dificultad:</strong> ${DIFFICULTY_LABELS[gameState.languageDifficulty]}<br>
        <strong>Monedas ganadas:</strong> ${s.imgCoins} 🪙<br>
        <strong>XP ganado:</strong> ${xpEarned}
    `;
    document.getElementById('imgResult').style.display = 'block';

    const resultDiv = document.getElementById('imgResult');
    const btn = resultDiv.querySelector('button');
    btn.textContent = 'Volver al menú';
    btn.onclick = () => {
        document.getElementById('imgObjectCard').style.display = '';
        document.getElementById('timerStat').style.display = '';
        document.querySelector('.timer-bar-wrapper').style.display = '';
        showDashboard();
    };

    document.getElementById('imgProgressFill').style.width = '100%';

    // Plan de estudio IA basado en errores de la ronda
    generateImageModeStudyPlan(total, wrong);
}

function exitImageMode() {
    stopTimer();
    showScreen('gameModeScreen');
}

// ========== STUDY MODE ==========

function startStudyMode() {
    const cat = gameState.currentCategory;
    const items = getCategoryItemsByDifficulty(cat);
    if (!items) return showNotif('❌', 'Categoría no encontrada');

    gameState.studyWords = shuffleArray([...items]);
    gameState.studyIndex = 0;

    showScreen('studyModeScreen');
    document.getElementById('studyTotal').textContent = gameState.studyWords.length;
    showStudyWord();
}

function showStudyWord() {
    const s = gameState;
    if (s.studyIndex >= s.studyWords.length) {
        // All words studied, go back
        showNotif('📚', '¡Has revisado todas las palabras!');
        showScreen('gameModeScreen');
        return;
    }

    const item = s.studyWords[s.studyIndex];
    const native = s.nativeLanguage;
    const learning = s.learningLanguage;
    const total = s.studyWords.length;

    document.getElementById('studyIndex').textContent = s.studyIndex + 1;
    document.getElementById('studyEmoji').textContent = item.emoji;
    document.getElementById('studyNativeLangLabel').textContent = langNames[native];
    document.getElementById('studyNativeWord').textContent = item[native];
    document.getElementById('studyTargetLangLabel').textContent = langNames[learning];
    document.getElementById('studyTargetWord').textContent = item[learning];
    document.getElementById('studyProgressFill').style.width = ((s.studyIndex / total) * 100) + '%';

    // Animation
    const card = document.getElementById('studyCard');
    card.style.animation = 'none';
    setTimeout(() => card.style.animation = 'cardPop 0.4s ease', 10);

    // Update button text
    const btn = document.getElementById('studyNextBtn');
    if (s.studyIndex >= total - 1) {
        btn.textContent = '✅ Finalizar';
    } else {
        btn.textContent = 'Siguiente →';
    }
}

function nextStudyWord() {
    gameState.studyIndex++;
    showStudyWord();
}

function exitStudyMode() {
    showScreen('gameModeScreen');
}

// ========== CAMERA MODE ==========

async function startGameMode1() {
    try {
        // Request camera with constraints for better compatibility
        const constraints = {
            video: {
                facingMode: 'environment', // Prefer back camera on mobile
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };
        gameState.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('webcam1');
        video.srcObject = gameState.cameraStream;

        // Wait for video to be ready before showing screen
        await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve).catch(resolve);
            };
            setTimeout(resolve, 3000); // Timeout fallback
        });

        gameState.mode1Score = 0;
        gameState.cameraAttempts = 0;
        gameState.cameraCorrect = 0;
        gameState.cameraMistakes = [];
        document.getElementById('scoreMode1').textContent = '0';
        document.getElementById('coinsAmount3').textContent = gameState.coins;
        document.getElementById('cameraStatus').textContent = '';
        document.getElementById('cameraStatus').className = 'camera-status';
        document.getElementById('captureBtn').disabled = false;
        document.getElementById('cameraSpeakBtn').style.display = 'none';

        showScreen('gameMode1Screen');

        // Inicializar robot asistente de cámara con personalización del jugador
        applyRobotType(document.getElementById('cameraRobot'), gameState.robotType || 'classic');
        applyRobotCustomization('camera');
        resetCameraRobotSpeech();

        requestNewObject();

        // Cargar COCO-SSD para detección de objetos
        showCameraStatus('📦 Cargando modelo de detección de objetos...', 'info');
        const model = (typeof loadCocoModel === 'function') ? await loadCocoModel() : null;
        const aiReady = (typeof checkAPIHealth === 'function') ? await checkAPIHealth() : false;

        if (model) {
            showCameraStatus(
                aiReady
                    ? '📷 COCO-SSD + DeepSeek R1 activos — detección y traducción con IA'
                    : '📷 COCO-SSD activo — detección de objetos lista',
                'success'
            );
        } else {
            showCameraStatus('📷 Cámara lista — modo simulación (COCO-SSD no cargó)', 'info');
        }
    } catch (e) {
        console.error('Camera error:', e);
        let msg = 'No se pudo acceder a la cámara.';
        if (e.name === 'NotAllowedError') {
            msg = 'Permiso de cámara denegado. Permite el acceso en los ajustes del navegador.';
        } else if (e.name === 'NotFoundError') {
            msg = 'No se encontró ninguna cámara en este dispositivo.';
        } else if (e.name === 'NotReadableError') {
            msg = 'La cámara está siendo usada por otra aplicación.';
        } else if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            msg = 'La cámara requiere HTTPS. Accede desde localhost o configura HTTPS.';
        }
        showNotif('❌', msg);
    }
}

function showCameraStatus(text, type) {
    const el = document.getElementById('cameraStatus');
    if (el) {
        el.textContent = text;
        el.className = 'camera-status ' + (type || '');
    }
}

function requestNewObject() {
    const items = getCategoryItemsByDifficulty(gameState.currentCategory);
    if (!items) return;
    const item = items[Math.floor(Math.random() * items.length)];
    gameState.requestedObj = item;
    document.getElementById('requestedObject').textContent =
        item[gameState.nativeLanguage] + ' (' + item[gameState.learningLanguage] + ')';
    // Show speak button for the requested word
    const speakBtn = document.getElementById('cameraSpeakBtn');
    if (speakBtn) speakBtn.style.display = '';

    // Robot asistente: resetear y mostrar mensaje de solicitud
    resetCameraRobotSpeech();
    setCameraRobotState(null); // idle
    const bubble = document.getElementById('objectRequest');
    if (bubble) {
        const msg = getRandomMessage('request');
        const wordNative = item[gameState.nativeLanguage];
        const wordLearn = item[gameState.learningLanguage];
        bubble.innerHTML = `${msg}<br><strong style="font-size:1.15em">${wordNative}</strong> → <strong style="color:var(--accent)">${wordLearn}</strong>`;
    }
}

async function captureMode1() {
    const video = document.getElementById('webcam1');
    const canvas = document.getElementById('canvas1');

    if (!video.videoWidth || !video.videoHeight) {
        showNotif('⚠️', 'La cámara aún no está lista');
        return;
    }

    // Dibujar frame actual en canvas (para visualización)
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const resultEl = document.getElementById('resultMode1');
    const captureBtn = document.getElementById('captureBtn');
    captureBtn.disabled = true;
    gameState.cameraAttempts++;

    // Robot: estado pensando
    setCameraRobotState('robot-thinking');
    setCameraBubbleState('bubble-thinking');
    const reqEl = document.getElementById('objectRequest');
    if (reqEl) reqEl.innerHTML = getRandomMessage('thinking');
    showCameraStatus('🔍 COCO-SSD analizando imagen...', 'analyzing');

    try {
        const rewardCfg = getDifficultyRewardConfig();
        const expectedObj = gameState.requestedObj[gameState.nativeLanguage];
        // Pasar el CANVAS con el snapshot (más confiable que video en vivo)
        const result = await apiValidateObject(canvas, expectedObj, gameState.currentCategory, true);

        if (result.isCorrect) {
            const detected = result.detectedObject || expectedObj;
            const conf = result.confidence ? ` (${(result.confidence * 100).toFixed(0)}%)` : '';
            resultEl.style.display = 'block';
            resultEl.style.background = 'rgba(34,197,94,0.15)';
            resultEl.style.color = '#22c55e';
            resultEl.innerHTML = `✅ ¡Correcto! <strong>${detected}</strong>${conf} (+${rewardCfg.cameraCoins} 🪙 | +${rewardCfg.cameraXp} XP)`;
            gameState.mode1Score++;
            gameState.cameraCorrect++;
            gameState.coins += rewardCfg.cameraCoins;
            addExperience(rewardCfg.cameraXp);
            showCameraStatus('✅ ¡Objeto detectado por COCO-SSD!', 'success');

            // Robot: celebrar y mostrar traducciones + pronunciación
            setCameraRobotState('robot-celebrate');
            setCameraBubbleState('bubble-correct');
            if (reqEl) reqEl.innerHTML = getRandomMessage('correct');
            const matchedItem = result.matchedItem || gameState.requestedObj;
            robotSpeakResult(matchedItem, true);
        } else {
            const detected = result.detectedObject || 'nada';
            gameState.cameraMistakes.push({
                native: gameState.requestedObj?.[gameState.nativeLanguage] || '',
                expected: gameState.requestedObj?.[gameState.learningLanguage] || '',
                user: detected,
                reason: 'deteccion distinta'
            });
            resultEl.style.display = 'block';
            resultEl.style.background = 'rgba(239,68,68,0.15)';
            resultEl.style.color = '#ef4444';
            resultEl.innerHTML = `❌ No coincide. Detectado: <strong>${detected}</strong>`;
            if (result.cocoLabel) {
                resultEl.innerHTML += `<br><small>🏷️ COCO-SSD: "${result.cocoLabel}"</small>`;
            }
            if (result.description) {
                resultEl.innerHTML += `<br><small>${result.description}</small>`;
            }
            showCameraStatus('❌ Intenta de nuevo o toca Siguiente', 'error');

            // Robot: triste y mostrar pista
            setCameraRobotState('robot-sad');
            setCameraBubbleState('bubble-wrong');
            if (reqEl) reqEl.innerHTML = getRandomMessage('wrong');
            robotSpeakResult(gameState.requestedObj, false);
        }

        document.getElementById('scoreMode1').textContent = gameState.mode1Score;
        document.getElementById('coinsAmount3').textContent = gameState.coins;

    } catch (error) {
        console.error('Error en captura:', error);
        const errMsg = typeof handleAPIError === 'function' ? handleAPIError(error) : 'Error al analizar';
        resultEl.style.display = 'block';
        resultEl.style.background = 'rgba(234,179,8,0.15)';
        resultEl.style.color = '#eab308';
        resultEl.textContent = `⚠️ ${errMsg}`;
        showCameraStatus('⚠️ Error en detección', 'error');

        // Robot: no detectó nada
        setCameraRobotState('robot-sad');
        setCameraBubbleState('bubble-wrong');
        if (reqEl) reqEl.innerHTML = getRandomMessage('noDetect');
    }

    captureBtn.disabled = false;

    setTimeout(() => {
        resultEl.style.display = 'none';
        showCameraStatus('📷 Listo para capturar', 'info');
    }, 6000);
}

function skipObject() {
    document.getElementById('resultMode1').style.display = 'none';
    resetCameraRobotSpeech();
    setCameraRobotState(null);
    requestNewObject();
}

async function exitGame() {
    await generateCameraModeStudyPlan();

    if (gameState.cameraStream) {
        gameState.cameraStream.getTracks().forEach(t => t.stop());
        gameState.cameraStream = null;
    }
    window.speechSynthesis?.cancel();
    saveProgress();
    showScreen('gameModeScreen');
}

// ========== SHOP (WITH PREVIEW) ==========

function switchShopTab(tab) {
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.shop-tab[data-tab="${tab}"]`).classList.add('active');
    document.querySelectorAll('.shop-grid').forEach(g => g.classList.remove('active'));
    const tabMap = { outfits: 'shopOutfits', hats: 'shopHats', glasses: 'shopGlasses', accessories: 'shopAccessories', earrings: 'shopEarrings', shoes: 'shopShoes' };
    document.getElementById(tabMap[tab]).classList.add('active');
}

function previewItem(type, value, price) {
    // Save current customization if not already previewing
    if (!gameState.shopPreviousCustomization) {
        gameState.shopPreviousCustomization = { ...gameState.customization };
    }

    // Store preview info
    gameState.shopPreview = { type, value, price };

    // Create a temporary customization for preview
    const tempCustom = { ...gameState.shopPreviousCustomization };

    if (type === 'hat') tempCustom.hat = value;
    else if (type === 'glasses') tempCustom.glasses = value;
    else if (type === 'bowtie') tempCustom.bowtie = value;
    else if (type === 'earring') tempCustom.earring = value;
    else if (type === 'shoes') tempCustom.shoes = value;
    else if (type === 'outfit') {
        // Apply complete outfit with all accessories
        const outfit = getOutfitInfo(value);
        tempCustom.bodyColor = outfit.bodyColor;
        tempCustom.hat = outfit.hat;
        tempCustom.glasses = outfit.glasses;
        tempCustom.bowtie = outfit.bowtie;
        tempCustom.outfit = value;
    }

    // Temporarily apply to shop robot
    gameState.customization = tempCustom;
    applyRobotCustomization('shop');

    // Restore actual customization (don't save yet)
    gameState.customization = { ...gameState.shopPreviousCustomization };

    // Show preview UI
    document.querySelector('.shop-preview-area').classList.add('previewing');
    const label = document.getElementById('shopPreviewLabel');

    // Check if already owned
    let invCat = '';
    if (type === 'outfit') invCat = 'outfits';
    else if (type === 'hat') invCat = 'hats';
    else if (type === 'glasses') invCat = 'glasses';
    else if (type === 'bowtie') invCat = 'accessories';
    else if (type === 'earring') invCat = 'earrings';
    else if (type === 'shoes') invCat = 'shoes';
    const isOwned = invCat && gameState.inventory[invCat] && gameState.inventory[invCat].includes(value);

    const buyBtn = document.getElementById('shopBuyBtn');
    const equipBtn = document.getElementById('shopEquipBtn');
    if (isOwned) {
        label.textContent = 'Ya tienes este item - ¿Equipar?';
        if (buyBtn) buyBtn.style.display = 'none';
        if (equipBtn) equipBtn.style.display = '';
    } else {
        if (price > 0) {
            label.textContent = `Previsualizando... (${price} 🪙)`;
        } else {
            label.textContent = 'Previsualizando... (Gratis)';
        }
        if (buyBtn) buyBtn.style.display = '';
        if (equipBtn) equipBtn.style.display = 'none';
    }
    document.getElementById('shopPreviewActions').style.display = 'flex';

    // Highlight the selected item
    document.querySelectorAll('.shop-item').forEach(i => i.classList.remove('previewing'));
    // Find and highlight the clicked item (by matching onclick params)
    // We'll use event delegation approach - highlight all matching items
    const allItems = document.querySelectorAll('.shop-item');
    allItems.forEach(item => {
        const onclickStr = item.getAttribute('onclick') || '';
        if (onclickStr.includes(`'${type}'`) && onclickStr.includes(`'${value}'`)) {
            item.classList.add('previewing');
        }
    });
}

function confirmPurchase() {
    const preview = gameState.shopPreview;
    if (!preview) return;

    const { type, value, price } = preview;

    // Determine inventory category
    let invCategory = '';
    if (type === 'outfit') invCategory = 'outfits';
    else if (type === 'hat') invCategory = 'hats';
    else if (type === 'glasses') invCategory = 'glasses';
    else if (type === 'bowtie') invCategory = 'accessories';
    else if (type === 'earring') invCategory = 'earrings';
    else if (type === 'shoes') invCategory = 'shoes';

    // Check if already owned - equip instead of buying again
    if (invCategory && gameState.inventory[invCategory] && gameState.inventory[invCategory].includes(value)) {
        let custKey = type === 'outfit' ? 'outfit' : type;
        if (type === 'bowtie') custKey = 'bowtie';
        equipItem(custKey, value);
        cancelPreview();
        markOwnedItems();
        return;
    }

    if (price > 0 && gameState.coins < price) {
        showNotif('❌', `No tienes suficientes monedas (necesitas ${price} 🪙)`);
        cancelPreview();
        return;
    }

    if (price > 0) {
        gameState.coins -= price;
    }

    // Add to inventory
    if (invCategory && !gameState.inventory[invCategory].includes(value)) {
        gameState.inventory[invCategory].push(value);
    }

    // Apply the item permanently
    if (type === 'hat') gameState.customization.hat = value;
    else if (type === 'glasses') gameState.customization.glasses = value;
    else if (type === 'bowtie') gameState.customization.bowtie = value;
    else if (type === 'earring') gameState.customization.earring = value;
    else if (type === 'shoes') gameState.customization.shoes = value;
    else if (type === 'outfit') {
        const outfit = getOutfitInfo(value);
        gameState.customization.bodyColor = outfit.bodyColor;
        gameState.customization.hat = outfit.hat;
        gameState.customization.glasses = outfit.glasses;
        gameState.customization.bowtie = outfit.bowtie;
        gameState.customization.outfit = value;
    }

    // Update coins display
    document.getElementById('shopCoins').textContent = gameState.coins;

    // Save customization to backend
    saveCustomization();

    // Clean up preview state
    gameState.shopPreview = null;
    gameState.shopPreviousCustomization = null;
    document.getElementById('shopPreviewActions').style.display = 'none';
    document.getElementById('shopPreviewLabel').textContent = '✅ ¡Comprado!';
    document.querySelector('.shop-preview-area').classList.remove('previewing');
    document.querySelectorAll('.shop-item').forEach(i => i.classList.remove('previewing'));

    // Apply to shop robot with new real customization
    applyRobotCustomization('shop');

    // Refresh owned badges
    markOwnedItems();

    showNotif('🛍️', value === 'none' ? 'Item removido' : '¡Compra exitosa!');

    // Reset label after a moment
    setTimeout(() => {
        document.getElementById('shopPreviewLabel').textContent = 'Vista previa';
    }, 2000);
}

function cancelPreview() {
    if (gameState.shopPreviousCustomization) {
        gameState.customization = { ...gameState.shopPreviousCustomization };
    }
    gameState.shopPreview = null;
    gameState.shopPreviousCustomization = null;

    // Reset shop robot to current real customization
    applyRobotCustomization('shop');

    document.getElementById('shopPreviewActions').style.display = 'none';
    document.getElementById('shopPreviewLabel').textContent = 'Vista previa';
    document.querySelector('.shop-preview-area').classList.remove('previewing');
    document.querySelectorAll('.shop-item').forEach(i => i.classList.remove('previewing'));
}

// ========== CUSTOMIZATION ==========

function applyRobotCustomization(prefix) {
    const c = gameState.customization;

    // Determine element IDs based on prefix
    let bodyId, eyeIds, hatId, glassId, bowId, earringIds, shoeIds, robotId, overlayId;

    if (prefix === 'wardrobe') {
        bodyId = 'wardrobeRobotBody';
        eyeIds = ['wardrobeEyeL', 'wardrobeEyeR'];
        hatId = 'wardrobeRobotHat';
        glassId = 'wardrobeRobotGlasses';
        bowId = 'wardrobeRobotBowtie';
        earringIds = ['wardrobeEarringL', 'wardrobeEarringR'];
        shoeIds = ['wardrobeShoeL', 'wardrobeShoeR'];
        robotId = 'wardrobeRobot';
        overlayId = 'wardrobeOutfitOverlay';
    } else if (prefix === 'shop') {
        bodyId = 'shopRobotBody';
        eyeIds = ['shopEyeL', 'shopEyeR'];
        hatId = 'shopRobotHat';
        glassId = 'shopRobotGlasses';
        bowId = 'shopRobotBowtie';
        earringIds = ['shopEarringL', 'shopEarringR'];
        shoeIds = ['shopShoeL', 'shopShoeR'];
        robotId = 'shopRobot';
        overlayId = 'shopOutfitOverlay';
    } else if (prefix === 'camera') {
        bodyId = 'cameraRobotBody';
        eyeIds = ['cameraEyeL', 'cameraEyeR'];
        hatId = 'cameraRobotHat';
        glassId = 'cameraRobotGlasses';
        bowId = 'cameraRobotBowtie';
        earringIds = ['cameraEarringL', 'cameraEarringR'];
        shoeIds = ['cameraShoeL', 'cameraShoeR'];
        robotId = 'cameraRobot';
        overlayId = 'cameraOutfitOverlay';
    } else if (prefix === 'image') {
        bodyId = 'imageRobotBody';
        eyeIds = ['imageEyeL', 'imageEyeR'];
        hatId = 'imageRobotHat';
        glassId = 'imageRobotGlasses';
        bowId = 'imageRobotBowtie';
        earringIds = ['imageEarringL', 'imageEarringR'];
        shoeIds = ['imageShoeL', 'imageShoeR'];
        robotId = 'imageRobot';
        overlayId = 'imageOutfitOverlay';
    } else if (prefix === 'battleMenu') {
        bodyId = 'battleMenuRobotBody';
        eyeIds = ['battleMenuEyeL', 'battleMenuEyeR'];
        hatId = 'battleMenuRobotHat';
        glassId = 'battleMenuRobotGlasses';
        bowId = 'battleMenuRobotBowtie';
        earringIds = ['battleMenuEarringL', 'battleMenuEarringR'];
        shoeIds = ['battleMenuShoeL', 'battleMenuShoeR'];
        robotId = 'battleMenuRobot';
        overlayId = 'battleMenuOutfitOverlay';
    } else if (prefix === 'battlePlayer') {
        bodyId = 'battlePlayerRobotBody';
        eyeIds = ['battlePlayerEyeL', 'battlePlayerEyeR'];
        hatId = 'battlePlayerRobotHat';
        glassId = 'battlePlayerRobotGlasses';
        bowId = 'battlePlayerRobotBowtie';
        earringIds = ['battlePlayerEarringL', 'battlePlayerEarringR'];
        shoeIds = ['battlePlayerShoeL', 'battlePlayerShoeR'];
        robotId = 'battlePlayerRobot';
        overlayId = 'battlePlayerOutfitOverlay';
    } else if (prefix === 'battleOpponent') {
        bodyId = 'battleOpponentRobotBody';
        eyeIds = ['battleOpponentEyeL', 'battleOpponentEyeR'];
        hatId = 'battleOpponentRobotHat';
        glassId = 'battleOpponentRobotGlasses';
        bowId = 'battleOpponentRobotBowtie';
        earringIds = ['battleOpponentEarringL', 'battleOpponentEarringR'];
        shoeIds = ['battleOpponentShoeL', 'battleOpponentShoeR'];
        robotId = 'battleOpponentRobot';
        overlayId = 'battleOpponentOutfitOverlay';
    } else {
        bodyId = 'dashRobotBody';
        eyeIds = ['dashEyeL', 'dashEyeR'];
        hatId = 'dashRobotHat';
        glassId = 'dashRobotGlasses';
        bowId = 'dashRobotBowtie';
        earringIds = ['dashEarringL', 'dashEarringR'];
        shoeIds = ['dashShoeL', 'dashShoeR'];
        robotId = 'dashRobot';
        overlayId = 'dashOutfitOverlay';
    }

    // Body color - use outfit's bodyColor if outfit is active, else default
    const bodyColor = c.bodyColor || '#E74856';
    const body = document.getElementById(bodyId);
    if (body) {
        body.style.background = `linear-gradient(180deg, ${bodyColor} 0%, ${darkenColor(bodyColor, 15)} 100%)`;
        // Apply outfit overlay SVG
        const overlayEl = document.getElementById(overlayId);
        if (overlayEl) {
            if (c.outfit && c.outfit !== 'none' && typeof SKINS !== 'undefined' && SKINS.outfits[c.outfit]) {
                injectSkin(overlayEl, SKINS.outfits[c.outfit].overlay);
            } else {
                overlayEl.innerHTML = '';
            }
        }
    }

    // Eyes - keep default red glow, no color override
    eyeIds.forEach(id => {
        const e = document.getElementById(id);
        if (e) {
            e.style.background = '';
            e.style.boxShadow = '';
        }
    });

    // Helper: apply SVG skin accessory
    function applyAccessory(elId, value, skinCategory) {
        const el = document.getElementById(elId);
        if (!el) return;
        if (value && value !== 'none' && typeof SKINS !== 'undefined' && SKINS[skinCategory] && SKINS[skinCategory][value]) {
            el.style.display = 'flex';
            injectSkin(el, SKINS[skinCategory][value].svg);
        } else {
            el.style.display = 'none';
            el.innerHTML = '';
        }
    }

    // Hat
    applyAccessory(hatId, c.hat, 'hats');

    // Glasses
    applyAccessory(glassId, c.glasses, 'glasses');

    // Bowtie / neck accessory
    applyAccessory(bowId, c.bowtie, 'bowties');

    // Earrings
    if (earringIds) {
        earringIds.forEach(id => applyAccessory(id, c.earring, 'earrings'));
    }

    // Shoes
    if (shoeIds) {
        shoeIds.forEach(id => applyAccessory(id, c.shoes, 'shoes'));
        // Hide default feet when shoes are equipped
        const robot = document.getElementById(robotId);
        if (robot) {
            robot.querySelectorAll('.robot-foot').forEach(f => {
                f.style.opacity = c.shoes !== 'none' ? '0' : '1';
            });
        }
    }

    // Arms, legs same color as body (darker)
    const robot = document.getElementById(robotId);
    if (robot) {
        const darkerColor = darkenColor(bodyColor, 22);
        robot.querySelectorAll('.robot-arm').forEach(a => {
            a.style.background = `linear-gradient(180deg, ${darkenColor(bodyColor, 15)} 0%, ${darkerColor} 100%)`;
        });
        robot.querySelectorAll('.robot-leg').forEach(l => {
            l.style.background = `linear-gradient(180deg, ${darkenColor(bodyColor, 15)} 0%, ${darkerColor} 100%)`;
        });
    }
}

function darkenColor(hex, pct) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.slice(0,2), 16);
    let g = parseInt(hex.slice(2,4), 16);
    let b = parseInt(hex.slice(4,6), 16);
    r = Math.max(0, Math.round(r * (1 - pct/100)));
    g = Math.max(0, Math.round(g * (1 - pct/100)));
    b = Math.max(0, Math.round(b * (1 - pct/100)));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function lightenColor(hex, pct) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.slice(0,2), 16);
    let g = parseInt(hex.slice(2,4), 16);
    let b = parseInt(hex.slice(4,6), 16);
    r = Math.min(255, Math.round(r + (255 - r) * (pct/100)));
    g = Math.min(255, Math.round(g + (255 - g) * (pct/100)));
    b = Math.min(255, Math.round(b + (255 - b) * (pct/100)));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

async function saveCustomization() {
    try {
        await updateRobotCustomization(gameState.token, gameState.customization, gameState.inventory);
    } catch (e) { console.error('Error saving customization:', e); }
}

// ========== XP & LEVEL ==========

function addExperience(amount) {
    gameState.experience += amount;
    const needed = gameState.level * 100;
    if (gameState.experience >= needed) {
        gameState.experience -= needed;
        gameState.level++;
        showNotif('🎉', `¡Subiste al nivel ${gameState.level}!`);
    }
}

async function saveProgress() {
    try {
        await saveGameResult(gameState.token, {
            coins: gameState.coins,
            experience: gameState.experience,
            level: gameState.level,
            category: gameState.currentCategory,
            correct: gameState.imgScore,
            wrong: gameState.imgWords ? gameState.imgWords.length - gameState.imgScore : 0
        });
    } catch (e) { console.error('Error saving progress:', e); }
}

// ========== NOTIFICATIONS ==========

function showNotif(icon, text) {
    const notif = document.getElementById('notification');
    document.getElementById('notifIcon').textContent = icon;
    document.getElementById('notifText').textContent = text;
    notif.style.display = 'flex';
    setTimeout(() => notif.style.display = 'none', 3000);
}

function showFloatingPoints(pts, isCorrect = true) {
    const el = document.createElement('div');
    el.className = 'floating-pts' + (isCorrect ? ' pts-correct' : ' pts-wrong');
    el.textContent = (isCorrect ? '+' : '') + pts + ' PTS';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// ========== UTILITIES ==========

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function normalizeStr(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function similarEnough(a, b) {
    const na = normalizeStr(a);
    const nb = normalizeStr(b);
    if (na === nb) return true;
    // For short words (≤4 chars) require exact match (synonyms handle variants)
    if (Math.min(na.length, nb.length) <= 4) return false;
    // For longer words allow at most 1 character difference (typo tolerance)
    if (Math.abs(na.length - nb.length) > 1) return false;
    let diff = 0;
    const maxLen = Math.max(na.length, nb.length);
    for (let i = 0; i < maxLen; i++) {
        if (na[i] !== nb[i]) diff++;
    }
    return diff <= 1;
}

// ========== NAV BAR ==========

function showNavBar(visible) {
    const nav = document.getElementById('mainNavBar');
    if (nav) nav.classList.toggle('visible', visible);
}

function toggleNavMore() {
    document.getElementById('navMorePanel')?.classList.toggle('visible');
}
function closeNavMore() {
    document.getElementById('navMorePanel')?.classList.remove('visible');
}

function updateNavBar(section) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-more-item').forEach(b => b.classList.remove('active-item'));
    // shop, wardrobe, stats all live inside the "Perfil" dropdown
    const profileGroup = ['wardrobe', 'stats', 'shop'];
    if (profileGroup.includes(section)) {
        document.querySelector('.nav-more-btn')?.classList.add('active');
        document.querySelector(`.nav-more-item[data-nav="${section}"]`)?.classList.add('active-item');
    } else {
        const btn = document.querySelector(`.nav-btn[data-nav="${section}"]`);
        if (btn) btn.classList.add('active');
    }
    closeNavMore();
}

function navTo(section) {
    if (section === 'dashboard') showDashboard();
    else if (section === 'play') showLanguageScreen();
    else if (section === 'battle') { if (typeof showBattleMenu === 'function') showBattleMenu(); }
    else if (section === 'shop') showShopScreen();
    else if (section === 'wardrobe') showWardrobe();
    else if (section === 'stats') showStatsScreen();
    updateNavBar(section);
}

function switchEqTab(tabName, btnEl) {
    document.querySelectorAll('.eq-tab').forEach(t => t.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    // Show/hide grids
    ['Weapons','Shields','Modules'].forEach(cat => {
        const grid = document.getElementById('eqShop' + cat);
        if (grid) grid.style.display = cat.toLowerCase() === tabName ? '' : 'none';
    });
    if (typeof renderBattleShop === 'function') renderBattleShop(tabName);
}

// ========== 3D ROBOT TILT (PARALLAX) ==========

function initRobotTilt(sceneId) {
    const scene = document.getElementById(sceneId);
    if (!scene) return;
    const wrap = scene.querySelector('.robot-3d-wrap');
    const shadow = scene.nextElementSibling; // .robot-shadow
    if (!wrap) return;

    let tiltActive = false;

    scene.addEventListener('mouseenter', () => {
        tiltActive = true;
        wrap.classList.add('tilting');
    });

    scene.addEventListener('mouseleave', () => {
        tiltActive = false;
        wrap.classList.remove('tilting');
        wrap.style.transform = '';
        if (shadow) {
            shadow.style.width = '';
            shadow.style.opacity = '';
        }
    });

    scene.addEventListener('mousemove', (e) => {
        if (!tiltActive) return;
        const rect = scene.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;  // 0..1
        const y = (e.clientY - rect.top) / rect.height;   // 0..1

        const tiltX = (y - 0.5) * -28;  // max ±14deg vertical
        const tiltY = (x - 0.5) * 32;   // max ±16deg horizontal
        const liftZ = 12;
        const sc = 1 + Math.abs(y - 0.5) * 0.04;

        wrap.style.transform =
            `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${liftZ}px) translateY(-8px) scale(${sc})`;

        if (shadow) {
            const spreadFactor = 1 - Math.abs(y - 0.5) * 0.7;
            shadow.style.width = `${55 + spreadFactor * 40}px`;
            shadow.style.opacity = `${0.3 + spreadFactor * 0.4}`;
        }
    });

    // Touch support for mobile
    scene.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const rect = scene.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;

        if (x < 0 || x > 1 || y < 0 || y > 1) return;

        wrap.classList.add('tilting');
        const tiltX = (y - 0.5) * -28;
        const tiltY = (x - 0.5) * 32;
        const sc = 1 + Math.abs(y - 0.5) * 0.04;
        wrap.style.transform =
            `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(12px) translateY(-8px) scale(${sc})`;
    }, { passive: true });

    scene.addEventListener('touchend', () => {
        wrap.classList.remove('tilting');
        wrap.style.transform = '';
    });
}

// Initialize tilts when dashboard loads
function initAllRobotTilts() {
    initRobotTilt('dashRobotScene');
    initRobotTilt('wardrobeRobotScene');
}

// ========== WARDROBE ==========

function populateWardrobe() {
    const cats = {
        outfits: { gridId: 'wardrobeOutfits', invKey: 'outfits', skinKey: 'outfits', custKey: 'outfit' },
        hats: { gridId: 'wardrobeHats', invKey: 'hats', skinKey: 'hats', custKey: 'hat' },
        glasses: { gridId: 'wardrobeGlasses', invKey: 'glasses', skinKey: 'glasses', custKey: 'glasses' },
        accessories: { gridId: 'wardrobeAccessories', invKey: 'accessories', skinKey: 'bowties', custKey: 'bowtie' },
        earrings: { gridId: 'wardrobeEarrings', invKey: 'earrings', skinKey: 'earrings', custKey: 'earring' },
        shoes: { gridId: 'wardrobeShoes', invKey: 'shoes', skinKey: 'shoes', custKey: 'shoes' }
    };

    for (const [tab, cfg] of Object.entries(cats)) {
        const grid = document.getElementById(cfg.gridId);
        if (!grid) continue;
        grid.innerHTML = '';
        const owned = gameState.inventory[cfg.invKey] || ['none'];
        if (owned.length <= 1 && owned[0] === 'none') {
            grid.innerHTML = `<div class="wardrobe-empty-msg">No tienes items aquí aún.<br><a onclick="showShopScreen()">Ir a la tienda</a></div>`;
            // Still add "none" option
        }

        // None option first
        const isNoneEquipped = gameState.customization[cfg.custKey] === 'none';
        const noneDiv = document.createElement('div');
        noneDiv.className = 'wardrobe-item' + (isNoneEquipped ? ' equipped-item' : '');
        noneDiv.innerHTML = `<div class="wardrobe-item-preview"><span class="no-item-icon">∅</span></div><div class="wardrobe-item-name">Ninguno</div>`;
        noneDiv.onclick = () => equipItem(cfg.custKey, 'none');
        grid.appendChild(noneDiv);

        // Owned items
        owned.forEach(itemId => {
            if (itemId === 'none') return;
            const skinData = (typeof SKINS !== 'undefined' && SKINS[cfg.skinKey]) ? SKINS[cfg.skinKey][itemId] : null;
            if (!skinData) return;
            const isEquipped = gameState.customization[cfg.custKey] === itemId;
            const div = document.createElement('div');
            div.className = 'wardrobe-item rarity-' + (skinData.rarity || 'common') + (isEquipped ? ' equipped-item' : '');
            const previewDiv = document.createElement('div');
            previewDiv.className = 'wardrobe-item-preview';
            if (skinData.svg) injectSkin(previewDiv, skinData.svg);
            else if (skinData.overlay) injectSkin(previewDiv, skinData.overlay);
            div.appendChild(previewDiv);
            const nameDiv = document.createElement('div');
            nameDiv.className = 'wardrobe-item-name';
            nameDiv.textContent = skinData.name || itemId;
            div.appendChild(nameDiv);
            div.onclick = () => equipItem(cfg.custKey, itemId);
            grid.appendChild(div);
        });
    }
}

function equipItem(custKey, itemId) {
    // For outfits, also apply body color + auto accessories
    if (custKey === 'outfit') {
        if (itemId === 'none') {
            gameState.customization.outfit = 'none';
            gameState.customization.bodyColor = '#E74856';
        } else {
            const outfit = getOutfitInfo(itemId);
            gameState.customization.outfit = itemId;
            gameState.customization.bodyColor = outfit.bodyColor;
            if (outfit.hat && outfit.hat !== 'none') gameState.customization.hat = outfit.hat;
            if (outfit.glasses && outfit.glasses !== 'none') gameState.customization.glasses = outfit.glasses;
            if (outfit.bowtie && outfit.bowtie !== 'none') gameState.customization.bowtie = outfit.bowtie;
        }
    } else {
        gameState.customization[custKey] = itemId;
    }
    applyRobotCustomization('wardrobe');
    saveCustomization();
    populateWardrobe(); // Refresh grid to update equipped markers
    showNotif('👕', itemId === 'none' ? 'Item removido' : '¡Equipado!');
}

function switchWardrobeTab(tab) {
    document.querySelectorAll('.wardrobe-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.wardrobe-tab[data-tab="${tab}"]`).classList.add('active');
    document.querySelectorAll('.wardrobe-grid').forEach(g => g.classList.remove('active'));
    const tabMap = { outfits: 'wardrobeOutfits', hats: 'wardrobeHats', glasses: 'wardrobeGlasses', accessories: 'wardrobeAccessories', earrings: 'wardrobeEarrings', shoes: 'wardrobeShoes' };
    document.getElementById(tabMap[tab]).classList.add('active');
}

// ========== SHOP OWNED/EQUIPPED BADGES ==========

function markOwnedItems() {
    document.querySelectorAll('.shop-item').forEach(item => {
        const onclickStr = item.getAttribute('onclick') || '';
        // Parse type and value from onclick
        const match = onclickStr.match(/previewItem\('(\w+)',\s*'([^']+)'/);
        if (!match) return;
        const type = match[1];
        const value = match[2];
        let invCategory = '';
        if (type === 'outfit') invCategory = 'outfits';
        else if (type === 'hat') invCategory = 'hats';
        else if (type === 'glasses') invCategory = 'glasses';
        else if (type === 'bowtie') invCategory = 'accessories';
        else if (type === 'earring') invCategory = 'earrings';
        else if (type === 'shoes') invCategory = 'shoes';

        item.classList.remove('owned', 'equipped');
        if (invCategory && gameState.inventory[invCategory] && gameState.inventory[invCategory].includes(value)) {
            item.classList.add('owned');
            // Check if equipped
            let custKey = type === 'outfit' ? 'outfit' : type;
            if (type === 'bowtie') custKey = 'bowtie';
            if (gameState.customization[custKey] === value) {
                item.classList.add('equipped');
            }
        }
    });
}

function equipFromShop() {
    const preview = gameState.shopPreview;
    if (!preview) return;
    const { type, value } = preview;
    let custKey = type === 'outfit' ? 'outfit' : type;
    if (type === 'bowtie') custKey = 'bowtie';
    equipItem(custKey, value);
    cancelPreview();
    markOwnedItems();
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
    const savedToken = localStorage.getItem('beimax_token');
    if (savedToken) {
        // Hay sesión guardada: verificar con getUserProfile (que sí lanza error en 401/403)
        gameState.token = savedToken;
        getUserProfile(savedToken)
            .then(() => loadProfile())
            .then(() => { showDashboard(); initAllRobotTilts(); })
            .catch(() => {
                // Token expirado o backend no disponible → mostrar login
                localStorage.removeItem('beimax_token');
                gameState.token = null;
                showScreen('authScreen');
            });
    } else {
        // Sin sesión guardada - mostrar login
        showScreen('authScreen');
    }

    document.getElementById('loginPassword')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin();
    });

    document.getElementById('imgAnswerName')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkImageAnswer();
    });

    document.getElementById('quizAnswerInput')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') submitOnlineEnglishAnswer();
    });

    onOnlineQuizCategoryModeChange();
});
