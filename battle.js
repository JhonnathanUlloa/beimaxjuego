/* ==============================================
   BEIMAX - SISTEMA DE BATALLA POKÉMON
   Combate por turnos entre robots con tipos,
   habilidades, equipamiento y batallas online
============================================== */

// ========== TIPOS ELEMENTALES (como Pokémon) ==========
const ROBOT_BATTLE_TYPES = {
    classic:  { element: 'electric', name: 'Eléctrico', emoji: '⚡', color: '#FFD700', desc: 'Veloz y versátil' },
    athletic: { element: 'fire',     name: 'Fuego',     emoji: '🔥', color: '#FF4444', desc: 'Poderoso en ataque' },
    slim:     { element: 'water',    name: 'Agua',      emoji: '💧', color: '#4488FF', desc: 'Ágil y curativo' },
    tank:     { element: 'steel',    name: 'Acero',     emoji: '🛡️', color: '#8899AA', desc: 'Defensa impenetrable' },
    cute:     { element: 'psychic',  name: 'Psíquico',  emoji: '🔮', color: '#AA44FF', desc: 'Ataque especial devastador' }
};

// ========== TABLA DE VENTAJAS DE TIPO ==========
// 2.0 = super efectivo, 0.5 = poco efectivo, 1.0 = normal
const TYPE_CHART = {
    electric: { water: 2.0, steel: 0.5, fire: 1.0, psychic: 1.0, electric: 0.5, neutral: 1.0 },
    fire:     { steel: 2.0, water: 0.5, electric: 1.0, psychic: 1.0, fire: 0.5, neutral: 1.0 },
    water:    { fire: 2.0, electric: 0.5, steel: 1.0, psychic: 1.0, water: 0.5, neutral: 1.0 },
    steel:    { psychic: 2.0, fire: 0.5, water: 1.0, electric: 1.0, steel: 0.5, neutral: 1.0 },
    psychic:  { electric: 2.0, steel: 0.5, fire: 1.0, water: 1.0, psychic: 0.5, neutral: 1.0 },
    neutral:  { electric: 1.0, fire: 1.0, water: 1.0, steel: 1.0, psychic: 1.0, neutral: 1.0 }
};

// ========== ESTADÍSTICAS BASE POR TIPO DE ROBOT ==========
const BASE_STATS = {
    classic:  { hp: 100, atk: 55, def: 55, spd: 60, spAtk: 55, spDef: 55 }, // Equilibrado
    athletic: { hp: 95,  atk: 78, def: 50, spd: 65, spAtk: 40, spDef: 42 }, // Atacante físico
    slim:     { hp: 85,  atk: 42, def: 48, spd: 80, spAtk: 65, spDef: 60 }, // Rápido + especial
    tank:     { hp: 140, atk: 58, def: 82, spd: 28, spAtk: 38, spDef: 74 }, // Tanque defensivo
    cute:     { hp: 78,  atk: 35, def: 42, spd: 58, spAtk: 85, spDef: 72 }  // Atacante especial
};

// ========== HABILIDAD PASIVA POR TIPO ==========
const ROBOT_ABILITIES = {
    classic: {
        name: 'Voltaje',
        desc: 'Los ataques eléctricos hacen 20% más daño',
        emoji: '⚡',
        apply: (move, attacker, defender) => {
            if (move.type === 'electric') return { dmgMult: 1.2 };
            return {};
        }
    },
    athletic: {
        name: 'Furia Ardiente',
        desc: 'ATK sube 30% cuando HP < 30%',
        emoji: '🔥',
        apply: (move, attacker, defender) => {
            if (attacker.currentHp / attacker.maxHp < 0.3 && move.category === 'physical') {
                return { dmgMult: 1.3 };
            }
            return {};
        }
    },
    slim: {
        name: 'Lluvia Sanadora',
        desc: 'Recupera 5% HP cada turno',
        emoji: '💧',
        onTurnEnd: (fighter) => {
            const heal = Math.floor(fighter.maxHp * 0.05);
            fighter.currentHp = Math.min(fighter.maxHp, fighter.currentHp + heal);
            return heal > 0 ? `${fighter.name} recupera ${heal} HP (Lluvia Sanadora)` : null;
        }
    },
    tank: {
        name: 'Coraza Blindada',
        desc: 'Recibe 20% menos daño físico',
        emoji: '🛡️',
        onDefend: (move, damage) => {
            if (move.category === 'physical') return { dmgMult: 0.8 };
            return {};
        }
    },
    cute: {
        name: 'Telepatía',
        desc: '15% de probabilidad de esquivar cualquier ataque',
        emoji: '🔮',
        onDefend: (move, damage) => {
            if (Math.random() < 0.15) return { dodge: true };
            return {};
        }
    }
};

// ========== CATÁLOGO DE MOVIMIENTOS ==========
const BATTLE_MOVES = {
    // === ELÉCTRICO ===
    spark: {
        name: 'Chispa', type: 'electric', power: 35, category: 'physical',
        accuracy: 100, pp: 30, effect: null,
        emoji: '⚡', desc: 'Un pequeño choque eléctrico'
    },
    thunder_pulse: {
        name: 'Pulso Trueno', type: 'electric', power: 55, category: 'special',
        accuracy: 100, pp: 20, effect: null,
        emoji: '⚡', desc: 'Pulso de energía eléctrica'
    },
    volt_tackle: {
        name: 'Placaje Voltio', type: 'electric', power: 75, category: 'physical',
        accuracy: 95, pp: 12, effect: { type: 'recoil', value: 15 },
        emoji: '⚡', desc: 'Embestida eléctrica. Causa retroceso'
    },
    electromagnetic: {
        name: 'Pulso EM', type: 'electric', power: 90, category: 'special',
        accuracy: 85, pp: 8, effect: { type: 'paralyze', chance: 25 },
        emoji: '⚡', desc: 'Potente pulso electromagnético. Puede paralizar'
    },
    thunder_storm: {
        name: 'Tormenta Eléctrica', type: 'electric', power: 110, category: 'special',
        accuracy: 75, pp: 5, effect: { type: 'paralyze', chance: 35 },
        emoji: '🌩️', desc: 'Devastadora tormenta. Baja precisión'
    },

    // === FUEGO ===
    ember: {
        name: 'Ascua', type: 'fire', power: 35, category: 'special',
        accuracy: 100, pp: 30, effect: null,
        emoji: '🔥', desc: 'Pequeña llama ardiente'
    },
    fire_punch: {
        name: 'Puño Fuego', type: 'fire', power: 55, category: 'physical',
        accuracy: 100, pp: 20, effect: { type: 'burn', chance: 10 },
        emoji: '🔥', desc: 'Puñetazo envuelto en llamas'
    },
    flamethrower: {
        name: 'Lanzallamas', type: 'fire', power: 75, category: 'special',
        accuracy: 95, pp: 12, effect: { type: 'burn', chance: 15 },
        emoji: '🔥', desc: 'Potente ráfaga de fuego'
    },
    inferno: {
        name: 'Infierno', type: 'fire', power: 95, category: 'special',
        accuracy: 80, pp: 6, effect: { type: 'burn', chance: 40 },
        emoji: '🔥', desc: 'Llamas infernales. Alta prob. de quemar'
    },
    supernova: {
        name: 'Supernova', type: 'fire', power: 120, category: 'special',
        accuracy: 70, pp: 3, effect: { type: 'recoil', value: 25 },
        emoji: '☀️', desc: 'Explosión solar devastadora. Daño propio'
    },

    // === AGUA ===
    aqua_jet: {
        name: 'Aqua Jet', type: 'water', power: 35, category: 'physical',
        accuracy: 100, pp: 25, effect: { type: 'priority' },
        emoji: '💧', desc: 'Ataque rápido de agua. Siempre va primero'
    },
    water_pulse: {
        name: 'Pulso Agua', type: 'water', power: 55, category: 'special',
        accuracy: 100, pp: 20, effect: { type: 'confuse', chance: 15 },
        emoji: '💧', desc: 'Pulso de agua concentrada'
    },
    hydro_beam: {
        name: 'Hidro Rayo', type: 'water', power: 75, category: 'special',
        accuracy: 95, pp: 12, effect: null,
        emoji: '💧', desc: 'Rayo de agua a alta presión'
    },
    tsunami: {
        name: 'Tsunami', type: 'water', power: 95, category: 'special',
        accuracy: 85, pp: 6, effect: { type: 'stat_down', stat: 'def', value: -1, chance: 30 },
        emoji: '🌊', desc: 'Ola gigantesca. Puede bajar DEF rival'
    },
    abyssal_surge: {
        name: 'Oleaje Abisal', type: 'water', power: 115, category: 'special',
        accuracy: 75, pp: 3, effect: { type: 'heal', value: 25 },
        emoji: '🌊', desc: 'Oleaje que sana 25% HP al atacante'
    },

    // === ACERO ===
    iron_bash: {
        name: 'Golpe Férrico', type: 'steel', power: 35, category: 'physical',
        accuracy: 100, pp: 30, effect: null,
        emoji: '🔩', desc: 'Golpe con puño de acero'
    },
    metal_claw: {
        name: 'Garra Metal', type: 'steel', power: 55, category: 'physical',
        accuracy: 95, pp: 20, effect: { type: 'stat_up', stat: 'atk', value: 1, chance: 15 },
        emoji: '🗡️', desc: 'Zarpazo metálico. Puede subir ATK'
    },
    steel_cannon: {
        name: 'Cañón Acero', type: 'steel', power: 80, category: 'special',
        accuracy: 90, pp: 10, effect: null,
        emoji: '💥', desc: 'Dispara un proyectil de acero'
    },
    fortress: {
        name: 'Fortaleza', type: 'steel', power: 0, category: 'status',
        accuracy: 100, pp: 8, effect: { type: 'stat_up', stat: 'def', value: 2, chance: 100 },
        emoji: '🏰', desc: 'Refuerza la defensa enormemente (+2)'
    },
    meteor_crash: {
        name: 'Impacto Meteoro', type: 'steel', power: 110, category: 'physical',
        accuracy: 80, pp: 5, effect: { type: 'recoil', value: 20 },
        emoji: '☄️', desc: 'Impacto brutal como un meteoro'
    },

    // === PSÍQUICO ===
    mind_ray: {
        name: 'Rayo Mental', type: 'psychic', power: 35, category: 'special',
        accuracy: 100, pp: 30, effect: null,
        emoji: '🔮', desc: 'Rayo de energía psíquica'
    },
    confusion: {
        name: 'Confusión', type: 'psychic', power: 55, category: 'special',
        accuracy: 100, pp: 20, effect: { type: 'confuse', chance: 20 },
        emoji: '💫', desc: 'Onda confusa. Puede confundir rival'
    },
    psycho_blast: {
        name: 'Psico Bomba', type: 'psychic', power: 80, category: 'special',
        accuracy: 90, pp: 10, effect: { type: 'stat_down', stat: 'spDef', value: -1, chance: 25 },
        emoji: '🔮', desc: 'Explosión psíquica. Puede bajar DEF.ESP'
    },
    mind_control: {
        name: 'Control Mental', type: 'psychic', power: 0, category: 'status',
        accuracy: 90, pp: 6, effect: { type: 'confuse', chance: 100 },
        emoji: '🧠', desc: 'Confunde al rival garantizado'
    },
    void_pulse: {
        name: 'Pulso del Vacío', type: 'psychic', power: 110, category: 'special',
        accuracy: 80, pp: 5, effect: { type: 'stat_down', stat: 'spDef', value: -2, chance: 30 },
        emoji: '🌀', desc: 'Ataque del vacío dimensional'
    },

    // === NEUTRALES (cualquier tipo puede usarlos) ===
    tackle: {
        name: 'Placaje', type: 'neutral', power: 40, category: 'physical',
        accuracy: 100, pp: 35, effect: null,
        emoji: '💥', desc: 'Embestida básica'
    },
    shield_up: {
        name: 'Escudo', type: 'neutral', power: 0, category: 'status',
        accuracy: 100, pp: 10, effect: { type: 'stat_up', stat: 'def', value: 1, chance: 100 },
        emoji: '🛡️', desc: 'Refuerza la defensa (+1)'
    },
    quick_heal: {
        name: 'Reparación', type: 'neutral', power: 0, category: 'status',
        accuracy: 100, pp: 5, effect: { type: 'heal', value: 30 },
        emoji: '💚', desc: 'Repara 30% de HP'
    },
    power_up: {
        name: 'Potenciar', type: 'neutral', power: 0, category: 'status',
        accuracy: 100, pp: 8, effect: { type: 'stat_up', stat: 'atk', value: 1, chance: 100 },
        emoji: '⬆️', desc: 'Aumenta ATK (+1)'
    },
    speed_boost: {
        name: 'Turbo', type: 'neutral', power: 0, category: 'status',
        accuracy: 100, pp: 8, effect: { type: 'stat_up', stat: 'spd', value: 1, chance: 100 },
        emoji: '💨', desc: 'Aumenta velocidad (+1)'
    },
    drain_punch: {
        name: 'Puño Drenaje', type: 'neutral', power: 50, category: 'physical',
        accuracy: 100, pp: 12, effect: { type: 'drain', value: 50 },
        emoji: '🤛', desc: 'Drena 50% del daño causado como HP'
    }
};

