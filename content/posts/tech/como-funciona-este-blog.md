---
title: "Cómo funciona este blog"
date: 2026-02-20T17:31:00-03:00
categories: ["tech"]
tags: ["hugo", "webgl", "telegram", "netlify"]
slug: "como-funciona-este-blog"
---

Este blog es mi espacio? Portal? Un lugar en donde tengo control sobre todo:
cómo se ve, cómo funciona, cómo publico. No hay algoritmo que decida qué
mostrar primero, no hay analytics invasivos y es bastante amigable con tu
privacidad.  

---

## La infraestructura

El blog corre con [Hugo](https://gohugo.io/), un generador de sitios estáticos.
El contenido son archivos markdown en un repositorio de git. Cuando _pusheo_,
[Netlify](https://www.netlify.com/) detecta el cambio, _buildea_ el sitio, y lo
_deploya_ a su CDN. Si odiás los anglicismos quizás ya estés muerto. 

Para postear tengo dos caminos: un script de bash que uso desde la compu, y un
bot de Telegram que corre en un container en mi servidor. Ambos hacen lo mismo:
crean el archivo markdown, commitean, y pushean.

El frontend tiene algunas cosas custom: un shader de WebGL para el fondo
animado, un panel de navegación tipo `tree` que se abre con T, y un lightbox
para las fotos del log.

---

## Tuitear sin Twitter

Ya sé que es X, pero para mí es Twitter. O incluso, tuiter. La sección
[/log/](/log/) es mi propia versión. Entradas cortas, a veces con foto, sin la
presión de escribir algo largo o estructurado. Pensamientos sueltos, links, lo
que sea.

La idea se la robé a [Taylor Brooks](https://taylorbrooks.xyz/), un doctorado
en filosofía que tiene un blog con una estética web 1.0, lleno de GIFs animados
y botones de "Best Viewed in Netscape". Su [log](https://taylorbrooks.xyz/log/)
mezcla reviews de películas, álbumes, y pensamientos random. Me gustó el
concepto: un microblog dentro de tu blog, sin depender de ninguna plataforma
externa.

El mío diría que es más simple, pero cumple la misma función. Un lugar para
tirar cosas cortas sin que tengan que ser un "post" formal.

Para cuando estoy en la PC, uso un script de bash. Lo llamo desde
[Rofi](https://github.com/davatorium/rofi), se abre Vim con un template,
escribo, guardo, y el script se encarga del resto: 

Genera el slug con timestamp, crea el archivo en la carpeta correspondiente,
_commitea_ con un mensaje descriptivo, pushea, y me notifica cuando terminó.

Es un workflow de menos de 10 segundos entre "quiero postear algo" y "está en
internet".

Para cuando no estoy con la pc, uso el bot de Telegram. Le mando `/log lo que
quiera decir` y aparece en el blog.

El bot está escrito en Go, corre en un container en mi servidor. Cuando recibe
un mensaje, genera el archivo markdown con el frontmatter de Hugo, hace `git
commit`, hace `git push`, y espera a que Netlify termine de desplegar. (También
me di cuenta que lo tienen público sin auth a este endpoint por diseño,
rarísimo). Me confirma cuando está online.

Si le mando una foto con el caption `/log caption de la foto`, baja la imagen,
la guarda en el repo, genera el markdown con la referencia a la imagen, y hace
lo mismo. Soporta hasta álbumes de varias fotos.

Es básicamente un cliente de git que habla por Telegram. Me deja postear desde
cualquier lado sin tocar una computadora.

---

## El deploy automático

El repositorio está conectado a [Netlify](https://www.netlify.com/). No es que
les quiera hacer publicidad, pero está bueno el servicio gratuito que tienen.
Una vez hice entrevista con ellos y fue el proceso más largo de entrevistas de
mi vida. 7 entrevistas para no quedar. 

Cada vez que hay un push a `main`, Netlify detecta el cambio, clona el repo,
corre `hugo --gc --minify`, y depliega el resultado a su CDN.

El proceso entero toma entre 10 y 30 segundos dependiendo de qué tan hasta las
manos esté Netlify. Como te mencioné antes, el bot de Telegram consulta la API
de Netlify para verificar que el deploy terminó bien antes de confirmarme.

Lo bueno es que no hay servidores que mantener, (bueno, el bot) no hay
infraestructura que escalar. Es un sitio estático servido desde edge locations
en todo el mundo. Rápido, gratis, y prácticamente indestructible.


---


## El fondo que respira

Si estás en una computadora, fijate en el fondo de la página. Hay algo
moviéndose. Son blobs difusos, como manchas de tinta diluida, que se mueven
lentamente.

Es un shader de WebGL que corre directo en el navegador. Usa [simplex
noise](https://en.wikipedia.org/wiki/Simplex_noise) para generar formas
orgánicas que mutan con el tiempo, y un patrón de dithering Bayer 8x8 para
darle esa textura pixelada, medio retro. Corre a 20fps para no comerse la
batería y el tiempo se persiste entre páginas para que no "salte" cuando
navegás.

Si estás en Brave con los shields activados, o en un celular con "reducir
movimiento", probablemente no lo veas. Está diseñado para degradar
silenciosamente. El blog sigue funcionando igual, solo que sin el efecto.

---

## Comentarios

Los comentarios usan [Giscus](https://giscus.app/), que almacena todo en GitHub
Discussions. No hay backend propio, no hay base de datos, no hay moderación
manual. 

Lo malo es que si querés comentar, necesitás una cuenta de GitHub.  Deja afuera
a mucha gente. Es un punto a mejorar. 

---

## El árbol escondido

Apretá la tecla T. No hizo nada? Entonces Shift + T. 

Aparece un panel flotante a la izquierda que muestra la estructura del blog
como si fuera el output del comando `tree` en Unix. Posts organizados por
categoría, los últimos logs, las páginas estáticas. Todo navegable.

Podés arrastrarlo a donde quieras y el navegador recuerda la posición. Apretá
ESC o T de nuevo para cerrarlo. También hay un panel de ayuda con H.

Es un detalle innecesario, pero me gusta. Es el tipo de cosa que solo existe
porque puedo hacerla.

---
## Por qué todo esto

Al final del día, este sitio no pretende nada. No necesito que tenga visitas,
no quiero venderte un curso y me importa bastante poco el SEO. Podría haber
usado cualquier plataforma que me resuelva la vida en dos clics, pero me
divierte más pasar una tarde automatizando un bot de Telegram que scrolleando
Reddit.

Me gusta más construir el juguete que jugar con él. Y si se rompe, lo arreglo.
O no. Es mío. 
