import assert from 'node:assert/strict';
import worker from './src/index.js';

const env = { ALLOWED_ORIGINS: 'https://msaucedo2311-star.github.io', OPENAI_MODEL: 'gpt-5.6-luna' };
const health = await worker.fetch(new Request('https://worker.test/health'), env);
assert.equal(health.status, 200);
assert.equal((await health.json()).ok, true);

const blocked = await worker.fetch(new Request('https://worker.test/api/study', {
  method: 'POST', headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' }, body: '{}'
}), env);
assert.equal(blocked.status, 403);

const missingKey = await worker.fetch(new Request('https://worker.test/api/study', {
  method: 'POST', headers: { Origin: 'https://msaucedo2311-star.github.io', 'Content-Type': 'application/json' },
  body: JSON.stringify({ passage: 'Juan 3', question: '¿Qué significa?', profile: { doctrine: 'Bautista conservador' } })
}), env);
assert.equal(missingKey.status, 503);
console.log('Backend: health, CORS y protección de clave verificados.');