// ========== MOVIMIENTOS INICIALES POR TIPO ==========
const DEFAULT_MOVES = {
    classic:  ['spark', 'thunder_pulse', 'tackle', 'shield_up'],
    athletic: ['ember', 'fire_punch', 'tackle', 'power_up'],
    slim:     ['aqua_jet', 'water_pulse', 'tackle', 'quick_heal'],
    tank:     ['iron_bash', 'metal_claw', 'tackle', 'fortress'],
    cute:     ['mind_ray', 'confusion', 'tackle', 'speed_boost']
};

// ========== MOVIMIENTOS DESBLOQUEABLES POR NIVEL ==========
const LEVEL_MOVES = {
    classic: [
        { level: 3, move: 'volt_tackle' },
        { level: 6, move: 'electromagnetic' },
        { level: 10, move: 'thunder_storm' },
        { level: 5, move: 'drain_punch' },
        { level: 8, move: 'quick_heal' }
    ],
    athletic: [
        { level: 3, move: 'flamethrower' },
        { level: 6, move: 'inferno' },
        { level: 10, move: 'supernova' },
        { level: 5, move: 'drain_punch' },
        { level: 8, move: 'speed_boost' }
    ],
    slim: [
        { level: 3, move: 'hydro_beam' },
        { level: 6, move: 'tsunami' },
        { level: 10, move: 'abyssal_surge' },
        { level: 5, move: 'speed_boost' },
        { level: 8, move: 'shield_up' }
    ],
    tank: [
        { level: 3, move: 'steel_cannon' },
        { level: 6, move: 'meteor_crash' },
        { level: 10, move: 'fortress' },
        { level: 5, move: 'quick_heal' },
        { level: 8, move: 'drain_punch' }
    ],
    cute: [
        { level: 3, move: 'psycho_blast' },
        { level: 6, move: 'mind_control' },
        { level: 10, move: 'void_pulse' },
        { level: 5, move: 'quick_heal' },
        { level: 8, move: 'shield_up' }
    ]
};

// ========== EQUIPAMIENTO (armas, escudos, módulos) ==========
const BATTLE_EQUIPMENT = {
    weapons: {
        laser_pistol: {
            name: 'Pistola Láser', emoji: '🔫', rarity: 'common',
            level: 1, price: 50, stat: 'atk', bonus: 5,
            grantMove: 'spark', desc: 'Arma básica. +5 ATK'
        },
        flame_cannon: {
            name: 'Cañón de Fuego', emoji: '🔥', rarity: 'common',
            level: 2, price: 80, stat: 'spAtk', bonus: 7,
            grantMove: 'ember', desc: 'Cañón térmico. +7 ATK.ESP'
        },
        plasma_blade: {
            name: 'Espada Plasma', emoji: '⚔️', rarity: 'rare',
            level: 4, price: 180, stat: 'atk', bonus: 12,
            grantMove: 'volt_tackle', desc: 'Hoja de plasma. +12 ATK'
        },
        cryo_rifle: {
            name: 'Rifle Criogénico', emoji: '❄️', rarity: 'rare',
            level: 5, price: 250, stat: 'spAtk', bonus: 14,
            grantMove: 'hydro_beam', desc: 'Rifle congelante. +14 ATK.ESP'
        },
        psycho_staff: {
            name: 'Bastón Psíquico', emoji: '🪄', rarity: 'rare',
            level: 6, price: 320, stat: 'spAtk', bonus: 16,
            grantMove: 'psycho_blast', desc: 'Canaliza energía mental. +16 ATK.ESP'
        },
        nova_cannon: {
            name: 'Cañón Nova', emoji: '💫', rarity: 'epic',
            level: 8, price: 500, stat: 'spAtk', bonus: 22,
            grantMove: 'supernova', desc: 'Arma de destrucción masiva. +22 ATK.ESP'
        },
        void_saber: {
            name: 'Sable del Vacío', emoji: '🌀', rarity: 'epic',
            level: 9, price: 600, stat: 'atk', bonus: 24,
            grantMove: 'void_pulse', desc: 'Corta la realidad misma. +24 ATK'
        },
        omega_lance: {
            name: 'Lanza Omega', emoji: '🔱', rarity: 'legendary',
            level: 12, price: 1000, stat: 'atk', bonus: 30,
            grantMove: 'meteor_crash', desc: 'Arma legendaria definitiva. +30 ATK'
        }
    },
    shields: {
        basic_shield: {
            name: 'Escudo Básico', emoji: '🛡️', rarity: 'common',
            level: 1, price: 40, stat: 'def', bonus: 5,
            desc: 'Protección básica. +5 DEF'
        },
        energy_barrier: {
            name: 'Barrera Energía', emoji: '🔋', rarity: 'common',
            level: 2, price: 70, stat: 'spDef', bonus: 7,
            desc: 'Barrera contra ataques especiales. +7 DEF.ESP'
        },
        titanium_plate: {
            name: 'Placa Titanio', emoji: '🪨', rarity: 'rare',
            level: 4, price: 200, stat: 'def', bonus: 14,
            desc: 'Blindaje de titanio. +14 DEF'
        },
        quantum_shield: {
            name: 'Escudo Cuántico', emoji: '🌐', rarity: 'rare',
            level: 6, price: 350, stat: 'spDef', bonus: 18,
            desc: 'Escudo dimensional. +18 DEF.ESP'
        },
        aegis_matrix: {
            name: 'Matriz Aegis', emoji: '💠', rarity: 'epic',
            level: 8, price: 550, stat: 'def', bonus: 22,
            desc: 'Defensa suprema. +22 DEF'
        },
        immortal_guard: {
            name: 'Guardia Inmortal', emoji: '♾️', rarity: 'legendary',
            level: 12, price: 900, stat: 'def', bonus: 30,
            desc: 'Protección legendaria. +30 DEF'
        }
    },
    modules: {
        speed_chip: {
            name: 'Chip Velocidad', emoji: '💨', rarity: 'common',
            level: 1, price: 60, stat: 'spd', bonus: 8,
            desc: 'Procesador rápido. +8 VEL'
        },
        power_core: {
            name: 'Núcleo Poder', emoji: '🔋', rarity: 'common',
            level: 3, price: 120, stat: 'hp', bonus: 15,
            desc: 'Núcleo de energía. +15 HP'
        },
        critical_lens: {
            name: 'Lente Crítico', emoji: '🎯', rarity: 'rare',
            level: 5, price: 280, stat: 'critRate', bonus: 15,
            desc: '+15% prob. de golpe crítico'
        },
        berserker_chip: {
            name: 'Chip Berserker', emoji: '😤', rarity: 'epic',
            level: 7, price: 450, stat: 'atk', bonus: 18,
            secondStat: 'def', secondBonus: -8,
            desc: '+18 ATK, -8 DEF. Alto riesgo, alta recompensa'
        },
        regenerator: {
            name: 'Regenerador', emoji: '💚', rarity: 'epic',
            level: 8, price: 500, stat: 'hp', bonus: 25,
            desc: '+25 HP extra. Más resistencia'
        },
        omega_processor: {
            name: 'Procesador Omega', emoji: '🧠', rarity: 'legendary',
            level: 11, price: 800, stat: 'spAtk', bonus: 20,
            secondStat: 'spd', secondBonus: 10,
            desc: '+20 ATK.ESP, +10 VEL. Chip legendario'
        }
    }
};

// ========== CPU OPONENTES ==========
const CPU_OPPONENTS = [
    {
        name: 'Sparky Jr.', robotType: 'classic', level: 1, difficulty: 'easy',
        moves: ['spark', 'tackle', 'shield_up', 'thunder_pulse'],
        equipment: { weapon: null, shield: null, module: null },
        emoji: '🤖', reward: { xp: 10 }
    },
    {
        name: 'Blaze Bot', robotType: 'athletic', level: 3, difficulty: 'easy',
        moves: ['ember', 'fire_punch', 'tackle', 'power_up'],
        equipment: { weapon: 'laser_pistol', shield: null, module: null },
        emoji: '🔥', reward: { xp: 15 }
    },
    {
        name: 'Aqua Drone', robotType: 'slim', level: 5, difficulty: 'medium',
        moves: ['aqua_jet', 'water_pulse', 'hydro_beam', 'quick_heal'],
        equipment: { weapon: 'cryo_rifle', shield: 'basic_shield', module: null },
        emoji: '💧', reward: { xp: 25 }
    },
    {
        name: 'Steel Titan', robotType: 'tank', level: 7, difficulty: 'medium',
        moves: ['iron_bash', 'metal_claw', 'fortress', 'steel_cannon'],
        equipment: { weapon: 'plasma_blade', shield: 'titanium_plate', module: 'power_core' },
        emoji: '🛡️', reward: { xp: 35 }
    },
    {
        name: 'Shadow Mind', robotType: 'cute', level: 9, difficulty: 'hard',
        moves: ['confusion', 'psycho_blast', 'mind_control', 'quick_heal'],
        equipment: { weapon: 'psycho_staff', shield: 'quantum_shield', module: 'critical_lens' },
        emoji: '🔮', reward: { xp: 45 }
    },
    {
        name: 'Volt Prime', robotType: 'classic', level: 12, difficulty: 'hard',
        moves: ['electromagnetic', 'thunder_storm', 'volt_tackle', 'drain_punch'],
        equipment: { weapon: 'nova_cannon', shield: 'aegis_matrix', module: 'speed_chip' },
        emoji: '⚡', reward: { xp: 55 }
    },
    {
        name: 'Inferno Rex', robotType: 'athletic', level: 15, difficulty: 'boss',
        moves: ['inferno', 'supernova', 'flamethrower', 'drain_punch'],
        equipment: { weapon: 'nova_cannon', shield: 'aegis_matrix', module: 'berserker_chip' },
        emoji: '👑', reward: { xp: 70 }
    },
    {
        name: 'Omega Nexus', robotType: 'cute', level: 20, difficulty: 'boss',
        moves: ['void_pulse', 'mind_control', 'psycho_blast', 'quick_heal'],
        equipment: { weapon: 'void_saber', shield: 'immortal_guard', module: 'omega_processor' },
        emoji: '💀', reward: { xp: 85 }
    }
];

// ========== ESTADO DE BATALLA ==========
let battleState = {
    active: false,
    mode: null,          // 'cpu' or 'online'
    turn: 0,
    player: null,        // fighter object
    opponent: null,      // fighter object
    log: [],
    animating: false,
    result: null,        // 'win', 'lose', null
    onlineSocket: null,
    onlineRoomId: null,
    opponentCustomization: null  // opponent skin data for online battles
};

// ========== TIMER DE TURNO (30 segundos) ==========
const TURN_TIME_LIMIT = 30;
let turnTimerInterval = null;
let turnTimeLeft = TURN_TIME_LIMIT;

function startTurnTimer() {
    stopTurnTimer();
    turnTimeLeft = TURN_TIME_LIMIT;
    const ring = document.getElementById('turnTimerRing');
    const text = document.getElementById('turnTimerText');
    const wrap = document.getElementById('turnTimerWrap');
    if (ring) {
        ring.style.transition = 'none';
        ring.setAttribute('stroke-dashoffset', '0');
        ring.classList.remove('timer-urgent');
    }
    if (text) text.textContent = TURN_TIME_LIMIT;
    if (wrap) { wrap.classList.remove('timer-danger'); wrap.style.display = 'flex'; }

    turnTimerInterval = setInterval(() => {
        turnTimeLeft--;
        if (text) text.textContent = Math.max(0, turnTimeLeft);
        if (ring) {
            const pct = ((TURN_TIME_LIMIT - turnTimeLeft) / TURN_TIME_LIMIT) * 100;
            ring.style.transition = 'stroke-dashoffset 1s linear';
            ring.setAttribute('stroke-dashoffset', String(pct));
            if (turnTimeLeft <= 10) ring.classList.add('timer-urgent');
        }
        if (wrap && turnTimeLeft <= 10) wrap.classList.add('timer-danger');

        if (turnTimeLeft <= 0) {
            stopTurnTimer();
            autoSelectMove();
        }
    }, 1000);
}

