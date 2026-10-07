# Gamyo · Políticas de UX/UI

> Documento rector del diseño de **Gamyo** (la plataforma) y de **Hora del ñache** (el primer juego). En la Fase 0 se guarda en el repo como `design-system/gamyo/MASTER.md`, con *overrides* por pantalla en `design-system/gamyo/pages/` (`tablero.md`, `partida.md`).
>
> **Fuentes**: búsquedas del skill *ui-ux-pro-max* (paleta "Gaming", guías de UX sobre touch, movimiento, carga, foco y regiones vivas) más criterio propio. Lo que es criterio propio se marca con *(criterio)*.

---

## 1. Contexto de uso: diseñar para una fiesta

Todas las reglas parten de estas condiciones reales:

| Condición | Consecuencia de diseño |
|---|---|
| Luz baja, pantallas con brillo bajo | Modo oscuro único, alto contraste y texto grande |
| Ruido, conversación, risas | Nada depende del sonido; vibración y señales visuales claras |
| Una mano ocupada (vaso, picoteo) | Acciones principales en el tercio inferior, al alcance del pulgar |
| Atención intermitente, algo de alcohol | **Una acción principal por pantalla**; estado siempre visible ("te toca", "esperando a 2") |
| Celulares de todo tipo, algunos viejos | Rendimiento como requisito, no como "extra" |
| Vecinos mirando tu pantalla | La mano es privada: modo discreto opcional |
| Gente que nunca usó la app | Unirse en menos de 15 s y sin tutoriales obligatorios |

## 2. Principios

1. **La fiesta nunca se detiene.** Ninguna pantalla espera sin explicar qué pasa ni a quién se espera. Toda espera tiene un timeout.
2. **Una pantalla, una decisión.** Hay un único botón primario visible; lo secundario va en menús o en una hoja inferior.
3. **Público vs. privado, siempre distinguible.** Lo que ven todos (carta negra, marcador) y lo que solo ves tú (tu mano) tienen tratamientos visuales distintos.
4. **Las cartas son las protagonistas.** La interfaz se aparta y las cartas tienen la tipografía más grande y el mayor contraste.
5. **Legible a un brazo (celular) y a tres metros (tablero).**
6. **Divertido, pero nunca confuso.** El humor está en el contenido y en los textos de la app, no en controles ambiguos.

---

## 3. Plataformas y layout

### 3.1 Objetivos de pantalla

| Superficie | Orientación | Tamaño de referencia | Notas |
|---|---|---|---|
| Celular (principal) | Vertical | 360–430 px de ancho (se prueba en 375) | En horizontal también funciona, sin romperse |
| Tablet | Ambas | 768–1024 px | Mano en grilla en vez de carrusel |
| Tablero (TV/notebook) | Horizontal 16:9 | 1280–1920 px | Se mira a unos 3 m; sin controles necesarios |
| Escritorio | — | ≥ 1024 px | Contenido centrado (máx. 480 px) salvo el tablero |

Breakpoints: `--bp-sm: 480px`, `--bp-md: 768px`, `--bp-lg: 1024px`, `--bp-xl: 1440px`.

### 3.2 Estructura de pantalla en el celular

```
┌──────────────────────────────┐ ← safe-area-inset-top
│ Barra superior (56px)        │  código de sala · timer · menú
├──────────────────────────────┤
│                              │
│  Zona pública                │  carta negra / estado de la ronda
│  (scroll si hace falta)      │
│                              │
├──────────────────────────────┤
│  Zona privada                │  tu mano (carrusel)
├──────────────────────────────┤
│ Barra de acción fija (72px)  │  UN botón primario
└──────────────────────────────┘ ← safe-area-inset-bottom
```

- La altura usa `100dvh`, nunca `100vh`.
- Se respetan `env(safe-area-inset-*)` en las barras fijas.
- El contenido con scroll tiene un `padding-bottom` igual a la altura de la barra fija, para que nada quede tapado.
- Las acciones principales siempre van en la barra inferior (zona del pulgar).

---

## 4. Design tokens

### 4.1 Color (modo oscuro único)

Base: paleta **"Gaming"** del skill (violeta neón + acción rosada), ampliada con colores semánticos *(criterio)*.

