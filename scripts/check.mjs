import { readFile, access } from 'node:fs/promises';
const required=['index.html','styles.css','calendar.css','manifest.webmanifest','sw.js','src/app.js','src/data.js','src/store.js','src/api.js','README.md'];
for(const file of required) await access(file);
const manifest=JSON.parse(await readFile('manifest.webmanifest','utf8'));
if(manifest.display!=='standalone'||!manifest.start_url) throw new Error('Manifest PWA incompleto');
const app=await readFile('src/app.js','utf8');
if(/sk-[A-Za-z0-9_-]{20,}/.test(app)) throw new Error('Posible clave API en frontend');
console.log(`Verificación correcta: ${required.length} archivos, manifest instalable y sin claves API detectadas.`);
