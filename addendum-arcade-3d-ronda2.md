# ADDENDUM — Sala Arcade 3D (ronda 2 de ajustes)

Este documento se suma al SPEC FINAL y a la nota de revisión previa. No reemplaza ninguno de los dos — es una extensión con dos elementos nuevos aprobados, más un recordatorio de un punto que sigue sin confirmarse.

---

## 1. Pantallas "respirando" (nuevo, aprobado)

Cada pantalla de cabina (el bloque de color sólido emisivo) debe tener una animación continua y sutil de intensidad de brillo — un pulso lento, no un parpadeo.

- **Diferencia clave con el attract mode ya especificado**: el attract mode (marquesina/luz de la cabina) es un parpadeo *irregular* tipo neón con fallas. Esto es distinto: un pulso *suave, continuo y predecible*, sin irregularidad ni cortes — deben convivir ambos efectos sin confundirse.
- **Implementación sugerida**: animar la propiedad de intensidad/brillo del material de la pantalla (o de un point light asociado a ella) con una función seno de periodo largo (~3-5 segundos por ciclo completo), variando entre un mínimo y máximo sutil — el color base no debe cambiar, solo su intensidad percibida.
- El efecto debe ser calmado, casi subliminal — el objetivo es que la sala se sienta "viva" sin ser distractor ni competir con el attract mode de la marquesina.
- Debe respetar `prefers-reduced-motion` igual que el resto de animaciones ya especificadas en el spec (sección 5): si está activo, este pulso se detiene o se reduce a un valor estático.

---

## 2. Pantalla de carga inicial (nuevo, aprobado — quedó pendiente de formalizar en el spec original)

Antes de que la escena 3D esté lista, mostrar una pantalla de carga simple:

- Fondo: mismo negro/azul-violeta oscuro que el resto del sitio (`#050308` a `#0a0812`).
- Texto: **"CARGANDO SALA..."** en la tipografía pixel ("Press Start 2P"), color acento (puede usar cualquiera de los 4 colores de sección, o un tono neutro tipo blanco/violeta claro).
- Puede incluir un indicador simple de progreso (porcentaje numérico o una barra minimalista) — no es necesario que sea preciso al peso real de los assets, puede ser una animación de progreso simulada.
- Al terminar de cargar, transición simple (fade out) hacia la escena 3D — sin corte brusco.
- No debe demorar innecesariamente la entrada al sitio: es una pantalla de transición breve, no un elemento decorativo prolongado.

---

## 3. Animación de pantalla: scanline + power-on (nuevo, aprobado)

Recordatorio de la regla que sigue vigente: la pantalla de cabina es un bloque de color sólido emisivo — **sin textura, sin imagen, sin contenido**. Las dos animaciones que siguen deben ser variaciones de luz únicamente, nunca información visual (nada de texto, iconos o patrones complejos).

### 3a. Barrido tipo scanline CRT (estado de reposo, continuo)
- Una franja horizontal sutil y semitransparente (más clara o más brillante que el color base de la pantalla) que recorre la pantalla de arriba a abajo en loop lento y continuo.
- Simula el refresco de un monitor CRT — es textura de movimiento, no contenido.
- Debe ser sutil: no debe leerse como algo "encima" de la pantalla, sino como parte de la calidad de la luz emitida.
- Convive con el pulso "respirando" ya definido en la sección 1 de este addendum — ambos son efectos de luz de baja intensidad que pueden superponerse sin conflicto.

### 3b. Encendido "power-on" (al hacer click en la cabina)
- En reposo, la pantalla se mantiene tal como está definida (color sólido con scanline + pulso respirando).
- Al hacer click en una cabina y comenzar la animación de cámara (dolly hacia la cabina, spec sección 5), la pantalla debe tener un breve momento de "encendido": puede iniciar desde una intensidad más baja/apagada y subir con un pequeño flicker de encendido hasta llegar a su brillo normal, sincronizado aproximadamente con la llegada de la cámara y la apertura del panel.
- Es un efecto puntual de transición, no cambia el estado de reposo de la pantalla una vez completado — busca dar la sensación de que la máquina "cobra vida" para el visitante en el momento de la selección.
- Debe respetar `prefers-reduced-motion`: si está activo, omitir el efecto de encendido y mostrar la pantalla ya en su estado final de brillo normal.

---

## 4. Recordatorio — pendiente de confirmar (de la nota de revisión anterior)

Este punto sigue abierto y no se ha confirmado ni corregido en las últimas entregas:

- **Outline/contorno cel-shaded** (spec, sección 3): en las capturas más recientes tampoco se aprecia un borde negro marcado en la silueta de las cabinas.
- **Material de joystick/botones**: se notan brillos especulares tipo material pulido (glossy), lo cual sugiere `roughness` bajo / material no-flat, en vez del flat shading que pide el spec.

Ambos puntos siguen pendientes de resolución o confirmación explícita antes de dar el proyecto por cerrado en cuanto a fidelidad visual con el concepto aprobado.
