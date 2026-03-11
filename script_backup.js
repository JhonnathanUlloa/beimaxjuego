/* ==============================================
   BEIMAX - SCRIPT PRINCIPAL
   Juego educativo de aprendizaje de idiomas
============================================== */

// ========== ESTADO DEL JUEGO ==========
const gameState = {
    user: null,
    token: null,
    selectedGender: null,
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
    }
};

// ========== OBJETOS POR CATEGORÍA E IDIOMA ==========
const categoryData = {
    kitchen: {
        name: { es: 'Cocina', en: 'Kitchen', fr: 'Cuisine', zh: '厨房' },
        items: [
            {emoji:'🔪', es:'cuchillo', en:'knife', fr:'couteau', zh:'刀',
             pron_es:'ku-CHI-yo', pron_en:'naif', pron_fr:'ku-TÓ', pron_zh:'dāo'},
            {emoji:'🍴', es:'tenedor', en:'fork', fr:'fourchette', zh:'叉子',
             pron_es:'te-ne-DOR', pron_en:'fork', pron_fr:'fur-SHET', pron_zh:'chā zi'},
            {emoji:'🥄', es:'cuchara', en:'spoon', fr:'cuillère', zh:'勺子',
             pron_es:'ku-CHA-ra', pron_en:'spuun', pron_fr:'kui-ÉR', pron_zh:'sháo zi'},
            {emoji:'🍳', es:'sartén', en:'pan', fr:'poêle', zh:'平底锅',
             pron_es:'sar-TÉN', pron_en:'pan', pron_fr:'pual', pron_zh:'píng dǐ guō'},
            {emoji:'🫖', es:'tetera', en:'teapot', fr:'théière', zh:'茶壶',
             pron_es:'te-TE-ra', pron_en:'tíi-pot', pron_fr:'te-IÉR', pron_zh:'chá hú'},
            {emoji:'🍽️', es:'plato', en:'plate', fr:'assiette', zh:'盘子',
             pron_es:'PLA-to', pron_en:'pleit', pron_fr:'a-SIÉT', pron_zh:'pán zi'},
            {emoji:'🥛', es:'vaso', en:'glass', fr:'verre', zh:'杯子',
             pron_es:'BA-so', pron_en:'glas', pron_fr:'ver', pron_zh:'bēi zi'},
            {emoji:'🧊', es:'hielo', en:'ice', fr:'glace', zh:'冰',
             pron_es:'IE-lo', pron_en:'ais', pron_fr:'glas', pron_zh:'bīng'}
        ]
    },
    office: {
        name: { es: 'Oficina', en: 'Office', fr: 'Bureau', zh: '办公室' },
        items: [
            {emoji:'💻', es:'computadora', en:'computer', fr:'ordinateur', zh:'电脑',
             pron_es:'kom-pu-ta-DO-ra', pron_en:'com-PIUU-ter', pron_fr:'or-di-na-TÉR', pron_zh:'diàn nǎo'},
            {emoji:'⌨️', es:'teclado', en:'keyboard', fr:'clavier', zh:'键盘',
             pron_es:'te-KLA-do', pron_en:'kíi-bord', pron_fr:'kla-VIÉ', pron_zh:'jiàn pán'},
            {emoji:'🖱️', es:'ratón', en:'mouse', fr:'souris', zh:'鼠标',
             pron_es:'ra-TÓN', pron_en:'maus', pron_fr:'su-RÍ', pron_zh:'shǔ biāo'},
            {emoji:'📱', es:'teléfono', en:'phone', fr:'téléphone', zh:'手机',
             pron_es:'te-LÉ-fo-no', pron_en:'foun', pron_fr:'te-le-FON', pron_zh:'shǒu jī'},
            {emoji:'📎', es:'clip', en:'paperclip', fr:'trombone', zh:'回形针',
             pron_es:'klip', pron_en:'PEI-per-klip', pron_fr:'trom-BON', pron_zh:'huí xíng zhēn'},
            {emoji:'✏️', es:'lápiz', en:'pencil', fr:'crayon', zh:'铅笔',
             pron_es:'LÁ-pis', pron_en:'PEN-sil', pron_fr:'kre-IÓN', pron_zh:'qiān bǐ'},
            {emoji:'📒', es:'cuaderno', en:'notebook', fr:'cahier', zh:'笔记本',
             pron_es:'kua-DER-no', pron_en:'NOUT-buk', pron_fr:'ka-IÉ', pron_zh:'bǐ jì běn'},
            {emoji:'🖨️', es:'impresora', en:'printer', fr:'imprimante', zh:'打印机',
             pron_es:'im-pre-SO-ra', pron_en:'PRIN-ter', pron_fr:'im-pri-MANT', pron_zh:'dǎ yìn jī'}
        ]
    },
    workshop: {
        name: { es: 'Taller', en: 'Workshop', fr: 'Atelier', zh: '工作坊' },
        items: [
            {emoji:'🔨', es:'martillo', en:'hammer', fr:'marteau', zh:'锤子',
             pron_es:'mar-TI-yo', pron_en:'JA-mer', pron_fr:'mar-TÓ', pron_zh:'chuí zi'},
            {emoji:'🪛', es:'destornillador', en:'screwdriver', fr:'tournevis', zh:'螺丝刀',
             pron_es:'des-tor-ni-ya-DOR', pron_en:'SKRUU-drai-ver', pron_fr:'tur-ne-VÍS', pron_zh:'luó sī dāo'},
            {emoji:'🔧', es:'llave', en:'wrench', fr:'clé', zh:'扳手',
             pron_es:'YA-ve', pron_en:'rench', pron_fr:'klé', pron_zh:'bān shǒu'},
            {emoji:'🪚', es:'sierra', en:'saw', fr:'scie', zh:'锯子',
             pron_es:'SIE-ra', pron_en:'so', pron_fr:'sí', pron_zh:'jù zi'},
            {emoji:'📏', es:'regla', en:'ruler', fr:'règle', zh:'尺子',
             pron_es:'RE-gla', pron_en:'RUU-ler', pron_fr:'regl', pron_zh:'chǐ zi'},
            {emoji:'🧲', es:'imán', en:'magnet', fr:'aimant', zh:'磁铁',
             pron_es:'i-MÁN', pron_en:'MAG-net', pron_fr:'e-MÁN', pron_zh:'cí tiě'},
            {emoji:'🔩', es:'tornillo', en:'screw', fr:'vis', zh:'螺丝',
             pron_es:'tor-NI-yo', pron_en:'skruu', pron_fr:'vís', pron_zh:'luó sī'},
            {emoji:'🪣', es:'cubo', en:'bucket', fr:'seau', zh:'桶',
             pron_es:'KU-bo', pron_en:'BA-ket', pron_fr:'só', pron_zh:'tǒng'}
        ]
    },
    home: {
        name: { es: 'Hogar', en: 'Home', fr: 'Maison', zh: '家' },
        items: [
            {emoji:'🛋️', es:'sofá', en:'sofa', fr:'canapé', zh:'沙发',
             pron_es:'so-FÁ', pron_en:'SOU-fa', pron_fr:'ka-na-PÉ', pron_zh:'shā fā'},
            {emoji:'🪑', es:'silla', en:'chair', fr:'chaise', zh:'椅子',
             pron_es:'SI-ya', pron_en:'cher', pron_fr:'shez', pron_zh:'yǐ zi'},
            {emoji:'🛏️', es:'cama', en:'bed', fr:'lit', zh:'床',
             pron_es:'KA-ma', pron_en:'bed', pron_fr:'lí', pron_zh:'chuáng'},
            {emoji:'🪟', es:'ventana', en:'window', fr:'fenêtre', zh:'窗户',
             pron_es:'ben-TA-na', pron_en:'UÍN-dou', pron_fr:'fe-NÉTR', pron_zh:'chuāng hu'},
            {emoji:'🚪', es:'puerta', en:'door', fr:'porte', zh:'门',
             pron_es:'PUER-ta', pron_en:'dor', pron_fr:'port', pron_zh:'mén'},
            {emoji:'💡', es:'lámpara', en:'lamp', fr:'lampe', zh:'灯',
             pron_es:'LÁM-pa-ra', pron_en:'lamp', pron_fr:'lamp', pron_zh:'dēng'},
            {emoji:'📺', es:'televisor', en:'television', fr:'télévision', zh:'电视',
             pron_es:'te-le-vi-SOR', pron_en:'TEL-e-vi-shon', pron_fr:'te-le-vi-SIÓN', pron_zh:'diàn shì'},
            {emoji:'🪞', es:'espejo', en:'mirror', fr:'miroir', zh:'镜子',
             pron_es:'es-PE-jo', pron_en:'MÍ-ror', pron_fr:'mi-RUÁR', pron_zh:'jìng zi'}
        ]
    }
};

