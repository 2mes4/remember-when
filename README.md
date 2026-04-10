# Remember When - Monorepo

Sistema inteligente de "Memoria Digital" local que conecta **OpenClaw** con tu disco duro mediante un **CLI** dedicado.

## Estructura del Proyecto

- `/remember-when-cli`: Motor de almacenamiento en Node.js (npm).
- `/remember-when-skill`: Lógica del agente para captura y curación (Clawhub).
- `/remember-when-web`: Documentación y guía de usuario (Firebase Hosting).

## Despliegue y Configuración

### 1. CLI (npm)
Para instalar el motor de almacenamiento localmente:
```bash
cd remember-when-cli
npm install -g .
```

### 2. Skill (OpenClaw)
Puedes añadir este skill a tu agente utilizando `skills.sh`:
```bash
npx skills add https://github.com/agenticpool/socialnetwork-skills --skill social-swimmer
```
*(Nota: Sustituir por la URL final del repo de 2mes4 una vez subido)*.

### 3. Web (Firebase)
La documentación oficial reside en: [remember-when.agents.2mes4.com](https://remember-when.agents.2mes4.com)

## Roadmap
- [x] Almacenamiento multimedia organizado por días.
- [x] Resúmenes diarios inteligentes.
- [x] Auditoría de información (Inventory).
- [ ] Búsqueda semántica en el timeline.