| Token | Valor | Uso | Contraste verificado |
|---|---|---|---|
| `--color-bg` | `#0F0F23` | Fondo de la app | — |
| `--color-surface` | `#1E1C35` | Paneles, hojas, listas | — |
| `--color-surface-raised` | `#27273B` | Elementos elevados, inputs | — |
| `--color-border` | `#3B3560` | Bordes y divisores visibles | ≥ 3:1 sobre `bg` para bordes de controles |
| `--color-text` | `#E2E8F0` | Texto principal | ~14:1 sobre `bg` |
| `--color-text-muted` | `#94A3B8` | Texto secundario | ~7:1 sobre `bg` |
| `--color-primary` | `#7C3AED` | Botón primario, foco | texto blanco ≥ 4.5:1 |
| `--color-primary-hover` | `#8B5CF6` | Hover/pressed del primario | — |
| `--color-accent` | `#F43F5E` | CTA destacados, "¡te toca!", ganador | texto negro ≥ 4.5:1 |
| `--color-success` | `#2DD4BF` | Listo, jugó, conectado | texto negro ≥ 4.5:1 |
| `--color-warning` | `#FBBF24` | Timer < 10 s, reconectando | texto negro ≥ 4.5:1 |
| `--color-danger` | `#EF4444` | Salir, expulsar, errores | texto negro ≥ 4.5:1 |
| `--color-card-black` | `#0A0A0A` | Carta negra | texto `#FFFFFF` |
| `--color-card-white` | `#FAF7F2` | Carta blanca (blanco cálido) | texto `#111111` |
| `--color-scrim` | `rgba(5,5,15,.72)` | Fondo detrás de modales | se mide contra el fondo real |

**Reglas**
- Solo se usan tokens semánticos; ningún hex suelto en componentes.
- El color **nunca** es el único indicador: los estados van acompañados de icono y texto ("Jugó ✓" lleva icono + etiqueta, no solo un punto verde).
- Fondo con 1–2 gradientes radiales sutiles de `primary` y `accent` al 10–15 % de opacidad, estáticos *(criterio)*. El glassmorphism se limita a la barra superior y a las hojas inferiores, con opacidad ≥ 80 % para no perder legibilidad.

### 4.2 Tipografía

| Rol | Fuente | Pesos | Motivo |
|---|---|---|---|
| Display / títulos / código de sala | **Space Grotesk** | 600, 700 | Carácter propio y lúdico sin verse infantil *(criterio)* |
| Texto de interfaz | **Inter** | 400, 500, 600 | Máxima legibilidad en tamaños chicos |
| Texto de cartas | **Inter** | 700 | Look clásico de juego de cartas: sans bold y compacta |

> [!NOTE]
> El skill sugirió *Fredoka + Nunito* (redondeadas, "playful"), pero su perfil está pensado para apps infantiles y choca con un juego +18. Queda como alternativa si prefieres un tono más amable.

**Escala (celular)** — base 16 px, razón ~1.25:

| Token | Tamaño / interlineado | Uso |
|---|---|---|
| `--text-xs` | 12/16 | Metadatos (nunca para info crítica) |
| `--text-sm` | 14/20 | Etiquetas secundarias |
| `--text-md` | 16/24 | Texto base, botones |
| `--text-lg` | 20/28 | Subtítulos |
| `--text-xl` | 24/32 | Títulos de pantalla |
| `--text-2xl` | 32/40 | Código de sala, ganador |
| `--text-card` | 18–24 (adaptativo) | Texto de cartas: se ajusta según el largo, nunca menos de 16 |

**Tablero**: se multiplica la escala ×2 (texto mínimo 32 px; carta negra 56–72 px).

- Se cargan desde Google Fonts con `display=swap` y *preload* de los pesos críticos; se usan fuentes variables si están disponibles.
- `font-variant-numeric: tabular-nums` en timers y marcadores, para que los números no "salten".
- Los textos se ajustan con `text-wrap: balance` en títulos y `pretty` en cartas.

### 4.3 Espaciado, radios, elevación

- **Espaciado** (ritmo de 4/8): `--space-1: 4px` · `2: 8` · `3: 12` · `4: 16` · `5: 24` · `6: 32` · `7: 48` · `8: 64`.
  - Padding de pantalla: 16 px (celular) / 24 px (tablet) / 48 px (tablero).
  - Separación mínima entre elementos tocables: 8 px.
- **Radios**: `--radius-sm: 8px` (chips, inputs) · `--radius-md: 14px` (botones, cartas) · `--radius-lg: 24px` (hojas, modales) · `--radius-full`.
- **Elevación**: 3 niveles de sombra (`--shadow-1/2/3`) más un brillo suave `--glow-primary` solo para el elemento activo. Nada de sombras complejas en capas.
- **Z-index** (escala cerrada): `base 0` · `sticky 10` · `overlay 100` · `sheet 200` · `modal 300` · `toast 400`.