function stopTurnTimer() {
    if (turnTimerInterval) { clearInterval(turnTimerInterval); turnTimerInterval = null; }
}

function autoSelectMove() {
    if (battleState.animating || !battleState.active) return;
    const available = battleState.player.moves.filter(m => m.currentPp > 0);
    if (available.length === 0) return;
    const idx = battleState.player.moves.indexOf(available[Math.floor(Math.random() * available.length)]);
    addBattleLog('⏰ ¡Se acabó el tiempo! Movimiento aleatorio...', '⏰');
    playerSelectMove(idx);
}

// ========== FUNCIONES DE CÁLCULO DE STATS ==========

function calculateStats(robotType, level, equipment) {
    const base = { ...BASE_STATS[robotType] };
    // Escalar por nivel (cada nivel +3% a todos los stats)
    const mult = 1 + (level - 1) * 0.03;
    const stats = {
        hp: Math.floor(base.hp * mult),
        atk: Math.floor(base.atk * mult),
        def: Math.floor(base.def * mult),
        spd: Math.floor(base.spd * mult),
        spAtk: Math.floor(base.spAtk * mult),
        spDef: Math.floor(base.spDef * mult),
        critRate: 6 // base 6%
    };

    // Aplicar bonificaciones de equipamiento
    if (equipment) {
        ['weapon', 'shield', 'module'].forEach(slot => {
            const eqId = equipment[slot];
            if (!eqId) return;
            const cat = slot === 'weapon' ? 'weapons' : slot === 'shield' ? 'shields' : 'modules';
            const eq = BATTLE_EQUIPMENT[cat][eqId];
            if (!eq) return;
            if (eq.stat === 'hp') stats.hp += eq.bonus;
            else if (eq.stat === 'critRate') stats.critRate += eq.bonus;
            else if (stats[eq.stat] !== undefined) stats[eq.stat] += eq.bonus;
            if (eq.secondStat && stats[eq.secondStat] !== undefined) {
                stats[eq.secondStat] += eq.secondBonus;
            }
        });
    }

    return stats;
}

function createFighter(name, robotType, level, moveIds, equipment, isPlayer) {
    const stats = calculateStats(robotType, level, equipment);
    const moves = moveIds.map(id => {
        const m = BATTLE_MOVES[id];
        if (!m) return null;
        return { ...m, id, currentPp: m.pp };
    }).filter(Boolean);

    return {
        name,
        robotType,
        element: ROBOT_BATTLE_TYPES[robotType].element,
        level,
        maxHp: stats.hp,
        currentHp: stats.hp,
        stats,
        statModifiers: { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
        moves,
        equipment: equipment || { weapon: null, shield: null, module: null },
        ability: ROBOT_ABILITIES[robotType],
        isPlayer,
        statusEffects: [], // 'burn', 'paralyze', 'confuse'
        turnCount: 0
    };
}

// ========== MOTOR DE BATALLA ==========

function getEffectiveStat(fighter, statName) {
    const base = fighter.stats[statName] || 0;
    const mod = fighter.statModifiers[statName] || 0;
    // Cada nivel de mod = ±25%
    const multiplier = mod >= 0 ? (1 + mod * 0.25) : (1 / (1 + Math.abs(mod) * 0.25));
    return Math.max(1, Math.floor(base * multiplier));
}

function calculateDamage(move, attacker, defender) {
    if (move.category === 'status') return 0;

    const level = attacker.level;
    const power = move.power;

    // Seleccionar ATK/DEF según categoría
    const atkStat = move.category === 'physical' ? getEffectiveStat(attacker, 'atk') : getEffectiveStat(attacker, 'spAtk');
    const defStat = move.category === 'physical' ? getEffectiveStat(defender, 'def') : getEffectiveStat(defender, 'spDef');

    // Fórmula inspirada en Pokémon
    let damage = ((2 * level / 5 + 2) * power * atkStat / defStat / 50 + 2);

    // STAB (Same Type Attack Bonus)
    if (move.type === attacker.element) damage *= 1.5;

    // Ventaja de tipo
    const effectiveness = TYPE_CHART[move.type]?.[defender.element] || 1.0;
    damage *= effectiveness;

    // Habilidad pasiva del atacante
    const abilityResult = attacker.ability?.apply?.(move, attacker, defender) || {};
    if (abilityResult.dmgMult) damage *= abilityResult.dmgMult;

    // Habilidad pasiva del defensor
    const defAbility = defender.ability?.onDefend?.(move, damage) || {};
    if (defAbility.dodge) return -1; // Esquivado
    if (defAbility.dmgMult) damage *= defAbility.dmgMult;

    // Crítico
    const critChance = (attacker.stats.critRate || 6) / 100;
    const isCrit = Math.random() < critChance;
    if (isCrit) damage *= 1.5;

    // Factor aleatorio (85-100% como Pokémon)
    damage *= (0.85 + Math.random() * 0.15);

    // Quemar reduce daño físico del atacante
    if (attacker.statusEffects.includes('burn') && move.category === 'physical') {
        damage *= 0.5;
    }

    return { damage: Math.max(1, Math.floor(damage)), effectiveness, isCrit };
}

function executeMove(move, attacker, defender) {
    const results = [];

    // Comprobar parálisis
    if (attacker.statusEffects.includes('paralyze') && Math.random() < 0.25) {
        results.push({ type: 'status', text: `${attacker.name} está paralizado y no puede moverse!`, icon: '⚡' });
        return results;
    }

    // Comprobar confusión
    if (attacker.statusEffects.includes('confuse')) {
        if (Math.random() < 0.33) {
            const selfDmg = Math.floor(attacker.maxHp * 0.08);
            attacker.currentHp = Math.max(0, attacker.currentHp - selfDmg);
            results.push({ type: 'confuse_hit', text: `${attacker.name} se hirió por confusión! (-${selfDmg} HP)`, icon: '💫' });
            return results;
        }
        // 50% chance to snap out each turn
        if (Math.random() < 0.5) {
            attacker.statusEffects = attacker.statusEffects.filter(s => s !== 'confuse');
            results.push({ type: 'status_heal', text: `${attacker.name} ya no está confundido!`, icon: '✨' });
        }
    }

    // Comprobar precisión
    if (Math.random() * 100 > move.accuracy) {
        results.push({ type: 'miss', text: `${attacker.name} usó ${move.name} pero falló!`, icon: '💨' });
        return results;
    }

    // Decrementar PP
    move.currentPp = Math.max(0, move.currentPp - 1);

    results.push({ type: 'use', text: `${attacker.name} usó ${move.emoji} ${move.name}!`, icon: move.emoji });

    // Calcular daño si es ataque
    if (move.category !== 'status') {
        const dmgResult = calculateDamage(move, attacker, defender);

        if (dmgResult === -1) {
            // Esquivado por habilidad
            results.push({ type: 'dodge', text: `${defender.name} esquivó el ataque! (${defender.ability.name})`, icon: '✨' });
            return results;
        }

        const { damage, effectiveness, isCrit } = dmgResult;
        defender.currentHp = Math.max(0, defender.currentHp - damage);

        let effText = '';
        if (effectiveness > 1) effText = ' ¡Es super efectivo!';
        else if (effectiveness < 1) effText = ' No es muy efectivo...';

        results.push({
            type: 'damage',
            text: `Causó ${damage} de daño!${effText}${isCrit ? ' ¡Golpe crítico!' : ''}`,
            icon: effectiveness > 1 ? '💥' : effectiveness < 1 ? '🔽' : '💢',
            damage,
            effectiveness,
            isCrit,
            target: defender.isPlayer ? 'player' : 'opponent'
        });

        // Efectos del movimiento
        if (move.effect) {
            const eff = move.effect;

            if (eff.type === 'recoil') {
                const recoil = Math.floor(damage * eff.value / 100);
                attacker.currentHp = Math.max(0, attacker.currentHp - recoil);
                results.push({ type: 'recoil', text: `${attacker.name} recibió ${recoil} de retroceso!`, icon: '💫' });
            }

            if (eff.type === 'drain') {
                const heal = Math.floor(damage * eff.value / 100);
                attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + heal);
                results.push({ type: 'drain', text: `${attacker.name} absorbió ${heal} HP!`, icon: '💚' });
            }

            if (eff.type === 'heal') {
                const heal = Math.floor(attacker.maxHp * eff.value / 100);
                attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + heal);
                results.push({ type: 'heal', text: `${attacker.name} se curó ${heal} HP!`, icon: '💚' });
            }

            if (eff.type === 'burn' && Math.random() * 100 < eff.chance) {
                if (!defender.statusEffects.includes('burn')) {
                    defender.statusEffects.push('burn');
                    results.push({ type: 'status_apply', text: `${defender.name} se quemó! 🔥`, icon: '🔥' });
                }
            }

            if (eff.type === 'paralyze' && Math.random() * 100 < eff.chance) {
                if (!defender.statusEffects.includes('paralyze')) {
                    defender.statusEffects.push('paralyze');
                    results.push({ type: 'status_apply', text: `${defender.name} fue paralizado! ⚡`, icon: '⚡' });
                }
            }

            if (eff.type === 'confuse' && Math.random() * 100 < eff.chance) {
                if (!defender.statusEffects.includes('confuse')) {
                    defender.statusEffects.push('confuse');
                    results.push({ type: 'status_apply', text: `${defender.name} fue confundido! 💫`, icon: '💫' });
                }
            }

            if (eff.type === 'stat_down' && Math.random() * 100 < eff.chance) {
                const stat = eff.stat;
                defender.statModifiers[stat] = Math.max(-6, (defender.statModifiers[stat] || 0) + eff.value);
                const statNames = { atk: 'ATK', def: 'DEF', spAtk: 'ATK.ESP', spDef: 'DEF.ESP', spd: 'VEL' };
                results.push({ type: 'stat_change', text: `${statNames[stat]} de ${defender.name} bajó!`, icon: '⬇️' });
            }
        }
    } else {
        // Movimiento de estado
        const eff = move.effect;
        if (!eff) return results;

        if (eff.type === 'stat_up') {
            attacker.statModifiers[eff.stat] = Math.min(6, (attacker.statModifiers[eff.stat] || 0) + eff.value);
            const statNames = { atk: 'ATK', def: 'DEF', spAtk: 'ATK.ESP', spDef: 'DEF.ESP', spd: 'VEL' };
            const amount = eff.value > 1 ? ' mucho' : '';
            results.push({ type: 'stat_change', text: `${statNames[eff.stat]} de ${attacker.name} subió${amount}!`, icon: '⬆️' });
        }

        if (eff.type === 'heal') {
            const heal = Math.floor(attacker.maxHp * eff.value / 100);
            attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + heal);
            results.push({ type: 'heal', text: `${attacker.name} se curó ${heal} HP!`, icon: '💚' });
        }

        if (eff.type === 'confuse' && eff.chance === 100) {
            if (!defender.statusEffects.includes('confuse')) {
                defender.statusEffects.push('confuse');
                results.push({ type: 'status_apply', text: `${defender.name} fue confundido!`, icon: '💫' });
            } else {
                results.push({ type: 'fail', text: `${defender.name} ya está confundido`, icon: '❌' });
            }
        }
    }

    return results;
}

function processTurnEnd(fighter) {
    const results = [];

    // Daño por quemadura
    if (fighter.statusEffects.includes('burn')) {
        const burnDmg = Math.floor(fighter.maxHp * 0.06);
        fighter.currentHp = Math.max(0, fighter.currentHp - burnDmg);
        results.push({ type: 'burn_dmg', text: `${fighter.name} sufre ${burnDmg} por quemadura 🔥`, icon: '🔥' });
    }

    // Habilidad pasiva de fin de turno
    if (fighter.ability?.onTurnEnd) {
        const msg = fighter.ability.onTurnEnd(fighter);
        if (msg) results.push({ type: 'ability', text: msg, icon: fighter.ability.emoji });
    }

    fighter.turnCount++;
    return results;
}

// ========== IA DEL CPU ==========

