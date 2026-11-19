module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) {
    return res.status(403).json({ error: 'Origen no permitido.' });
  }

  try {
    if (new URL(origin).host !== host) {
      return res.status(403).json({ error: 'Origen no permitido.' });
    }
  } catch {
    return res.status(403).json({ error: 'Origen no permitido.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const rating = body.rating;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'La puntuación debe ser de 1 a 5.' });
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return res.status(400).json({ error: 'Envío no válido.' });
  }

  if (body.comment !== undefined && typeof body.comment !== 'string') {
    return res.status(400).json({ error: 'El comentario debe ser texto.' });
  }

  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  if (comment.length > 2000) {
    return res.status(400).json({ error: 'El comentario no puede superar los 2000 caracteres.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SURVEY_FROM;
  const to = process.env.SURVEY_RECIPIENT;
  if (!apiKey || !from || !to) {
    console.error('Survey email configuration is incomplete.');
    return res.status(500).json({ error: 'La encuesta todavía no está configurada para enviar correos.' });
  }

  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from,
        to: [to],
        subject: 'Nueva respuesta a la encuesta de Los Changuitos',
        text: [
          'Nueva respuesta a la encuesta de satisfacción.',
          'Puntuación: ' + rating + ' de 5',
          'Comentario:',
          comment || '(Sin comentario)'
        ].join('\n')
      })
    });

    if (!emailResponse.ok) {
      console.error('Email provider rejected survey email with status ' + emailResponse.status + '.');
      return res.status(502).json({ error: 'El servicio de correo no pudo enviar la respuesta.' });
    }
  } catch (error) {
    console.error('Unable to send survey email:', error);
    return res.status(502).json({ error: 'No se pudo conectar con el servicio de correo.' });
  }

  return res.status(200).json({ message: 'Encuesta enviada.' });
};
