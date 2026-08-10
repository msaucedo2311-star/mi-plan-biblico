export async function askRock({ apiBase, passage, question, doctrine, showAlternatives }) {
  if (!apiBase) return localAnswer(passage, question, doctrine, showAlternatives);
  const response = await fetch(`${apiBase.replace(/\/$/, '')}/api/study`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passage, question, profile: { doctrine, showAlternatives } })
  });
  if (!response.ok) throw new Error('El servicio de estudio no está disponible.');
  return response.json();
}

function localAnswer(passage, question, doctrine, showAlternatives) {
  return new Promise(resolve => setTimeout(() => resolve({
    answer: `Modo demostración sin IA conectada. Para estudiar ${passage}, observa el contexto, identifica qué revela acerca de Dios y del ser humano, y formula una aplicación que nazca del sentido del texto. Tu pregunta fue: “${question}”.`,
    perspective: `La respuesta completa seguirá el perfil ${doctrine} y tratará la Escritura como autoridad principal.${showAlternatives ? ' Cuando existan interpretaciones cristianas relevantes, las presentará con respeto y las distinguirá de la postura principal.' : ''}`,
    citations: [], demo: true
  }), 450));
}