const langNames = {
    es: 'Español', en: 'English', fr: 'Français', zh: '中文'
};

// Outfit definitions now in skins.js via getOutfitData()
// Legacy wrapper for compatibility
function getOutfitInfo(value) {
    if (typeof getOutfitData === 'function') return getOutfitData(value);
    return { bodyColor: '#E74856', hat: 'none', glasses: 'none', bowtie: 'none' };
}

// Word synonyms for more flexible answers
const wordSynonyms = {
    // English synonyms
    en: {
        'knife': ['knife', 'cutter'],
        'fork': ['fork'],
        'spoon': ['spoon'],
        'pan': ['pan', 'frying pan', 'skillet'],
        'teapot': ['teapot', 'tea pot'],
        'plate': ['plate', 'dish'],
        'glass': ['glass', 'cup'],
        'ice': ['ice'],
        'computer': ['computer', 'pc'],
        'keyboard': ['keyboard'],
        'mouse': ['mouse'],
        'phone': ['phone', 'telephone', 'cellphone', 'mobile'],
        'paperclip': ['paperclip', 'paper clip', 'clip'],
        'pencil': ['pencil'],
        'notebook': ['notebook', 'note book'],
        'printer': ['printer'],
        'hammer': ['hammer'],
        'screwdriver': ['screwdriver', 'screw driver'],
        'wrench': ['wrench', 'spanner'],
        'saw': ['saw'],
        'ruler': ['ruler'],
        'magnet': ['magnet'],
        'screw': ['screw'],
        'bucket': ['bucket', 'pail'],
        'sofa': ['sofa', 'couch'],
        'chair': ['chair'],
        'bed': ['bed'],
        'window': ['window'],
        'door': ['door'],
        'lamp': ['lamp', 'light'],
        'television': ['television', 'tv', 'telly'],
        'mirror': ['mirror']
    }
};