function cpuSelectMove(cpuFighter, playerFighter) {
    const available = cpuFighter.moves.filter(m => m.currentPp > 0);
    if (available.length === 0) return cpuFighter.moves[0]; // Struggle fallback

    // Estrategia simple basada en situación
    const hpPercent = cpuFighter.currentHp / cpuFighter.maxHp;

    // Si HP bajo, intentar curar
    if (hpPercent < 0.3) {
        const heal = available.find(m => m.effect?.type === 'heal');
        if (heal && heal.currentPp > 0) return heal;
    }

    // Si el rival está bajo de HP, usar el ataque más fuerte
    if (playerFighter.currentHp / playerFighter.maxHp < 0.25) {
        const strongest = available
            .filter(m => m.category !== 'status')
            .sort((a, b) => b.power - a.power)[0];
        if (strongest) return strongest;
    }

    // Elegir movimiento con ventaja de tipo si es posible
    const superEffective = available.filter(m => {
        if (m.category === 'status') return false;
        return (TYPE_CHART[m.type]?.[playerFighter.element] || 1) > 1;
    });
    if (superEffective.length > 0 && Math.random() < 0.7) {
        return superEffective[Math.floor(Math.random() * superEffective.length)];
    }

    // Usar buff si no tiene modificadores positivos
    if (Math.random() < 0.3) {
        const buff = available.find(m => m.effect?.type === 'stat_up');
        if (buff && buff.currentPp > 0 && cpuFighter.statModifiers[buff.effect.stat] < 2) return buff;
    }

    // Ataque aleatorio con peso por poder
    const attacks = available.filter(m => m.category !== 'status');
    if (attacks.length > 0) {
        // Weighted random by power
        const totalPower = attacks.reduce((s, m) => s + m.power, 0);
        let rand = Math.random() * totalPower;
        for (const m of attacks) {
            rand -= m.power;
            if (rand <= 0) return m;
        }
        return attacks[0];
    }

    return available[0];
}

// ========== CONTROLADOR UI DE BATALLA ==========

function getAvailableMoves(robotType, level) {
    const defaults = [...(DEFAULT_MOVES[robotType] || [])];
    const unlocked = (LEVEL_MOVES[robotType] || [])
        .filter(lm => level >= lm.level)
        .map(lm => lm.move);
    // Combinar sin duplicados
    const all = [...new Set([...defaults, ...unlocked])];
    return all;
}

function showBattleMenu() {
    showScreen('battleMenuScreen');
    updateNavBar('battle');

    const rType = gameState.robotType || 'classic';
    const bType = ROBOT_BATTLE_TYPES[rType];
    const ability = ROBOT_ABILITIES[rType];
    const stats = calculateStats(rType, gameState.level, gameState.battleEquipment);

    // Actualizar info del robot del jugador
    const el = (id) => document.getElementById(id);
    el('battleMenuRobotName').textContent = gameState.charName || 'BeiBot';
    el('battleMenuRobotLevel').textContent = `Nv. ${gameState.level}`;
    el('battleMenuRobotType').innerHTML = `${bType.emoji} ${bType.name}`;
    el('battleMenuRobotType').style.color = bType.color;
    el('battleMenuAbility').innerHTML = `${ability.emoji} <strong>${ability.name}:</strong> ${ability.desc}`;

    // Stats
    el('bMenuHp').textContent = stats.hp;
    el('bMenuAtk').textContent = stats.atk;
    el('bMenuDef').textContent = stats.def;
    el('bMenuSpAtk').textContent = stats.spAtk;
    el('bMenuSpDef').textContent = stats.spDef;
    el('bMenuSpd').textContent = stats.spd;

    // Robot visual
    const robot = document.getElementById('battleMenuRobot');
    if (robot) {
        applyRobotType(robot, rType);
        applyRobotCustomization('battleMenu');
    }

    // Opponent list
    renderCpuOpponents();

    // Update ranking card
    updateRankingCard();
}

// ========== RANKING SYSTEM ==========

const RANKING_TIERS = [
    { name: 'Bronce', emoji: '🥉', minElo: 0, color: '#cd7f32' },
    { name: 'Plata', emoji: '🥈', minElo: 1200, color: '#c0c0c0' },
    { name: 'Oro', emoji: '🥇', minElo: 1500, color: '#ffd700' },
    { name: 'Platino', emoji: '💎', minElo: 1800, color: '#00bcd4' },
    { name: 'Diamante', emoji: '👑', minElo: 2200, color: '#e040fb' },
    { name: 'Leyenda', emoji: '🌟', minElo: 2800, color: '#ff5722' }
];

function getRankTier(elo) {
    for (let i = RANKING_TIERS.length - 1; i >= 0; i--) {
        if (elo >= RANKING_TIERS[i].minElo) return { current: RANKING_TIERS[i], next: RANKING_TIERS[i + 1] || null, index: i };
    }
    return { current: RANKING_TIERS[0], next: RANKING_TIERS[1], index: 0 };
}

function updateRankingCard() {
    const stats = gameState.battleStats || { wins: 0, losses: 0, elo: 1000 };
    const el = (id) => document.getElementById(id);
    if (!el('rankingElo')) return;

    const elo = stats.elo || 1000;
    const { current, next } = getRankTier(elo);
    const total = stats.wins + stats.losses;
    const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;

    el('rankingElo').textContent = elo;
    el('rankingElo').style.color = current.color;
    el('rankingWins').textContent = stats.wins;
    el('rankingLosses').textContent = stats.losses;
    el('rankingWinRate').textContent = `${winRate}%`;
    el('rankingTier').textContent = `${current.emoji} ${current.name}`;
    el('rankingTier').style.color = current.color;

    if (next) {
        const progress = ((elo - current.minElo) / (next.minElo - current.minElo)) * 100;
        el('rankingBarFill').style.width = `${Math.min(100, Math.max(0, progress))}%`;
        el('rankingBarFill').style.background = `linear-gradient(90deg, ${current.color}, ${next.color})`;
        el('rankingNextTier').textContent = `Siguiente: ${next.emoji} ${next.name} (${next.minElo})`;
    } else {
        el('rankingBarFill').style.width = '100%';
        el('rankingBarFill').style.background = `linear-gradient(90deg, ${current.color}, #fff)`;
        el('rankingNextTier').textContent = `🌟 ¡Rango máximo alcanzado!`;
    }
}

// ========== MATCHMAKING MEJORADO ==========

function getMatchRecommendation(oppLevel, oppDifficulty) {
    const playerLevel = gameState.level || 1;
    const stats = gameState.battleStats || { wins: 0, losses: 0, elo: 1000 };
    const diff = oppLevel - playerLevel;

    // Visual warning for very high level opponents (no lockout - always allow)
    if (diff > 5) return { tag: 'too-hard', label: 'Muy fuerte', locked: false };

    // Difficulty mapping based on player ELO
    const elo = stats.elo || 1000;
    if (oppDifficulty === 'easy') {
        if (elo >= 1500) return { tag: 'too-easy', label: 'Fácil', locked: false };
        if (elo < 1200) return { tag: 'recommended', label: '★ Ideal', locked: false };
        return { tag: '', label: '', locked: false };
    }
    if (oppDifficulty === 'medium') {
        if (elo >= 1200 && elo < 1800) return { tag: 'recommended', label: '★ Ideal', locked: false };
        if (elo < 1000 && diff > 3) return { tag: 'too-hard', label: 'Difícil', locked: false };
        return { tag: '', label: '', locked: false };
    }
    if (oppDifficulty === 'hard') {
        if (elo >= 1500 && elo < 2200) return { tag: 'recommended', label: '★ Ideal', locked: false };
        if (elo < 1200) return { tag: 'too-hard', label: 'Muy difícil', locked: false };
        return { tag: '', label: '', locked: false };
    }
    if (oppDifficulty === 'boss') {
        if (elo >= 2000) return { tag: 'recommended', label: '★ Ideal', locked: false };
        if (diff > 3 && elo < 1500) return { tag: 'too-hard', label: 'Peligroso', locked: false };
        return { tag: '', label: '', locked: false };
    }
    return { tag: '', label: '', locked: false };
}

function renderCpuOpponents() {
    const list = document.getElementById('cpuOpponentList');
    if (!list) return;
    list.innerHTML = '';

    CPU_OPPONENTS.forEach((opp, i) => {
        const bType = ROBOT_BATTLE_TYPES[opp.robotType];
        const diffColors = { easy: '#4CAF50', medium: '#FF9800', hard: '#F44336', boss: '#9C27B0' };
        const diffNames = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil', boss: '⭐ JEFE' };

        const match = getMatchRecommendation(opp.level, opp.difficulty);
        const matchTag = match.label ? `<span class="cpu-opp-match-tag ${match.tag}">${match.label}</span>` : '';

        const card = document.createElement('div');
        card.className = `cpu-opponent-card difficulty-${opp.difficulty}${match.tag === 'recommended' ? ' match-recommended' : ''}`;
        card.innerHTML = `
            <div class="cpu-opp-header">
                <span class="cpu-opp-emoji">${opp.emoji}</span>
                <div class="cpu-opp-info">
                    <div class="cpu-opp-name">${opp.name}${matchTag}</div>
                    <div class="cpu-opp-type" style="color:${bType.color}">${bType.emoji} ${bType.name} · Nv.${opp.level}</div>
                </div>
                <span class="cpu-opp-diff" style="background:${diffColors[opp.difficulty]}">${diffNames[opp.difficulty]}</span>
            </div>
            <div class="cpu-opp-reward">⭐ ${opp.reward.xp} XP</div>
        `;
        card.onclick = () => showBattlePrep(i);
        list.appendChild(card);
    });
}

// ========== TIENDA DE EQUIPAMIENTO ==========

function showBattleShop() {
    showScreen('battleShopScreen');
    renderBattleShop();
    document.getElementById('battleShopCoins').textContent = gameState.coins;
}

function renderBattleShop() {
    const categories = [
        { key: 'weapons', tabId: 'eqShopWeapons', label: '⚔️ Armas' },
        { key: 'shields', tabId: 'eqShopShields', label: '🛡️ Escudos' },
        { key: 'modules', tabId: 'eqShopModules', label: '🔧 Módulos' }
    ];

    categories.forEach(cat => {
        const container = document.getElementById(cat.tabId);
        if (!container) return;
        container.innerHTML = '';

        Object.entries(BATTLE_EQUIPMENT[cat.key]).forEach(([id, eq]) => {
            const owned = gameState.battleInventory?.[cat.key]?.includes(id);
            const equipped = gameState.battleEquipment?.[cat.key === 'weapons' ? 'weapon' : cat.key === 'shields' ? 'shield' : 'module'] === id;
            const canBuy = gameState.level >= eq.level && gameState.coins >= eq.price && !owned;
            const levelLocked = gameState.level < eq.level;

            const card = document.createElement('div');
            card.className = `eq-shop-card rarity-${eq.rarity}${owned ? ' owned' : ''}${equipped ? ' equipped' : ''}${levelLocked ? ' locked' : ''}`;
            card.innerHTML = `
                <div class="eq-card-header">
                    <span class="eq-emoji">${eq.emoji}</span>
                    <div class="eq-info">
                        <div class="eq-name">${eq.name}</div>
                        <div class="eq-desc">${eq.desc}</div>
                    </div>
                </div>
                <div class="eq-card-footer">
                    ${levelLocked ? `<span class="eq-level-req">🔒 Nv.${eq.level}</span>` : ''}
                    ${owned ? (equipped ? '<span class="eq-equipped-tag">✅ Equipado</span>' : '<span class="eq-owned-tag">📦 Comprado</span>') : `<span class="eq-price">${eq.price} 🪙</span>`}
                    ${eq.grantMove ? `<span class="eq-move-tag">${BATTLE_MOVES[eq.grantMove]?.emoji || ''} ${BATTLE_MOVES[eq.grantMove]?.name || ''}</span>` : ''}
                </div>
            `;

            if (owned && !equipped) {
                card.onclick = () => equipBattleItem(cat.key, id);
            } else if (canBuy) {
                card.onclick = () => buyBattleItem(cat.key, id);
            }

            container.appendChild(card);
        });
    });
}

function buyBattleItem(category, itemId) {
    const eq = BATTLE_EQUIPMENT[category][itemId];
    if (!eq) return;
    if (gameState.coins < eq.price) return showNotif('❌', 'No tienes suficientes monedas');
    if (gameState.level < eq.level) return showNotif('🔒', `Necesitas nivel ${eq.level}`);

    // Deducir monedas
    gameState.coins -= eq.price;

    // Añadir al inventario
    if (!gameState.battleInventory) gameState.battleInventory = { weapons: [], shields: [], modules: [] };
    if (!gameState.battleInventory[category]) gameState.battleInventory[category] = [];
    gameState.battleInventory[category].push(itemId);

    // Auto-equipar si no tiene nada
    const slotKey = category === 'weapons' ? 'weapon' : category === 'shields' ? 'shield' : 'module';
    if (!gameState.battleEquipment) gameState.battleEquipment = { weapon: null, shield: null, module: null };
    if (!gameState.battleEquipment[slotKey]) {
        gameState.battleEquipment[slotKey] = itemId;
    }

    showNotif('✅', `¡Compraste ${eq.name}!`);
    saveBattleData();
    renderBattleShop();
    document.getElementById('battleShopCoins').textContent = gameState.coins;
}

