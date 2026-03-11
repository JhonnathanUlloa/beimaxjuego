// ============================================
// BeiMax AI Service — Hybrid Architecture
// ============================================
// 1. COCO-SSD (TensorFlow.js) → Object detection in browser (vision)
// 2. DeepSeek R1 (LM Studio)  → Translation, pronunciation, chat (text)
// ============================================
// DeepSeek R1 es un modelo de TEXTO. No puede ver imágenes.
// COCO-SSD (80 objetos COCO) corre en el navegador para detección visual.
// ============================================

const API_CONFIG = {
    baseURL: '',
    endpoints: {
        aiHealth: '/api/ai/health',
        chat: '/api/ai/chat',
        translate: '/api/ai/translate'
    },
    timeout: 120000
};

// ============================================
// COCO-SSD Object Detection (Client-Side)
// ============================================

let cocoModel = null;
let cocoModelLoading = false;
let cocoReady = false;

/**
 * Helper: promesa con timeout
 */
function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${label} tardó más de ${ms / 1000}s`)), ms)
        )
    ]);
}

/**
 * Carga el modelo COCO-SSD (una sola vez, se cachea)
 */
async function loadCocoModel() {
    if (cocoModel) return cocoModel;
    if (cocoModelLoading) {
        // Esperar máximo 45s a que termine otra carga en curso
        const start = Date.now();
        while (cocoModelLoading && Date.now() - start < 45000) {
            await new Promise(r => setTimeout(r, 300));
        }
        if (cocoModel) return cocoModel;
        // Si sigue cargando después de 45s, reset y reintentar
        if (cocoModelLoading) {
            console.warn('⚠️ Carga anterior de COCO-SSD expiró, reintentando...');
            cocoModelLoading = false;
        }
    }
    cocoModelLoading = true;
    try {
        if (typeof cocoSsd === 'undefined') {
            throw new Error('La librería cocoSsd no está disponible. ¿Falta el CDN de TensorFlow.js?');
        }

        const modelsToTry = ['lite_mobilenet_v2'];

        for (const base of modelsToTry) {
            try {
                cocoModel = await withTimeout(
                    cocoSsd.load({ base }),
                    30000,
                    `carga de modelo ${base}`
                );
                cocoReady = true;
                return cocoModel;
            } catch (e) {
                // intentar siguiente modelo
            }
        }

        cocoModel = await withTimeout(cocoSsd.load(), 30000, 'carga de modelo default');
        cocoReady = true;
        return cocoModel;
    } catch (e) {
        console.error('Error cargando COCO-SSD:', e.message || e);
        cocoReady = false;
        return null;
    } finally {
        cocoModelLoading = false;
    }
}

// Mapeo de etiquetas COCO-SSD (inglés) → vocabulario del juego
const COCO_TO_GAME_MAP = {
    // Cocina
    'knife': 'knife', 'fork': 'fork', 'spoon': 'spoon',
    'cup': 'glass', 'wine glass': 'glass', 'bowl': 'plate', 'bottle': 'bottle',
    'banana': 'banana', 'apple': 'apple', 'sandwich': 'sandwich',
    'orange': 'orange', 'broccoli': 'broccoli', 'carrot': 'carrot',
    'pizza': 'pizza', 'donut': 'donut', 'cake': 'cake',
    // Oficina
    'laptop': 'computer', 'keyboard': 'keyboard', 'mouse': 'mouse',
    'cell phone': 'phone', 'remote': 'remote', 'book': 'notebook',
    'scissors': 'scissors',
    // Hogar
    'couch': 'sofa', 'chair': 'chair', 'bed': 'bed',
    'tv': 'television', 'dining table': 'table',
    'potted plant': 'plant', 'clock': 'clock', 'vase': 'vase',
    // Electrodomésticos
    'microwave': 'microwave', 'oven': 'oven', 'toaster': 'toaster',
    'refrigerator': 'refrigerator', 'sink': 'sink',
    // Otros
    'person': 'person', 'cat': 'cat', 'dog': 'dog',
    'car': 'car', 'bicycle': 'bicycle', 'backpack': 'backpack',
    'umbrella': 'umbrella', 'handbag': 'handbag', 'tie': 'tie',
    'teddy bear': 'teddy bear', 'toothbrush': 'toothbrush',
    'hair drier': 'hair dryer'
};

/**
 * Detecta objetos en un elemento de video/canvas/imagen usando COCO-SSD
 * @param {HTMLVideoElement|HTMLCanvasElement|HTMLImageElement} source
 * @returns {Promise<Array>} Array de {label, score, bbox, gameLabel}
 */
async function detectObjectsCoco(source) {
    if (typeof cocoSsd === 'undefined') {
        console.error('COCO-SSD library no cargada.');
        return [];
    }
    const model = await loadCocoModel();
    if (!model) {
        console.error('Modelo COCO-SSD no disponible');
        return [];
    }

    try {
        // Umbral bajo (0.15) para detectar objetos pequeños
        const predictions = await model.detect(source, 20, 0.15);
        return predictions.map(p => ({
            label: p.class.toLowerCase(),
            score: p.score,
            bbox: p.bbox,
            gameLabel: COCO_TO_GAME_MAP[p.class.toLowerCase()] || p.class.toLowerCase()
        }));
    } catch (e) {
        console.error('Error en detección COCO-SSD:', e);
        return [];
    }
}

/**
 * Compara las detecciones de COCO-SSD contra el vocabulario del juego
 * @param {Array} detections - Detecciones COCO-SSD
 * @param {string} expectedObject - Nombre del objeto esperado (cualquier idioma)
 * @param {string} category - Categoría del juego
 * @returns {Object} Resultado: {isCorrect, detectedObject, confidence, matchedItem}
 */
function matchDetectionToVocabulary(detections, expectedObject, category) {
    if (!detections || detections.length === 0) {
        return {
            isCorrect: false,
            detectedObject: 'nada detectado',
            confidence: 0,
            matchedItem: null,
            description: 'No se detectaron objetos. Acerca el objeto a la cámara.'
        };
    }

    // Recoger items de la categoría actual o de todas
    let items = [];
    if (typeof categoryData !== 'undefined') {
        if (category && categoryData[category]) {
            items = categoryData[category].items;
        } else {
            for (const cat of Object.values(categoryData)) {
                items.push(...cat.items);
            }
        }
    }

    const expected = expectedObject.toLowerCase().trim();
    const sorted = [...detections].sort((a, b) => b.score - a.score);

    for (const det of sorted) {
        const cocoLabel = det.label;
        const gameLabel = det.gameLabel;

        for (const item of items) {
            // Coincidencia directa con label inglés
            const matchesEn = item.en && (
                item.en.toLowerCase() === gameLabel ||
                item.en.toLowerCase() === cocoLabel
            );
            const matchesEs = item.es && item.es.toLowerCase() === cocoLabel;

            // Revisar sinónimos si están disponibles
            let matchesSynonym = false;
            if (typeof wordSynonyms !== 'undefined') {
                for (const lang of ['en', 'es', 'fr']) {
                    const syns = wordSynonyms[lang];
                    if (!syns) continue;
                    for (const [key, list] of Object.entries(syns)) {
                        if (list.includes(cocoLabel) || list.includes(gameLabel)) {
                            if (item.en?.toLowerCase() === key ||
                                item.es?.toLowerCase() === key ||
                                item.fr?.toLowerCase() === key) {
                                matchesSynonym = true;
                                break;
                            }
                        }
                    }
                    if (matchesSynonym) break;
                }
            }

            if (matchesEn || matchesEs || matchesSynonym) {
                const isCorrect = (
                    item.es?.toLowerCase() === expected ||
                    item.en?.toLowerCase() === expected ||
                    item.fr?.toLowerCase() === expected
                );

                return {
                    isCorrect,
                    detectedObject: item.es || gameLabel,
                    detectedObjectEn: item.en || cocoLabel,
                    confidence: det.score,
                    matchedItem: item,
                    cocoLabel: cocoLabel,
                    description: `Detectado: ${item.es} (${(det.score * 100).toFixed(0)}% confianza)`
                };
            }
        }
    }

    // Sin match en vocabulario — devolver la mejor detección cruda
    const best = sorted[0];
    return {
        isCorrect: false,
        detectedObject: best.gameLabel || best.label,
        detectedObjectEn: best.label,
        confidence: best.score,
        matchedItem: null,
        cocoLabel: best.label,
        description: `Detectado: ${best.label} — no es un objeto del juego`
    };
}

// ============================================
// DeepSeek R1 (via Backend Proxy) — Solo Texto
// ============================================

function getAuthHeaders() {
    const token = gameState?.token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

/**
 * Traduce una palabra usando DeepSeek R1
 */
async function translateWordAPI(word, fromLang, toLang) {
    try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.translate}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ word, fromLang, toLang }),
            signal: AbortSignal.timeout(60000)
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en translateWordAPI:', error);
        throw error;
    }
}

/**
 * Chat con DeepSeek R1
 */
async function chatWithAI(userMessage, systemPrompt) {
    try {
        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: userMessage });

        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.chat}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ messages }),
            signal: AbortSignal.timeout(API_CONFIG.timeout)
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.content || '';
    } catch (error) {
        console.error('Error en chatWithAI:', error);
        throw error;
    }
}

/**
 * Obtiene pronunciación via DeepSeek R1
 */
async function getPronunciationAPI(word, language) {
    try {
        const langNames = { es: 'español', en: 'inglés', fr: 'francés' };
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.chat}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'Responde SOLO con JSON válido.' },
                    { role: 'user', content: `Dame la pronunciación de "${word}" en ${langNames[language] || language}. JSON: {"pronunciation": "...", "phonetic": "/IPA/"}` }
                ],
                temperature: 0.1,
                max_tokens: 1024
            }),
            signal: AbortSignal.timeout(60000)
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        const content = data.content || '';
        try {
            const match = content.match(/\{[\s\S]*\}/);
            return match ? JSON.parse(match[0]) : { pronunciation: word, phonetic: `/${word}/` };
        } catch {
            return { pronunciation: word, phonetic: `/${word}/` };
        }
    } catch (error) {
        console.error('Error en getPronunciationAPI:', error);
        throw error;
    }
}

/**
 * Verifica salud de LM Studio / DeepSeek R1
 */
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.aiHealth}`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}