// ========== AUTH FUNCTIONS ==========

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function selectGender(gender) {
    gameState.selectedGender = gender;
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.gender-btn[data-gender="${gender}"]`).classList.add('selected');
}

async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!username || !password) return showNotif('⚠️', 'Completa todos los campos');

    try {
        const res = await loginUser(username, password);
        gameState.token = res.token;
        gameState.user = res.user;
        localStorage.setItem('beimax_token', res.token);
        await loadProfile();
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

    if (!username || !email || !password || !charName || !age || !gender) {
        return showNotif('⚠️', 'Completa todos los campos');
    }
    if (password.length < 6) return showNotif('⚠️', 'La contraseña debe tener al menos 6 caracteres');

    try {
        const res = await registerUser(username, email, password, charName, parseInt(age), gender);
        gameState.token = res.token;
        gameState.user = res.user;
        gameState.charName = charName;
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
                console.log('No inventory found, using defaults');
            }
        }
        updateDashboard();
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

    applyRobotCustomization('dash');
}

// ========== NAVIGATION ==========

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
}

function showDashboard() {
    updateDashboard();
    showScreen('dashboardScreen');
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
    // Apply current customization to shop robot
    applyRobotCustomization('shop');
    showScreen('shopScreen');
}

function exitShop() {
    // Cancel any pending preview
    if (gameState.shopPreview) {
        cancelPreview();
    }
    showDashboard();
}

function showCustomizationScreen() {
    applyRobotCustomization('custom');
    showScreen('customizationScreen');
}

function showStatsScreen() {
    document.getElementById('statGames').textContent = gameState.totalGames;
    document.getElementById('statCorrect').textContent = gameState.totalCorrect;
    document.getElementById('statBestStreak').textContent = gameState.longestStreak;
    document.getElementById('statLevel').textContent = gameState.level;
    showScreen('statsScreen');
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

// ========== IMAGE MODE (CON CRONÓMETRO) ==========

function startImageMode() {
    const cat = gameState.currentCategory;
    const items = categoryData[cat]?.items;
    if (!items) return showNotif('❌', 'Categoría no encontrada');

    gameState.imgWords = shuffleArray([...items]);
    gameState.imgIndex = 0;
    gameState.imgScore = 0;
    gameState.imgLives = 3;
    gameState.imgCoins = 0;

    showScreen('imageModeScreen');
    document.getElementById('imgTotal').textContent = gameState.imgWords.length;
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

    let details = `<strong>⏰ ¡Se acabó el tiempo!</strong><br>`;
    details += `<strong>Palabra correcta:</strong> ${item[learning]}<br>`;
    details += `<strong>Pronunciación:</strong> ${item['pron_' + learning]}`;

    document.getElementById('imgResultIcon').textContent = '⏰';
    document.getElementById('imgResultText').textContent = '¡Tiempo agotado!';
    document.getElementById('imgResultText').className = 'result-main result-wrong';
    document.getElementById('imgResultDetails').innerHTML = details;
    document.getElementById('imgLives').textContent = s.imgLives;

    document.getElementById('imgAnswerSection').style.display = 'none';
    document.getElementById('imgResult').style.display = 'block';
}

function getTimeBonus() {
    const elapsed = (Date.now() - gameState.questionStartTime) / 1000;
    if (elapsed < 5) return { coins: 3, label: '⚡ Rapidísimo +3 🪙' };
    if (elapsed < 10) return { coins: 2, label: '🏃 Rápido +2 🪙' };
    if (elapsed < 15) return { coins: 1, label: '👍 Bien +1 🪙' };
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
    document.getElementById('imgAnswerPronunciation').value = '';
    document.getElementById('imgAnswerSection').style.display = 'block';
    document.getElementById('imgResult').style.display = 'none';
    document.getElementById('imgObjectCard').style.animation = 'none';
    setTimeout(() => document.getElementById('imgObjectCard').style.animation = 'cardPop 0.4s ease', 10);
    document.getElementById('imgAnswerName').focus();

    // Start timer
    startTimer();
}

function checkImageAnswer() {
    stopTimer();

    const s = gameState;
    const item = s.imgWords[s.imgIndex];
    const learning = s.learningLanguage;

    const userWord = document.getElementById('imgAnswerName').value.trim().toLowerCase();
    const userPron = document.getElementById('imgAnswerPronunciation').value.trim().toLowerCase();

    if (!userWord) return showNotif('⚠️', 'Escribe la palabra');

    const correctWord = item[learning].toLowerCase();
    const correctPron = item['pron_' + learning].toLowerCase();

    // Check for synonyms
    const synonyms = wordSynonyms[learning]?.[correctWord] || [correctWord];
    const wordCorrect = synonyms.some(syn => normalizeStr(userWord) === normalizeStr(syn));
    const pronCorrect = userPron ? similarEnough(userPron, correctPron) : false;

    let points = 0;
    let coinReward = 0;
    let resultIcon, resultText, resultClass;
    let timeBonus = { coins: 0, label: '' };

    if (wordCorrect && pronCorrect) {
        points = 2; coinReward = 5;
        timeBonus = getTimeBonus();
        resultIcon = '🌟'; resultText = '¡Perfecto!'; resultClass = 'result-correct';
    } else if (wordCorrect) {
        points = 1; coinReward = 3;
        timeBonus = getTimeBonus();
        resultIcon = '✅'; resultText = '¡Palabra correcta!'; resultClass = 'result-correct';
    } else {
        s.imgLives--;
        resultIcon = '❌'; resultText = 'Incorrecto'; resultClass = 'result-wrong';
    }

    coinReward += timeBonus.coins;
    s.imgScore += points;
    s.imgCoins += coinReward;

    let details = `<strong>Palabra correcta:</strong> ${item[learning]}<br>`;
    details += `<strong>Pronunciación:</strong> ${item['pron_' + learning]}<br>`;
    if (wordCorrect && !pronCorrect && userPron) {
        details += `<em>Tu pronunciación no coincidió exactamente</em><br>`;
    }
    if (timeBonus.label) {
        details += `<br>${timeBonus.label}`;
    }
    if (coinReward > 0) {
        details += `<br>+${coinReward} 🪙 | +${points * 15} XP`;
    }

    document.getElementById('imgResultIcon').textContent = resultIcon;
    document.getElementById('imgResultText').textContent = resultText;
    document.getElementById('imgResultText').className = 'result-main ' + resultClass;
    document.getElementById('imgResultDetails').innerHTML = details;
    document.getElementById('imgLives').textContent = s.imgLives;
    document.getElementById('imgScore').textContent = s.imgScore;
    document.getElementById('imgCoins').textContent = s.imgCoins;

    document.getElementById('imgAnswerSection').style.display = 'none';
    document.getElementById('imgResult').style.display = 'block';
}

function nextImageQuestion() {
    gameState.imgIndex++;
    showImageQuestion();
}

function endImageMode() {
    stopTimer();
    const s = gameState;
    const total = s.imgWords.length;

    gameState.coins += s.imgCoins;
    const xpEarned = s.imgScore * 15;
    addExperience(xpEarned);
    gameState.totalGames++;
    gameState.totalCorrect += s.imgScore;

    saveProgress();

    document.getElementById('imgObjectCard').style.display = 'none';
    document.getElementById('imgAnswerSection').style.display = 'none';

    // Hide timer
    document.getElementById('timerStat').style.display = 'none';
    document.querySelector('.timer-bar-wrapper').style.display = 'none';

    const pct = Math.round((s.imgScore / (total * 2)) * 100);
    let emoji = '🏆';
    if (pct < 30) emoji = '😢';
    else if (pct < 60) emoji = '😊';
    else if (pct < 90) emoji = '🎉';

    document.getElementById('imgResultIcon').textContent = emoji;
    document.getElementById('imgResultText').textContent = `¡Partida terminada!`;
    document.getElementById('imgResultText').className = 'result-main';
    document.getElementById('imgResultDetails').innerHTML = `
        <strong>Puntuación:</strong> ${s.imgScore} / ${total * 2}<br>
        <strong>Porcentaje:</strong> ${pct}%<br>
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
}