### 4.4 Movimiento

| Token | Duración | Easing | Uso |
|---|---|---|---|
| `--motion-instant` | 100 ms | `ease-out` | Feedback de toque |
| `--motion-fast` | 180 ms | `cubic-bezier(.2,.8,.2,1)` | Hover, selección de carta, chips |
| `--motion-base` | 280 ms | `cubic-bezier(.2,.8,.2,1)` | Hojas, cambios de fase |
| `--motion-slow` | 450 ms | `cubic-bezier(.34,1.56,.64,1)` (leve rebote) | Revelación, ganador |

- Las salidas son más rápidas que las entradas (aprox. 70 % de la duración).
- Solo se animan `transform` y `opacity`.
- **Máximo 1–2 animaciones protagonistas por pantalla** (guía del skill: el exceso de movimiento distrae y marea).
- **`prefers-reduced-motion: reduce`**: los flips 3D pasan a fundidos, se elimina el confeti y el rebote, y la cuenta regresiva no pulsa.

---

## 5. Componentes base

| Componente | Reglas |
|---|---|
| **Button** | Variantes `primary` · `secondary` · `ghost` · `danger`. Alto mínimo 48 px, ancho completo en la barra de acción. Estados: default, hover, pressed (cambia color/opacidad **sin mover el layout**), focus visible, disabled (semántica `disabled`, opacidad 40 %, sin acción), loading (spinner dentro del botón, mismo ancho) |
| **IconButton** | Área táctil de 48×48 aunque el icono sea de 24; `aria-label` obligatorio |
| **GameCard** | Proporción 63:88. Negra o blanca. Estados: normal, seleccionada (se eleva 8 px + borde `primary` + número de orden si pick > 1), deshabilitada, en blanco (input editable). El texto se adapta al largo de la carta |
| **BlackCardComposite** | Carta negra con las blancas insertadas en los espacios, resaltadas en `accent` (en la fase de juicio y en la revelación) |
| **HandCarousel** | Scroll horizontal con *snap*; muestra 2,5 cartas para sugerir que hay más; **flechas y contador como alternativa al swipe** |
| **PlayerChip / Avatar** | Avatar + apodo + estado (jugó, Zar, desconectado, invitado). Cada estado lleva icono **y** texto o tooltip, no solo color |
| **Timer** | Anillo circular + número. A los 10 s pasa a `warning`; se anuncia a lectores de pantalla solo a los 30 y 10 s |
| **RoomCode** | `--text-2xl`, monoespaciado tabular, botón copiar + QR |
| **BottomSheet** | En el celular reemplaza a los modales. Se cierra con botón visible, tocando el fondo o con Escape; foco atrapado; devuelve el foco al cerrar |
| **VoteSheet** | Hoja de votación: nombre y autor de la expansión, n.º de cartas, 3 cartas de muestra, 👍/👎 como botones grandes con texto, barra de progreso y cuenta regresiva |
| **Toast** | Para confirmaciones breves y errores no bloqueantes; `role="status"`; 4 s; no tapa la barra de acción |
| **ConnectionBanner** | Franja fija arriba: "Reconectando…" (warning) / "Sin conexión" (danger) |
| **AgeGate (+18)** | Pantalla completa con texto claro, botón "Soy mayor de 18" y "Salir". Se recuerda por dispositivo |

**Iconografía**: **Phosphor Icons** (`@phosphor-icons/react`), peso *regular* por defecto y *fill* solo para el estado activo. Tamaños por token: `--icon-sm: 16` · `md: 20` · `lg: 24` · `xl: 32`.
- Los iconos decorativos junto a un texto llevan `aria-hidden="true"`.
- **No se usan emojis como iconos estructurales** (navegación, controles). Los emojis solo se permiten como **contenido**: avatares de jugador y reacciones.

---

## 6. Interacción

