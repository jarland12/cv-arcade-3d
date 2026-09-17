# SPEC FINAL — Hoja de vida interactiva "Sala Arcade 3D"

**Stack objetivo:** Three.js (vanilla JS), sitio estático para GitHub Pages (repositorio nuevo).
**Propósito de este documento:** especificación cerrada para generación de código. Todo lo aquí descrito fue validado con referencias visuales e iterado en conversación con el usuario — no reinterpretar ni improvisar sobre lo definido.

---

## 1. Concepto general

Una escena 3D de una sala de arcade oscura y en penumbra. Cuatro cabinas arcade están alineadas en **fila recta**, del mismo tamaño, sin jerarquía visual entre ellas, cada una representando una sección de la hoja de vida. El visitante orbita la escena con el mouse/touch y hace click en una cabina para "entrar" a esa sección: la cámara se acerca y aparece un panel de contenido estilo pantalla retro CRT.

**Fijado y no debe reinterpretarse:**
- Disposición en fila recta (no semicírculo, no curva).
- Estilo flat-shaded / low-poly con outline tipo cel-shading (sección 3).
- Pantallas de cabina como bloque de color sólido emisivo — sin textura, sin imagen, sin reflejo del entorno.
- Sin props adicionales en la sala (nada de máquinas expendedoras, carteles extra, personajes, etc.).

---

## 2. Orden, paleta y naming de cabinas (izquierda a derecha)

| # | Sección | Color (hex) | Marquesina | Eyebrow (etiqueta pequeña en el panel) |
|---|---------|-------------|------------|------------------------------------------|
| 1 | Perfil | `#4DE8E8` (cian) | **CHARACTER SELECT** | "LOAD PLAYER" |
| 2 | Docencia | `#F2A93B` (ámbar) | **TRAINING MODE** | "XP GANADO" |
| 3 | Meltdown | `#E85DE0` (magenta) | **MELTDOWN** (nombre de marca, no traducir/gamificar) | "HOME BASE" |
| 4 | Binance | `#F0B90B` (amarillo dorado, color de marca real de Binance) | **BINANCE** (nombre de marca, no traducir/gamificar) | "GUILD" |

Fondo de la sala: negro casi puro tendiendo a azul-violeta muy oscuro (`#050308` a `#0a0812`).

Nota de naming: "Meltdown" y "Binance" son marcas reales reconocibles y deben mantenerse literales en la marquesina. "Perfil" y "Docencia" son etiquetas genéricas, por eso llevan nombres con más identidad de juego (Character Select alude a elegir quién eres; Training Mode alude a formar/entrenar a otros).

---

## 3. Estilo visual (referencia: imagen final aprobada, estilo low-poly flat-shaded en fila)

- **Geometría**: bloques simples (BoxGeometry combinadas) — cuerpo base, panel de control angulado, bisel de pantalla, marquesina superior. Low-poly, sin curvas orgánicas.
- **Sombreado**: flat shading (`flatShading: true`), NO PBR realista, NO sombreado suave.
- **Outline / contorno cel-shaded**: obligatorio, es un elemento de identidad visual aprobado. Implementar vía **geometría** (mesh duplicado ligeramente escalado con material negro y `side: THREE.BackSide`, o `EdgesGeometry` + `LineSegments`) — explícitamente NO usar post-procesado/outline pass, para mantener el sitio liviano en GitHub Pages y con buen desempeño en mobile.
- **Pantalla de cada cabina**: plano rectangular `MeshBasicMaterial`, color sólido de la sección, `toneMapped: false`, sin textura — se debe leer como luz pura emitida, no como superficie iluminada.
- **Marquesina superior**: bloque emisivo del color de la sección.
- **Attract mode**: parpadeo **notorio e irregular**, tipo letrero de neón viejo con fallas — no un pulso rítmico/constante, sino variaciones aleatorias de intensidad que ocasionalmente simulan un "flicker" o corte breve de luz, como si el tubo de neón estuviera fallando. Aplica a la luz de la marquesina y/o el punto de luz de cada cabina.

---

## 4. Piso y ambiente