function equipBattleItem(category, itemId) {
    const slotKey = category === 'weapons' ? 'weapon' : category === 'shields' ? 'shield' : 'module';
    if (!gameState.battleEquipment) gameState.battleEquipment = { weapon: null, shield: null, module: null };
    gameState.battleEquipment[slotKey] = itemId;
    showNotif('✅', `Equipado: ${BATTLE_EQUIPMENT[category][itemId].name}`);
    saveBattleData();
    renderBattleShop();
}

// ========== PREPARACIÓN DE BATALLA ==========

function showBattlePrep(opponentIndex) {
    battleState.pendingOpponentIndex = opponentIndex;
    const rType = gameState.robotType || 'classic';
    const level = gameState.level || 1;
    const available = getAvailableMoves(rType, level);

    // Agregar moves de equipamiento
    if (gameState.battleEquipment?.weapon) {
        const wep = BATTLE_EQUIPMENT.weapons[gameState.battleEquipment.weapon];
        if (wep?.grantMove && !available.includes(wep.grantMove)) {
            available.push(wep.grantMove);
        }
    }

    // Store available moves for re-rendering
    battleState._availableMoves = available;

    // Selected moves (max 4)
    if (!gameState.selectedBattleMoves) {
        gameState.selectedBattleMoves = [...(DEFAULT_MOVES[rType] || ['tackle', 'tackle', 'tackle', 'tackle'])].slice(0, 4);
    }

    renderPrepMoveGrid();
    updateSelectedMovesDisplay();
    showScreen('battlePrepScreen');
}

function renderPrepMoveGrid() {
    const container = document.getElementById('moveSelectorGrid');
    if (!container) return;
    container.innerHTML = '';

    const available = battleState._availableMoves || [];

    available.forEach(moveId => {
        const move = BATTLE_MOVES[moveId];
        if (!move) return;
        const isSelected = gameState.selectedBattleMoves?.includes(moveId);

        const card = document.createElement('div');
        card.className = `move-select-card type-${move.type}${isSelected ? ' selected' : ''}`;
        card.dataset.moveId = moveId;
        card.innerHTML = `
            <div class="move-sel-top">
                <span class="move-sel-emoji">${move.emoji}</span>
                <span class="move-sel-name">${move.name}</span>
                ${isSelected ? '<span class="move-sel-check">✓</span>' : '<span class="move-sel-add">+</span>'}
            </div>
            <div class="move-sel-info">
                ${move.power > 0 ? `<span>💥 ${move.power}</span>` : '<span>📊 Estado</span>'}
                <span>🎯 ${move.accuracy}%</span>
                <span>PP: ${move.pp}</span>
            </div>
            <div class="move-sel-desc">${move.desc}</div>
        `;
        card.onclick = () => toggleMoveSelect(moveId);
        container.appendChild(card);
    });
}

function toggleMoveSelect(moveId) {
    if (!gameState.selectedBattleMoves) gameState.selectedBattleMoves = [];

    const idx = gameState.selectedBattleMoves.indexOf(moveId);
    if (idx >= 0) {
        // Remove it
        gameState.selectedBattleMoves.splice(idx, 1);
    } else {
        if (gameState.selectedBattleMoves.length >= 4) {
            return showNotif('⚠️', 'Máximo 4 movimientos. Quita uno primero.');
        }
        gameState.selectedBattleMoves.push(moveId);
    }

    // Full re-render for clean state
    renderPrepMoveGrid();
    updateSelectedMovesDisplay();
}

function removeSelectedMove(slotIndex) {
    if (!gameState.selectedBattleMoves || !gameState.selectedBattleMoves[slotIndex]) return;
    gameState.selectedBattleMoves.splice(slotIndex, 1);
    renderPrepMoveGrid();
    updateSelectedMovesDisplay();
}

function updateSelectedMovesDisplay() {
    const container = document.getElementById('selectedMovesBar');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        const moveId = gameState.selectedBattleMoves?.[i];
        const move = moveId ? BATTLE_MOVES[moveId] : null;
        const slot = document.createElement('div');
        slot.className = `prep-slot${move ? ' prep-slot-filled' : ''}`;
        if (move) {
            slot.classList.add(`prep-slot-${move.type}`);
            slot.innerHTML = `
                <span class="prep-slot-emoji">${move.emoji}</span>
                <span class="prep-slot-name">${move.name}</span>
                <span class="prep-slot-remove" title="Quitar">✕</span>
            `;
            slot.onclick = () => removeSelectedMove(i);
        } else {
            slot.innerHTML = `<span class="prep-slot-empty">${i + 1}</span>`;
        }
        container.appendChild(slot);
    }

    const btn = document.getElementById('startBattleBtn');
    if (btn) btn.disabled = (gameState.selectedBattleMoves?.length || 0) < 2;
}

// ========== INICIO DE BATALLA ==========

function startBattle(mode, opponentIndex) {
    battleState.mode = mode;
    battleState.turn = 0;
    battleState.log = [];
    battleState.result = null;
    battleState.animating = false;

    const rType = gameState.robotType || 'classic';
    const level = gameState.level || 1;

    // Si no hay moves seleccionados, usar defaults
    if (!gameState.selectedBattleMoves || gameState.selectedBattleMoves.length < 2) {
        gameState.selectedBattleMoves = [...(DEFAULT_MOVES[rType] || ['tackle', 'tackle', 'tackle', 'tackle'])].slice(0, 4);
    }

    // Crear jugador
    battleState.player = createFighter(
        gameState.charName || 'BeiBot',
        rType,
        level,
        gameState.selectedBattleMoves,
        gameState.battleEquipment || { weapon: null, shield: null, module: null },
        true
    );

    if (mode === 'cpu') {
        const opp = CPU_OPPONENTS[opponentIndex];
        if (!opp) return;
        battleState.currentCpuIndex = opponentIndex;
        battleState.opponent = createFighter(
            opp.name,
            opp.robotType,
            opp.level,
            opp.moves,
            opp.equipment,
            false
        );
        battleState.cpuReward = opp.reward;
    }

    battleState.active = true;
    showBattleScreen();
}

function confirmStartBattle() {
    const oppIdx = battleState.pendingOpponentIndex;
    if (oppIdx == null) return;
    startBattle('cpu', oppIdx);
}

// ========== PANTALLA DE BATALLA ==========

function showBattleScreen() {
    showScreen('battleScreen');
    const p = battleState.player;
    const o = battleState.opponent;

    const el = (id) => document.getElementById(id);
    const pType = ROBOT_BATTLE_TYPES[p.robotType];
    const oType = ROBOT_BATTLE_TYPES[o.robotType];

    // Player info
    el('battlePlayerName').textContent = p.name;
    el('battlePlayerLevel').textContent = `Nv.${p.level}`;
    el('battlePlayerType').textContent = `${pType.emoji} ${pType.name}`;
    el('battlePlayerType').style.color = pType.color;
    updateHpBar('player', p, false);

    // Opponent info
    el('battleOpponentName').textContent = o.name;
    el('battleOpponentLevel').textContent = `Nv.${o.level}`;
    el('battleOpponentType').textContent = `${oType.emoji} ${oType.name}`;
    el('battleOpponentType').style.color = oType.color;
    updateHpBar('opponent', o, false);

    // Robot visuals — Player gets FULL customization
    const pRobot = document.getElementById('battlePlayerRobot');
    const oRobot = document.getElementById('battleOpponentRobot');

    // Clear leftover animation classes from previous battles (KO, attack, hit)
    [pRobot, oRobot].forEach(r => {
        if (r) {
            r.classList.remove('battle-ko-anim', 'battle-attack-anim', 'battle-hit-anim');
            r.style.opacity = '';
            r.style.animation = '';
            r.style.filter = '';
            r.style.transform = '';
        }
    });

    if (pRobot) {
        applyRobotType(pRobot, p.robotType);
        applyRobotCustomization('battlePlayer');
    }
    if (oRobot) {
        applyRobotType(oRobot, o.robotType);

        // Online battle: apply opponent's REAL customization
        if (battleState.mode === 'online' && battleState.opponentCustomization) {
            applyBattleCustomization('battleOpponent', battleState.opponentCustomization);
        } else {
            // CPU opponent: apply distinct body color based on element type
            const oppColors = {
                electric: '#d4a017', fire: '#c0392b', water: '#2471a3',
                steel: '#7f8c8d', psychic: '#8e44ad', neutral: '#555'
            };
            const oppColor = oppColors[o.element] || '#888';
            const oBody = oRobot.querySelector('.robot-body');
            if (oBody) {
                oBody.style.background = `linear-gradient(180deg, ${oppColor} 0%, ${darkenHex(oppColor, 20)} 100%)`;
            }
            oRobot.querySelectorAll('.robot-arm').forEach(a => {
                a.style.background = `linear-gradient(180deg, ${darkenHex(oppColor, 10)} 0%, ${darkenHex(oppColor, 25)} 100%)`;
            });
            oRobot.querySelectorAll('.robot-leg').forEach(l => {
                l.style.background = `linear-gradient(180deg, ${darkenHex(oppColor, 10)} 0%, ${darkenHex(oppColor, 25)} 100%)`;
            });
            // Clear any opponent accessories from previous online battle
            ['battleOpponentRobotHat','battleOpponentRobotGlasses','battleOpponentRobotBowtie',
             'battleOpponentEarringL','battleOpponentEarringR','battleOpponentShoeL','battleOpponentShoeR'].forEach(id => {
                const accEl = document.getElementById(id);
                if (accEl) { accEl.style.display = 'none'; accEl.innerHTML = ''; }
            });
            const oOverlay = document.getElementById('battleOpponentOutfitOverlay');
            if (oOverlay) oOverlay.innerHTML = '';
        }
    }

    // Turn indicator + timer
    updateTurnIndicator(battleState.turn, true);
    startTurnTimer();

    // Spawn arena environment dust particles
    spawnArenaDust();

    // Render move buttons
    renderBattleMoves();
    clearBattleLog();
    addBattleLog(`¡Batalla iniciada! ${p.name} vs ${o.name}`, '⚔️');

    // Show type matchup
    const pElem = p.element;
    const oElem = o.element;
    const matchup = TYPE_CHART[pElem]?.[oElem] || 1;
    if (matchup > 1) addBattleLog(`${pType.emoji} ${pType.name} es fuerte contra ${oType.emoji} ${oType.name}!`, '💪');
    else if (matchup < 1) addBattleLog(`${pType.emoji} ${pType.name} es débil contra ${oType.emoji} ${oType.name}...`, '⚠️');
}

// Apply customization to opponent robot using opponent's data (online battles)
function applyBattleCustomization(prefix, customData) {
    const c = customData;
    const bodyColor = c.bodyColor || '#E74856';
    const bodyEl = document.getElementById(`${prefix}RobotBody`);
    if (bodyEl) {
        bodyEl.style.background = `linear-gradient(180deg, ${bodyColor} 0%, ${darkenHex(bodyColor, 15)} 100%)`;
        const overlayEl = document.getElementById(`${prefix}OutfitOverlay`);
        if (overlayEl) {
            if (c.outfit && c.outfit !== 'none' && typeof SKINS !== 'undefined' && SKINS.outfits?.[c.outfit]) {
                injectSkin(overlayEl, SKINS.outfits[c.outfit].overlay);
            } else {
                overlayEl.innerHTML = '';
            }
        }
    }

    function applySkinAccessory(elId, value, skinCategory) {
        const el = document.getElementById(elId);
        if (!el) return;
        if (value && value !== 'none' && typeof SKINS !== 'undefined' && SKINS[skinCategory]?.[value]) {
            el.style.display = 'flex';
            injectSkin(el, SKINS[skinCategory][value].svg);
        } else {
            el.style.display = 'none';
            el.innerHTML = '';
        }
    }

    applySkinAccessory(`${prefix}RobotHat`, c.hat, 'hats');
    applySkinAccessory(`${prefix}RobotGlasses`, c.glasses, 'glasses');
    applySkinAccessory(`${prefix}RobotBowtie`, c.bowtie, 'bowties');
    applySkinAccessory(`${prefix}EarringL`, c.earring, 'earrings');
    applySkinAccessory(`${prefix}EarringR`, c.earring, 'earrings');
    applySkinAccessory(`${prefix}ShoeL`, c.shoes, 'shoes');
    applySkinAccessory(`${prefix}ShoeR`, c.shoes, 'shoes');

    // Body, arms, legs coloring
    const robotEl = document.getElementById(`${prefix}Robot`);
    if (robotEl) {
        const dk = darkenHex(bodyColor, 22);
        robotEl.querySelectorAll('.robot-arm').forEach(a => {
            a.style.background = `linear-gradient(180deg, ${darkenHex(bodyColor, 15)} 0%, ${dk} 100%)`;
        });
        robotEl.querySelectorAll('.robot-leg').forEach(l => {
            l.style.background = `linear-gradient(180deg, ${darkenHex(bodyColor, 15)} 0%, ${dk} 100%)`;
        });
        if (c.shoes && c.shoes !== 'none') {
            robotEl.querySelectorAll('.robot-foot').forEach(f => f.style.opacity = '0');
        }
    }
}

