require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'beimax-secret-key-change-in-production';

// ========== LM Studio / DeepSeek R1 Config ==========
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://172.20.10.4:1234';

// Helper: Strip DeepSeek R1 <think> reasoning tags from response
function stripThinkTags(text) {
    if (!text) return '';
    // Remove complete <think>...</think> blocks
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    // Remove unclosed <think> block (model ran out of tokens while thinking)
    cleaned = cleaned.replace(/<think>[\s\S]*/gi, '').trim();
    return cleaned;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Servir archivos estáticos desde la carpeta raíz del proyecto
app.use(express.static(path.join(__dirname, '..')));

// ========== Base de Datos ==========
const dbPath = path.join(__dirname, 'beimax.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err);
    } else {
        console.log('✅ Base de datos conectada');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Tabla de usuarios
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                character_name TEXT DEFAULT 'BeiBot',
                age INTEGER DEFAULT 10,
                gender TEXT DEFAULT 'other',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de perfiles de usuario
        db.run(`
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id INTEGER PRIMARY KEY,
                native_language TEXT DEFAULT 'es',
                learning_language TEXT DEFAULT 'en',
                coins INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                experience INTEGER DEFAULT 0,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_play_date DATE,
                total_games_played INTEGER DEFAULT 0,
                total_correct_answers INTEGER DEFAULT 0,
                total_wrong_answers INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de personalización del robot
        db.run(`
            CREATE TABLE IF NOT EXISTS robot_customization (
                user_id INTEGER PRIMARY KEY,
                body_color TEXT DEFAULT '#E74856',
                eye_color TEXT DEFAULT '#E74856',
                hat TEXT DEFAULT NULL,
                glasses TEXT DEFAULT NULL,
                bowtie TEXT DEFAULT NULL,
                earring TEXT DEFAULT NULL,
                shoes TEXT DEFAULT NULL,
                outfit TEXT DEFAULT 'none',
                inventory TEXT DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de progreso por categoría
        db.run(`
            CREATE TABLE IF NOT EXISTS category_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                category TEXT NOT NULL,
                level INTEGER DEFAULT 1,
                games_played INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de logros
        db.run(`
            CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                achievement_type TEXT NOT NULL,
                unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de historial de rachas
        db.run(`
            CREATE TABLE IF NOT EXISTS streak_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date DATE NOT NULL,
                games_played INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Migration: Add inventory column if it doesn't exist
        db.run(`
            ALTER TABLE robot_customization ADD COLUMN inventory TEXT DEFAULT NULL
        `, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.log('⚠️  Error adding inventory column (may already exist):', err.message);
            }
        });

        // Migration: Add outfit column if it doesn't exist
        db.run(`
            ALTER TABLE robot_customization ADD COLUMN outfit TEXT DEFAULT 'none'
        `, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.log('⚠️  Error adding outfit column (may already exist):', err.message);
            }
        });

        // Migration: Add robot_type column if it doesn't exist
        db.run(`
            ALTER TABLE users ADD COLUMN robot_type TEXT DEFAULT 'classic'
        `, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.log('⚠️  Error adding robot_type column (may already exist):', err.message);
            }
        });

        // Migration: Add unique index on streak_history (user_id, date) for ON CONFLICT
        db.run(`
            DELETE FROM streak_history WHERE id NOT IN (
                SELECT MIN(id) FROM streak_history GROUP BY user_id, date
            )
        `);

        db.run(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_streak_history_user_date
            ON streak_history(user_id, date)
        `, (err) => {
            if (err) {
                console.log('⚠️  streak_history index:', err.message);
            }
        });

        // Tabla de datos de batalla
        db.run(`
            CREATE TABLE IF NOT EXISTS battle_data (
                user_id INTEGER PRIMARY KEY,
                battle_inventory TEXT DEFAULT '{"weapons":[],"shields":[],"modules":[]}',
                battle_equipment TEXT DEFAULT '{"weapon":null,"shield":null,"module":null}',
                selected_moves TEXT DEFAULT '[]',
                battle_wins INTEGER DEFAULT 0,
                battle_losses INTEGER DEFAULT 0,
                battle_rating INTEGER DEFAULT 1000,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, () => {
            console.log('✅ Tablas de base de datos inicializadas');
            // Crear usuario admin cuando el esquema ya está listo
            createAdminUser();
        });
    });
}

async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt.hash('admin', 10);

        // Full inventory with every item unlocked
        const adminInventory = JSON.stringify({
            outfits:      ['none','tuxedo','ninja','astronaut','wizard','pirate','knight','superhero','scientist','samurai'],
            hats:         ['none','top_hat','crown','cap','wizard_hat','pirate_hat','santa_hat','viking_helmet','beanie','halo','chef_hat','headband','party_hat'],
            glasses:      ['none','round','sunglasses','vr_headset','steampunk','heart_glasses','monocle','cyber_visor'],
            accessories:  ['none','bowtie','tie','chain','cape','scarf','bandana','medal'],
            earrings:     ['none','diamond','hoop_gold','star','ruby','led_rgb','lightning','pearl','skull'],
            shoes:        ['none','sneakers','boots','rocket','roller','wings','sandals','high_tops','slippers'],
            bodyColors:   ['#E74856','#00FF9F','#00C8FF','#7000FF','#FFE000','#FF003C','#FF6B00','#FFFFFF','#222244'],
            eyeColors:    ['#E74856','#00FF9F','#00C8FF','#7000FF','#FFE000','#FF003C','#FFFFFF','#FF69B4']
        });

        const adminBattleInventory = JSON.stringify({
            weapons:  ['plasma_blade','thunder_cannon','frost_lance','shadow_claw','solar_beam'],
            shields:  ['nano_shield','titan_plate','phase_barrier'],
            modules:  ['overclock','medkit','emp_burst']
        });

        db.run(
            `INSERT OR IGNORE INTO users (username, email, password, character_name, age, gender, robot_type)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['admin', 'admin@beimax.com', hashedPassword, 'ADMIN', 99, 'other', 'tank'],
            function(err) {
                if (err) {
                    console.log('⚠️  Usuario admin ya existe:', err.message);
                } else if (this.lastID) {
                    const userId = this.lastID;
                    db.run(
                        `INSERT INTO user_profiles
                         (user_id, coins, level, experience, total_correct_answers, total_games_played)
                         VALUES (?, 999999, 99, 0, 9999, 999)`,
                        [userId]
                    );
                    db.run(
                        `INSERT INTO robot_customization
                         (user_id, body_color, eye_color, inventory)
                         VALUES (?, ?, ?, ?)`,
                        [userId, '#00FF9F', '#00C8FF', adminInventory]
                    );
                    db.run(
                        `INSERT OR IGNORE INTO battle_data
                         (user_id, battle_inventory, battle_wins, battle_losses, battle_rating)
                         VALUES (?, ?, 999, 0, 9999)`,
                        [userId, adminBattleInventory]
                    );
                    console.log('✅ Usuario admin creado: admin/admin (999999 monedas, nivel 99, todo desbloqueado)');
                }
            }
        );

        // Also upgrade existing admin if already in DB
        db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
            if (err || !row) return;
            const userId = row.id;
            db.run(`UPDATE users SET robot_type = 'tank', character_name = 'ADMIN' WHERE id = ?`, [userId]);
            db.run(`UPDATE user_profiles SET coins = 999999, level = 99, total_correct_answers = 9999 WHERE user_id = ?`, [userId]);
            db.run(`UPDATE robot_customization SET body_color = '#00FF9F', eye_color = '#00C8FF', inventory = ? WHERE user_id = ?`, [adminInventory, userId]);
            db.run(`INSERT OR REPLACE INTO battle_data (user_id, battle_inventory, battle_wins, battle_losses, battle_rating) VALUES (?, ?, 999, 0, 9999)`, [userId, adminBattleInventory]);
            console.log('✅ Usuario admin actualizado con inventario completo');
        });
    } catch (error) {
        console.error('Error al crear usuario admin:', error);
    }
}

// ========== Middleware de Autenticación ==========
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

// ========== Endpoints de Autenticación ==========

// Registro de usuario
app.post('/api/auth/register', [
    body('username').isLength({ min: 3 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, characterName, age, gender, robotType } = req.body;

    try {
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        db.run(
            'INSERT INTO users (username, email, password, character_name, age, gender, robot_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, characterName || 'BeiBot', age || 10, gender || 'other', robotType || 'classic'],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ error: 'Usuario o email ya existe' });
                    }
                    return res.status(500).json({ error: 'Error al crear usuario' });
                }

                const userId = this.lastID;

                // Crear perfil inicial
                db.run('INSERT INTO user_profiles (user_id) VALUES (?)', [userId]);
                db.run('INSERT INTO robot_customization (user_id) VALUES (?)', [userId]);

                // Crear token
                const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '30d' });

                res.status(201).json({
                    message: 'Usuario creado exitosamente',
                    token,
                    user: { id: userId, username, email }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Login de usuario
app.post('/api/auth/login', [
    body('username').trim().escape(),
    body('password').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    });
});

// Verificar si token es válido (para persistencia de sesión)
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({
        message: 'Token válido',
        user: { id: req.user.id, username: req.user.username }
    });
});

