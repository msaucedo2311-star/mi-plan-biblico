export const weeklyPlans = [
  { title: 'Conocer a Jesús', verse: 'Juan 1:14', passages: ['Juan 1:1-18','Marcos 1:14-28','Lucas 5:1-11','Mateo 5:1-16','Juan 3:1-21','Marcos 4:35-41','Juan 4:4-26'] },
  { title: 'Gracia y salvación', verse: 'Efesios 2:8-9', passages: ['Romanos 3:21-31','Efesios 2:1-10','Tito 3:3-8','Lucas 15:11-32','Romanos 5:1-11','Juan 10:1-18','1 Pedro 1:3-12'] },
  { title: 'La Palabra de Dios', verse: 'Salmo 119:105', passages: ['Salmo 19:1-14','2 Timoteo 3:10-17','Salmo 119:9-24','Hebreos 4:12-16','Josué 1:1-9','Mateo 7:24-29','Salmo 1'] },
  { title: 'Oración y comunión', verse: 'Filipenses 4:6-7', passages: ['Mateo 6:5-15','Salmo 23','Filipenses 4:4-9','Lucas 11:1-13','Salmo 51:1-17','Juan 15:1-17','Salmo 103:1-14'] },
  { title: 'Vida en el Espíritu', verse: 'Gálatas 5:22-23', passages: ['Juan 14:15-27','Romanos 8:1-17','Gálatas 5:13-26','Hechos 2:1-21','1 Corintios 12:1-11','Efesios 5:15-21','Romanos 12:1-8'] },
  { title: 'Carácter de Cristo', verse: 'Filipenses 2:5', passages: ['Filipenses 2:1-18','Colosenses 3:1-17','Mateo 5:17-48','Santiago 1:19-27','1 Corintios 13','1 Pedro 2:9-25','Miqueas 6:6-8'] },
  { title: 'Fe en las pruebas', verse: 'Santiago 1:2-3', passages: ['Santiago 1:1-18','Salmo 46','Romanos 8:18-39','2 Corintios 4:7-18','Daniel 3:8-30','Marcos 5:21-43','1 Pedro 5:6-11'] },
  { title: 'Iglesia y comunidad', verse: 'Hechos 2:42', passages: ['Hechos 2:37-47','1 Corintios 12:12-27','Efesios 4:1-16','Hebreos 10:19-25','Gálatas 6:1-10','Hechos 4:32-37','Juan 13:1-17'] },
  { title: 'Misión y testimonio', verse: 'Mateo 28:19-20', passages: ['Mateo 28:16-20','Hechos 1:1-11','Romanos 10:8-17','2 Corintios 5:11-21','1 Pedro 3:8-17','Hechos 17:16-34','Colosenses 4:2-6'] },
  { title: 'Sabiduría práctica', verse: 'Proverbios 3:5-6', passages: ['Proverbios 3:1-12','Santiago 3:1-18','Mateo 6:19-34','Proverbios 4:20-27','Eclesiastés 3:1-15','Santiago 4:1-17','Proverbios 16:1-9'] },
  { title: 'Esperanza eterna', verse: 'Apocalipsis 21:4', passages: ['Juan 11:17-44','1 Corintios 15:12-28','1 Tesalonicenses 4:13-18','Apocalipsis 21:1-8','Romanos 6:1-14','2 Pedro 3:8-18','Apocalipsis 22:1-7'] },
  { title: 'Perseverar y servir', verse: 'Hebreos 12:1-2', passages: ['Hebreos 12:1-17','Juan 21:15-25','2 Timoteo 4:1-8','Filipenses 3:7-16','Mateo 25:14-30','Judas 17-25','Salmo 145'] }
];

export const days = weeklyPlans.flatMap((week, wi) => week.passages.map((passage, di) => ({
  id: `w${wi + 1}d${di + 1}`, week: wi + 1, day: di + 1, passage, theme: week.title
})));

export const commentarySamples = {
  'Juan 1:1-18': [
    { author: 'Matthew Henry', work: 'Comentario de Matthew Henry (dominio público)', note: 'Presenta al Verbo eterno como verdadero Dios y verdadero hombre, y subraya que la gracia y la verdad llegan plenamente en Cristo.', link: 'https://www.biblegateway.com/resources/matthew-henry/John.1.1-John.1.18' },
    { author: 'BibleProject', work: 'Resumen visual del Evangelio de Juan', note: 'Sitúa el prólogo como la afirmación inicial de que Jesús es el Dios creador que trae vida y luz al mundo.', link: 'https://bibleproject.com/explore/video/john-1-12/' }
  ],
  'Efesios 2:1-10': [
    { author: 'Matthew Henry', work: 'Comentario de Matthew Henry (dominio público)', note: 'Destaca el contraste entre la muerte espiritual humana y la iniciativa misericordiosa de Dios, que salva por gracia para una vida de buenas obras.', link: 'https://www.biblegateway.com/resources/matthew-henry/Eph.2.1-Eph.2.10' }
  ]
};

export const verseTexts = {
  'Juan 1:14': 'Y aquel Verbo fue hecho carne, y habitó entre nosotros… lleno de gracia y de verdad.',
  'Efesios 2:8-9': 'Porque por gracia sois salvos por medio de la fe… no por obras, para que nadie se gloríe.',
  'Salmo 119:105': 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.',
  'Filipenses 4:6-7': 'Por nada estéis afanosos… y la paz de Dios… guardará vuestros corazones.',
  'Gálatas 5:22-23': 'Mas el fruto del Espíritu es amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre, templanza.',
  'Filipenses 2:5': 'Haya, pues, en vosotros este sentir que hubo también en Cristo Jesús.',
  'Santiago 1:2-3': 'Tened por sumo gozo cuando os halléis en diversas pruebas, sabiendo que la prueba de vuestra fe produce paciencia.',
  'Hechos 2:42': 'Y perseveraban en la doctrina de los apóstoles, en la comunión unos con otros, en el partimiento del pan y en las oraciones.',
  'Mateo 28:19-20': 'Id, y haced discípulos a todas las naciones… enseñándoles que guarden todas las cosas que os he mandado.',
  'Proverbios 3:5-6': 'Fíate de Jehová de todo tu corazón… Reconócelo en todos tus caminos, y él enderezará tus veredas.',
  'Apocalipsis 21:4': 'Enjugará Dios toda lágrima… y ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor.',
  'Hebreos 12:1-2': 'Corramos con paciencia la carrera… puestos los ojos en Jesús, el autor y consumador de la fe.'
};
