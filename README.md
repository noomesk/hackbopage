# HackBo Web 🧬

> Arte generativo bioinformático — patrones emergentes, complejidad y fractales,
> renderizados en tiempo real directamente en el navegador.

Proyecto realizado en el marco de un **taller de HTML de HackBo**, explorando
cómo unas pocas líneas de código y reglas matemáticas simples pueden generar
belleza visual compleja — el mismo principio que rige la naturaleza.

---

## 🎯 Concepto

Esta página no es solo estética: es una **demostración visual de un principio
matemático y biológico real**. Todo lo que ves en pantalla nace de sistemas
simples que, al iterarse miles de veces, producen complejidad emergente:

- **Patrones de Turing** (reacción-difusión) — el mismo mecanismo matemático
  que explica cómo un leopardo genera sus manchas, cómo un pez cebra genera
  sus rayas, o cómo se forman los pliegues de un cerebro. Descubierto por
  Alan Turing en 1952 en su paper *"The Chemical Basis of Morphogenesis"*.

- **Fractal de Mandelbrot** — el ejemplo más célebre de auto-similitud
  infinita: un patrón que se repite a cualquier escala de zoom, generado
  por una ecuación de apenas tres caracteres: `z → z² + c`.

**La idea central**: los patrones de la vida (biología) y los patrones de
las matemáticas puras (fractales) no son fenómenos separados — **todo está
conectado** por las mismas reglas de iteración, retroalimentación y
auto-organización. Lo orgánico y lo abstracto son, en el fondo, el mismo
lenguaje matemático expresado de formas distintas.

---

## 🛠️ Tecnologías usadas

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura semántica de la página y `<canvas>` |
| **CSS3** | Diseño visual (glitch effects, glassmorphism, animaciones, responsive) |
| **JavaScript (vanilla)** | Lógica de interacción, sliders, eventos DOM |
| **[p5.js](https://p5js.org/) v1.9.0** | Motor de renderizado gráfico (Canvas 2D API bajo el capó) |
| **ASCII Art** | Renderizado del fractal de Mandelbrot usando caracteres tipográficos en vez de píxeles de color |
| **Perlin Noise** (`noise()` de p5.js) | Textura orgánica y variación no-uniforme en ambos modos |

> **Nota técnica**: no usamos WebGL directamente — p5.js corre en modo
> `P2D` (Canvas 2D acelerado por hardware vía el navegador). Esto fue una
> decisión deliberada: el algoritmo de reacción-difusión (Gray-Scott) requiere
> acceso pixel-por-pixel a una grilla de datos (arrays `Float32Array`), lo cual
> es más simple de manejar en 2D que portarlo a shaders GLSL. Aun así, el
> renderizado aprovecha aceleración de hardware del navegador.

---

## 🏗️ Arquitectura del proyecto