### 6.1 Reglas generales
- **Feedback de toque en ≤ 100 ms** en todo elemento interactivo.
- **Sin gestos exclusivos**: todo swipe tiene una alternativa con botón (carrusel, juicio del Zar).
- **Un gesto por región**: el carrusel de la mano no convive con un swipe de navegación.
- **Confirmación solo para lo destructivo o irreversible**: salir de la partida, expulsar a alguien, gastar un punto en "Cambio de mano". Nunca para jugar cartas.
- **Jugar cartas en dos pasos**: tocar para seleccionar (y tocar de nuevo para quitar) → botón "Jugar" en la barra. Una vez enviada, la jugada no se puede deshacer, y la UI lo deja claro.
- **Vibración** (`navigator.vibrate`): cuando te toca, al ser elegido Zar y al ganar la ronda. Se puede desactivar en ajustes.
- **Sonido**: desactivado por defecto en el celular y activado en el tablero. Nunca es la única señal.
- **Wake Lock** activo durante la partida y en el tablero, para que la pantalla no se apague.

### 6.2 Flujos críticos y su objetivo

| Flujo | Objetivo |
|---|---|
| Unirse por QR (invitado) | ≤ 15 s y ≤ 3 pantallas (link → apodo y avatar → lobby) |
| Crear sala | ≤ 4 toques con los ajustes por defecto |
| Jugar una carta | 2 toques |
| Elegir ganador (Zar) | Ver todas las respuestas + 1 toque |
| Votar una expansión | 1 toque |
| Volver tras cerrar la app | 1 toque ("Volver a la partida") |

### 6.3 Privacidad en pantalla
- **Modo discreto** (opcional, en el menú de la partida): las cartas de la mano se muestran boca abajo y se revelan solo **mientras mantienes presionado** o tocas "Ver mano". Siempre con un botón alternativo.
- El tablero **jamás** muestra información privada; el rol `board` no tiene acceso a manos.
- En la fase de juicio, las respuestas aparecen sin autor y en orden aleatorio. El autor se revela solo en la revelación.

---

## 7. Estados y feedback

| Estado | Política |
|---|---|
| **Carga** | Se usan *skeletons* con la forma final en listas y lobby. Si la operación tarda menos de 300 ms, no se muestra nada (evita parpadeos). `aria-busy` en el contenedor |
| **Acción optimista** | La carta se marca "jugada" al instante; si el servidor la rechaza, vuelve a la mano con un toast explicativo |
| **Espera de otros** | Siempre dice **a quién** se espera: "Esperando a Cata y Nico…", con avatares. Nunca un spinner mudo |
| **Vacío** | Ilustración simple + acción: "Aún no tienes expansiones → Crear la primera" |
| **Error** | Lenguaje humano + qué hacer: "No pudimos unirte. ¿El código está bien? Revisa y prueba de nuevo." Nunca códigos técnicos |
| **Sin conexión** | Banner fijo; las acciones se deshabilitan con una explicación; reintento automático con *backoff* |
| **Cambio de fase** | Transición breve + anuncio `role="status"`: "Ronda 3. Zar: Pancho." |
| **Victoria** | Un solo gran momento por ronda (flip + confeti), ≤ 2 s antes de poder seguir |

---

## 8. Accesibilidad (WCAG 2.2 AA)

- **Contraste**: texto normal ≥ 4.5:1, texto grande e iconos o bordes con significado ≥ 3:1. Se verifica en el tema oscuro real.
- **Foco visible**: `outline: 2px solid var(--color-primary); outline-offset: 2px` en todo control, incluidos los de modales y hojas. Nunca `outline: none` sin reemplazo.
- **Tamaño táctil**: 48×48 px como norma de la app (el mínimo WCAG en web es 24 px; nosotros apuntamos al estándar móvil), con 8 px entre elementos.
- **Lectores de pantalla**:
  - Una sola región viva (`role="status"`, `aria-atomic`) para los anuncios de fase, con mensajes con contexto ("3 de 5 jugadores listos", no "3").
  - Las cartas son `button` con `aria-pressed` cuando están seleccionadas.
  - El orden del foco sigue el orden visual.
- **Texto escalable** hasta 200 % sin romper el layout (unidades `rem`, sin alturas fijas en textos).
- **Idioma**: `<html lang="es-CL">`.
- **Teclado** (escritorio y tablero): todo es operable con Tab, Enter, Espacio y Escape.
- **Autenticación**: se permite pegar texto y usar gestores de contraseñas; magic link y Google como alternativas sin carga cognitiva.
- **Movimiento**: se respeta `prefers-reduced-motion`; nada parpadea más de 3 veces por segundo.

---

## 9. Voz y microcopy