// ============================================
// Funciones Unificadas (COCO-SSD + DeepSeek)
// ============================================

/**
 * Identifica un objeto — COCO-SSD en el navegador
 * @param {HTMLVideoElement|HTMLCanvasElement} source - Fuente de video/canvas
 * @param {string} category - Categoría del juego
 */
async function apiIdentifyObject(source, category, useFallback = true) {
    try {
        const detections = await detectObjectsCoco(source);
        if (detections.length > 0) {
            const best = detections.sort((a, b) => b.score - a.score)[0];
            let allItems = [];
            if (typeof categoryData !== 'undefined') {
                for (const cat of Object.values(categoryData)) allItems.push(...cat.items);
            }
            const matched = allItems.find(item =>
                item.en?.toLowerCase() === best.gameLabel ||
                item.en?.toLowerCase() === best.label
            );

            return {
                object: matched ? matched.es : best.gameLabel,
                confidence: best.score,
                language: 'es',
                translations: matched ? {
                    es: matched.es, en: matched.en, fr: matched.fr
                } : { es: best.gameLabel, en: best.label, fr: '' },
                description: `COCO-SSD: ${best.label} (${(best.score * 100).toFixed(0)}%)`
            };
        }
    } catch (e) {
        // COCO-SSD falló, usar fallback
    }

    if (useFallback) return getFallbackResponse('identifyObject', null, category);
    throw new Error('No se pudo detectar ningún objeto');
}

