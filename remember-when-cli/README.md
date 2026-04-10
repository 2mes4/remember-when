# Remember When - CLI

Este CLI es el motor de almacenamiento local para el sistema de memoria digital "Remember When". Permite registrar entradas en un historial cronológico (`timeline.json`) y organizar archivos multimedia en carpetas diarias.

## Instalación

Para usar el comando `remember-when` globalmente en tu sistema, ejecuta desde esta carpeta:

```bash
npm install -g .
```

## Comandos

### 1. `add`
Registra un evento (foto, texto, etc.).
```bash
remember-when add -g "Familia" -t "photo" -s "Mama" -r "Foto del jardín"
```

### 2. `set-group-info`
Define el contexto del grupo.
```bash
remember-when set-group-info -g "Familia" -d "Grupo para organizar cenas y noticias familiares" -p "Mama, Papa, Juan, Ana"
```

### 3. `set-daily-summary`
Establece un resumen breve de lo ocurrido en un día.
```bash
remember-when set-daily-summary -g "Familia" -d "2026-04-10" -s "Hoy decidimos que la cena de Navidad será en casa de Ana."
```

### 4. `inventory`
Muestra qué información falta por rellenar (descripciones o resúmenes diarios).
```bash
remember-when inventory
```

## Almacenamiento
Toda la información se guarda en tu directorio personal en:
`~/.remember-when/`

Estructura:
- `timeline.json`: Índice maestro de todos los recuerdos.
- `YYYY-MM-DD/`: Carpetas diarias con los archivos originales.