// Spawn floating dust / particles in the arena environment
function spawnArenaDust() {
    const container = document.getElementById('battleEnvDust');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'env-dust-particle';
        p.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${50 + Math.random() * 50}%;
            animation-delay: ${Math.random() * 8}s;
            animation-duration: ${6 + Math.random() * 6}s;
            width: ${2 + Math.random() * 3}px;
            height: ${2 + Math.random() * 3}px;
            opacity: ${0.2 + Math.random() * 0.4};
        `;
        container.appendChild(p);
    }
}

// Darken a hex color by percentage (for opponent robot)
function darkenHex(hex, pct) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.max(0, Math.floor(r * (1 - pct / 100)));
    g = Math.max(0, Math.floor(g * (1 - pct / 100)));
    b = Math.max(0, Math.floor(b * (1 - pct / 100)));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// Update the turn indicator
function updateTurnIndicator(turnNum, isPlayerTurn) {
    const turnEl = document.getElementById('turnNumber');
    const whoEl = document.getElementById('turnWho');
    if (turnEl) turnEl.textContent = `Turno ${turnNum + 1}`;
    if (whoEl) {
        if (isPlayerTurn) {
            whoEl.textContent = 'Tu turno — ¡Elige un movimiento!';
            whoEl.className = 'turn-who turn-player';
        } else {
            whoEl.textContent = 'Oponente atacando...';
            whoEl.className = 'turn-who turn-opponent';
        }
    }
    // Animate the indicator
    const indicator = document.getElementById('battleTurnIndicator');
    if (indicator) {
        indicator.classList.remove('turn-flash');
        void indicator.offsetWidth;
        indicator.classList.add('turn-flash');
    }
}

function renderBattleMoves() {
    const grid = document.getElementById('battleMoveGrid');
    if (!grid) return;
    grid.innerHTML = '';

    battleState.player.moves.forEach((move, i) => {
        const btn = document.createElement('button');
        const typeColor = ROBOT_BATTLE_TYPES[Object.keys(ROBOT_BATTLE_TYPES).find(k => ROBOT_BATTLE_TYPES[k].element === move.type)]?.color || '#888';
        btn.className = `battle-move-btn type-${move.type}`;
        btn.disabled = move.currentPp <= 0 || battleState.animating;
        btn.innerHTML = `
            <div class="bmove-name">${move.emoji} ${move.name}</div>
            <div class="bmove-info">
                ${move.power > 0 ? `POW:${move.power}` : 'Estado'}
                · PP:${move.currentPp}/${move.pp}
            </div>
        `;
        btn.onclick = () => playerSelectMove(i);
        grid.appendChild(btn);
    });
}

function updateHpBar(who, fighter, animate = true) {
    const hpBar = document.getElementById(`battle${who === 'player' ? 'Player' : 'Opponent'}HpBar`);
    const hpText = document.getElementById(`battle${who === 'player' ? 'Player' : 'Opponent'}HpText`);
    if (!hpBar || !hpText) return;

    const pct = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100);

    // Smooth HP bar animation with CSS transition
    hpBar.style.width = pct + '%';

    // Color transition
    if (pct > 50) hpBar.className = 'battle-hp-fill hp-high';
    else if (pct > 25) hpBar.className = 'battle-hp-fill hp-mid';
    else hpBar.className = 'battle-hp-fill hp-low';

    // Animate HP text counter
    if (animate) {
        const prevHp = parseInt(hpText.textContent) || fighter.maxHp;
        const targetHp = Math.max(0, fighter.currentHp);
        animateHpCounter(hpText, prevHp, targetHp, fighter.maxHp);

        // Shake the info card on damage
        if (targetHp < prevHp) {
            const card = hpBar.closest('.battle-info-card');
            if (card) {
                card.classList.remove('hp-shake');
                void card.offsetWidth; // force reflow
                card.classList.add('hp-shake');
                setTimeout(() => card.classList.remove('hp-shake'), 500);
            }
        }
    } else {
        hpText.textContent = `${Math.max(0, fighter.currentHp)} / ${fighter.maxHp}`;
    }
}

function animateHpCounter(el, from, to, max) {
    const duration = 600;
    const start = performance.now();
    const diff = to - from;

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = Math.round(from + diff * eased);
        el.textContent = `${current} / ${max}`;
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function clearBattleLog() {
    const log = document.getElementById('battleLog');
    if (log) log.innerHTML = '';
}

function addBattleLog(text, icon) {
    const log = document.getElementById('battleLog');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'battle-log-entry';
    entry.innerHTML = `<span class="blog-icon">${icon || '📝'}</span> ${text}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    battleState.log.push({ text, icon });
}

// ========== TURNO DE BATALLA ==========

async function playerSelectMove(moveIndex) {
    // --- MODO ONLINE: enviar al servidor en vez de resolver localmente ---
    if (battleState.mode === 'online') {
        stopTurnTimer();
        sendOnlineMove(moveIndex);
        return;
    }

    // --- MODO CPU: resolver turno localmente ---
    if (battleState.animating || !battleState.active) return;
    battleState.animating = true;
    stopTurnTimer();

    // Disable moves and show "processing" state
    updateTurnIndicator(battleState.turn, false);

    const playerMove = battleState.player.moves[moveIndex];
    const cpuMove = cpuSelectMove(battleState.opponent, battleState.player);

    // Determinar orden (prioridad > velocidad)
    const playerPriority = playerMove.effect?.type === 'priority' ? 1 : 0;
    const cpuPriority = cpuMove.effect?.type === 'priority' ? 1 : 0;

    let firstAttacker, secondAttacker, firstMove, secondMove;

    if (playerPriority > cpuPriority) {
        firstAttacker = battleState.player; firstMove = playerMove;
        secondAttacker = battleState.opponent; secondMove = cpuMove;
    } else if (cpuPriority > playerPriority) {
        firstAttacker = battleState.opponent; firstMove = cpuMove;
        secondAttacker = battleState.player; secondMove = playerMove;
    } else {
        const pSpd = getEffectiveStat(battleState.player, 'spd');
        const oSpd = getEffectiveStat(battleState.opponent, 'spd');
        if (pSpd >= oSpd) {
            firstAttacker = battleState.player; firstMove = playerMove;
            secondAttacker = battleState.opponent; secondMove = cpuMove;
        } else {
            firstAttacker = battleState.opponent; firstMove = cpuMove;
            secondAttacker = battleState.player; secondMove = playerMove;
        }
    }

    const firstDefender = firstAttacker.isPlayer ? battleState.opponent : battleState.player;
    const secondDefender = secondAttacker.isPlayer ? battleState.opponent : battleState.player;

    // === Primer ataque ===
    const results1 = executeMove(firstMove, firstAttacker, firstDefender);
    for (const r of results1) {
        addBattleLog(r.text, r.icon);
        if (r.type === 'damage') {
            await animateAttack(firstAttacker.isPlayer ? 'player' : 'opponent', firstMove.type);
            await animateHit(
                firstDefender.isPlayer ? 'player' : 'opponent',
                firstMove.type,
                r.damage || 0,
                r.effectiveness || 1,
                r.isCrit || false
            );
        }
        if (r.type === 'heal' || r.type === 'drain') {
            showDamageNumber(parseInt(r.text.match(/\d+/)?.[0]) || 0, firstAttacker.isPlayer ? 'player' : 'opponent', true);
        }
        if (r.type === 'recoil') {
            showDamageNumber(parseInt(r.text.match(/\d+/)?.[0]) || 0, firstAttacker.isPlayer ? 'player' : 'opponent', false);
        }
        updateHpBar('player', battleState.player);
        updateHpBar('opponent', battleState.opponent);
        await sleep(400);
    }

    // Check KO después del primer ataque
    if (firstDefender.currentHp <= 0) {
        await endBattle(firstAttacker.isPlayer ? 'win' : 'lose');
        return;
    }

    // Fin de turno del primero
    const turnEnd1 = processTurnEnd(firstAttacker);
    for (const r of turnEnd1) {
        addBattleLog(r.text, r.icon);
        updateHpBar('player', battleState.player);
        updateHpBar('opponent', battleState.opponent);
        await sleep(400);
    }

    if (firstAttacker.currentHp <= 0) {
        await endBattle(firstAttacker.isPlayer ? 'lose' : 'win');
        return;
    }

    // === Segundo ataque ===
    const results2 = executeMove(secondMove, secondAttacker, secondDefender);
    for (const r of results2) {
        addBattleLog(r.text, r.icon);
        if (r.type === 'damage') {
            await animateAttack(secondAttacker.isPlayer ? 'player' : 'opponent', secondMove.type);
            await animateHit(
                secondDefender.isPlayer ? 'player' : 'opponent',
                secondMove.type,
                r.damage || 0,
                r.effectiveness || 1,
                r.isCrit || false
            );
        }
        if (r.type === 'heal' || r.type === 'drain') {
            showDamageNumber(parseInt(r.text.match(/\d+/)?.[0]) || 0, secondAttacker.isPlayer ? 'player' : 'opponent', true);
        }
        if (r.type === 'recoil') {
            showDamageNumber(parseInt(r.text.match(/\d+/)?.[0]) || 0, secondAttacker.isPlayer ? 'player' : 'opponent', false);
        }
        updateHpBar('player', battleState.player);
        updateHpBar('opponent', battleState.opponent);
        await sleep(400);
    }

    // Check KO después del segundo ataque
    if (secondDefender.currentHp <= 0) {
        await endBattle(secondAttacker.isPlayer ? 'win' : 'lose');
        return;
    }

    // Fin de turno del segundo
    const turnEnd2 = processTurnEnd(secondAttacker);
    for (const r of turnEnd2) {
        addBattleLog(r.text, r.icon);
        updateHpBar('player', battleState.player);
        updateHpBar('opponent', battleState.opponent);
        await sleep(400);
    }

    if (secondAttacker.currentHp <= 0) {
        await endBattle(secondAttacker.isPlayer ? 'lose' : 'win');
        return;
    }

    battleState.turn++;
    battleState.animating = false;
    updateTurnIndicator(battleState.turn, true);
    startTurnTimer();
    renderBattleMoves();
}

// ========== ANIMACIONES POKÉMON-STYLE ==========

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Get the FX layer and robot positions for particle spawning
function getBattlePositions() {
    const fxLayer = document.getElementById('battleFxLayer');
    const arena = document.querySelector('.battle-field');
    if (!fxLayer || !arena) return null;

    const arenaRect = arena.getBoundingClientRect();
    const playerRobot = document.getElementById('battlePlayerRobot');
    const oppRobot = document.getElementById('battleOpponentRobot');

    const pRect = playerRobot?.getBoundingClientRect();
    const oRect = oppRobot?.getBoundingClientRect();

    return {
        fxLayer,
        arena: arenaRect,
        player: pRect ? {
            x: pRect.left - arenaRect.left + pRect.width / 2,
            y: pRect.top - arenaRect.top + pRect.height / 2
        } : { x: 80, y: 200 },
        opponent: oRect ? {
            x: oRect.left - arenaRect.left + oRect.width / 2,
            y: oRect.top - arenaRect.top + oRect.height / 2
        } : { x: 260, y: 80 }
    };
}

