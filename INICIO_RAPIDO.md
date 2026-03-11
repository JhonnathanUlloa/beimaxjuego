# 🚀 Guía de Inicio Rápido - Beimax

## 📦 Instalación

### 1. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env y cambiar JWT_SECRET por una clave segura
```

### 3. Iniciar el Backend

```bash
# En la carpeta backend
npm start

# O para desarrollo con auto-reload
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 4. Abrir el Juego

Abre tu navegador y ve a **http://localhost:3000**

(También puedes abrir directamente `index.html`, pero usando el servidor tienes todas las funcionalidades)

## 🎮 Cómo Jugar

### Primera Vez

1. **Crear Cuenta**: Registrate con usuario, email y contraseña
2. **Seleccionar Idiomas**:
   - **Idioma Nativo**: Para ver explicaciones e instrucciones
   - **Idioma a Aprender**: En este idioma aparecerán las palabras y preguntas
3. **Elegir Categoría**: Cocina, Oficina, Taller u Hogar
4. **Seleccionar Modo de Juego**

### Modos de Juego

#### 🔍 Modo 1: Muestra el Objeto
- El juego te dice una palabra en el **idioma que estás aprendiendo**
- Muestra ese objeto a la cámara
- Ganas **5 monedas** y **10 EXP** por respuesta correcta

#### ❓ Modo 2: ¿Qué es esto?
- Muestra cualquier objeto a la cámara
- El juego lo identifica
- Responde preguntas sobre cómo se escribe o pronuncia en el **idioma que estás aprendiendo**
- Ganas **8 monedas** y **15 EXP** por respuesta correcta

## 🆙 Sistema de Niveles

- Cada nivel requiere **100 EXP × Nivel actual**
- Al subir de nivel recibes **10 × Nivel monedas** de bonificación
- Ejemplo: Nivel 1→2 = 100 EXP, Nivel 2→3 = 200 EXP, etc.

## 🔥 Sistema de Rachas

- Juega todos los días para mantener tu racha
- Si dejas de jugar un día, tu racha se reinicia
- Cuanto más larga tu racha, más motivación para seguir aprendiendo

## 🎨 Personalización

### Colores
- **Cuerpo**: 6 colores diferentes (rojo incluido gratis)
- **Ojos**: 6 colores (rojo incluido gratis)

### Accesorios
- **Sombreros**: Sombrero de copa, corona, gorra, etc.
- **Gafas**: Lentes normales, de sol, goggles
- **Corbatas**: Corbata clásica, moño, joya

Todo se compra con las monedas que ganas jugando.

## 🏆 Logros

Desbloquea logros especiales:
- 🎮 **Primer Juego**: Completa tu primer juego
- 🔥 **Racha de 7 días**: 7 días consecutivos jugando
- 🏆 **Mes Completo**: 30 días consecutivos
- ⭐ **Nivel 10**: Alcanza el nivel 10
- 💫 **Nivel 25**: Alcanza el nivel 25
- ✅ **100 Respuestas**: 100 respuestas correctas
- 🎯 **500 Respuestas**: 500 respuestas correctas
- 👑 **Maestro de Categoría**: Domina una categoría

## 🔧 Solución de Problemas

### No puedo iniciar sesión
1. Verifica que el backend esté ejecutándose
2. Revisa la consola del navegador para errores
3. Asegúrate de que el archivo `.env` esté configurado

### La cámara no funciona
1. Permite acceso a la cámara cuando el navegador lo solicite
2. Verifica que ninguna otra aplicación esté usando la cámara
3. Intenta con otro navegador

### API de IA no conecta
1. Verifica que tu servidor de IA esté ejecutándose
2. Revisa la URL en `api-service.js`
3. El juego funcionará en modo simulación sin la IA

## 📱 Compatibilidad

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 🎯 Consejos para Aprender Mejor

1. **Juega todos los días** para mantener tu racha
2. **Practica todas las categorías** para vocabulario variado
3. **Alterna entre modos de juego** para diferentes tipos de práctica
4. **Repite los objetos que falles** para reforzar el aprendizaje

## 🛠️ Para Desarrolladores

### Estructura del Proyecto

```
beimaxjuego/
├── backend/
│   ├── server.js           # Servidor Express
│   ├── package.json
│   ├── .env.example
│   └── beimax.db          # Base de datos SQLite (se crea automáticamente)
├── index.html             # Interfaz principal
├── styles.css             # Estilos (blanco y rojo)
├── script.js              # Lógica del juego
├── backend-service.js     # Comunicación con backend
├── api-service.js         # Integración con API de IA
└── README.md
```

### Base de Datos

El backend usa SQLite con las siguientes tablas:
- `users`: Información de usuarios
- `user_profiles`: Perfil, nivel, monedas, rachas
- `robot_customization`: Personalización del robot
- `category_progress`: Progreso por categoría
- `achievements`: Logros desbloqueados
- `streak_history`: Historial de días jugados

### API Endpoints

Ver documentación completa en `INTEGRACION_API.md`

**Autenticación:**
- POST `/api/auth/register` - Registro
- POST `/api/auth/login` - Login

**Perfil:**
- GET `/api/user/profile` - Obtener perfil
- PUT `/api/user/languages` - Actualizar idiomas
- PUT `/api/user/customization` - Actualizar personalización

**Progreso:**
- POST `/api/game/result` - Guardar resultado de juego
- GET `/api/user/progress` - Obtener progreso
- GET `/api/user/streak-history` - Historial de rachas

**Logros:**
- GET `/api/user/achievements` - Obtener logros
- POST `/api/user/achievement` - Desbloquear logro

## 🔐 Seguridad

En producción:
1. Cambiar `JWT_SECRET` en `.env`
2. Usar HTTPS
3. Implementar rate limiting
4. Validar inputs del usuario
5. Usar contraseñas fuertes

## 🚀 Próximas Características

- [ ] Modo multijugador
- [ ] Más categorías de objetos
- [ ] Sistema de amigos
- [ ] Ranking global
- [ ] Integración con redes sociales
- [ ] App móvil nativa

---

**¡Diviértete aprendiendo idiomas con Beimax! 🤖❤️**