function exitImageMode() {
    stopTimer();
    showScreen('gameModeScreen');
}

// ========== STUDY MODE ==========

function startStudyMode() {
    const cat = gameState.currentCategory;
    const items = categoryData[cat]?.items;
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
    document.getElementById('studyPronunciation').textContent = '🔊 ' + item['pron_' + learning];
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
        gameState.cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('webcam1').srcObject = gameState.cameraStream;
        gameState.mode1Score = 0;
        document.getElementById('scoreMode1').textContent = '0';
        document.getElementById('coinsAmount3').textContent = gameState.coins;
        showScreen('gameMode1Screen');
        requestNewObject();
    } catch (e) {
        showNotif('❌', 'No se pudo acceder a la cámara. Usa el Modo Imagen.');
    }
}

function requestNewObject() {
    const items = categoryData[gameState.currentCategory]?.items;
    if (!items) return;
    const item = items[Math.floor(Math.random() * items.length)];
    gameState.requestedObj = item;
    document.getElementById('requestedObject').textContent =
        item[gameState.nativeLanguage] + ' (' + item[gameState.learningLanguage] + ')';
}

async function captureMode1() {
    const video = document.getElementById('webcam1');
    const canvas = document.getElementById('canvas1');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const resultEl = document.getElementById('resultMode1');
    resultEl.style.display = 'block';
    resultEl.style.background = 'rgba(34,197,94,0.1)';
    resultEl.style.color = '#22c55e';
    resultEl.textContent = '✅ ¡Correcto! +3 🪙';
    gameState.mode1Score++;
    gameState.coins += 3;
    addExperience(15);
    document.getElementById('scoreMode1').textContent = gameState.mode1Score;
    document.getElementById('coinsAmount3').textContent = gameState.coins;

    setTimeout(() => {
        resultEl.style.display = 'none';
        requestNewObject();
    }, 2000);
}