// Spawn particles based on element type
function spawnTypeParticles(elementType, targetWho) {
    const pos = getBattlePositions();
    if (!pos) return;

    const target = targetWho === 'player' ? pos.player : pos.opponent;
    const fxLayer = pos.fxLayer;

    const configs = {
        electric: { count: 12, mainClass: 'particle-electric', burstClass: 'particle-electric-ball' },
        fire: { count: 10, mainClass: 'particle-fire', burstClass: 'particle-fire-burst' },
        water: { count: 10, mainClass: 'particle-water', burstClass: 'particle-water-wave' },
        steel: { count: 14, mainClass: 'particle-steel', burstClass: 'particle-steel-impact' },
        psychic: { count: 8, mainClass: 'particle-psychic', burstClass: 'particle-psychic-ring' },
        neutral: { count: 8, mainClass: 'particle-neutral', burstClass: 'particle-impact-star' }
    };

    const config = configs[elementType] || configs.neutral;

    // Central burst effect
    const burst = document.createElement('div');
    burst.className = `battle-particle ${config.burstClass}`;
    burst.style.left = (target.x - 30) + 'px';
    burst.style.top = (target.y - 30) + 'px';
    fxLayer.appendChild(burst);

    // Scattered particles
    for (let i = 0; i < config.count; i++) {
        const p = document.createElement('div');
        p.className = `battle-particle ${config.mainClass}`;
        const angle = (Math.PI * 2 * i) / config.count + (Math.random() * 0.5 - 0.25);
        const dist = 20 + Math.random() * 40;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const dx2 = dx * 1.5;
        const dy2 = dy * 1.5;

        p.style.cssText = `
            left: ${target.x + (Math.random() * 10 - 5)}px;
            top: ${target.y + (Math.random() * 10 - 5)}px;
            --dx: ${dx}px; --dy: ${dy}px;
            --dx2: ${dx2}px; --dy2: ${dy2}px;
            --rot: ${Math.random() * 360}deg;
            animation-delay: ${Math.random() * 0.15}s;
        `;
        fxLayer.appendChild(p);
    }

    // Clean up particles after animation
    setTimeout(() => {
        fxLayer.innerHTML = '';
    }, 1000);
}

// Show floating damage number
function showDamageNumber(damage, targetWho, isHeal) {
    const pos = getBattlePositions();
    if (!pos) return;

    const target = targetWho === 'player' ? pos.player : pos.opponent;
    const fxLayer = pos.fxLayer;

    const num = document.createElement('div');
    num.className = `battle-dmg-number${isHeal ? ' heal' : ''}`;
    num.textContent = isHeal ? `+${damage}` : `-${damage}`;
    num.style.left = (target.x - 20 + Math.random() * 20) + 'px';
    num.style.top = (target.y - 30) + 'px';
    fxLayer.appendChild(num);

    setTimeout(() => num.remove(), 1100);
}

// Show effectiveness popup
function showEffectivenessPopup(effectiveness, isCrit) {
    const popup = document.getElementById('battleEffPopup');
    if (!popup) return;

    let text = '';
    let cls = '';
    if (effectiveness > 1) { text = '¡SUPER EFECTIVO!'; cls = 'eff-super'; }
    else if (effectiveness < 1) { text = 'No muy efectivo...'; cls = 'eff-not-very'; }
    if (isCrit) {
        text = text ? text + ' ¡CRÍTICO!' : '¡GOLPE CRÍTICO!';
        cls = cls || 'eff-critical';
    }

    if (!text) return;

    popup.textContent = text;
    popup.className = `battle-effectiveness-popup ${cls}`;
    // Force reflow to restart animation
    void popup.offsetWidth;
    popup.classList.add('show-eff');

    setTimeout(() => {
        popup.classList.remove('show-eff');
    }, 1300);
}

// Screen flash effect for super effective / crits
function screenFlash(type) {
    const arena = document.querySelector('.battle-field');
    if (!arena) return;

    let flash = arena.querySelector('.battle-screen-flash');
    if (!flash) {
        flash = document.createElement('div');
        flash.className = 'battle-screen-flash';
        arena.appendChild(flash);
    }

    flash.classList.remove('flash-active', 'flash-super', 'flash-crit');
    void flash.offsetWidth;
    flash.classList.add('flash-active', type === 'super' ? 'flash-super' : 'flash-crit');

    setTimeout(() => flash.classList.remove('flash-active', 'flash-super', 'flash-crit'), 400);
}

async function animateAttack(who, moveType) {
    const robot = document.getElementById(who === 'player' ? 'battlePlayerRobot' : 'battleOpponentRobot');
    if (!robot) return;

    // Stop idle animation, reflow, then re-enable so CSS class can take over
    robot.style.animation = 'none';
    void robot.offsetWidth;
    robot.style.animation = '';
    robot.classList.add('battle-attack-anim');

    // Launch projectile from attacker toward target
    await animateProjectile(who, moveType);

    await sleep(200);
    robot.classList.remove('battle-attack-anim');

    // Resume idle
    robot.style.animation = '';
}

// Animated projectile that travels from attacker to target
async function animateProjectile(fromWho, elementType) {
    const pos = getBattlePositions();
    if (!pos) return;

    const from = fromWho === 'player' ? pos.player : pos.opponent;
    const to = fromWho === 'player' ? pos.opponent : pos.player;
    const fxLayer = pos.fxLayer;

    // Create projectile element
    const proj = document.createElement('div');
    proj.className = `battle-projectile proj-${elementType || 'neutral'}`;

    // Set starting position
    proj.style.left = from.x + 'px';
    proj.style.top = from.y + 'px';

    // Calculate travel vector
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    proj.style.setProperty('--proj-dx', dx + 'px');
    proj.style.setProperty('--proj-dy', dy + 'px');
    proj.style.setProperty('--proj-angle', angle + 'deg');

    fxLayer.appendChild(proj);

    // Add trail particles along the path
    const trailCount = 6;
    for (let i = 0; i < trailCount; i++) {
        setTimeout(() => {
            const trail = document.createElement('div');
            trail.className = `battle-proj-trail trail-${elementType || 'neutral'}`;
            const progress = i / trailCount;
            trail.style.left = (from.x + dx * progress) + 'px';
            trail.style.top = (from.y + dy * progress) + 'px';
            fxLayer.appendChild(trail);
            setTimeout(() => trail.remove(), 400);
        }, i * 40);
    }

    await sleep(450);
    proj.remove();
}

async function animateHit(who, moveType, damage, effectiveness, isCrit) {
    const robot = document.getElementById(who === 'player' ? 'battlePlayerRobot' : 'battleOpponentRobot');
    if (!robot) return;

    // Spawn type-specific particles at the target
    spawnTypeParticles(moveType || 'neutral', who);

    // Show damage number
    if (damage > 0) {
        showDamageNumber(damage, who, false);
    }

    // Show effectiveness / crit popup
    if (effectiveness !== 1 || isCrit) {
        showEffectivenessPopup(effectiveness, isCrit);
    }

    // Screen flash for super effective or crit
    if (effectiveness > 1) screenFlash('super');
    else if (isCrit) screenFlash('crit');

    // Intense screen shake for heavy hits
    if (damage > 30 || effectiveness > 1 || isCrit) {
        const field = document.querySelector('.battle-field');
        if (field) {
            field.classList.remove('field-shake');
            void field.offsetWidth;
            field.classList.add('field-shake');
            setTimeout(() => field.classList.remove('field-shake'), 500);
        }
    }

    // Robot hit animation
    robot.style.animation = 'none';
    void robot.offsetWidth;
    robot.style.animation = '';
    robot.classList.add('battle-hit-anim');
    await sleep(550);
    robot.classList.remove('battle-hit-anim');

    // Resume idle
    robot.style.animation = '';
}

// ========== FIN DE BATALLA ==========

async function endBattle(result) {
    battleState.active = false;
    battleState.result = result;
    stopTurnTimer();

    // KO animation on the defeated robot
    const loser = result === 'win' ? 'opponent' : 'player';
    const loserRobot = document.getElementById(loser === 'player' ? 'battlePlayerRobot' : 'battleOpponentRobot');
    if (loserRobot) {
        loserRobot.style.animation = 'none';
        void loserRobot.offsetWidth;
        loserRobot.classList.add('battle-ko-anim');
    }

    await sleep(800);

    if (result === 'win') {
        addBattleLog(`🎉 ¡${battleState.player.name} ganó la batalla!`, '🏆');

        const reward = battleState.cpuReward || { xp: 15 };
        addExperience(reward.xp);
        gameState.totalGames++;
        gameState.totalCorrect++;

        // Track ranking stats
        if (!gameState.battleStats) gameState.battleStats = { wins: 0, losses: 0, elo: 1000 };
        gameState.battleStats.wins++;
        const oppLevel = battleState.opponent?.level || 1;
        const eloGain = Math.max(5, Math.round(15 + (oppLevel - (gameState.level || 1)) * 3));
        gameState.battleStats.elo = Math.max(0, (gameState.battleStats.elo || 1000) + eloGain);

        // Save
        saveBattleData();
        saveProgress();

        await sleep(800);
        showBattleResult('win', reward);
    } else {
        addBattleLog(`💀 ${battleState.player.name} fue derrotado...`, '😢');

        // Small consolation XP
        const xp = Math.floor((battleState.cpuReward?.xp || 10) * 0.3);
        addExperience(xp);
        gameState.totalGames++;

        // Track ranking stats
        if (!gameState.battleStats) gameState.battleStats = { wins: 0, losses: 0, elo: 1000 };
        gameState.battleStats.losses++;
        const oppLevel = battleState.opponent?.level || 1;
        const eloLoss = Math.max(3, Math.round(10 - (oppLevel - (gameState.level || 1)) * 2));
        gameState.battleStats.elo = Math.max(0, (gameState.battleStats.elo || 1000) - eloLoss);

        saveBattleData();
        saveProgress();

        await sleep(800);
        showBattleResult('lose', { xp });
    }
}

function showBattleResult(result, reward) {
    const el = (id) => document.getElementById(id);
    const stats = gameState.battleStats || { wins: 0, losses: 0, elo: 1000 };

    el('battleResultIcon').textContent = result === 'win' ? '🏆' : '😢';
    el('battleResultTitle').textContent = result === 'win' ? '¡Victoria!' : 'Derrota';
    el('battleResultTitle').className = `battle-result-title ${result}`;

    let details = '';
    if (result === 'win') {
        details = `
            <div class="reward-item">⭐ +${reward.xp} XP</div>
            <div class="reward-item">🏅 Ranking: ${stats.elo} ELO</div>
            <div class="reward-item">📊 ${stats.wins}V / ${stats.losses}D</div>
            <div class="reward-item reward-tip">💡 Aprende idiomas para ganar monedas</div>
        `;
    } else {
        details = `
            <div class="reward-item">⭐ +${reward.xp} XP (consolación)</div>
            <div class="reward-item">🏅 Ranking: ${stats.elo} ELO</div>
            <div class="reward-item">📊 ${stats.wins}V / ${stats.losses}D</div>
            <div class="reward-item">💪 ¡Sigue intentándolo!</div>
        `;
    }

    el('battleResultDetails').innerHTML = details;
    el('battleResultOverlay').style.display = 'flex';
}

function closeBattleResult() {
    document.getElementById('battleResultOverlay').style.display = 'none';
    showBattleMenu();
}

// ========== BATALLA ONLINE (WebSocket con reconexión) ==========

let onlineWs = null;
let onlinePlayerIndex = null;
let wsReconnectAttempts = 0;
let wsReconnectTimer = null;
let wsHeartbeatTimer = null;
const WS_MAX_RECONNECT = 5;

function showOnlineBattle() {
    showScreen('onlineBattleScreen');
    const statusEl = document.getElementById('onlineStatus');
    const matchBtn = document.getElementById('onlineMatchBtn');
    
    statusEl.innerHTML = '🔌 Conectando al servidor...';
    matchBtn.disabled = true;
    wsReconnectAttempts = 0;

    connectWebSocket();
}

