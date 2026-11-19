
# Envío de respuestas de la encuesta

La encuesta usa la función `api/send-survey.js` y Resend para enviar cada respuesta por correo. Para activarla en Vercel:

1. Crea una API key en Resend y verifica el dominio desde el que se enviarán los mensajes.
2. En Vercel, abre **Settings → Environment Variables** y agrega:
   - `RESEND_API_KEY`: la API key de Resend (marcar como secreta).
   - `SURVEY_FROM`: el remitente verificado, por ejemplo `Los Changuitos <encuestas@tu-dominio-verificado.com>`.
   - `SURVEY_RECIPIENT`: la dirección que recibirá las respuestas.
3. Guarda las variables para Production y vuelve a desplegar el proyecto.

No agregues la API key al código ni al repositorio.