- **Piso**: plano oscuro (`#0a0812` aprox.) con grid visible (`GridHelper` u equivalente), sutil, no protagonista.
- **Acentos de esquina del grid**: líneas de acento en las esquinas — verde tenue (`#3ddc84` muy atenuado) y rojo tenue (`#ff4d4d` muy atenuado), tal como aparece en la referencia final aprobada.
- **Niebla**: `THREE.FogExp2`, densidad baja, mismo color que el fondo — las cabinas se atenúan hacia el fondo, sin paredes ni techo visibles, los bordes de la sala se disuelven en oscuridad.
- **Glow de piso**: cada cabina proyecta un charco de luz de su color en el piso debajo de ella (point light de distancia corta, o plano adicional con gradiente radial semitransparente).

---

## 5. Cámara e interacción

- **Vista inicial**: cámara de frente a la fila completa de cabinas, a media altura, las 4 visibles a la vez.
- **Órbita libre**: `OrbitControls` con damping suave, límites de zoom razonables (no atravesar cabinas, no perderlas de vista).
- **Click en una cabina**:
  - Cámara anima (dolly/lerp con ease-out) hacia un punto centrado frente a esa cabina. Duración: **~900ms al entrar**, **~700ms al salir** — velocidad calibrada para sentirse cinematográfica sin ser tediosa si el visitante recorre varias cabinas seguidas.
  - Se abre el panel de contenido en overlay 2D sobre el canvas (ver sección 6).
  - **Mientras el panel está abierto, las demás cabinas no son clickeables** — el visitante debe cerrar el panel actual antes de seleccionar otra cabina, para evitar transiciones de cámara encimadas/confusas.
- **Cerrar panel**: botón de cierre, click fuera del panel, o tecla `Escape`. Al cerrar, la cámara regresa animada a la vista inicial.
- **Hover**: cursor cambia a pointer sobre una cabina clickeable (desktop).
- **Accesibilidad**:
  - Respetar `prefers-reduced-motion`: si está activo en el sistema del visitante, la animación de cámara se reduce a un corte directo (sin lerp) y el attract-mode flicker se atenúa o desactiva.
  - Foco visible por teclado al navegar con Tab, con contorno del color de la sección correspondiente; permitir activar una cabina con Enter/Espacio.

---

## 6. Panel de contenido (UI 2D sobre el canvas)

Estilo definitivo, aprobado:
- Fondo oscuro, borde con el color de la cabina activa.
- Líneas sutiles tipo scanline de pantalla CRT superpuestas sobre el panel.
- Botón de cierre circular en la esquina superior.
- Eyebrow (etiqueta pequeña, ver tabla sección 2) + título en tipografía pixel + cuerpo de texto en sans-serif legible + bullets con la información de esa sección.

---

## 7. Mobile / responsive

Dentro de alcance para esta primera versión (no es una fase futura):
- Misma interacción base (drag para orbitar, tap para seleccionar cabina) adaptada a touch.
- Zoom limitado a un rango que mantenga la escena legible en pantallas angostas.
- Paneles de contenido ajustados a ancho de pantalla móvil (texto, padding y tipografía escalados).
- Si es necesario para mantener buen framerate en dispositivos de gama media/baja, simplificar niebla/cantidad de luces dinámicas sin alterar la paleta ni el estilo visual.

---

## 8. Compatibilidad

- Si el navegador no soporta WebGL: mostrar un mensaje simple ("Tu navegador no soporta esta experiencia, por favor actualízalo"), sin versión estática alternativa por ahora.

---

## 9. Tipografía

- **Marquesinas y títulos de panel**: fuente pixel/monoespaciada retro ("Press Start 2P" de Google Fonts), usada con moderación — solo en títulos cortos, nunca en párrafos.
- **Cuerpo de texto en paneles**: sans-serif limpia y legible.
- **Datos/stats destacados**: monoespaciada tipo "JetBrains Mono".

---

## 10. HUD superior

Visible sobre el canvas, sin interferir con la interacción 3D:
- Nombre: **Jhojan Ramos**
- Rol: Ingeniero de Sistemas
- Ubicación: Cali, Colombia
- Texto de instrucción: **"MUÉVETE POR LA SALA · ELIGE TU SIGUIENTE NIVEL"**

No incluir datos de contacto (email, teléfono, redes) en esta primera versión — queda fuera de alcance (sección 12).

---