/**
 * Valida un objeto — COCO-SSD + matching vocabulario
 * @param {HTMLVideoElement|HTMLCanvasElement} source - Fuente de video/canvas
 * @param {string} expectedObject - Objeto esperado
 * @param {string} category - Categoría del juego
 */
async function apiValidateObject(source, expectedObject, category, useFallback = true) {
    try {
        const detections = await detectObjectsCoco(source);
        if (detections.length > 0) {
            return matchDetectionToVocabulary(detections, expectedObject, category);
        }
        return {
            isCorrect: false,
            detectedObject: 'nada detectado',
            confidence: 0,
            matchedItem: null,
            cocoLabel: null,
            description: 'No se detectó ningún objeto. Acerca el objeto con buena iluminación.'
        };
    } catch (e) {
        if (useFallback) return getFallbackResponse('validateObject', null, expectedObject, category);
        throw e;
    }
}

/**
 * Traduce una palabra (DeepSeek R1 o datos locales)
 */
async function apiTranslateWord(word, fromLang, toLang, useFallback = true) {
    try {
        if (apiAvailable) return await translateWordAPI(word, fromLang, toLang);
    } catch (e) {
        // usar fallback
    }
    if (useFallback) return getFallbackResponse('translate', word, fromLang, toLang);
    throw new Error('Traducción fallida');
}

/**
 * Obtiene pronunciación (DeepSeek R1 o fallback local)
 */
async function apiGetPronunciation(word, language, useFallback = true) {
    try {
        if (apiAvailable) return await getPronunciationAPI(word, language);
    } catch (e) {
        console.warn('DeepSeek pronunciation error:', e);
    }
    if (useFallback) return getFallbackResponse('pronunciation', word, language);
    throw new Error('Pronunciación fallida');
}

// ============================================
// Manejo de Errores
// ============================================

function handleAPIError(error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return 'La IA tardó demasiado. Intenta de nuevo.';
    }
    if (error.message?.includes('Failed to fetch')) {
        return 'No se pudo conectar con el servidor.';
    }
    if (error.message?.includes('502') || error.message?.includes('LM Studio')) {
        return 'LM Studio no disponible. Verifica http://172.20.10.4:1234';
    }
    return 'Error inesperado. Intenta de nuevo.';
}

// ============================================
// Fallback / Simulación
// ============================================

