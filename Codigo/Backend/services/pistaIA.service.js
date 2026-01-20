// services/aiHint.service.js
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generarPistaTeoria({ preguntaTexto, posiblesRespuestas, recursoAudicion }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY no está configurada');
  }

  const opciones = Array.isArray(posiblesRespuestas)
    ? posiblesRespuestas.map((r, i) => `${i + 1}) ${r?.texto ?? ''}`).join('\n')
    : '';

  const userContent =
`Genera UNA pista breve para ayudar a responder esta pregunta tipo test sin revelar la respuesta.

Pregunta:
${preguntaTexto}

Opciones:
${opciones}

${recursoAudicion ? 'Hay un recurso de audición asociado.' : ''}

Requisitos:
- 1 o 2 frases máximo
- No digas cuál es la opción correcta
- No des la solución ni pasos completos
- No menciones "IA" ni "modelo"`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'Eres un tutor de música. Das pistas breves y seguras.' },
      { role: 'user', content: userContent }
    ],
    temperature: 0.2,
    max_tokens: 90
  });
  const hint = completion?.choices?.[0]?.message?.content?.trim();
  if (!hint) throw new Error('No se pudo generar pista');
  return hint.replace(/^["'\s]+|["'\s]+$/g, '').trim();
}

module.exports = { generarPistaTeoria };