function connectWebSocket() {
    const statusEl = document.getElementById('onlineStatus');
    const matchBtn = document.getElementById('onlineMatchBtn');
    
    // Connect to WebSocket on port 3001
    const wsHost = location.hostname || 'localhost';
    const wsPort = parseInt(location.port || '3000') + 1;
    const wsUrl = `ws://${wsHost}:${wsPort}`;

    if (onlineWs) {
        try { onlineWs.close(); } catch(e) {}
    }
    clearInterval(wsHeartbeatTimer);

    try {
        onlineWs = new WebSocket(wsUrl);

        onlineWs.onopen = () => {
            console.log('✅ WebSocket conectado a', wsUrl);
            wsReconnectAttempts = 0;
            if (statusEl) statusEl.innerHTML = '✅ Conectado al servidor de batallas';
            if (matchBtn) {
                matchBtn.disabled = false;
                matchBtn.textContent = '🔍 Buscar Oponente';
                matchBtn.onclick = searchOnlineMatch;
            }

            // Client-side heartbeat to keep connection alive
            wsHeartbeatTimer = setInterval(() => {
                if (onlineWs && onlineWs.readyState === WebSocket.OPEN) {
                    try { onlineWs.send(JSON.stringify({ type: 'ping' })); } catch(e) {}
                }
            }, 15000);
        };

        onlineWs.onclose = (e) => {
            console.log('WebSocket cerrado:', e.code, e.reason);
            clearInterval(wsHeartbeatTimer);
            onlineWs = null;

            // If in a battle, try to reconnect
            if (battleState.active && battleState.mode === 'online') {
                attemptReconnect();
                return;
            }

            if (statusEl) statusEl.innerHTML = '❌ Desconectado del servidor';
            if (matchBtn) matchBtn.disabled = true;
        };

        onlineWs.onerror = (err) => {
            console.error('WebSocket error:', err);
            if (statusEl && !battleState.active) {
                statusEl.innerHTML = '❌ Error de conexión — ¿Servidor corriendo?<br><small style="color:rgba(255,255,255,.5)">Necesitas: <code>node server.js</code> en backend/</small>';
            }
        };

        onlineWs.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'pong') return; // heartbeat response
                handleOnlineMsg(data);
            } catch(e) { console.error('WS parse error:', e); }
        };
    } catch(e) {
        if (statusEl) statusEl.innerHTML = '❌ WebSocket no disponible en este navegador';
    }
}

function attemptReconnect() {
    if (wsReconnectAttempts >= WS_MAX_RECONNECT) {
        const statusEl = document.getElementById('onlineStatus');
        if (statusEl) statusEl.innerHTML = '❌ No se pudo reconectar. La batalla se perdió.';
        if (battleState.active) {
            battleState.active = false;
            endBattle('lose');
        }
        return;
    }

    wsReconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, wsReconnectAttempts - 1), 8000); // Exponential backoff: 1s, 2s, 4s, 8s
    console.log(`🔄 Reconectando WebSocket intento ${wsReconnectAttempts}/${WS_MAX_RECONNECT} en ${delay}ms...`);

    addBattleLog?.(`🔄 Reconectando... (intento ${wsReconnectAttempts})`, '🔌');

    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = setTimeout(() => {
        connectWebSocket();
    }, delay);
}

function searchOnlineMatch() {
    if (!onlineWs || onlineWs.readyState !== WebSocket.OPEN) return;

    const statusEl = document.getElementById('onlineStatus');
    const matchBtn = document.getElementById('onlineMatchBtn');

    statusEl.innerHTML = '🔍 Buscando oponente...<br><small style="color:rgba(255,255,255,.5)">Esperando que otro jugador busque batalla</small>';
    matchBtn.textContent = '❌ Cancelar búsqueda';
    matchBtn.onclick = cancelOnlineSearch;

    const rType = gameState.robotType || 'classic';
    const c = gameState.customization || {};
    onlineWs.send(JSON.stringify({
        type: 'join_queue',
        name: gameState.charName || 'BeiBot',
        robotType: rType,
        level: gameState.level || 1,
        moves: gameState.selectedBattleMoves || DEFAULT_MOVES[rType],
        equipment: gameState.battleEquipment || { weapon: null, shield: null, module: null },
        customization: {
            bodyColor: c.bodyColor || '#E74856',
            eyeColor: c.eyeColor || '#E74856',
            hat: c.hat || 'none',
            glasses: c.glasses || 'none',
            bowtie: c.bowtie || 'none',
            earring: c.earring || 'none',
            shoes: c.shoes || 'none',
            outfit: c.outfit || 'none'
        }
    }));
}

function cancelOnlineSearch() {
    if (onlineWs && onlineWs.readyState === WebSocket.OPEN) {
        onlineWs.send(JSON.stringify({ type: 'leave_queue' }));
    }
    const statusEl = document.getElementById('onlineStatus');
    const matchBtn = document.getElementById('onlineMatchBtn');
    statusEl.innerHTML = '✅ Conectado — búsqueda cancelada';
    matchBtn.textContent = '🔍 Buscar Oponente';
    matchBtn.onclick = searchOnlineMatch;
    matchBtn.disabled = false;
}

async function handleOnlineMsg(data) {
    console.log('📩 WS:', data.type, data);
    const statusEl = document.getElementById('onlineStatus');

    switch (data.type) {
        case 'queue_joined':
            statusEl.innerHTML = `🔍 En cola — posición ${data.position}<br><small>Esperando otro jugador...</small>`;
            break;

        case 'queue_left':
            statusEl.innerHTML = '✅ Conectado';
            break;

        case 'battle_start': {
            onlinePlayerIndex = data.playerIndex;
            const oppLevelDisplay = data.opponent.level || 1;
            const myLevelDisplay = gameState.level || 1;
            const levelGap = Math.abs(oppLevelDisplay - myLevelDisplay);
            let matchInfo = `⚔️ ¡Oponente encontrado! <strong>${data.opponent.name}</strong> (Nv.${oppLevelDisplay})`;
            if (levelGap > 3) {
                matchInfo += `<br><small style="color:#ff9800">⚠️ Diferencia de ${levelGap} niveles — ¡prepárate!</small>`;
            }
            statusEl.innerHTML = matchInfo;
            
            // Store opponent customization for rendering
            battleState.opponentCustomization = data.opponent.customization || null;

            // Start the battle
            battleState.mode = 'online';
            battleState.turn = 0;
            battleState.log = [];
            battleState.result = null;
            battleState.onlineBattleId = data.battleId;
            battleState.onlineSocket = onlineWs;

            const rType2 = gameState.robotType || 'classic';
            const level2 = gameState.level || 1;

            battleState.player = createFighter(
                gameState.charName || 'BeiBot', rType2, level2,
                gameState.selectedBattleMoves || DEFAULT_MOVES[rType2],
                gameState.battleEquipment || {},
                true
            );

            battleState.opponent = createFighter(
                data.opponent.name,
                data.opponent.robotType || 'classic',
                data.opponent.level || 1,
                DEFAULT_MOVES[data.opponent.robotType || 'classic'],
                {},
                false
            );

            // Dynamic XP based on opponent level difference
            const oppLvl = data.opponent.level || 1;
            const myLvl = gameState.level || 1;
            const lvlDiff = oppLvl - myLvl;
            const baseXp = 40;
            const bonusXp = Math.max(0, Math.round(lvlDiff * 5));
            battleState.cpuReward = { xp: baseXp + bonusXp };
            battleState.active = true;

            setTimeout(() => {
                showBattleScreen();
                const lvlWarn = Math.abs(lvlDiff) > 3 ? ` ⚠️ (Diferencia de ${Math.abs(lvlDiff)} niveles)` : '';
                addBattleLog(`⚔️ ¡Batalla online contra ${data.opponent.name}!${lvlWarn}`, '🌐');
                addBattleLog('Ambos eligen movimiento a la vez. ¡Selecciona el tuyo!', '👉');
            }, 1000);
            break;
        }

        case 'turn_resolve': {
            // Both players selected moves — resolve with full animations
            battleState.animating = true;
            const myMoveId = data.moves[onlinePlayerIndex];
            const oppMoveId = data.moves[onlinePlayerIndex === 0 ? 1 : 0];

            addBattleLog(`Turno ${data.turn + 1} — Resolviendo...`, '⚡');

            const myMove = BATTLE_MOVES[myMoveId];
            const oppMove = BATTLE_MOVES[oppMoveId];

            // === Player's attack with animations ===
            if (myMove) {
                const results = executeMove(myMove, battleState.player, battleState.opponent);
                for (const r of results) {
                    addBattleLog(r.text, r.icon);
                    if (r.type === 'damage') {
                        await animateAttack('player', myMove.type);
                        await animateHit('opponent', myMove.type, r.damage || 0, r.effectiveness || 1, r.isCrit || false);
                    }
                    if (r.type === 'heal' || r.type === 'drain') {
                        showDamageNumber(parseInt(r.text.match(/\d+/)?.[0]) || 0, 'player', true);
                    }
                    if (r.type === 'recoil') {
                        showDamageNumber(parseInt(r.text.match(/\d+/)?.[0]) || 0, 'player', false);
                    }
                    updateHpBar('player', battleState.player);
                    updateHpBar('opponent', battleState.opponent);
                    await sleep(400);
                }
            }

            // Check KO after player attack
            if (battleState.opponent.currentHp <= 0) {
                battleState.animating = false;
                battleState.active = false;
                if (onlineWs) onlineWs.send(JSON.stringify({ type: 'battle_end', result: 'win' }));
                await endBattle('win');
                break;
            }

            // === Opponent's attack with animations ===
            if (oppMove) {
                const results = executeMove(oppMove, battleState.opponent, battleState.player);
                for (const r of results) {
                    addBattleLog(r.text, r.icon);
                    if (r.type === 'damage') {
                        await animateAttack('opponent', oppMove.type);
                        await animateHit('player', oppMove.type, r.damage || 0, r.effectiveness || 1, r.isCrit || false);
                    }
                    if (r.type === 'heal' || r.type === 'drain') {
                        showDamageNumber(parseInt(r.text.match(/\d+/)?.[0]) || 0, 'opponent', true);
                    }
                    if (r.type === 'recoil') {
                        showDamageNumber(parseInt(r.text.match(/\d+/)?.[0]) || 0, 'opponent', false);
                    }
                    updateHpBar('player', battleState.player);
                    updateHpBar('opponent', battleState.opponent);
                    await sleep(400);
                }
            }

            // Check KO after opponent attack
            if (battleState.player.currentHp <= 0) {
                battleState.animating = false;
                battleState.active = false;
                if (onlineWs) onlineWs.send(JSON.stringify({ type: 'battle_end', result: 'lose' }));
                await endBattle('lose');
                break;
            }

            battleState.animating = false;
            enableMoveButtons(true);
            break;
        }

        case 'move_confirmed':
            addBattleLog('Movimiento enviado. Esperando al oponente...', '⏳');
            break;

        case 'opponent_selecting':
            addBattleLog('Tu oponente está eligiendo...', '🤔');
            break;

        case 'opponent_disconnected':
            addBattleLog('🏆 ¡El oponente se desconectó! Ganas por abandono.', '🏆');
            battleState.active = false;
            setTimeout(() => endBattle('win'), 1500);
            break;

        case 'battle_ended':
            addBattleLog('La batalla ha terminado.', '🏁');
            battleState.active = false;
            setTimeout(() => endBattle(data.result === 'win' ? 'lose' : 'win'), 1500);
            break;

        case 'error':
            showNotif('❌', data.message || 'Error del servidor');
            break;
    }
}

function enableMoveButtons(enabled) {
    document.querySelectorAll('#battleMoveGrid .battle-move-btn').forEach(btn => {
        btn.disabled = !enabled;
        btn.style.opacity = enabled ? '1' : '0.4';
    });
}

function sendOnlineMove(moveIndex) {
    if (!onlineWs || !battleState.active || battleState.mode !== 'online') return;
    
    const moves = battleState.player.moves;
    if (!moves[moveIndex]) return;

    const moveId = moves[moveIndex].id;
    onlineWs.send(JSON.stringify({
        type: 'select_move',
        moveId: moveId
    }));

    // Disable buttons while waiting
    enableMoveButtons(false);
    addBattleLog(`Usaste ${moves[moveIndex].name}. Esperando oponente...`, '⏳');
}

// ========== PERSISTENCIA ==========

function saveBattleData() {
    try {
        const data = {
            battleInventory: gameState.battleInventory,
            battleEquipment: gameState.battleEquipment,
            selectedBattleMoves: gameState.selectedBattleMoves,
            battleStats: gameState.battleStats || { wins: 0, losses: 0, elo: 1000 }
        };
        localStorage.setItem('beimax_battle_data', JSON.stringify(data));

        // Also save to server if token available
        if (gameState.token) {
            fetch('/api/battle/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${gameState.token}`
                },
                body: JSON.stringify(data)
            }).catch(() => {});
        }
    } catch(e) { console.error('Error saving battle data:', e); }
}

function loadBattleData() {
    try {
        const saved = localStorage.getItem('beimax_battle_data');
        if (saved) {
            const data = JSON.parse(saved);
            gameState.battleInventory = data.battleInventory || { weapons: [], shields: [], modules: [] };
            gameState.battleEquipment = data.battleEquipment || { weapon: null, shield: null, module: null };
            gameState.selectedBattleMoves = data.selectedBattleMoves || null;
            gameState.battleStats = data.battleStats || { wins: 0, losses: 0, elo: 1000 };
        } else {
            gameState.battleStats = { wins: 0, losses: 0, elo: 1000 };
        }
    } catch(e) { console.error('Error loading battle data:', e); }
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', loadBattleData);