function getFallbackResponse(functionName, ...args) {
    console.warn(`⚠️ Usando fallback simulado para: ${functionName}`);
    switch (functionName) {
        case 'identifyObject': return simulateIdentifyObject(...args);
        case 'validateObject': return simulateValidateObject(...args);
        case 'translate': return simulateTranslate(...args);
        case 'pronunciation': return simulatePronunciation(...args);
        default: return null;
    }
}

function simulateIdentifyObject(imageData, category) {
    const items = (typeof categoryData !== 'undefined' && categoryData[category]) ? categoryData[category].items : [];
    if (!items.length) return { object: 'desconocido', confidence: 0.1 };
    const item = items[Math.floor(Math.random() * items.length)];
    const lang = gameState?.nativeLanguage || 'es';
    return {
        object: item[lang], confidence: 0.85 + Math.random() * 0.15, language: lang,
        translations: { es: item.es, en: item.en, fr: item.fr }
    };
}

function simulateValidateObject(imageData, expectedObject, category) {
    const isCorrect = Math.random() > 0.3;
    return { isCorrect, detectedObject: isCorrect ? expectedObject : 'objeto desconocido', confidence: isCorrect ? 0.9 : 0.4 };
}

function simulateTranslate(word, fromLang, toLang) {
    let translation = word;
    if (typeof categoryData !== 'undefined') {
        for (const cat of Object.values(categoryData)) {
            for (const item of cat.items) {
                if (item[fromLang]?.toLowerCase() === word.toLowerCase()) {
                    translation = item[toLang] || word;
                    break;
                }
            }
        }
    }
    return { translation, pronunciation: translation, phonetic: `/${translation}/` };
}

function simulatePronunciation(word, language) {
    return { pronunciation: word, phonetic: `/${word}/`, audioURL: null };
}

// ============================================
// Inicialización
// ============================================

let apiAvailable = false;
let aiModels = [];

async function initializeAPI() {
    // 1. Cargar COCO-SSD para detección de objetos por cámara
    loadCocoModel();

    // 2. Verificar DeepSeek R1 para traducciones/chat
    try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.aiHealth}`, {
            signal: AbortSignal.timeout(5000)
        });
        if (response.ok) {
            const data = await response.json();
            apiAvailable = data.status === 'ok';
            aiModels = data.models || [];
        }
    } catch {
        apiAvailable = false;
    }

    return apiAvailable;
}

// Re-check DeepSeek R1 cada 30s
setInterval(async () => {
    apiAvailable = await checkAPIHealth();
}, 30000);

// ============================================
// Diagnóstico Visual — Dibujar detecciones en canvas
// ============================================

/**
 * Función de diagnóstico: detecta y dibuja los bboxes sobre el canvas
 * Llámala desde la consola del navegador: await debugDetection()
 */
async function debugDetection() {
    const video = document.getElementById('webcam1');
    const canvas = document.getElementById('canvas1');
    if (!video || !canvas) {
        console.error('No se encontró video/canvas. ¿La cámara está abierta?');
        return;
    }
    // Hacer el canvas visible para depurar
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '9999';
    canvas.style.border = '3px solid red';
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    console.log(`📐 Canvas: ${canvas.width}x${canvas.height}`);
    console.log(`📐 Video: ${video.videoWidth}x${video.videoHeight}, playing: ${!video.paused}`);
    console.log(`📦 COCO-SSD cargado: ${cocoReady}, modelo: ${cocoModel ? 'sí' : 'no'}`);

    const detections = await detectObjectsCoco(canvas);
    console.log(`🔍 Detecciones totales: ${detections.length}`);

    // Dibujar cada detección
    ctx.lineWidth = 3;
    ctx.font = '16px Arial';
    detections.forEach((det, i) => {
        const [x, y, w, h] = det.bbox;
        const color = det.score > 0.5 ? '#22c55e' : det.score > 0.3 ? '#eab308' : '#ef4444';
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = color;
        ctx.fillRect(x, y - 20, ctx.measureText(det.label).width + 60, 20);
        ctx.fillStyle = 'white';
        ctx.fillText(`${det.label} ${(det.score * 100).toFixed(0)}%`, x + 4, y - 5);
        console.log(`  [${i}] ${det.label} → ${det.gameLabel} | ${(det.score * 100).toFixed(1)}% | bbox: [${det.bbox.map(v => v.toFixed(0)).join(',')}]`);
    });

    if (detections.length === 0) {
        ctx.fillStyle = 'red';
        ctx.font = '24px Arial';
        ctx.fillText('❌ No se detectó ningún objeto', 20, 40);
    }

    // Ocultar canvas después de 8 segundos
    setTimeout(() => {
        canvas.style.display = 'none';
        canvas.style.position = '';
        canvas.style.zIndex = '';
        canvas.style.border = '';
    }, 8000);

    return detections;
}
