import type { OcaCard } from "./types.ts";

export const OCA_CARDS: OcaCard[] = [
  // =================== NIVEL 1: PREVIA / ROMPEHIELO ===================
  {
    id: 'oca_1_01',
    level: 1,
    type: 'group',
    title: 'El Pato de la Mesa',
    description: 'Toman 2 sorbos todos los que actualmente tengan menos de 5 lucas en la cuenta corriente o en la billetera.',
    sips: 2,
    penaltySips: 5,
    tags: ['dinero', 'carrete']
  },
  {
    id: 'oca_1_02',
    level: 1,
    type: 'individual',
    title: 'Piscolero de Cartón',
    description: 'Si tu copete actual está cabezón (más negro que blanco), regalas 2 sorbos. Si tomaste con blanca o suave, te tomas 3 sorbos tú solo por vergonzoso.',
    sips: 2,
    penaltySips: 5,
    tags: ['copete', 'piscola']
  },
  {
    id: 'oca_1_03',
    level: 1,
    type: 'vote',
    title: 'El Más Jugoso',
    description: 'A la cuenta de 3, todos apuntan al que tenga más probabilidades de dar jugo, botar el vaso o terminar durmiendo en el suelo hoy.',
    sips: 3,
    penaltySips: 5,
    tags: ['jugo', 'votacion']
  },
  {
    id: 'oca_1_04',
    level: 1,
    type: 'group',
    title: 'Tierra Trágame',
    description: 'Toman 3 sorbos todos los que alguna vez hayan vomitado en una micro, Uber, metro o en la tina de un carrete ajeno.',
    sips: 3,
    penaltySips: 5,
    tags: ['anecdota', 'jugo']
  },
  {
    id: 'oca_1_05',
    level: 1,
    type: 'duel',
    title: 'Duelo de Miradas',
    description: 'Elige a un rival. Se miran fijamente sin pestañear ni reírse. El primero que se cague de la risa o parpadee, se toma 3 sorbos.',
    sips: 3,
    penaltySips: 5,
    tags: ['duelo', 'reflejos']
  },
  {
    id: 'oca_1_06',
    level: 1,
    type: 'individual',
    title: 'Compañero de Copete',
    description: 'Elige a un compadre de la mesa. De aquí en adelante, cada vez que tú tomes un sorbo por cualquier motivo, esa persona toma contigo.',
    sips: 2,
    penaltySips: 5,
    tags: ['pacto', 'social']
  },
  {
    id: 'oca_1_07',
    level: 1,
    type: 'group',
    title: 'Manos al Techo',
    description: '¡El último en tocar el techo o levantar las dos manos gritando un garabato se toma 3 sorbos!',
    sips: 3,
    penaltySips: 5,
    tags: ['reflejos', 'garabatos']
  },
  {
    id: 'oca_1_08',
    level: 1,
    type: 'curse',
    title: 'El Pituco Zorrón',
    description: 'Maldición: Durante toda tu próxima ronda tienes que hablar como cuico zorrón ("perro, papá, zorrón, pichanga"). Si se te sale un modismo cuma o se te olvida el tono, pagas 1 sorbo cada vez.',
    sips: 2,
    penaltySips: 5,
    tags: ['maldicion', 'roleplay']
  },
  {
    id: 'oca_1_09',
    level: 1,
    type: 'individual',
    title: 'Galería Secreta',
    description: 'Muestra tu última foto guardada en la galería del celular a los demás. Si te niegas rotundamente, pagas el castigo universal.',
    sips: 2,
    penaltySips: 5,
    tags: ['celular', 'verguenza']
  },
  {
    id: 'oca_1_10',
    level: 1,
    type: 'individual',
    title: 'Cultura Chupística',
    description: 'Inicia una Cultura Chupística de "Marcas de copete chileno o botillerías". El primero que repita o se quede pegado, toma 3 sorbos.',
    sips: 3,
    penaltySips: 5,
    tags: ['cultura', 'ronda']
  },
  {
    id: 'oca_1_11',
    level: 1,
    type: 'group',
    title: 'La Caña Moral',
    description: 'Toman 2 sorbos todos los que hayan prometido "no vuelvo a tomar nunca más" en el último mes y aquí están de nuevo.',
    sips: 2,
    penaltySips: 5,
    tags: ['cana', 'promesas']
  },
  {
    id: 'oca_1_12',
    level: 1,
    type: 'duel',
    title: 'Cachipún Curado',
    description: 'Juega un Cachipún al mejor de 3 con la persona a tu izquierda. El perdedor se toma 3 sorbos grandes.',
    sips: 3,
    penaltySips: 5,
    tags: ['duelo', 'clasico']
  },

  // =================== NIVEL 2: CAHUÍN / PICANTE ===================
  {
    id: 'oca_2_01',
    level: 2,
    type: 'individual',
    title: 'El Recaído de Medianoche',
    description: 'Confiesa cuándo fue la última vez que le hablaste o sapeaste las historias a tu ex (incluso desde cuenta falsa). Si fue hace menos de 3 meses, tomas 4 sorbos.',
    sips: 3,
    penaltySips: 5,
    tags: ['ex', 'cahuin']
  },
  {
    id: 'oca_2_02',
    level: 2,
    type: 'vote',
    title: 'El Más Tóxico/a',
    description: 'A la cuenta de 3, apunten a la persona de la mesa que revisa el celular de la pareja, pide ubicación en tiempo real o hace más atados por celos.',
    sips: 4,
    penaltySips: 5,
    tags: ['toxicidad', 'celos']
  },
  {
    id: 'oca_2_03',
    level: 2,
    type: 'individual',
    title: 'Amigo de Cartón',
    description: 'Di con nombre y apellido quién de los presentes en la mesa te caía como las hueás cuando recién lo conociste y por qué. Si no te atreves, pagas castigo.',
    sips: 4,
    penaltySips: 5,
    tags: ['sinceridad', 'amigos']
  },
  {
    id: 'oca_2_04',
    level: 2,
    type: 'group',
    title: 'El Desliz Prohibido',
    description: 'Toman 4 sorbos todos los que alguna vez hayan tenido onda, besado o enganchado con el/la ex de un amigo/a cercano/a.',
    sips: 4,
    penaltySips: 5,
    tags: ['traicion', 'codigos']
  },
  {
    id: 'oca_2_05',
    level: 2,
    type: 'duel',
    title: 'Pregunta Incómoda al Hueso',
    description: 'Hazle una pregunta sin filtro de cahuín a quien elijas. Si responde la verdad, tú tomas 3 sorbos. Si prefiere callar, esa persona toma 4.',
    sips: 3,
    penaltySips: 5,
    tags: ['duelo', 'verdades']
  },
  {
    id: 'oca_2_06',
    level: 2,
    type: 'group',
    title: 'Fantasmas del DM',
    description: 'Toman 2 sorbos todos los que tengan a alguien dejado en "visto" o ignorado en WhatsApp o Instagram en este momento.',
    sips: 2,
    penaltySips: 5,
    tags: ['ghosting', 'celular']
  },
  {
    id: 'oca_2_07',
    level: 2,
    type: 'individual',
    title: 'Historial Turbio',
    description: 'Lee en voz alta tu última búsqueda en Google o en Instagram. Si hay algo que quieras esconder a toda costa, paga la fianza.',
    sips: 3,
    penaltySips: 5,
    tags: ['privacidad', 'google']
  },
  {
    id: 'oca_2_08',
    level: 2,
    type: 'vote',
    title: 'El Rey del Casi Algo',
    description: 'Apunten a la persona que tiene el historial amoroso más enredado o cambia de "casi algo" más rápido.',
    sips: 3,
    penaltySips: 5,
    tags: ['amor', 'votacion']
  },
  {
    id: 'oca_2_09',
    level: 2,
    type: 'group',
    title: 'Escape Ninja',
    description: 'Toman 3 sorbos todos los que alguna vez se hayan escapado de un carrete a la mala sin despedirse de nadie para no pagar o no dar explicaciones.',
    sips: 3,
    penaltySips: 5,
    tags: ['escape', 'carrete']
  },
  {
    id: 'oca_2_10',
    level: 2,
    type: 'curse',
    title: 'Sinceridad Brutal',
    description: 'Maldición: Hasta tu próximo turno, cada vez que alguien te haga una pregunta tienes que responder con la verdad más cruda y sin filtro. Si te guardas algo, pagas 2 sorbos.',
    sips: 2,
    penaltySips: 5,
    tags: ['maldicion', 'verdad']
  },
  {
    id: 'oca_2_11',
    level: 2,
    type: 'individual',
    title: 'La Peor Cita',
    description: 'Cuenta en 30 segundos la peor cita o peor experiencia romántica de tu vida. Si la historia hace reír a la mesa, regalas 3 sorbos.',
    sips: 2,
    penaltySips: 5,
    tags: ['citas', 'anecdota']
  },
  {
    id: 'oca_2_12',
    level: 2,
    type: 'group',
    title: 'Pillados In Fraganti',
    description: 'Toman 3 sorbos todos los que alguna vez hayan sido pillados en el acto por sus papás, hermanos o amigos.',
    sips: 3,
    penaltySips: 5,
    tags: ['pillado', 'verguenza']
  },

  // =================== NIVEL 3: CALENTURA / HOT ===================
  {
    id: 'oca_3_01',
    level: 3,
    type: 'individual',
    title: 'Top 1 de la Mesa',
    description: 'Di sin rodeos y mirándolo a los ojos quién de los presentes te parece la persona más atractiva físicamente hoy. Si lo haces, esa persona toma 2 sorbos contigo. Si arrugas, pagas castigo.',
    sips: 4,
    penaltySips: 5,
    tags: ['atraccion', 'directo']
  },
  {
    id: 'oca_3_02',
    level: 3,
    type: 'individual',
    title: 'Tributo Textil',
    description: 'Quítate una prenda de ropa visible (chaqueta, polerón, calcetines, camisa o zapatillas) y déjala fuera hasta que des otra vuelta al tablero.',
    sips: 3,
    penaltySips: 5,
    tags: ['ropa', 'strip']
  },
  {
    id: 'oca_3_03',
    level: 3,
    type: 'group',
    title: 'El Club del Fetiche',
    description: 'Toman 3 sorbos todos los que tengan algún fetiche confesable (pies, disfraces, nalgadas o dominación) y que se atrevan a admitirlo.',
    sips: 3,
    penaltySips: 5,
    tags: ['fetiches', 'tabu']
  },
  {
    id: 'oca_3_04',
    level: 3,
    type: 'duel',
    title: 'Perreo Pegado',
    description: 'Elige a alguien de la mesa para bailar 15 segundos de perreo intenso hasta abajo, con o sin música. Si alguno de los dos arruga, ese paga 5 sorbos.',
    sips: 4,
    penaltySips: 5,
    tags: ['baile', 'contacto']
  },
  {
    id: 'oca_3_05',
    level: 3,
    type: 'individual',
    title: 'Susurro al Oído',
    description: 'Acércate al oído del jugador de tu izquierda y susúrrale la cosa más sucia o cochina que se te ocurra. Si se le pone la piel de gallina o se sonroja, esa persona toma 3 sorbos.',
    sips: 3,
    penaltySips: 5,
    tags: ['susurro', 'hot']
  },
  {
    id: 'oca_3_06',
    level: 3,
    type: 'vote',
    title: 'Máquina en la Cama',
    description: 'Apunten a la persona de la mesa que tiene más cara de ser una máquina absoluta entre cuatro paredes. El más votado regala 4 sorbos.',
    sips: 3,
    penaltySips: 5,
    tags: ['votacion', 'sexo']
  },
  {
    id: 'oca_3_07',
    level: 3,
    type: 'group',
    title: 'Lugar Prohibido',
    description: 'Toman 3 sorbos todos los que hayan tenido relaciones en un lugar público, patio ajeno, auto estacionado o baño de disco.',
    sips: 3,
    penaltySips: 5,
    tags: ['lugares', 'anecdota']
  },
  {
    id: 'oca_3_08',
    level: 3,
    type: 'individual',
    title: 'Masaje Express',
    description: 'Dale un masaje de hombros o cuello de 30 segundos al jugador de tu derecha o al que elijas. Si alguno de los dos se niega, ambos pagan 4 sorbos.',
    sips: 3,
    penaltySips: 5,
    tags: ['tacto', 'masaje']
  },
  {
    id: 'oca_3_09',
    level: 3,
    type: 'group',
    title: 'Fotos Ocultas',
    description: 'Toman 3 sorbos todos los que tengan fotos o videos íntimos (nudes) guardados actualmente en su carpeta oculta o papelera.',
    sips: 3,
    penaltySips: 5,
    tags: ['nudes', 'fotos']
  },
  {
    id: 'oca_3_10',
    level: 3,
    type: 'individual',
    title: 'Posición Favorita',
    description: 'Describe tu posición sexual favorita y por qué. Si haces la mímica sin pudor, regalas 3 sorbos a quien quieras.',
    sips: 3,
    penaltySips: 5,
    tags: ['posicion', 'humor']
  },
  {
    id: 'oca_3_11',
    level: 3,
    type: 'duel',
    title: 'Contacto Visual Íntimo',
    description: 'Siéntate frente a quien elijas a 10 centímetros de distancia por 20 segundos sin hablar. Quien rompa la tensión o se ría primero, toma 3 sorbos.',
    sips: 3,
    penaltySips: 5,
    tags: ['tension', 'duelo']
  },
  {
    id: 'oca_3_12',
    level: 3,
    type: 'individual',
    title: 'Beso al Cuello',
    description: 'Dale un beso suave en el cuello a la persona de tu elección. Si esa persona acepta, ambos regalan 3 sorbos. Si alguno arruga, paga castigo.',
    sips: 4,
    penaltySips: 5,
    tags: ['beso', 'cuello']
  },

  // =================== NIVEL 4: MODO VALIENTE / SIN FILTRO ===================
  {
    id: 'oca_4_01',
    level: 4,
    type: 'duel',
    title: 'Piquito o Sequía',
    description: 'Elige a alguien de la mesa para darse un piquito de 3 segundos. Si ambos aceptan, el resto de la mesa toma 2 sorbos por mirones. Quien arrugue, paga Fondo Blanco.',
    sips: 4,
    penaltySips: 5,
    tags: ['piquito', 'extremo']
  },
  {
    id: 'oca_4_02',
    level: 4,
    type: 'individual',
    title: 'Ruleta de WhatsApp',
    description: 'La persona a tu derecha agarra tu celular y le manda un audio de voz de 5 segundos diciendo: "Oye, me quedé pensando en ti..." a quien esa persona elija de tus chats.',
    sips: 5,
    penaltySips: 5,
    tags: ['whatsapp', 'peligro']
  },
  {
    id: 'oca_4_03',
    level: 4,
    type: 'duel',
    title: 'Body Shot Callejero',
    description: 'Toma un sorbo o shot directamente del cuello, clavícula o abdomen del jugador a tu derecha. Si arrugan, ambos se van a Fondo Blanco.',
    sips: 5,
    penaltySips: 5,
    tags: ['bodyshot', 'alcohol']
  },
  {
    id: 'oca_4_04',
    level: 4,
    type: 'individual',
    title: 'Striptease Forzado',
    description: 'Te quitas dos prendas de ropa al hilo o te quedas en ropa interior/traje de baño si ya te quedaba poco. La ropa queda fuera por toda la partida.',
    sips: 4,
    penaltySips: 5,
    tags: ['ropa', 'strip']
  },
  {
    id: 'oca_4_05',
    level: 4,
    type: 'duel',
    title: 'La Mordida Suave',
    description: 'Dale una mordida suave pero marcada en el cuello o la oreja a quien elijas de la mesa. Si la persona acepta, se reparten 4 sorbos entre los demás.',
    sips: 4,
    penaltySips: 5,
    tags: ['mordida', 'roce']
  },
  {
    id: 'oca_4_06',
    level: 4,
    type: 'individual',
    title: 'Llamada de la Muerte',
    description: 'Llama por altavoz a tu último contacto marcado en el teléfono y dile: "Necesito contarte algo urgente pero prométeme que no te vas a enojar..." y córtale a los 10 segundos.',
    sips: 5,
    penaltySips: 5,
    tags: ['llamada', 'trolling']
  },
  {
    id: 'oca_4_07',
    level: 4,
    type: 'group',
    title: 'Beso de Tres',
    description: 'El jugador activo propone a dos personas más para armar un beso de tres. Si los tres aceptan, la mesa entera se va a Fondo Blanco. Si arrugan, los tres toman 5 sorbos.',
    sips: 5,
    penaltySips: 5,
    tags: ['beso', 'trio']
  },
  {
    id: 'oca_4_08',
    level: 4,
    type: 'individual',
    title: 'Historial en Pantalla',
    description: 'Pasa tu celular desbloqueado al grupo durante 45 segundos. Pueden revisar libremente fotos o chats sin borrar nada. Si te niegas, pagas Fondo Blanco.',
    sips: 5,
    penaltySips: 5,
    tags: ['privacidad', 'celular']
  },
  {
    id: 'oca_4_09',
    level: 4,
    type: 'duel',
    title: 'Hielo Íntimo',
    description: 'Pásale un cubito de hielo por los labios y bájalo hasta el cuello o abdomen a otro jugador usando únicamente tu boca. Si arrugan, pagan 5 sorbos.',
    sips: 5,
    penaltySips: 5,
    tags: ['hielo', 'contacto']
  },
  {
    id: 'oca_4_10',
    level: 4,
    type: 'individual',
    title: 'El Cáliz del Condenado',
    description: 'Todos los jugadores echan un chorrito de su respectivo trago en un vaso central. Te tomas 3 tragos largos del menjunje o pagas penitencia doble.',
    sips: 5,
    penaltySips: 5,
    tags: ['menjunje', 'extremo']
  },
  {
    id: 'oca_4_11',
    level: 4,
    type: 'individual',
    title: 'Shot Sin Manos',
    description: 'Debes tomarte un shot o trago largo directamente del vaso puesto en la mesa, sin usar las manos, apoyado únicamente con la boca.',
    sips: 4,
    penaltySips: 5,
    tags: ['habilidad', 'shot']
  },
  {
    id: 'oca_4_12',
    level: 4,
    type: 'curse',
    title: 'El Esclavo del Turno',
    description: 'Maldición: Durante toda esta ronda eres el sirviente del jugador con menos sorbos. Debes servirle el copete y sostenerle el vaso cada vez que tome.',
    sips: 3,
    penaltySips: 5,
    tags: ['maldicion', 'esclavo']
  }
];
