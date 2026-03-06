# 🤖 Beimax - Juego Educativo de Idiomas

Juego interactivo para aprender idiomas usando visión por computadora y un robot virtual personalizable.

## 🎮 Características

- ✅ **Autenticación de usuarios** con JWT
- ✅ **Sistema de niveles** (100 EXP × nivel actual)
- ✅ **Sistema de rachas** (días consecutivos jugando)
- ✅ **Personalización del robot** (colores, sombreros, lentes, accesorios)
- ✅ **Base de datos SQLite** para persistencia
- ✅ **Dos modos de juego**: Búsqueda de objetos y Preguntas
- ✅ **Logros desbloqueables**
- ✅ **Tema blanco y rojo**

## 🚀 Inicio Rápido

### Prerequisitos
- [Node.js](https://nodejs.org/) (v14 o superior)
- Navegador moderno con soporte para cámara web

### Instalación (Windows)

1. **Instalar dependencias:**
   ```bash
   install.bat
   ```

2. **Iniciar el servidor:**
   ```bash
   start-backend.bat
   ```

3. **Abrir el juego:**
   - Abre tu navegador y ve a: **http://localhost:3000**
   - O abre directamente el archivo `index.html`

### Instalación (Linux/Mac)

```bash
cd backend
npm install
cp .env.example .env
# Edita .env y cambia JWT_SECRET
node server.js
```

Luego abre `index.html` en tu navegador.

## 📖 Cómo Jugar

### 1. Registro/Login
- Crea una cuenta o inicia sesión
- Selecciona tu idioma nativo y el idioma que quieres aprender

### 2. Modo Búsqueda
- El robot te pedirá un objeto (en el idioma que aprendes)
- Muestra el objeto a la cámara
- Gana EXP y monedas al acertar

### 3. Modo Preguntas
- Responde preguntas sobre objetos que muestra la cámara
- Las preguntas están en el idioma que aprendes
- Gana puntos por respuestas correctas

### 4. Personalización
- Usa monedas para comprar accesorios
- Personaliza colores, sombreros, lentes y más
- Desbloquea logros especiales

## 🎯 Sistema de Progresión

### Niveles
- **Inicio:** Nivel 1 con 0 EXP
- **Subir de nivel:** Gana 100 × nivel_actual en EXP
- **Recompensas:** Monedas bonus por cada nivel

### Rachas
- Juega cada día para mantener tu racha
- La racha se reinicia si no juegas 1 día
- Desbloquea logros de racha

### Monedas
- Gana monedas al completar rondas
- Usa monedas para comprar personalizaciones
- Más monedas por rachas largas

## 🎨 Personalización

### Colores Corporales (50 monedas)
- Azul, Verde, Morado, Naranja, Rosa, Rojo

### Colores de Ojos (30 monedas)
- Azul, Verde, Morado, Rosa, Rojo, Amarillo

### Sombreros (100 monedas)
- Gorra, Sombrero Vaquero, Corona, Sombrero de Mago, Boina, Casco

### Lentes (75 monedas)
- Lentes Redondos, Gafas de Sol, Gafas 3D, Monóculo

### Accesorios (50 monedas)
- Moño, Collar, Bufanda, Reloj

## 🏆 Logros

- **Primera Vez:** Completa tu primera ronda
- **Racha Semanal:** 7 días consecutivos
- **Racha Mensual:** 30 días consecutivos
- **Nivel 10, 25, 50:** Alcanza estos niveles
- **Coleccionista:** Desbloquea 10 personalizaciones

## 🛠️ Estructura del Proyecto

```
beimaxjuego/
├── index.html              # HTML principal
├── styles.css              # Estilos (tema blanco/rojo)
├── script.js               # Lógica del juego
├── api-service.js          # Servicio de API de visión
├── backend-service.js      # Comunicación con backend
├── install.bat             # Instalador Windows
├── start-backend.bat       # Iniciar servidor Windows
├── INICIO_RAPIDO.md        # Documentación detallada
└── backend/
    ├── server.js           # Servidor Express
    ├── package.json        # Dependencias Node.js
    ├── .env.example        # Variables de entorno
    └── beimax.db           # Base de datos SQLite (se crea automáticamente)
```

## 🔒 Seguridad

⚠️ **ANTES DE PRODUCCIÓN:**

1. Cambia `JWT_SECRET` en `backend/.env`
2. Usa HTTPS para el servidor
3. Configura CORS apropiadamente
4. Implementa rate limiting
5. Valida todas las entradas del usuario

## 📚 Documentación Completa

Para más detalles, consulta:
- [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - Guía completa de usuario
- `backend/server.js` - Documentación de API endpoints

## 🐛 Solución de Problemas

### El servidor no inicia
- Verifica que Node.js esté instalado: `node --version`
- Ejecuta: `cd backend && npm install`
- Asegúrate de que el puerto 3000 esté libre

### No funciona la cámara
- Permite permisos de cámara en tu navegador
- Usa HTTPS o localhost (requerido para getUserMedia)

### Error de login
- Verifica que el servidor backend esté corriendo
- Revisa la consola del navegador (F12) para errores
- Asegúrate de que `JWT_SECRET` esté configurado en `.env`

## 🤝 Contribuciones

Este es un proyecto educativo. Para mejoras:
1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m 'Agrega nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).

## 👨‍💻 Autor

Creado con ❤️ para aprender idiomas de forma divertida.

---

**¡Diviértete aprendiendo idiomas con Beimax!** 🚀🤖
