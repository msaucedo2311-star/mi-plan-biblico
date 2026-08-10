import { cp, mkdir, rm } from 'node:fs/promises';
const files=['index.html','styles.css','calendar.css','manifest.webmanifest','sw.js','icons','src'];
await rm('dist',{recursive:true,force:true}); await mkdir('dist',{recursive:true});
for(const file of files) await cp(file,`dist/${file}`,{recursive:true});
console.log('PWA construida en dist/');