// ========== Endpoints de Perfil de Usuario ==========

// Obtener perfil completo
app.get('/api/user/profile', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT 
            u.id, u.username, u.email, u.character_name, u.age, u.gender, u.robot_type,
            p.native_language, p.learning_language, p.coins, p.level, 
            p.experience, p.current_streak, p.longest_streak, p.last_play_date,
            p.total_games_played, p.total_correct_answers, p.total_wrong_answers,
            r.body_color, r.eye_color, r.hat, r.glasses, r.bowtie, r.earring, r.shoes, r.outfit, r.inventory
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        LEFT JOIN robot_customization r ON u.id = r.user_id
        WHERE u.id = ?
    `;

    db.get(query, [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener perfil' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Structure customization as nested object
        const response = {
            ...row,
            customization: {
                body_color: row.body_color,
                eye_color: row.eye_color,
                hat: row.hat,
                glasses: row.glasses,
                bowtie: row.bowtie,
                earring: row.earring,
                shoes: row.shoes,
                outfit: row.outfit || 'none'
            },
            inventory: row.inventory // Include inventory JSON string
        };
        res.json(response);
    });
});

// Actualizar idiomas
app.put('/api/user/languages', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { nativeLanguage, learningLanguage } = req.body;

    db.run(
        'UPDATE user_profiles SET native_language = ?, learning_language = ? WHERE user_id = ?',
        [nativeLanguage, learningLanguage, userId],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar idiomas' });
            }
            res.json({ message: 'Idiomas actualizados' });
        }
    );
});

// Actualizar tipo de robot
app.put('/api/user/robot-type', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { robotType } = req.body;
    const validTypes = ['classic', 'athletic', 'slim', 'tank', 'cute'];
    if (!robotType || !validTypes.includes(robotType)) {
        return res.status(400).json({ error: 'Tipo de robot no válido' });
    }
    db.run('UPDATE users SET robot_type = ? WHERE id = ?', [robotType, userId], (err) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar tipo de robot' });
        res.json({ message: 'Tipo de robot actualizado', robotType });
    });
});

// Actualizar personalización del robot
app.put('/api/user/customization', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { customization, inventory } = req.body;
    
    // Extract customization fields
    const { bodyColor, eyeColor, hat, glasses, bowtie, earring, shoes, outfit } = customization || req.body;
    
    // Convert inventory to JSON string
    const inventoryJson = inventory ? JSON.stringify(inventory) : null;

    db.run(
        `UPDATE robot_customization 
         SET body_color = ?, eye_color = ?, hat = ?, glasses = ?, bowtie = ?, earring = ?, shoes = ?, outfit = ?, inventory = ?
         WHERE user_id = ?`,
        [bodyColor, eyeColor, hat, glasses, bowtie, earring || null, shoes || null, outfit || 'none', inventoryJson, userId],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar personalización' });
            }
            res.json({ message: 'Personalización actualizada' });
        }
    );
});

// ========== Endpoints de Progreso y Estadísticas ==========

// Registrar resultado de juego
app.post('/api/game/result', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { category, correct, wrong, coinsEarned, expEarned, coins, experience, level } = req.body;

    db.serialize(() => {
        if (coins !== undefined) {
            // Direct state update from client
            db.run(`
                UPDATE user_profiles 
                SET coins = ?,
                    experience = ?,
                    level = ?,
                    total_games_played = total_games_played + 1,
                    total_correct_answers = total_correct_answers + ?,
                    total_wrong_answers = total_wrong_answers + ?,
                    last_play_date = DATE('now')
                WHERE user_id = ?
            `, [coins, experience, level || 1, correct || 0, wrong || 0, userId]);
        } else {
            // Legacy increment update
            db.run(`
                UPDATE user_profiles 
                SET coins = coins + ?,
                    experience = experience + ?,
                    total_games_played = total_games_played + 1,
                    total_correct_answers = total_correct_answers + ?,
                    total_wrong_answers = total_wrong_answers + ?,
                    last_play_date = DATE('now')
                WHERE user_id = ?
            `, [coinsEarned || 0, expEarned || 0, correct || 0, wrong || 0, userId]);
        }

        // Actualizar progreso por categoría
        db.run(`
            INSERT INTO category_progress (user_id, category, games_played, correct_answers)
            VALUES (?, ?, 1, ?)
            ON CONFLICT(user_id, category) DO UPDATE SET
                games_played = games_played + 1,
                correct_answers = correct_answers + ?
        `, [userId, category, correct, correct]);

        // Actualizar racha
        updateStreak(userId);

        // Verificar nivel
        checkLevelUp(userId, res);
    });
});

function updateStreak(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    db.get('SELECT last_play_date FROM user_profiles WHERE user_id = ?', [userId], (err, row) => {
        if (err || !row) return;

        const lastPlayDate = row.last_play_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastPlayDate === today) {
            // Ya jugó hoy, no hacer nada
            return;
        } else if (lastPlayDate === yesterdayStr) {
            // Jugó ayer, incrementar racha
            db.run(`
                UPDATE user_profiles 
                SET current_streak = current_streak + 1,
                    longest_streak = MAX(longest_streak, current_streak + 1)
                WHERE user_id = ?
            `, [userId]);
        } else {
            // Racha rota, reiniciar
            db.run('UPDATE user_profiles SET current_streak = 1 WHERE user_id = ?', [userId]);
        }

        // Registrar en historial
        db.run(`
            INSERT INTO streak_history (user_id, date, games_played)
            VALUES (?, ?, 1)
            ON CONFLICT(user_id, date) DO UPDATE SET games_played = games_played + 1
        `, [userId, today]);
    });
}

function checkLevelUp(userId, res) {
    db.get('SELECT level, experience FROM user_profiles WHERE user_id = ?', [userId], (err, row) => {
        if (err || !row) {
            return res.json({ message: 'Resultado registrado' });
        }

        const currentLevel = row.level;
        const currentExp = row.experience;
        const expForNextLevel = currentLevel * 100; // 100 exp por nivel

        if (currentExp >= expForNextLevel) {
            const newLevel = currentLevel + 1;
            const bonusCoins = newLevel * 10;

            db.run(`
                UPDATE user_profiles 
                SET level = ?, 
                    experience = ?, 
                    coins = coins + ?
                WHERE user_id = ?
            `, [newLevel, currentExp - expForNextLevel, bonusCoins, userId]);

            res.json({
                message: 'Resultado registrado',
                levelUp: true,
                newLevel: newLevel,
                bonusCoins: bonusCoins
            });
        } else {
            res.json({ message: 'Resultado registrado' });
        }
    });
}

// Obtener progreso por categorías
app.get('/api/user/progress', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all('SELECT * FROM category_progress WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener progreso' });
        }
        res.json(rows);
    });
});

// Obtener historial de rachas
app.get('/api/user/streak-history', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(
        'SELECT * FROM streak_history WHERE user_id = ? ORDER BY date DESC LIMIT 30',
        [userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener historial' });
            }
            res.json(rows);
        }
    );
});

// ========== Endpoints de Batalla ==========

// Guardar datos de batalla
app.post('/api/battle/save', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { battleInventory, battleEquipment, selectedMoves, wins, losses } = req.body;

    db.run(`
        INSERT INTO battle_data (user_id, battle_inventory, battle_equipment, selected_moves, battle_wins, battle_losses)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            battle_inventory = ?,
            battle_equipment = ?,
            selected_moves = ?,
            battle_wins = COALESCE(?, battle_wins),
            battle_losses = COALESCE(?, battle_losses)
    `, [
        userId,
        JSON.stringify(battleInventory || {}),
        JSON.stringify(battleEquipment || {}),
        JSON.stringify(selectedMoves || []),
        wins || 0, losses || 0,
        JSON.stringify(battleInventory || {}),
        JSON.stringify(battleEquipment || {}),
        JSON.stringify(selectedMoves || []),
        wins, losses
    ], (err) => {
        if (err) return res.status(500).json({ error: 'Error al guardar datos de batalla' });
        res.json({ message: 'Datos de batalla guardados' });
    });
});

// Cargar datos de batalla
app.get('/api/battle/load', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.get('SELECT * FROM battle_data WHERE user_id = ?', [userId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Error al cargar datos de batalla' });
        if (!row) return res.json({ battleInventory: { weapons: [], shields: [], modules: [] }, battleEquipment: { weapon: null, shield: null, module: null }, selectedMoves: [], wins: 0, losses: 0 });
        
        try {
            res.json({
                battleInventory: JSON.parse(row.battle_inventory),
                battleEquipment: JSON.parse(row.battle_equipment),
                selectedMoves: JSON.parse(row.selected_moves),
                wins: row.battle_wins || 0,
                losses: row.battle_losses || 0,
                rating: row.battle_rating || 1000
            });
        } catch(e) {
            res.json({ battleInventory: { weapons: [], shields: [], modules: [] }, battleEquipment: { weapon: null, shield: null, module: null }, selectedMoves: [], wins: 0, losses: 0 });
        }
    });
});

// ========== Endpoints de Logros ==========

// Obtener logros del usuario
app.get('/api/user/achievements', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all('SELECT * FROM achievements WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener logros' });
        }
        res.json(rows);
    });
});

// Desbloquear logro
app.post('/api/user/achievement', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { achievementType } = req.body;

    db.run(
        'INSERT INTO achievements (user_id, achievement_type) VALUES (?, ?)',
        [userId, achievementType],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al desbloquear logro' });
            }
            res.json({ message: 'Logro desbloqueado', achievementType });
        }
    );
});

// ========== Check-in diario (rachas por fecha del dispositivo) ==========
app.post('/api/user/checkin', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { clientDate } = req.body; // fecha del dispositivo: 'YYYY-MM-DD'

    if (!clientDate || !/^\d{4}-\d{2}-\d{2}$/.test(clientDate)) {
        return res.status(400).json({ error: 'Fecha inválida' });
    }

    db.get('SELECT last_play_date, current_streak, longest_streak FROM user_profiles WHERE user_id = ?', [userId], (err, row) => {
        if (err || !row) return res.status(500).json({ error: 'Error al verificar racha' });

        const lastDate = row.last_play_date;
        const currentStreak = row.current_streak || 0;
        const longestStreak = row.longest_streak || 0;

        if (lastDate === clientDate) {
            // Ya hizo check-in hoy
            return res.json({ 
                currentStreak: currentStreak, 
                longestStreak: longestStreak, 
                message: 'Ya registrado hoy',
                checkedIn: false
            });
        }

        // Calcular si es día consecutivo
        const lastDateObj = lastDate ? new Date(lastDate + 'T00:00:00') : null;
        const todayObj = new Date(clientDate + 'T00:00:00');
        
        let newStreak;
        if (lastDateObj) {
            const diffMs = todayObj.getTime() - lastDateObj.getTime();
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Día consecutivo
                newStreak = currentStreak + 1;
            } else if (diffDays <= 0) {
                // Fecha anterior (no debería pasar), mantener
                newStreak = currentStreak;
            } else {
                // Racha rota (más de 1 día de diferencia)
                newStreak = 1;
            }
        } else {
            // Primera vez
            newStreak = 1;
        }

        const newLongest = Math.max(longestStreak, newStreak);

        db.run(`
            UPDATE user_profiles 
            SET current_streak = ?, longest_streak = ?, last_play_date = ?
            WHERE user_id = ?
        `, [newStreak, newLongest, clientDate, userId], (err) => {
            if (err) return res.status(500).json({ error: 'Error al actualizar racha' });

            // Registrar en historial
            db.run(`
                INSERT INTO streak_history (user_id, date, games_played)
                VALUES (?, ?, 0)
                ON CONFLICT(user_id, date) DO UPDATE SET games_played = games_played
            `, [userId, clientDate]);

            res.json({ 
                currentStreak: newStreak, 
                longestStreak: newLongest, 
                checkedIn: true,
                message: newStreak > 1 ? `¡Racha de ${newStreak} días!` : '¡Check-in registrado!' 
            });
        });
    });
});

// ========== AI Proxy (LM Studio / DeepSeek R1) ==========

// Health check for LM Studio
app.get('/api/ai/health', async (req, res) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`${LM_STUDIO_URL}/v1/models`, {
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (response.ok) {
            const data = await response.json();
            const models = data.data || [];
            res.json({ 
                status: 'ok', 
                models: models.map(m => m.id),
                url: LM_STUDIO_URL
            });
        } else {
            res.json({ status: 'error', message: `LM Studio respondió ${response.status}` });
        }
    } catch (e) {
        res.json({ status: 'error', message: e.message });
    }
});

// Analyze image with AI (vision)
app.post('/api/ai/analyze-image', authenticateToken, async (req, res) => {
    const { image, prompt, category, expectedObject } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'No se envió imagen' });
    }

    // Build system prompt for object identification in educational context
    const systemPrompt = `Eres un asistente de un juego educativo de idiomas llamado BeiMax. Tu tarea es identificar objetos en imágenes que los estudiantes te muestran con su cámara.

REGLAS:
- Identifica el objeto principal en la imagen
- Responde SOLO con JSON válido, sin texto adicional, sin markdown
- El JSON debe tener esta estructura exacta:
{
  "object_es": "nombre en español",
  "object_en": "name in english", 
  "object_fr": "nom en français",
  "confidence": 0.95,
  "description": "breve descripción de lo que ves"
}
- Si no puedes identificar el objeto, pon confidence menor a 0.3
- Sé preciso con los nombres de objetos cotidianos`;

    let userContent;
    
    // Check if image is base64 data URL
    const isBase64Image = image.startsWith('data:image');
    
    if (isBase64Image) {
        // Vision model: send image as content array
        userContent = [
            { 
                type: 'text', 
                text: prompt || `Identifica el objeto principal en esta imagen.${category ? ` Categoría esperada: ${category}.` : ''}${expectedObject ? ` El usuario debe mostrar: "${expectedObject}".` : ''} Responde SOLO con JSON.`
            },
            {
                type: 'image_url',
                image_url: { url: image }
            }
        ];
    } else {
        // Text-only fallback
        userContent = prompt || 'Describe qué objeto se te pide identificar.';
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120000); // 2min for vision

        const response = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                temperature: 0.1,
                max_tokens: 2048,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errText = await response.text();
            console.error('LM Studio error:', response.status, errText);
            return res.status(502).json({ error: 'Error de LM Studio', details: errText });
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const content = stripThinkTags(rawContent);

        // Try to parse JSON from the response
        let parsed;
        try {
            // Extract JSON from response (handle markdown code blocks)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (parseErr) {
            parsed = null;
        }

        if (parsed) {
            // Validate against expected object if provided
            if (expectedObject && parsed.object_es) {
                const detected = parsed.object_es.toLowerCase().trim();
                const expected = expectedObject.toLowerCase().trim();
                parsed.isCorrect = detected === expected || 
                                   detected.includes(expected) || 
                                   expected.includes(detected);
                parsed.detectedObject = parsed.object_es;
            }
            res.json(parsed);
        } else {
            // Return raw text response
            res.json({ 
                raw: content, 
                confidence: 0.5,
                object_es: 'No identificado',
                isCorrect: false
            });
        }
    } catch (e) {
        console.error('Error al contactar LM Studio:', e.message);
        if (e.name === 'AbortError') {
            return res.status(504).json({ error: 'Timeout: LM Studio tardó demasiado' });
        }
        res.status(502).json({ error: 'No se pudo contactar LM Studio', details: e.message });
    }
});

// General chat with AI
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
    const { messages, temperature, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Se requiere array de messages' });
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90000); // 90s for chat

        const response = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                temperature: temperature ?? 0.7,
                max_tokens: max_tokens ?? 2048,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errText = await response.text();
            return res.status(502).json({ error: 'Error de LM Studio', details: errText });
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        res.json({
            content: stripThinkTags(rawContent),
            usage: data.usage
        });
    } catch (e) {
        console.error('Error en /api/ai/chat:', e.message);
        if (e.name === 'AbortError') {
            return res.status(504).json({ error: 'Timeout' });
        }
        res.status(502).json({ error: 'No se pudo contactar LM Studio', details: e.message });
    }
});

// Translate with AI
app.post('/api/ai/translate', authenticateToken, async (req, res) => {
    const { word, fromLang, toLang } = req.body;

    const langNames = { es: 'español', en: 'inglés', fr: 'francés' };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { 
                        role: 'system', 
                        content: 'Eres un traductor. Responde SOLO con JSON válido, sin texto adicional.' 
                    },
                    { 
                        role: 'user', 
                        content: `Traduce "${word}" de ${langNames[fromLang] || fromLang} a ${langNames[toLang] || toLang}. Responde con JSON: {"translation": "...", "pronunciation": "pronunciación aproximada en español", "phonetic": "/transcripción fonética/"}` 
                    }
                ],
                temperature: 0.1,
                max_tokens: 1024,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(502).json({ error: 'Error de LM Studio' });
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const content = stripThinkTags(rawContent);

        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { translation: word };
            res.json(parsed);
        } catch {
            res.json({ translation: content.trim(), pronunciation: '', phonetic: '' });
        }
    } catch (e) {
        res.status(502).json({ error: 'No se pudo contactar LM Studio' });
    }
});

// ========== Health Check ==========
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend Beimax funcionando' });
});

// ========== Ruta Principal ==========
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ========== Iniciar Servidor ==========
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Generate self-signed certificate if not exists
function ensureCerts() {
    const certDir = path.join(__dirname, 'certs');
    const keyPath = path.join(certDir, 'key.pem');
    const certPath = path.join(certDir, 'cert.pem');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
    }

    try {
        if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });
        console.log('🔐 Generando certificado SSL auto-firmado...');

        const forge = require('node-forge');
        const pki = forge.pki;
        const keys = pki.rsa.generateKeyPair(2048);
        const cert = pki.createCertificate();
        cert.publicKey = keys.publicKey;
        cert.serialNumber = '01';
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
        const attrs = [{ name: 'commonName', value: 'BeiMax' }];
        cert.setSubject(attrs);
        cert.setIssuer(attrs);
        cert.sign(keys.privateKey, forge.md.sha256.create());

        fs.writeFileSync(keyPath, pki.privateKeyToPem(keys.privateKey));
        fs.writeFileSync(certPath, pki.certificateToPem(cert));
        console.log('✅ Certificado SSL generado');
        return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
    } catch (e) {
        console.warn('⚠️ HTTPS no disponible:', e.message);
        console.warn('   La cámara solo funcionará desde localhost.');
        console.warn('   Para cámara desde celular, en Chrome del celular:');
        console.warn('   chrome://flags → "Insecure origins treated as secure"');
        console.warn(`   Agrega: http://<TU-IP>:${PORT}`);
        return null;
    }
}

