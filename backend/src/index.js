const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = allowedOrigins(env);
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') {
      return allowed.has(origin)
        ? new Response(null, { status: 204, headers: cors })
        : json({ error: 'Origen no permitido.' }, 403);
    }

    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, service: 'rock', model: env.OPENAI_MODEL || 'gpt-5.6-luna' }, 200, cors);
    }
    if (request.method !== 'POST' || url.pathname !== '/api/study') {
      return json({ error: 'Ruta no encontrada.' }, 404, cors);
    }
    if (!allowed.has(origin)) return json({ error: 'Origen no permitido.' }, 403);
    if (!env.OPENAI_API_KEY) return json({ error: 'El servidor no tiene configurada la clave de IA.' }, 503, cors);

    try {
      const body = await readJson(request);
      const input = validate(body);
      if (input.error) return json({ error: input.error }, 400, cors);

      const safetyIdentifier = await anonymousId(input.clientId);
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-5.6-luna',
          store: false,
          safety_identifier: safetyIdentifier,
          max_output_tokens: 1100,
          reasoning: { effort: 'low' },
          text: { verbosity: 'medium' },
          instructions: systemPrompt(input.profile),
          input: `Pasaje: ${input.passage}\n\nPregunta del estudiante: ${input.question}`
        })
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('OpenAI request failed', response.status, result?.error?.type);
        return json({ error: 'Rock no pudo responder en este momento.' }, 502, cors);
      }
      const answer = extractOutputText(result);
      if (!answer) return json({ error: 'Rock devolvió una respuesta vacía.' }, 502, cors);

      return json({
        answer,
        perspective: perspectiveLabel(input.profile),
        citations: [],
        demo: false
      }, 200, cors);
    } catch (error) {
      console.error('Study endpoint error', error?.message || error);
      return json({ error: 'No se pudo procesar la solicitud.' }, 500, cors);
    }
  }
};

function allowedOrigins(env) {
  return new Set(String(env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean));
}
function corsHeaders(origin, allowed) {
  return allowed.has(origin) ? {
    ...JSON_HEADERS,
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  } : JSON_HEADERS;
}
function json(value, status = 200, headers = JSON_HEADERS) {
  return new Response(JSON.stringify(value), { status, headers });
}
async function readJson(request) {
  if (!String(request.headers.get('Content-Type') || '').includes('application/json')) throw new Error('Content-Type inválido');
  return request.json();
}
function validate(body) {
  const passage = String(body?.passage || '').trim().slice(0, 100);
  const question = String(body?.question || '').trim().slice(0, 1500);
  const doctrine = String(body?.profile?.doctrine || 'Bautista conservador');
  const clientId = String(body?.clientId || 'anonymous').slice(0, 100);
  const allowedProfiles = ['Bautista conservador', 'Cristiano evangélico', 'Exploración amplia'];
  if (!passage) return { error: 'Escribe un pasaje bíblico.' };
  if (question.length < 3) return { error: 'La pregunta es demasiado corta.' };
  if (!allowedProfiles.includes(doctrine)) return { error: 'Perfil doctrinal no válido.' };
  return { passage, question, clientId, profile: { doctrine, showAlternatives: Boolean(body?.profile?.showAlternatives) } };
}
function systemPrompt(profile) {
  const alternatives = profile.showAlternatives
    ? 'Cuando exista más de una interpretación cristiana históricamente relevante, presenta las alternativas brevemente, atribúyelas por tradición y distingue cuál corresponde al perfil principal.'
    : 'Concéntrate en la interpretación correspondiente al perfil principal.';
  return `Eres Rock, un asistente de estudio bíblico cristiano. Tu perfil principal es: ${profile.doctrine}.

Interpreta el pasaje en su contexto literario, histórico y canónico. Trata la Escritura como autoridad principal. Distingue con claridad: (1) lo que afirma el texto, (2) inferencias interpretativas, y (3) aplicaciones pastorales. ${alternatives}

No inventes citas, autores, significados del idioma original ni datos históricos. Si no puedes comprobar un detalle, dilo. No presentes tu respuesta como consejo pastoral profesional ni como revelación divina. Ante peligro, abuso, autolesión o crisis, anima a buscar ayuda humana inmediata y apropiada.

Responde en español claro. Usa secciones breves: "Idea central", "Contexto", "Explicación", "Aplicación" y, cuando corresponda, "Otras interpretaciones". Termina con una pregunta de reflexión. No reproduzcas extensamente traducciones bíblicas protegidas.`;
}
function perspectiveLabel(profile) {
  return `Respuesta generada desde el perfil ${profile.doctrine}.${profile.showAlternatives ? ' Se incluyeron otras interpretaciones relevantes cuando correspondía.' : ''}`;
}
function extractOutputText(result) {
  if (typeof result?.output_text === 'string') return result.output_text.trim();
  return (result?.output || []).filter(item => item.type === 'message')
    .flatMap(item => item.content || []).filter(item => item.type === 'output_text')
    .map(item => item.text || '').join('\n').trim();
}
async function anonymousId(clientId) {
  const bytes = new TextEncoder().encode(clientId);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
