// ============================================
// Backend Service - Comunicación con el backend
// ============================================

const BACKEND_CONFIG = {
    // Si se abre desde archivo local (file://), usar localhost:3000 por defecto
    baseURL: (window.location.protocol === 'file:' || !window.location.host) 
        ? 'http://localhost:3000' 
        : `${window.location.protocol}//${window.location.host}`,
    endpoints: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: '/api/auth/reset-password',
        profile: '/api/user/profile',
        updateLanguages: '/api/user/languages',
        updateCustomization: '/api/user/customization',
        saveGameResult: '/api/game/result',
        getProgress: '/api/user/progress', getStreakHistory: '/api/user/streak-history',
        getAchievements: '/api/user/achievements',
        unlockAchievement: '/api/user/achievement',
        checkin: '/api/user/checkin'
    }
};

// Token de autenticación
let authToken = localStorage.getItem('beimaxAuthToken');

// ========== Funciones de Autenticación ==========

async function registerUser(username, email, password, characterName, age, gender, robotType) {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.register}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, characterName, age, gender, robotType: robotType || 'classic' })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al registrar usuario');
        }

        // Guardar token
        authToken = data.token;
        localStorage.setItem('beimaxAuthToken', data.token);
        localStorage.setItem('beimaxUser', JSON.stringify(data.user));

        return data;
    } catch (error) {
        console.error('Error en registro:', error);
        throw error;
    }
}

async function loginUser(username, password) {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.login}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }

        // Guardar token
        authToken = data.token;
        localStorage.setItem('beimaxAuthToken', data.token);
        localStorage.setItem('beimaxUser', JSON.stringify(data.user));

        return data;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
}

async function forgotPassword(identifier) {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.forgotPassword}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ identifier })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'No se pudo iniciar recuperación de contraseña');
        }
        return data;
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        throw error;
    }
}

async function resetPassword(identifier, code, newPassword) {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.resetPassword}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ identifier, code, newPassword })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'No se pudo restablecer la contraseña');
        }
        return data;
    } catch (error) {
        console.error('Error en resetPassword:', error);
        throw error;
    }
}

function logoutUser() {
    authToken = null;
    localStorage.removeItem('beimaxAuthToken');
    localStorage.removeItem('beimaxUser');
    localStorage.removeItem('beimaxGameState');
}

function isUserLoggedIn() {
    return authToken !== null;
}

function getCurrentUser() {
    const userStr = localStorage.getItem('beimaxUser');
    return userStr ? JSON.parse(userStr) : null;
}

// ========== Check-in diario (rachas) ==========
async function dailyCheckin(token) {
    const tkn = token || authToken;
    const today = new Date();
    const clientDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
    
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.checkin}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tkn}`
            },
            body: JSON.stringify({ clientDate })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error en check-in');
        return data;
    } catch (e) {
        console.error('Error en check-in:', e);
        return null;
    }
}

// ========== Funciones de Perfil ==========

async function getUserProfile(token) {
    const tkn = token || authToken;
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.profile}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tkn}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener perfil');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        throw error;
    }
}

async function updateUserLanguages(nativeLanguage, learningLanguage) {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.updateLanguages}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nativeLanguage, learningLanguage })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar idiomas');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al actualizar idiomas:', error);
        throw error;
    }
}

async function updateRobotType(token, robotType) {
    const tkn = token || authToken;
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}/api/user/robot-type`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${tkn}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ robotType })
        });
        if (!response.ok) throw new Error('Error al actualizar tipo de robot');
        return await response.json();
    } catch (error) {
        console.error('Error al actualizar tipo de robot:', error);
        throw error;
    }
}

async function updateRobotCustomization(token, customization, inventory) {
    const tkn = token || authToken;
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.updateCustomization}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${tkn}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customization, inventory })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar personalización');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al actualizar personalización:', error);
        throw error;
    }
}

// ========== Funciones de Progreso ==========

async function saveGameResult(token, gameData) {
    const tkn = token || authToken;
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.saveGameResult}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tkn}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameData)
        });

        if (!response.ok) {
            throw new Error('Error al guardar resultado');
        }

        const result = await response.json();
        
        // Si hay level up, mostrar notificación
        if (result.levelUp) {
            showLevelUpNotification(result.newLevel, result.bonusCoins);
        }

        return result;
    } catch (error) {
        console.error('Error al guardar resultado:', error);
        throw error;
    }
}

async function getCategoryProgress() {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.getProgress}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener progreso');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al obtener progreso:', error);
        throw error;
    }
}

async function getStreakHistory() {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.getStreakHistory}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener historial de rachas');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al obtener historial:', error);
        throw error;
    }
}

// ========== Funciones de Logros ==========

async function getUserAchievements() {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.getAchievements}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener logros');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al obtener logros:', error);
        throw error;
    }
}

async function unlockAchievement(achievementType) {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}${BACKEND_CONFIG.endpoints.unlockAchievement}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ achievementType })
        });

        if (!response.ok) {
            throw new Error('Error al desbloquear logro');
        }

        const result = await response.json();
        showAchievementNotification(achievementType);
        return result;
    } catch (error) {
        console.error('Error al desbloquear logro:', error);
        throw error;
    }
}

// ========== Funciones de UI ==========

function showLevelUpNotification(level, bonusCoins) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">🎉</div>
        <div class="achievement-content">
            <h4>¡Nivel ${level}!</h4>
            <p>Has subido de nivel. +${bonusCoins} monedas de bonificación</p>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

function showAchievementNotification(achievementType) {
    const achievements = {
        'first_game': { icon: '🎮', title: 'Primer Juego', desc: 'Has completado tu primer juego' },
        'streak_7': { icon: '🔥', title: 'Racha de 7 días', desc: '¡7 días consecutivos jugando!' },
        'streak_30': { icon: '🏆', title: 'Mes Completo', desc: '¡30 días consecutivos!' },
        'level_10': { icon: '⭐', title: 'Nivel 10', desc: 'Has alcanzado el nivel 10' },
        'level_25': { icon: '💫', title: 'Nivel 25', desc: 'Has alcanzado el nivel 25' },
        '100_correct': { icon: '✅', title: '100 Respuestas', desc: '100 respuestas correctas' },
        '500_correct': { icon: '🎯', title: '500 Respuestas', desc: '500 respuestas correctas' },
        'category_master': { icon: '👑', title: 'Maestro', desc: 'Dominaste una categoría' }
    };
    
    const achievement = achievements[achievementType] || { icon: '🏅', title: 'Logro', desc: 'Has desbloqueado un logro' };
    
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
            <h4>${achievement.title}</h4>
            <p>${achievement.desc}</p>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// ========== Verificar conexión con backend ==========

async function checkBackendConnection() {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseURL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        return response.ok;
    } catch (error) {
        console.error('Backend no disponible:', error);
        return false;
    }
}