// Usar http.createServer para poder adjuntar WebSocket al mismo puerto
const http = require('http');
const httpServer = http.createServer(app);

httpServer.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const nets = os.networkInterfaces();
    let localIP = 'No encontrada';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                localIP = net.address;
                break;
            }
        }
        if (localIP !== 'No encontrada') break;
    }
    console.log('='.repeat(50));
    console.log('🤖 Backend Beimax iniciado');
    console.log('='.repeat(50));
    console.log(`✅ HTTP Local:  http://localhost:${PORT}`);
    console.log(`📱 HTTP Red:    http://${localIP}:${PORT}`);
    console.log(`🎮 WebSocket:   ws://${localIP}:${PORT} (mismo puerto HTTP)`);

    // ========== WebSocket Server — mismo puerto que HTTP ==========
    // Adjuntado al httpServer para compartir puerto 3000 (sin puerto extra,
    // sin reglas de firewall adicionales — funciona en LAN automáticamente)
    const wss = new WebSocket.Server({ server: httpServer });
    const battleQueue = [];
    const activeBattles = new Map();
    const quizQueue = [];
    const activeQuizMatches = new Map();

    const QUIZ_ROUND_MS = 15000;
    const QUIZ_ROULETTE_MS = 2200;
    const QUIZ_TOTAL_ROUNDS = 6;
    const QUIZ_CATEGORY_KEYS = ['kitchen', 'office', 'workshop', 'home'];
    const QUIZ_LANGS = ['es', 'en', 'fr'];

    const ENGLISH_DUEL_BANK = {
        kitchen: {
            label: 'Cocina',
            words: [
                { es: 'cuchara', fr: 'cuillere', en: 'spoon' },
                { es: 'tenedor', fr: 'fourchette', en: 'fork' },
                { es: 'cuchillo', fr: 'couteau', en: 'knife' },
                { es: 'plato', fr: 'assiette', en: 'plate' },
                { es: 'taza', fr: 'tasse', en: 'cup' },
                { es: 'vaso', fr: 'verre', en: 'glass' },
                { es: 'horno', fr: 'four', en: 'oven' },
                { es: 'nevera', fr: 'refrigerateur', en: 'fridge' },
                { es: 'sarten', fr: 'poele', en: 'pan' },
                { es: 'olla', fr: 'marmite', en: 'pot' },
                { es: 'sal', fr: 'sel', en: 'salt' },
                { es: 'azucar', fr: 'sucre', en: 'sugar' }
            ]
        },
        office: {
            label: 'Oficina',
            words: [
                { es: 'escritorio', fr: 'bureau', en: 'desk' },
                { es: 'silla', fr: 'chaise', en: 'chair' },
                { es: 'teclado', fr: 'clavier', en: 'keyboard' },
                { es: 'raton', fr: 'souris', en: 'mouse' },
                { es: 'monitor', fr: 'ecran', en: 'monitor' },
                { es: 'lapiz', fr: 'crayon', en: 'pencil' },
                { es: 'boligrafo', fr: 'stylo', en: 'pen' },
                { es: 'cuaderno', fr: 'cahier', en: 'notebook' },
                { es: 'impresora', fr: 'imprimante', en: 'printer' },
                { es: 'telefono', fr: 'telephone', en: 'phone' },
                { es: 'carpeta', fr: 'dossier', en: 'folder' },
                { es: 'agenda', fr: 'agenda', en: 'planner' }
            ]
        },
        workshop: {
            label: 'Taller',
            words: [
                { es: 'martillo', fr: 'marteau', en: 'hammer' },
                { es: 'destornillador', fr: 'tournevis', en: 'screwdriver' },
                { es: 'llave', fr: 'cle', en: 'wrench' },
                { es: 'tornillo', fr: 'vis', en: 'screw' },
                { es: 'tuerca', fr: 'ecrou', en: 'nut' },
                { es: 'clavo', fr: 'clou', en: 'nail' },
                { es: 'sierra', fr: 'scie', en: 'saw' },
                { es: 'taladro', fr: 'perceuse', en: 'drill' },
                { es: 'alicates', fr: 'pince', en: 'pliers' },
                { es: 'cinta', fr: 'ruban', en: 'tape' },
                { es: 'guantes', fr: 'gants', en: 'gloves' },
                { es: 'casco', fr: 'casque', en: 'helmet' }
            ]
        },
        home: {
            label: 'Hogar',
            words: [
                { es: 'cama', fr: 'lit', en: 'bed' },
                { es: 'almohada', fr: 'oreiller', en: 'pillow' },
                { es: 'manta', fr: 'couverture', en: 'blanket' },
                { es: 'puerta', fr: 'porte', en: 'door' },
                { es: 'ventana', fr: 'fenetre', en: 'window' },
                { es: 'lampara', fr: 'lampe', en: 'lamp' },
                { es: 'mesa', fr: 'table', en: 'table' },
                { es: 'sofa', fr: 'canape', en: 'sofa' },
                { es: 'alfombra', fr: 'tapis', en: 'carpet' },
                { es: 'espejo', fr: 'miroir', en: 'mirror' },
                { es: 'toalla', fr: 'serviette', en: 'towel' },
                { es: 'ducha', fr: 'douche', en: 'shower' }
            ]
        }
    };

    function safeSend(client, payload) {
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
        }
    }

    function normalizeQuizText(str) {
        return String(str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function randomFrom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function buildQuizQuestionKey(entry, promptLang, answerLang) {
        const prompt = normalizeQuizText(entry?.[promptLang] || '');
        const answer = normalizeQuizText(entry?.[answerLang] || '');
        return `${promptLang}|${answerLang}|${prompt}|${answer}`;
    }

    function normalizeQuizLang(lang, fallback = 'es') {
        const normalized = String(lang || '').toLowerCase().trim();
        return QUIZ_LANGS.includes(normalized) ? normalized : fallback;
    }

    function normalizeQuizCategoryKey(categoryKey) {
        const normalized = String(categoryKey || '').toLowerCase().trim();
        return QUIZ_CATEGORY_KEYS.includes(normalized) ? normalized : null;
    }

    function makeQuizQuestion(nativeLanguage, learningLanguage, categoryKey = null, rouletteLabel = null, usedQuestionKeys = null) {
        const safeNative = normalizeQuizLang(nativeLanguage, 'es');
        const safeLearning = normalizeQuizLang(learningLanguage, 'en');
        const normalizedCategory = normalizeQuizCategoryKey(categoryKey);
        const selectedCategory = normalizedCategory || randomFrom(QUIZ_CATEGORY_KEYS);
        const categoryData = ENGLISH_DUEL_BANK[selectedCategory];
        if (!categoryData || !Array.isArray(categoryData.words) || categoryData.words.length === 0) return null;

        const candidates = categoryData.words.filter(entry => entry[safeNative] && entry[safeLearning]);
        const basePool = candidates.length > 0 ? candidates : categoryData.words;
        const unusedPool = usedQuestionKeys
            ? basePool.filter(entry => !usedQuestionKeys.has(buildQuizQuestionKey(entry, safeNative, safeLearning)))
            : basePool;

        if (unusedPool.length === 0) return null;

        const entry = randomFrom(unusedPool);

        const promptLang = safeNative;
        const answerLang = safeLearning;
        const expectedRaw = entry[answerLang] || '';
        const questionKey = buildQuizQuestionKey(entry, promptLang, answerLang);
        if (usedQuestionKeys) usedQuestionKeys.add(questionKey);

        const effectiveRouletteLabel = rouletteLabel || categoryData.label;
        return {
            categoryKey: selectedCategory,
            categoryLabel: categoryData.label,
            rouletteLabel: effectiveRouletteLabel,
            promptLang,
            prompt: entry[promptLang],
            answerLang,
            expected: normalizeQuizText(expectedRaw),
            expectedRaw,
            questionKey
        };
    }

    function prepareNextQuizQuestion(match) {
        let question = null;

        if (match.categoryMode === 'roulette') {
            const wheelOptions = [...QUIZ_CATEGORY_KEYS, 'free'];
            for (let i = 0; i < 16 && !question; i++) {
                const landed = randomFrom(wheelOptions);
                if (landed === 'free') {
                    const chosen = randomFrom(QUIZ_CATEGORY_KEYS);
                    question = makeQuizQuestion(
                        match.nativeLanguage,
                        match.learningLanguage,
                        chosen,
                        'Libre',
                        match.usedQuestionKeys
                    );
                } else {
                    question = makeQuizQuestion(
                        match.nativeLanguage,
                        match.learningLanguage,
                        landed,
                        null,
                        match.usedQuestionKeys
                    );
                }
            }
        } else {
            question = makeQuizQuestion(
                match.nativeLanguage,
                match.learningLanguage,
                match.fixedCategory,
                null,
                match.usedQuestionKeys
            );
        }

        match.nextQuestion = question;
    }

    function startQuizRoulette(match) {
        prepareNextQuizQuestion(match);
        if (!match.nextQuestion) {
            endQuizMatch(match.id);
            return;
        }

        const categories = [...QUIZ_CATEGORY_KEYS.map(k => ENGLISH_DUEL_BANK[k].label), 'Libre'];
        match.players.forEach(p => safeSend(p.ws, {
            type: 'quiz_roulette',
            round: match.round + 1,
            totalRounds: match.totalRounds,
            selectedCategory: match.nextQuestion.rouletteLabel,
            categories,
            durationMs: QUIZ_ROULETTE_MS
        }));

        clearTimeout(match.intermissionTimer);
        match.intermissionTimer = setTimeout(() => {
            startQuizRound(match);
        }, QUIZ_ROULETTE_MS);
    }

    function startQuizRound(match) {
        if (!activeQuizMatches.has(match.id)) return;

        match.round += 1;
        match.currentQuestion = match.nextQuestion || makeQuizQuestion(
            match.nativeLanguage,
            match.learningLanguage,
            match.fixedCategory,
            null,
            match.usedQuestionKeys
        );
        if (!match.currentQuestion) {
            endQuizMatch(match.id);
            return;
        }
        match.answers = [null, null];
        match.roundStartedAt = Date.now();
        match.roundEndsAt = match.roundStartedAt + QUIZ_ROUND_MS;

        const payload = {
            type: 'quiz_round_start',
            matchId: match.id,
            round: match.round,
            totalRounds: match.totalRounds,
            category: match.currentQuestion.categoryLabel,
            prompt: match.currentQuestion.prompt,
            promptLang: match.currentQuestion.promptLang,
            answerLang: match.currentQuestion.answerLang,
            durationMs: QUIZ_ROUND_MS,
            deadline: match.roundEndsAt
        };

        match.players.forEach(p => safeSend(p.ws, payload));

        clearTimeout(match.roundTimer);
        match.roundTimer = setTimeout(() => resolveQuizRound(match.id), QUIZ_ROUND_MS + 100);
    }

    function resolveQuizRound(matchId) {
        if (!activeQuizMatches.has(matchId)) return;
        const match = activeQuizMatches.get(matchId);

        clearTimeout(match.roundTimer);
        const now = Date.now();

        const roundResults = [0, 1].map((idx) => {
            const ans = match.answers[idx] || { answer: '', answeredAt: now };
            const normalized = normalizeQuizText(ans.answer);
            const correct = normalized && normalized === match.currentQuestion.expected;
            const msLeft = Math.max(0, match.roundEndsAt - (ans.answeredAt || now));
            const speedRatio = QUIZ_ROUND_MS > 0 ? (msLeft / QUIZ_ROUND_MS) : 0;
            const basePoints = correct ? 120 : 0;
            const speedBonus = correct ? Math.round(80 * speedRatio) : 0;
            const points = basePoints + speedBonus;

            match.scores[idx] += points;
            if (correct) match.correctAnswers[idx] += 1;
            else match.wrongAnswers[idx] += 1;

            return {
                answer: ans.answer || '',
                correct,
                points,
                speedBonus,
                totalScore: match.scores[idx]
            };
        });

        match.players.forEach((player, idx) => {
            const opponentIdx = idx === 0 ? 1 : 0;
            safeSend(player.ws, {
                type: 'quiz_round_result',
                matchId: match.id,
                round: match.round,
                totalRounds: match.totalRounds,
                expectedAnswer: match.currentQuestion.expectedRaw,
                you: roundResults[idx],
                opponent: {
                    answer: roundResults[opponentIdx].answer,
                    correct: roundResults[opponentIdx].correct,
                    points: roundResults[opponentIdx].points,
                    totalScore: roundResults[opponentIdx].totalScore
                },
                scores: match.scores
            });
        });

        if (match.round >= match.totalRounds) {
            endQuizMatch(match.id);
        } else {
            startQuizRoulette(match);
        }
    }

    function endQuizMatch(matchId, disconnectedIndex = null) {
        if (!activeQuizMatches.has(matchId)) return;
        const match = activeQuizMatches.get(matchId);

        clearTimeout(match.roundTimer);
        clearTimeout(match.intermissionTimer);

        let winnerIndex = null;
        if (disconnectedIndex !== null) {
            winnerIndex = disconnectedIndex === 0 ? 1 : 0;
        } else if (match.scores[0] > match.scores[1]) {
            winnerIndex = 0;
        } else if (match.scores[1] > match.scores[0]) {
            winnerIndex = 1;
        }

        const diff = Math.abs(match.scores[0] - match.scores[1]);
        const winnerBonus = Math.min(40, Math.floor(diff / 40) * 5);
        const coinsAward = [0, 0];
        const xpAward = [0, 0];

        if (winnerIndex === null) {
            coinsAward[0] = 40;
            coinsAward[1] = 40;
            xpAward[0] = 95;
            xpAward[1] = 95;
        } else {
            const loserIndex = winnerIndex === 0 ? 1 : 0;
            coinsAward[winnerIndex] = 65 + winnerBonus;
            coinsAward[loserIndex] = 25;
            xpAward[winnerIndex] = 130;
            xpAward[loserIndex] = disconnectedIndex === null ? 80 : 50;
        }

        match.players.forEach((p, idx) => {
            safeSend(p.ws, {
                type: 'quiz_match_end',
                matchId: match.id,
                winnerIndex,
                youAreWinner: winnerIndex === idx,
                scores: match.scores,
                correctAnswers: match.correctAnswers,
                wrongAnswers: match.wrongAnswers,
                coinsAward: coinsAward[idx],
                xpAward: xpAward[idx]
            });
            if (p.ws) p.ws.quizId = null;
        });

        activeQuizMatches.delete(matchId);
    }

    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.battleId = null;
        ws.quizId = null;

        ws.on('pong', () => { ws.isAlive = true; });

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data);
                handleBattleMessage(ws, msg);
            } catch (e) {
                ws.send(JSON.stringify({ type: 'error', message: 'Mensaje inválido' }));
            }
        });

        ws.on('close', () => {
            // Remove from queue and cancel timeout
            const qIdx = battleQueue.findIndex(q => q.ws === ws);
            if (qIdx >= 0) {
                clearTimeout(battleQueue[qIdx].queueTimer);
                battleQueue.splice(qIdx, 1);
            }
            const quizIdx = quizQueue.findIndex(q => q.ws === ws);
            if (quizIdx >= 0) {
                clearTimeout(quizQueue[quizIdx].queueTimer);
                quizQueue.splice(quizIdx, 1);
            }
            // Handle disconnect from active battle
            if (ws.battleId && activeBattles.has(ws.battleId)) {
                const battle = activeBattles.get(ws.battleId);
                const opponent = battle.players.find(p => p.ws !== ws);
                if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
                    opponent.ws.send(JSON.stringify({ type: 'opponent_disconnected' }));
                }
                activeBattles.delete(ws.battleId);
            }
            if (ws.quizId && activeQuizMatches.has(ws.quizId)) {
                const quizMatch = activeQuizMatches.get(ws.quizId);
                const disconnectedIndex = quizMatch.players.findIndex(p => p.ws === ws);
                const opponentIndex = disconnectedIndex === 0 ? 1 : 0;
                const opponent = quizMatch.players[opponentIndex];
                safeSend(opponent?.ws, {
                    type: 'quiz_opponent_disconnected',
                    message: 'Tu rival se desconecto. Ganas la partida.'
                });
                endQuizMatch(ws.quizId, disconnectedIndex);
            }
        });
    });

    function handleBattleMessage(ws, msg) {
        switch (msg.type) {
            case 'ping': {
                // Client heartbeat - respond with pong
                ws.isAlive = true;
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }
                break;
            }
            case 'join_queue': {
                const playerData = {
                    ws,
                    name: msg.name || 'Jugador',
                    robotType: msg.robotType || 'classic',
                    level: msg.level || 1,
                    moves: msg.moves || [],
                    equipment: msg.equipment || {},
                    customization: msg.customization || {}
                };
                battleQueue.push(playerData);
                ws.send(JSON.stringify({ type: 'queue_joined', position: battleQueue.length }));

                // Timeout de cola: si después de 90s no hay match, notificar
                playerData.queueTimer = setTimeout(() => {
                    const idx = battleQueue.findIndex(q => q.ws === ws);
                    if (idx >= 0) {
                        battleQueue.splice(idx, 1);
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'queue_timeout',
                                message: 'No se encontró oponente. Intenta de nuevo.'
                            }));
                        }
                    }
                }, 90000);

                // Try matchmaking
                if (battleQueue.length >= 2) {
                    const p1 = battleQueue.shift();
                    const p2 = battleQueue.shift();
                    clearTimeout(p1.queueTimer);
                    clearTimeout(p2.queueTimer);
                    const battleId = 'battle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                    
                    p1.ws.battleId = battleId;
                    p2.ws.battleId = battleId;

                    activeBattles.set(battleId, {
                        id: battleId,
                        players: [p1, p2],
                        currentTurn: 0,
                        turnPhase: 'select',
                        moves: [null, null]
                    });

                    // Envía al oponente: customization + moves reales (no los por defecto)
                    const startMsg = (pIndex) => JSON.stringify({
                        type: 'battle_start',
                        battleId,
                        playerIndex: pIndex,
                        opponent: {
                            name: pIndex === 0 ? p2.name : p1.name,
                            robotType: pIndex === 0 ? p2.robotType : p1.robotType,
                            level: pIndex === 0 ? p2.level : p1.level,
                            moves: pIndex === 0 ? p2.moves : p1.moves,
                            equipment: pIndex === 0 ? p2.equipment : p1.equipment,
                            customization: pIndex === 0 ? p2.customization : p1.customization
                        }
                    });

                    p1.ws.send(startMsg(0));
                    p2.ws.send(startMsg(1));
                }
                break;
            }
            case 'leave_queue': {
                const idx = battleQueue.findIndex(q => q.ws === ws);
                if (idx >= 0) {
                    clearTimeout(battleQueue[idx].queueTimer);
                    battleQueue.splice(idx, 1);
                }
                ws.send(JSON.stringify({ type: 'queue_left' }));
                break;
            }
            case 'select_move': {
                if (!ws.battleId || !activeBattles.has(ws.battleId)) return;
                const battle = activeBattles.get(ws.battleId);
                const pIdx = battle.players.findIndex(p => p.ws === ws);
                if (pIdx < 0) return;

                battle.moves[pIdx] = msg.moveId;

                // If both players selected, resolve turn
                if (battle.moves[0] !== null && battle.moves[1] !== null) {
                    battle.players.forEach((p, i) => {
                        if (p.ws.readyState === WebSocket.OPEN) {
                            p.ws.send(JSON.stringify({
                                type: 'turn_resolve',
                                moves: battle.moves,
                                turn: battle.currentTurn
                            }));
                        }
                    });
                    battle.moves = [null, null];
                    battle.currentTurn++;
                } else {
                    // Notify opponent is waiting
                    const oppIdx = pIdx === 0 ? 1 : 0;
                    if (battle.players[oppIdx].ws.readyState === WebSocket.OPEN) {
                        battle.players[oppIdx].ws.send(JSON.stringify({ type: 'opponent_selecting' }));
                    }
                    ws.send(JSON.stringify({ type: 'move_confirmed' }));
                }
                break;
            }
            case 'battle_end': {
                if (ws.battleId && activeBattles.has(ws.battleId)) {
                    const battle = activeBattles.get(ws.battleId);
                    const opponent = battle.players.find(p => p.ws !== ws);
                    if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
                        opponent.ws.send(JSON.stringify({ type: 'battle_ended', result: msg.result }));
                    }
                    activeBattles.delete(ws.battleId);
                    ws.battleId = null;
                }
                break;
            }
            case 'join_quiz_queue': {
                if (ws.quizId) return;

                const inQueue = quizQueue.some(q => q.ws === ws);
                if (inQueue) return;

                const nativeLanguage = normalizeQuizLang(msg.nativeLanguage, 'es');
                const learningLanguage = normalizeQuizLang(msg.learningLanguage, 'en');
                if (nativeLanguage === learningLanguage) {
                    safeSend(ws, {
                        type: 'error',
                        message: 'Selecciona idiomas diferentes para nativo y aprendizaje.'
                    });
                    return;
                }

                const requestedMode = String(msg.categoryMode || 'roulette').toLowerCase().trim();
                const mode = requestedMode === 'roulette' ? 'roulette' : 'fixed';
                const preferredCategory = normalizeQuizCategoryKey(msg.fixedCategory);
                if (mode === 'fixed' && !preferredCategory) {
                    safeSend(ws, {
                        type: 'error',
                        message: 'Selecciona una categoría válida para modo libre.'
                    });
                    return;
                }

                const matchKey = mode === 'roulette'
                    ? `${nativeLanguage}|${learningLanguage}|roulette`
                    : `${nativeLanguage}|${learningLanguage}|fixed:${preferredCategory}`;

                const playerData = {
                    ws,
                    name: msg.name || 'Jugador',
                    level: msg.level || 1,
                    nativeLanguage,
                    learningLanguage,
                    categoryMode: mode,
                    fixedCategory: preferredCategory,
                    matchKey
                };

                quizQueue.push(playerData);
                const positionInCompatibleQueue = quizQueue.filter(q => q.matchKey === matchKey).length;
                safeSend(ws, { type: 'quiz_queue_joined', position: positionInCompatibleQueue });

                playerData.queueTimer = setTimeout(() => {
                    const idx = quizQueue.findIndex(q => q.ws === ws);
                    if (idx >= 0) {
                        quizQueue.splice(idx, 1);
                        safeSend(ws, {
                            type: 'quiz_queue_timeout',
                            message: 'No se encontro rival para el duelo. Intenta de nuevo.'
                        });
                    }
                }, 90000);

                const myIdx = quizQueue.findIndex(q => q.ws === ws);
                const oppIdx = quizQueue.findIndex((q, idx) => idx !== myIdx && q.matchKey === matchKey);

                if (myIdx >= 0 && oppIdx >= 0) {
                    const idxA = Math.max(myIdx, oppIdx);
                    const idxB = Math.min(myIdx, oppIdx);
                    const p1 = quizQueue[idxB];
                    const p2 = quizQueue[idxA];
                    quizQueue.splice(idxA, 1);
                    quizQueue.splice(idxB, 1);
                    clearTimeout(p1.queueTimer);
                    clearTimeout(p2.queueTimer);

                    const matchId = 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                    p1.ws.quizId = matchId;
                    p2.ws.quizId = matchId;

                    const match = {
                        id: matchId,
                        players: [p1, p2],
                        round: 0,
                        totalRounds: QUIZ_TOTAL_ROUNDS,
                        scores: [0, 0],
                        correctAnswers: [0, 0],
                        wrongAnswers: [0, 0],
                        answers: [null, null],
                        currentQuestion: null,
                        nextQuestion: null,
                        nativeLanguage: p1.nativeLanguage,
                        learningLanguage: p1.learningLanguage,
                        categoryMode: p1.categoryMode,
                        fixedCategory: p1.fixedCategory,
                        usedQuestionKeys: new Set(),
                        roundStartedAt: 0,
                        roundEndsAt: 0,
                        roundTimer: null,
                        intermissionTimer: null
                    };

                    activeQuizMatches.set(matchId, match);

                    safeSend(p1.ws, {
                        type: 'quiz_match_found',
                        matchId,
                        playerIndex: 0,
                        totalRounds: QUIZ_TOTAL_ROUNDS,
                        nativeLanguage: p1.nativeLanguage,
                        learningLanguage: p1.learningLanguage,
                        categoryMode: p1.categoryMode,
                        fixedCategory: p1.fixedCategory,
                        opponent: { name: p2.name, level: p2.level }
                    });

                    safeSend(p2.ws, {
                        type: 'quiz_match_found',
                        matchId,
                        playerIndex: 1,
                        totalRounds: QUIZ_TOTAL_ROUNDS,
                        nativeLanguage: p1.nativeLanguage,
                        learningLanguage: p1.learningLanguage,
                        categoryMode: p1.categoryMode,
                        fixedCategory: p1.fixedCategory,
                        opponent: { name: p1.name, level: p1.level }
                    });

                    startQuizRoulette(match);
                }
                break;
            }
            case 'leave_quiz_queue': {
                const idx = quizQueue.findIndex(q => q.ws === ws);
                if (idx >= 0) {
                    clearTimeout(quizQueue[idx].queueTimer);
                    quizQueue.splice(idx, 1);
                }
                safeSend(ws, { type: 'quiz_queue_left' });
                break;
            }
            case 'quiz_answer': {
                if (!ws.quizId || !activeQuizMatches.has(ws.quizId)) return;
                const match = activeQuizMatches.get(ws.quizId);
                const pIdx = match.players.findIndex(p => p.ws === ws);
                if (pIdx < 0) return;

                if (msg.round !== match.round) return;
                if (match.answers[pIdx]) return;

                match.answers[pIdx] = {
                    answer: String(msg.answer || '').slice(0, 60),
                    answeredAt: Date.now()
                };

                safeSend(ws, { type: 'quiz_answer_received' });

                const oppIdx = pIdx === 0 ? 1 : 0;
                safeSend(match.players[oppIdx]?.ws, { type: 'quiz_opponent_answered' });

                if (match.answers[0] && match.answers[1]) {
                    setTimeout(() => resolveQuizRound(match.id), 350);
                }
                break;
            }
        }
    }

    // Heartbeat to detect disconnected clients (45s tolerance)
    const heartbeat = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 45000);

    wss.on('close', () => clearInterval(heartbeat));

    console.log(`⚔️  WebSocket Batallas: ws://localhost:${PORT} (mismo puerto HTTP)`);

    // Try to start HTTPS server
    const certs = ensureCerts();
    if (certs) {
        try {
            https.createServer(certs, app).listen(HTTPS_PORT, '0.0.0.0', () => {
                console.log(`🔒 HTTPS Local: https://localhost:${HTTPS_PORT}`);
                console.log(`📱 HTTPS Red:   https://${localIP}:${HTTPS_PORT} (para cámara en celular)`);
                console.log('='.repeat(50));
                console.log(`\n📷 Para usar la cámara desde el celular:`);
                console.log(`   Abre: https://${localIP}:${HTTPS_PORT}`);
                console.log(`   Acepta el certificado auto-firmado en el navegador`);
            });
        } catch (e) {
            console.warn('⚠️ No se pudo iniciar HTTPS:', e.message);
            console.log('='.repeat(50));
        }
    } else {
        console.log('='.repeat(50));
        console.log(`\n💡 Para juego sin cámara: http://${localIP}:${PORT}`);
        console.log(`📷 Para cámara en celular: habilita en Chrome → chrome://flags`);
        console.log(`   "Insecure origins treated as secure" → http://${localIP}:${PORT}`);
    }
});

// Cerrar base de datos al terminar
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('\n✅ Base de datos cerrada');
        process.exit(0);
    });
});
