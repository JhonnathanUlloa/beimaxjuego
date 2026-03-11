# 🔌 Guía de Integración con API de IA Local

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Estructura de la API](#estructura-de-la-api)
3. [Endpoints Requeridos](#endpoints-requeridos)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Solución de Problemas](#solución-de-problemas)

---

## Configuración Inicial

### 1. Preparar el Servidor API

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor de ejemplo
python api_server_example.py
```

El servidor se ejecutará en `http://localhost:5000`

### 2. Configurar la URL en el Cliente

En `api-service.js`, modifica la configuración:

```javascript
const API_CONFIG = {
    baseURL: 'http://localhost:5000', // URL de tu API
    endpoints: {
        identifyObject: '/api/identify',
        validateObject: '/api/validate',
        translate: '/api/translate',
        pronounce: '/api/pronounce'
    },
    timeout: 5000
};
```

### 3. Verificar Conexión

Abre `index.html` en tu navegador y verifica la consola del navegador. Deberías ver:

```
✅ API conectada correctamente
```

Si ves:
```
⚠️ API no disponible - usando modo de simulación
```

El juego funcionará pero usará respuestas simuladas en lugar de tu IA.

---

## Estructura de la API

### Arquitectura General

```
Cliente (Navegador)
    ↓ HTTP POST con imagen base64
API Server (Python/Flask)
    ↓ Procesa imagen
Tu Modelo de IA
    ↓ Retorna predicción
API Server
    ↓ JSON Response
Cliente
```

---

## Endpoints Requeridos

### 1. Health Check
**Endpoint**: `GET /health`

**Respuesta**:
```json
{
    "status": "ok",
    "message": "API Beimax funcionando correctamente"
}
```

---

### 2. Identificar Objeto
**Endpoint**: `POST /api/identify`

**Request Body**:
```json
{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "category": "kitchen"
}
```

**Response**:
```json
{
    "object": "cuchillo",
    "confidence": 0.95,
    "language": "es",
    "translations": {
        "en": "knife",
        "fr": "couteau",
        "zh": "刀"
    }
}
```

**Implementación**:
```python
@app.route('/api/identify', methods=['POST'])
def identify_object():
    data = request.json
    image = decode_base64_image(data['image'])
    category = data['category']
    
    # TU CÓDIGO AQUÍ
    # resultado = tu_modelo.predict(image)
    
    return jsonify({
        'object': 'nombre_detectado',
        'confidence': 0.95,
        'language': 'es',
        'translations': {...}
    })
```

---

### 3. Validar Objeto
**Endpoint**: `POST /api/validate`

**Request Body**:
```json
{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "expected_object": "cuchillo",
    "category": "kitchen"
}
```

**Response**:
```json
{
    "isCorrect": true,
    "detectedObject": "cuchillo",
    "confidence": 0.92
}
```

**Implementación**:
```python
@app.route('/api/validate', methods=['POST'])
def validate_object():
    data = request.json
    image = decode_base64_image(data['image'])
    expected = data['expected_object']
    
    # TU CÓDIGO AQUÍ
    # detected = tu_modelo.predict(image)
    # is_correct = detected.lower() == expected.lower()
    
    return jsonify({
        'isCorrect': True,
        'detectedObject': 'objeto_detectado',
        'confidence': 0.92
    })
```

---

### 4. Traducir Palabra
**Endpoint**: `POST /api/translate`

**Request Body**:
```json
{
    "word": "cuchillo",
    "from": "es",
    "to": "en"
}
```

**Response**:
```json
{
    "translation": "knife",
    "pronunciation": "naif",
    "phonetic": "/naɪf/"
}
```

**Implementación**:
```python
@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.json
    word = data['word']
    from_lang = data['from']
    to_lang = data['to']
    
    # TU CÓDIGO AQUÍ
    # Usa un diccionario, API de traducción, o modelo
    
    return jsonify({
        'translation': 'traducción',
        'pronunciation': 'pronunciación',
        'phonetic': '/fonética/'
    })
```

---

### 5. Obtener Pronunciación
**Endpoint**: `POST /api/pronounce`

**Request Body**:
```json
{
    "word": "knife",
    "language": "en"
}
```

**Response**:
```json
{
    "pronunciation": "naif",
    "phonetic": "/naɪf/",
    "audioURL": null
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Integración con Modelo YOLO para detección

```python
from ultralytics import YOLO

# Cargar modelo
model = YOLO('yolov8n.pt')

@app.route('/api/identify', methods=['POST'])
def identify_object():
    data = request.json
    image = decode_base64_image(data['image'])
    
    # Convertir PIL a numpy
    image_np = np.array(image)
    
    # Predecir con YOLO
    results = model(image_np)
    
    # Obtener objeto con mayor confianza
    if len(results[0].boxes) > 0:
        box = results[0].boxes[0]
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        object_name = model.names[class_id]
        
        # Traducir nombre del objeto
        translations = get_translations(object_name)
        
        return jsonify({
            'object': object_name,
            'confidence': confidence,
            'language': 'es',
            'translations': translations
        })
    
    return jsonify({'error': 'No se detectó ningún objeto'}), 400
```

### Ejemplo 2: Integración con Google Translate

```python
from googletrans import Translator

translator = Translator()

@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.json
    word = data['word']
    from_lang = data['from']
    to_lang = data['to']
    
    # Traducir
    result = translator.translate(word, src=from_lang, dest=to_lang)
    
    # Obtener pronunciación (si está disponible)
    pronunciation = result.pronunciation or result.text
    
    return jsonify({
        'translation': result.text,
        'pronunciation': pronunciation,
        'phonetic': f'/{pronunciation}/'
    })
```

### Ejemplo 3: Procesamiento de Imagen con OpenCV

```python
import cv2

@app.route('/api/validate', methods=['POST'])
def validate_object():
    data = request.json
    image = decode_base64_image(data['image'])
    expected = data['expected_object']
    
    # Convertir a OpenCV
    image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    
    # Preprocesar imagen
    image_preprocessed = preprocess_image(image_cv)
    
    # Predecir con tu modelo
    prediction = your_model.predict(image_preprocessed)
    detected_object = get_object_name(prediction)
    confidence = get_confidence(prediction)
    
    # Validar
    is_correct = detected_object.lower() == expected.lower()
    
    return jsonify({
        'isCorrect': is_correct,
        'detectedObject': detected_object,
        'confidence': confidence
    })
```

---

## Solución de Problemas

### ❌ Error: CORS Policy

**Problema**: El navegador bloquea las peticiones

**Solución**: Asegúrate de tener CORS habilitado
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
```

---

### ❌ Error: API no disponible

**Problema**: El juego no puede conectarse a la API

**Soluciones**:
1. Verifica que el servidor esté ejecutándose
2. Verifica la URL en `api-service.js`
3. Revisa el firewall
4. Verifica la consola del navegador para errores

---

### ❌ Error: Timeout

**Problema**: La API tarda mucho en responder

**Soluciones**:
1. Aumenta el timeout en `api-service.js`
2. Optimiza tu modelo de IA
3. Reduce el tamaño de las imágenes
4. Usa async/await correctamente

---

### ❌ Error: Invalid Base64

**Problema**: Error al decodificar imagen

**Solución**:
```python
def decode_base64_image(image_data):
    # Remover prefijo si existe
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    # Agregar padding si es necesario
    missing_padding = len(image_data) % 4
    if missing_padding:
        image_data += '=' * (4 - missing_padding)
    
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
    return image
```

---

## 📊 Métricas de Rendimiento Recomendadas

- **Tiempo de respuesta**: < 2 segundos
- **Precisión mínima**: > 80%
- **Tamaño de imagen**: 640x480 o menor
- **Formato de imagen**: JPEG con calidad 80-90%

---

## 🔒 Seguridad

### Producción
Si despliegas esto en producción:

1. **Autenticación**: Agrega tokens JWT
2. **Rate Limiting**: Limita peticiones por IP
3. **Validación**: Valida tamaño y formato de imágenes
4. **HTTPS**: Usa siempre HTTPS en producción
5. **Sanitización**: Sanitiza inputs del usuario

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["100 per hour"]
)

@app.route('/api/identify', methods=['POST'])
@limiter.limit("10 per minute")
def identify_object():
    # Tu código aquí
    pass
```

---

## 🚀 Optimizaciones

### 1. Caché de Traducciones
```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_translation(word, from_lang, to_lang):
    # Tu lógica de traducción
    pass
```

### 2. Procesamiento Asíncrono
```python
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

@app.route('/api/identify', methods=['POST'])
def identify_object():
    # Procesar en background
    future = executor.submit(process_image, image)
    result = future.result(timeout=5)
    return jsonify(result)
```

### 3. Batch Processing
Si recibes muchas peticiones, procesa en lotes.

---

## 📚 Recursos Adicionales

- **Flask**: https://flask.palletsprojects.com/
- **YOLO**: https://github.com/ultralytics/ultralytics
- **OpenCV**: https://opencv.org/
- **TensorFlow**: https://www.tensorflow.org/
- **PyTorch**: https://pytorch.org/

---

## ✅ Checklist de Integración

- [ ] Servidor API ejecutándose
- [ ] CORS configurado correctamente
- [ ] Endpoint de health check respondiendo
- [ ] Modelo de IA cargado y funcionando
- [ ] Pruebas con imágenes reales
- [ ] Manejo de errores implementado
- [ ] Logs configurados
- [ ] Optimización de rendimiento
- [ ] Documentación actualizada

---

**¡Listo! Ahora tu juego Beimax está conectado con tu IA local. 🤖✨**