function skipObject() { requestNewObject(); }

function exitGame() {
    if (gameState.cameraStream) {
        gameState.cameraStream.getTracks().forEach(t => t.stop());
        gameState.cameraStream = null;
    }
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
    if (price > 0) {
        label.textContent = `Previsualizando... (${price} 🪙)`;
    } else {
        label.textContent = 'Previsualizando... (Gratis)';
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

    // Check if already owned
    if (invCategory && gameState.inventory[invCategory] && gameState.inventory[invCategory].includes(value)) {
        showNotif('ℹ️', 'Ya tienes este item');
        cancelPreview();
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

function changeBodyColor(color, cost) {
    // Check if already owned
    if (gameState.inventory.bodyColors.includes(color)) {
        gameState.customization.bodyColor = color;
        applyRobotCustomization('custom');
        saveCustomization();
        return;
    }
    // Need to purchase
    if (cost > 0 && gameState.coins < cost) {
        return showNotif('❌', `Necesitas ${cost} 🪙`);
    }
    if (cost > 0) gameState.coins -= cost;
    gameState.inventory.bodyColors.push(color);
    gameState.customization.bodyColor = color;
    applyRobotCustomization('custom');
    saveCustomization();
}

function changeEyeColor(color, cost) {
    // Check if already owned
    if (gameState.inventory.eyeColors.includes(color)) {
        gameState.customization.eyeColor = color;
        applyRobotCustomization('custom');
        saveCustomization();
        return;
    }
    // Need to purchase
    if (cost > 0 && gameState.coins < cost) {
        return showNotif('❌', `Necesitas ${cost} 🪙`);
    }
    if (cost > 0) gameState.coins -= cost;
    gameState.inventory.eyeColors.push(color);
    gameState.customization.eyeColor = color;
    applyRobotCustomization('custom');
    saveCustomization();
}

function applyRobotCustomization(prefix) {
    const c = gameState.customization;

    // Determine element IDs based on prefix
    let bodyId, eyeIds, hatId, glassId, bowId, earringIds, shoeIds, robotId;

    if (prefix === 'custom') {
        bodyId = 'customBody';
        eyeIds = ['customEyeLeft', 'customEyeRight'];
        hatId = 'robotHat';
        glassId = 'robotGlasses';
        bowId = 'robotBowtie';
        earringIds = ['customEarringL', 'customEarringR'];
        shoeIds = ['customShoeL', 'customShoeR'];
        robotId = 'customRobot';
    } else if (prefix === 'shop') {
        bodyId = 'shopRobotBody';
        eyeIds = ['shopEyeL', 'shopEyeR'];
        hatId = 'shopRobotHat';
        glassId = 'shopRobotGlasses';
        bowId = 'shopRobotBowtie';
        earringIds = ['shopEarringL', 'shopEarringR'];
        shoeIds = ['shopShoeL', 'shopShoeR'];
        robotId = 'shopRobot';
    } else {
        bodyId = 'dashRobotBody';
        eyeIds = ['dashEyeL', 'dashEyeR'];
        hatId = 'dashRobotHat';
        glassId = 'dashRobotGlasses';
        bowId = 'dashRobotBowtie';
        earringIds = ['dashEarringL', 'dashEarringR'];
        shoeIds = ['dashShoeL', 'dashShoeR'];
        robotId = 'dashRobot';
    }

    // Body color
    const body = document.getElementById(bodyId);
    if (body) {
        body.style.background = `linear-gradient(180deg, ${c.bodyColor} 0%, ${darkenColor(c.bodyColor, 15)} 100%)`;
        // Apply outfit overlay SVG
        const overlayId = prefix === 'custom' ? 'customOutfitOverlay' : (prefix === 'shop' ? 'shopOutfitOverlay' : 'dashOutfitOverlay');
        const overlayEl = document.getElementById(overlayId);
        if (overlayEl) {
            if (c.outfit && c.outfit !== 'none' && typeof SKINS !== 'undefined' && SKINS.outfits[c.outfit]) {
                injectSkin(overlayEl, SKINS.outfits[c.outfit].overlay);
            } else {
                overlayEl.innerHTML = '';
            }
        }
    }

    // Eyes
    eyeIds.forEach(id => {
        const e = document.getElementById(id);
        if (e) {
            e.style.background = `radial-gradient(circle at 35% 35%, ${lightenColor(c.eyeColor, 20)}, ${c.eyeColor})`;
            e.style.boxShadow = `0 0 10px ${c.eyeColor}80, 0 0 20px ${c.eyeColor}33`;
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

    // Arms, legs, waist same color as body (darker)
    const robot = document.getElementById(robotId);
    if (robot) {
        const darkerColor = darkenColor(c.bodyColor, 22);
        robot.querySelectorAll('.robot-arm').forEach(a => {
            a.style.background = `linear-gradient(180deg, ${darkenColor(c.bodyColor, 15)} 0%, ${darkerColor} 100%)`;
        });
        robot.querySelectorAll('.robot-leg').forEach(l => {
            l.style.background = `linear-gradient(180deg, ${darkenColor(c.bodyColor, 15)} 0%, ${darkerColor} 100%)`;
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
    if (Math.abs(na.length - nb.length) > 3) return false;
    let diff = 0;
    const maxLen = Math.max(na.length, nb.length);
    for (let i = 0; i < maxLen; i++) {
        if (na[i] !== nb[i]) diff++;
    }
    return diff <= 2;
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('beimax_token');
    if (saved) {
        gameState.token = saved;
        loadProfile().then(() => {
            showDashboard();
        }).catch(() => {
            localStorage.removeItem('beimax_token');
            showScreen('authScreen');
        });
    }

    document.getElementById('loginPassword')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin();
    });

    document.getElementById('imgAnswerPronunciation')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkImageAnswer();
    });

    document.getElementById('imgAnswerName')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('imgAnswerPronunciation').focus();
    });
});
