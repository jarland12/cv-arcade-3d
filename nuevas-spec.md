# Spec — Zona de Downloads (cartuchos 3D)
### CV Arcade 3D · jarland12/cv-arcade-3d

## 1. Objetivo

Agregar una zona secreta/apartada dentro de la sala 3D existente donde el visitante encuentra una máquina expendedora de cartuchos. Cada cartucho representa un documento descargable (CV, certificados, portfolio, referencias). Insertar un cartucho dispara una animación de carga estilo arcade y termina descargando el archivo real.

Esta zona es un **easter egg de exploración**, no una máquina más de la fila principal — recompensa a quien explora la sala en vez de estar a la vista inmediata.

## 2. Stack y contexto existente

- **Motor**: Three.js vanilla (sin framework, sin React)
- **Estética ya establecida** (mantener consistencia, no reinventar):
  - Magenta primario `#ff2fb0`
  - Teal como acento únicamente (líneas delgadas, nunca bloques del mismo tamaño que magenta/navy) `#28e8d8`
  - Navy como fondo dominante (60%+ de la composición) `#0a0a1a`
  - Tipografía Press Start 2P para todo texto en pantalla/UI
  - Estética CRT / scanlines
  - ⚠️ Evitar patrones de franjas horizontales iguales en magenta/teal/navy — visualmente se leen como una bandera no intencional

## 3. Ubicación y descubribilidad — mecanismo de puerta/portal

Descartado: colocar el mostrador de cartuchos en la fila principal (ya sea alineado o en diagonal) resulta anticlimático — compite visualmente con los 4 cabinets existentes sin tener su mismo lenguaje de "evento interactivo", y se ve como mueble en vez de sala especial.

**Solución elegida**: una puerta/portal en la sala principal que teletransporta al visitante a un cuarto secreto aparte, donde vive todo el contenido de Downloads.

- **La puerta**: un objeto 3D distinto a los cabinets (marco de puerta o portal), ubicado en un punto de la sala principal que invite a explorar sin ser parte de la fila de 4 máquinas. Señalizada con:
  - Glow violeta/púrpura sutil alrededor del marco (color exclusivo de esta zona, no usado en ningún cabinet existente)
  - Partícula o brillo pulsante suave (loop lento) para diferenciarla de objetos estáticos del entorno
  - Sonido ambiental bajo (zumbido/hum) audible solo al acercarse, como pista sonora sin depender de texto
- **Transición**: al interactuar con la puerta, un fade-to-black corto (~0.3-0.4s) antes de cargar/mostrar el cuarto secreto — evita popping visual y refuerza la sensación de "cambio de escena", no de modal.
- **Sin HUD de texto** tipo "¡encontraste un secreto!" — la sala no usa ese lenguaje en ningún otro punto; la puerta y su glow ya comunican que hay algo más sin necesidad de anunciarlo.
- **Regreso**: el cuarto secreto debe tener su propia puerta/salida de vuelta a la sala principal, con la misma transición de fade.

## 4. Contenido del cuarto secreto

Además del mostrador de cartuchos (sección 6), el cuarto se siente vacío/relleno si solo tiene eso. Agregar 2-3 de los siguientes elementos para reforzar identidad sin saturar:

- **Vitrina de logros**: certificaciones, reconocimientos, rol de Binance Angel — presentados como una "sala de trofeos" de videojuego (íconos o placas con glow, no texto plano)
- **Pantallas CRT en loop**: 1-2 pantallas mostrando clips cortos y mudos de MELTDOWN en funcionamiento (contenido real del negocio, reutilizable de lo que ya se produce)
- **Tabla de "high scores"**: cronología de hitos profesionales presentada con el formato de tabla de puntajes arcade (nombre del hito + "score"/resultado), reutilizando el mismo concepto ya usado en la mecánica del Día del Gamer en Meltdown
- **Pósters ambientales**: 1-2 piezas gráficas ya producidas (ej. el poster estilo Jaime Garzón, still del video de Bitcoin Pizza Day) pegadas en las paredes como memorabilia, sin necesidad de generar arte nuevo
- **Letrero de neón identificador**: texto tipo "VAULT" o "ARCHIVO SECRETO" en violeta sobre la entrada del cuarto, marcando su identidad sin depender de un banner explicativo

## 5. La máquina expendedora (contenedor de los cartuchos)

- Modelo 3D nuevo: una máquina expendedora/vending retro-arcade, **con el mismo nivel de detalle que los cabinets actuales** — ni hiperrealista ni geometría plana. Es decir: formas primitivas combinadas (cajas, cilindros, biseles) con materiales planos de color + un poco de emissive para el brillo de neón, igual que ya se hizo con los cabinets existentes.
- Pantalla frontal de la máquina en navy oscuro, con el texto "DOWNLOADS" en Press Start 2P y un glow sutil violeta (ver paleta abajo).
- 4 slots visibles en la máquina, cada uno mostrando el borde de un cartucho (para que el usuario sepa cuántos hay antes de interactuar).

## 6. Los cartuchos (modelos 3D)

- **Nivel de detalle**: igual que los cabinets — no fotorrealista, no geometría de una sola caja plana. Bisel visible en los bordes, una etiqueta con relieve leve (offset de geometría o normal map simple), sombreado con materiales flat + emissive en el color de cada cartucho.
- 4 cartuchos, cada uno con su color (reutilizar paleta ya definida en el sitio, agregando violeta como color nuevo exclusivo de esta zona):