## 11. Contenido de cada sección (texto final aprobado)

### Cabina 1 — Perfil / "CHARACTER SELECT" (cian)
Ingeniero de sistemas basado en Cali, Colombia. Conocido como "Cacheticos" en algunas comunidades.
- Fundador y operador de Meltdown, centro de PC gaming y arcade — el único de su tipo en su municipio.
- Fundador de una tienda de comida natural para mascotas, también única en su municipio.
- Angel ambassador de Binance en Colombia.
- Docente de tecnología desde febrero de 2023.

### Cabina 2 — Docencia / "TRAINING MODE" (ámbar)
Desde el 10 de febrero de 2023, enseñando en la Institución La Gran Colombia: tecnologías de modelos de IA aplicados a seguridad, principios básicos de seguridad informática, y programación en C++ enfocada en Arduino y ESP32.
- Ha formado a más de 100 estudiantes.
- Diseñó él mismo todo el contenido del curso.
- Fue el primero en dictar contenido de IA y seguridad informática en la institución.
- Bajo su enseñanza, sus estudiantes desarrollaron un semáforo para una feria de ciencias.

### Cabina 3 — Meltdown (magenta)
Meltdown nace de la idea de crear un espacio que no existía en su municipio: un lugar donde la cultura gamer se vive, no solo se juega. Un centro de PC gaming y arcade completamente temático, pensado como una experiencia inmersiva más que como un simple alquiler de equipos.
- Ambientación 100% temática, diseñada para que la experiencia arcade se sienta genuina.
- Combina PCs gamer de alto rendimiento con cabinas arcade físicas, modernas y clásicas.
- También es un espacio abierto para quienes quieren programar y codear, no solo jugar.
- En constante evolución: explorando nuevas formas de expandir la experiencia (como pistolas de luz para juegos shooter).
- El único espacio de su tipo en su municipio.

**Importante**: no incluir precios ni detalle de inventario/equipos en este panel — el foco es el concepto y la visión del negocio, no una lista de servicios.

### Cabina 4 — Binance (amarillo/dorado)
Angel ambassador de Binance en Colombia desde 2023.
- Impulsa iniciativas tanto digitales como presenciales dentro del programa.
- Diseñó y desarrolló mecánicas de gamificación para eventos de la comunidad.
- Moderación de comunidad y onboarding de nuevos miembros.
- Presencia activa en eventos offline representando la marca.

---

## 12. Fuera de alcance para esta primera versión

No implementar por iniciativa propia — quedan para una iteración posterior:
- Sonido/música ambiente.
- Sección de contactos tipo "tabla de high scores" (datos de contacto: email, teléfono, redes).
- Partículas de polvo/atmósfera adicional más allá de la niebla ya especificada.

(Mobile **sí** está dentro de alcance — ver sección 7, no confundir con la lista anterior.)

---

## 13. Estructura del proyecto

Repositorio nuevo en GitHub Pages, organizado en archivos separados (no todo en un solo HTML) para facilitar iteración futura:

```
/index.html
/css/style.css
/js/scene.js       (escena, cámara, luces, piso, niebla)
/js/cabinets.js     (geometría y lógica de las 4 cabinas + outline)
/js/content.js      (textos de cada sección, sección 11 de este documento)
/js/ui.js           (HUD, panel 2D, interacciones, accesibilidad)
```

- Todas las rutas de assets y fuentes deben ser **relativas**, para funcionar correctamente sin importar el subpath del repositorio en GitHub Pages.
- Título de la pestaña del navegador: **"Jhojan Ramos · CV Arcade"**.
- Incluir meta tags básicos (título y descripción) en el `<head>` para que el link se vea bien al compartirse en redes sociales.

---

## 14. Referencia visual

Adjuntar junto a este spec **una sola imagen**: la referencia low-poly flat-shaded con outline, cabinas en fila (la última generada y aprobada). Es la única referencia visual definitiva — todo lo que las exploraciones previas aportaban (paleta, disposición, tratamiento de pantalla) ya quedó descrito en texto en las secciones 2 y 3. No adjuntar las otras imágenes exploradas durante el proceso: al tener estilos de render distintos entre sí (fotorrealista con distintos tratamientos), podrían inducir a mezclar rasgos visuales que ya fueron descartados.
