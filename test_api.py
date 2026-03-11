"""
Script de pruebas para verificar la API de Beimax
Ejecuta: python test_api.py
"""

import requests
import base64
import json
from pathlib import Path

# Configuración
API_BASE_URL = "http://localhost:5000"

def test_health_check():
    """Prueba el endpoint de health check"""
    print("\n🏥 Probando Health Check...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=3)
        
        if response.status_code == 200:
            print("✅ Health check OK")
            print(f"   Respuesta: {response.json()}")
            return True
        else:
            print(f"❌ Health check falló con código: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando con la API: {e}")
        return False

def load_test_image():
    """Carga una imagen de prueba o crea una dummy"""
    # Crear una imagen de prueba simple (pixel rojo)
    from PIL import Image
    import io
    
    # Crear imagen de 100x100 roja
    img = Image.new('RGB', (100, 100), color='red')
    
    # Convertir a base64
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    img_bytes = buffer.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
    
    return f"data:image/jpeg;base64,{img_base64}"

def test_identify_object():
    """Prueba el endpoint de identificación de objetos"""
    print("\n🔍 Probando Identificación de Objetos...")
    try:
        image_data = load_test_image()
        
        payload = {
            "image": image_data,
            "category": "kitchen"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/identify",
            json=payload,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Identificación OK")
            print(f"   Objeto: {result.get('object')}")
            print(f"   Confianza: {result.get('confidence')}")
            print(f"   Traducciones: {result.get('translations')}")
            return True
        else:
            print(f"❌ Identificación falló con código: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en identificación: {e}")
        return False

def test_validate_object():
    """Prueba el endpoint de validación de objetos"""
    print("\n✓ Probando Validación de Objetos...")
    try:
        image_data = load_test_image()
        
        payload = {
            "image": image_data,
            "expected_object": "cuchillo",
            "category": "kitchen"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/validate",
            json=payload,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Validación OK")
            print(f"   Es correcto: {result.get('isCorrect')}")
            print(f"   Objeto detectado: {result.get('detectedObject')}")
            print(f"   Confianza: {result.get('confidence')}")
            return True
        else:
            print(f"❌ Validación falló con código: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en validación: {e}")
        return False

def test_translate():
    """Prueba el endpoint de traducción"""
    print("\n🌍 Probando Traducción...")
    try:
        payload = {
            "word": "cuchillo",
            "from": "es",
            "to": "en"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/translate",
            json=payload,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Traducción OK")
            print(f"   Palabra original: cuchillo")
            print(f"   Traducción: {result.get('translation')}")
            print(f"   Pronunciación: {result.get('pronunciation')}")
            print(f"   Fonética: {result.get('phonetic')}")
            return True
        else:
            print(f"❌ Traducción falló con código: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en traducción: {e}")
        return False

def test_pronunciation():
    """Prueba el endpoint de pronunciación"""
    print("\n🗣️ Probando Pronunciación...")
    try:
        payload = {
            "word": "knife",
            "language": "en"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/pronounce",
            json=payload,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Pronunciación OK")
            print(f"   Palabra: knife")
            print(f"   Pronunciación: {result.get('pronunciation')}")
            print(f"   Fonética: {result.get('phonetic')}")
            return True
        else:
            print(f"❌ Pronunciación falló con código: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en pronunciación: {e}")
        return False

def run_all_tests():
    """Ejecuta todas las pruebas"""
    print("=" * 60)
    print("🧪 SUITE DE PRUEBAS PARA API BEIMAX")
    print("=" * 60)
    
    results = []
    
    # Health Check
    results.append(("Health Check", test_health_check()))
    
    # Si health check falla, no continuar
    if not results[-1][1]:
        print("\n❌ API no disponible. Asegúrate de que el servidor esté ejecutándose.")
        print("   Ejecuta: python api_server_example.py")
        return
    
    # Resto de pruebas
    results.append(("Identificar Objeto", test_identify_object()))
    results.append(("Validar Objeto", test_validate_object()))
    results.append(("Traducción", test_translate()))
    results.append(("Pronunciación", test_pronunciation()))
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("-" * 60)
    print(f"Total: {passed}/{total} pruebas pasadas")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 ¡Todas las pruebas pasaron! Tu API está lista.")
    else:
        print(f"\n⚠️ {total - passed} pruebas fallaron. Revisa los errores arriba.")

if __name__ == "__main__":
    # Verificar dependencias
    try:
        from PIL import Image
    except ImportError:
        print("⚠️ Instalando Pillow...")
        import subprocess
        subprocess.check_call(['pip', 'install', 'pillow'])
        from PIL import Image
    
    run_all_tests()