| Cartucho | Color | Hex sugerido |
|---|---|---|
| CV.EXE | Magenta | `#ff2fb0` |
| CERTIFICADOS | Ámbar | `#f0b43c` (ya usado en Training Mode/Binance) |
| PORTFOLIO | Teal | `#28e8d8` |
| REFERENCIAS | Violeta (nuevo, exclusivo de esta zona) | `#7c4fd6` |

- Etiqueta de cada cartucho: texto corto en Press Start 2P, mismo tratamiento que las pantallas de los cabinets (fondo del color del cartucho, texto en un tono más oscuro/claro del mismo ramp para legibilidad).

## 7. Flujo de interacción (estados)

1. **Reposo**: cartuchos visibles en sus slots dentro de la máquina, leve animación idle (flotación sutil, 2-3px, loop lento) para indicar que son interactivos.
2. **Hover/aproximación**: al acercar el cursor (desktop) o el personaje (si hay movimiento en primera persona), el cartucho se ilumina más (aumentar emissive intensity) y sale levemente del slot (~5px).
3. **Selección (click)**: el cartucho se desliza fuera del slot flotando hacia la cámara, gira sutilmente (rotación en Y, ~360° en 0.6s, easing ease-out) — este es el momento "más 3D" de toda la interacción.
4. **Inserción**: el cartucho se desliza hacia una ranura de lectura en la máquina (translateY o translateZ según el modelo) y desaparece dentro — 0.4-0.5s, easing ease-in.
5. **Carga**: la pantalla de la máquina (plano/texture con canvas dinámico, o UI overlay 2D superpuesta en pantalla) muestra una barra de progreso estilo arcade (bloques discretos, no barra continua lisa) llenándose en ~1.2-1.5s.
6. **Completado**: la pantalla muestra "LISTO" o el nombre del archivo + un breve destello (flash de luz breve en el color del cartucho), y se dispara la descarga real del archivo.
7. **Reset**: la máquina vuelve al estado de reposo, lista para otro cartucho.

## 8. Audio (set completo de sonidos retro)

Necesarios, todos estilo chiptune/8-bit, cortos (<1s salvo el loop):

| Momento | Sonido |
|---|---|
| Ambiente de la zona (loop, bajo volumen) | Zumbido eléctrico retro, loop continuo |
| Hover sobre cartucho | Blip corto agudo |
| Selección (click) | "Coin insert" clásico de arcade |
| Cartucho deslizando a la ranura | Sonido de "swoosh" corto + click mecánico al final |
| Durante la carga | Loop corto de "beep-beep-beep" tipo carga de consola retro, sincronizado con el llenado de bloques de la barra |
| Completado | Jingle corto de victoria (3-4 notas ascendentes, estilo 8-bit) |

Todos deben poder mutearse desde el control de audio global que ya exista en el sitio (si no existe uno, incluir un ícono de mute/unmute en la esquina, consistente con el estilo del HUD actual).

## 9. Manejo de archivos y descarga

- **Estado actual**: no hay archivos ni rutas definidas todavía.
- Usar rutas **placeholder** por ahora, estructuradas así para reemplazo fácil después:
  ```
  /assets/docs/cv.pdf
  /assets/docs/certificados.pdf
  /assets/docs/portfolio.pdf
  /assets/docs/referencias.pdf
  ```
- La descarga se dispara al completar la barra de carga (paso 6), vía un `<a download>` programático o `window.location.href`.
- Si el archivo no existe todavía (placeholder), mostrar en la pantalla de la máquina un mensaje neutro tipo "PRÓXIMAMENTE" en vez de fallar silenciosamente — así se puede probar el flujo completo antes de tener los PDFs reales.

## 10. Estructura de código sugerida (Three.js vanilla)

```
/src
  /downloads-zone
    DownloadsZone.js        // posiciona la máquina en la escena, maneja luces/glow ambiental
    VendingMachine.js        // geometría + materiales de la máquina
    Cartridge.js              // clase reutilizable, instanciada x4 con color/label/fileURL
    CartridgeStateMachine.js  // idle → hover → selected → inserting → loading → done → reset
    audio.js                  // carga y reproduce los SFX de esta sección
  /assets
    /docs                     // PDFs (placeholder por ahora)
    /sfx                      // archivos de audio retro
```

- Mantener el patrón de máquina de estados explícito (no animaciones encadenadas con `setTimeout` sueltos) para que sea fácil de debuggear y extender si se agregan más cartuchos después.

## 11. Criterios de aceptación

- [ ] La zona no es visible/accesible desde la fila principal sin explorar
- [ ] Los 4 cartuchos usan los colores y tipografía ya establecidos en el resto del sitio
- [ ] El nivel de detalle 3D de la máquina y cartuchos es visualmente coherente con los cabinets existentes (ni más simple, ni más realista)
- [ ] Los 6 sonidos están implementados y son muteable desde un control accesible
- [ ] El flujo completo (idle → hover → click → insertar → cargar → completar → descarga) funciona con archivos placeholder
- [ ] Cambiar una ruta de archivo real es un cambio de una sola línea (sin tocar lógica de animación)
- [ ] Funciona en mobile (touch en vez de hover, mismos estados)
