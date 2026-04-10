# Remember When - OpenClaw Skill

Este skill permite a un agente de OpenClaw capturar recuerdos de chats grupales y almacenarlos localmente usando el CLI `remember-when`.

## Cómo Funciona
1. El agente escucha mensajes en un grupo.
2. Si detecta algo que merece ser guardado (frase, foto, video, nota de voz), genera un resumen contextual.
3. El agente ejecuta el comando `remember-when add` para persistir la información.

## Despliegue en Clawhub
Para desplegar este skill en Clawhub:
1. Asegúrate de que el CLI `remember-when-cli` esté instalado en la máquina donde corre el agente.
2. Sube esta carpeta a tu repositorio de Clawhub.
3. Configura el agente para que use `SKILL.md` como sus instrucciones de sistema.

## Notas para el Agente
El agente debe tener acceso a herramientas de shell para poder invocar el CLI.
El formato del comando es:
`remember-when add -g "<grupo>" -t "<tipo>" -s "<remitente>" -r "<resumen>" [-f "<archivo>"]`