- **Tono**: chileno, cercano y pícaro en la *interfaz* ("¡Te toca, Zar!", "Nadie se salva"), pero **siempre claro** en instrucciones, errores y temas legales.
- **Trato de tú** (chileno estándar escrito: "elige", "juega", no "elegí" ni "jugá").
- **Sin farándula** en ningún texto de la app, igual que en las cartas.
- **Botones con verbo + objeto**: "Jugar cartas", "Elegir ganadora", "Crear sala". Nada de "OK" o "Aceptar".
- **+18**: tono directo y sin sermón: "Este juego tiene humor negro y contenido para adultos. ¿Tienes 18 o más?"

| Situación | Texto |
|---|---|
| Tu turno | "¡Te toca! Elige tu carta." / pick 2: "Elige 2 cartas, en orden." |
| Eres Zar | "Hoy mandas tú. Espera las respuestas." |
| Esperando | "Esperando a Cata y Nico…" |
| Ganador de ronda | "¡Punto para Pancho!" |
| Fin de partida | "Pancho es el más ñache de la noche." |
| Error de código | "Esa sala no existe o ya terminó." |
| Invitado intenta crear sala | "Para crear salas necesitas una cuenta. Toma 10 segundos." |

---

## 10. Tablero (override de pantalla)

- Solo horizontal; layout de 3 zonas: **carta negra (centro, 60 %)** · **jugadores y estado (lateral)** · **timer y código (arriba)**.
- Texto mínimo de 32 px; la carta negra a 56–72 px.
- No requiere interacción. Si hay mouse, los controles aparecen al moverlo y se ocultan a los 3 s.
- En el lobby muestra un QR de al menos 320 px.
- Animaciones algo más generosas que en el celular (es "el show"), siempre respetando el movimiento reducido.
- Pantalla completa (`requestFullscreen`) a un clic + Wake Lock.

---

## 11. PWA

- El aviso de instalación propio se muestra **después de la primera partida terminada**, nunca al abrir la app por primera vez. Si se descarta, se vuelve a ofrecer a los 7 días como mínimo.
- Las actualizaciones del Service Worker **no se aplican en medio de una partida**: se muestra un toast "Nueva versión disponible" en el lobby o en la pantalla final.
- Página offline propia ("Sin conexión. Gamyo necesita internet para jugar con tus amigos.") con botón de reintentar.
- Manifest: `display: standalone`, `orientation: portrait` (el tablero sobreescribe), `theme_color: #0F0F23`, íconos *maskable*.

## 12. Presupuesto de rendimiento

| Métrica | Objetivo (Android de gama media, 4G) |
|---|---|
| LCP | < 2.5 s en la primera visita; < 1 s con caché |
| INP | < 200 ms |
| CLS | < 0.05 |
| JS inicial (gzip) | < 180 KB; cada juego se carga en un *chunk* aparte (lazy) |
| Animaciones | 60 fps, solo `transform`/`opacity`, `will-change` puntual |
| Fuentes | ≤ 4 archivos, *preload* de los críticos |

---

## 13. Anti-patrones (prohibidos)

- Emojis como iconos de navegación o de control.
- Spinners sin texto en esperas de más de 1 s.
- Interacciones solo por swipe o mantener presionado, sin alternativa.
- Botones primarios en la parte superior de la pantalla en el celular.
- Información privada en el tablero o visible en notificaciones.
- Colores hex sueltos fuera de los tokens.
- Pressed states que mueven el layout.
- Modales centrados en el celular (se usan hojas inferiores).
- Texto de carta menor a 16 px.
- Confeti o efectos con movimiento reducido activo.
- Pedir el login o la instalación antes de que la persona haya visto el valor.

---

## 14. Checklist de entrega (por pantalla)

- [ ] Usa solo tokens; cero hex sueltos
- [ ] Probado a 375 px vertical, en horizontal y a 1920 px en el tablero
- [ ] Un único botón primario, en la zona del pulgar
- [ ] Todos los tocables de 48 px o más, con 8 px de separación
- [ ] Feedback de toque visible y sin saltos de layout
- [ ] Foco visible y orden de tabulación lógico
- [ ] Estados de carga, vacío, error y sin conexión diseñados
- [ ] Contraste verificado (4.5:1 texto / 3:1 iconos y bordes)
- [ ] Funciona con `prefers-reduced-motion` y con el texto al 200 %
- [ ] Swipes con alternativa por botón
- [ ] Anuncios de estado con contexto y sin regiones vivas duplicadas
- [ ] Microcopy en tono Gamyo, sin farándula
- [ ] El tablero no expone nada privado
