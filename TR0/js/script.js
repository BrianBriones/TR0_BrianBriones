document.addEventListener("DOMContentLoaded", () => {
  const NPREGUNTAS = 10; // número de preguntas a cargar
  const app = document.getElementById("app");
  const marcadorDiv = document.getElementById("marcador");


  let estatDeLaPartida = {
    preguntaActual: 0,
    contadorPreguntes: 0,
    respostesUsuari: [],
    tempsRestant: 60,
    preguntes: []
  };

  let idTimer;

  // === GUARDAR EN LOCALSTORAGE ===
  function guardarPartida() {
    localStorage.setItem("partida", JSON.stringify(estatDeLaPartida));
  }

  // === RECUPERAR DE LOCALSTORAGE ===
  function carregarPartida() {
    if (localStorage.partida) {
      estatDeLaPartida = JSON.parse(localStorage.getItem("partida"));
      return true;
    }
    return false;
  }

  // === BORRAR PARTIDA ===
  function esborrarPartida() {
    localStorage.removeItem("partida");
    estatDeLaPartida = {
      preguntaActual: 0,
      contadorPreguntes: 0,
      respostesUsuari: [],
      tempsRestant: 60,
      preguntes: []
    };
    clearInterval(idTimer);
    carregarPreguntes(NPREGUNTAS);
  }

  // === CARGAR PREGUNTAS ===
  async function carregarPreguntes(n = NPREGUNTAS) {
    try {
      if (!carregarPartida()) {
        const res = await fetch(`./getPreguntas.php?n=${n}`);
        if (!res.ok) throw new Error("Error cargando preguntas");
        estatDeLaPartida.preguntes = await res.json();
        estatDeLaPartida.respostesUsuari = new Array(estatDeLaPartida.preguntes.length).fill(null);
      }
      iniciarTimer();
      mostrarPregunta();
    } catch (e) {
      app.innerHTML = `<p>Error al cargar preguntes: ${e.message}</p>`;
    }
  }

  // === TIMER ===
  function iniciarTimer() {
    clearInterval(idTimer);
    idTimer = setInterval(() => {
      if (estatDeLaPartida.tempsRestant > 0) {
        estatDeLaPartida.tempsRestant--;
      } else {
        clearInterval(idTimer);
        enviarResultats();
      }
      actualitzaMarcador();
      guardarPartida();
    }, 1000);
  }

  // === MARCADOR ===
  function actualitzaMarcador() {
    if (!marcadorDiv) return;
    let htmlString = `
      Pregunta ${estatDeLaPartida.preguntaActual + 1}/${estatDeLaPartida.preguntes.length} <br>
      Temps restant: ${estatDeLaPartida.tempsRestant}s
      <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:${(estatDeLaPartida.tempsRestant/60)*100}%"></div>
      </div>
      <div> <button id="btnBorrar" class="btn btn-danger">Borrar Partida</button> </div>
    `;
    marcadorDiv.innerHTML = htmlString;
    document.getElementById("btnBorrar").addEventListener("click", esborrarPartida);
  }

  // === MOSTRAR PREGUNTA ===
  function mostrarPregunta() {
    const total = estatDeLaPartida.preguntes.length;
    const p = estatDeLaPartida.preguntes[estatDeLaPartida.preguntaActual];
    app.innerHTML = "";

    const contador = document.createElement("div");
    contador.className = "contador";
    contador.textContent = `Pregunta ${estatDeLaPartida.preguntaActual + 1} de ${total}`;
    app.appendChild(contador);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${p.pregunta}</h3>`;

    if (p.imatge) {
      const img = document.createElement("img");
      img.src = p.imatge;
      img.className = "question-img";
      card.appendChild(img);
    }

    const answersDiv = document.createElement("div");
    answersDiv.className = "answers";
    p.respostes.forEach((r) => {
      const id = `q${estatDeLaPartida.preguntaActual}_a${r.id}`;
      const label = document.createElement("label");
      label.className = "answer-label";
      label.innerHTML = `
        <input type="radio" name="q${estatDeLaPartida.preguntaActual}" value="${r.id}" id="${id}">
        ${r.resposta}
      `;
      answersDiv.appendChild(label);
    });
    card.appendChild(answersDiv);

    // Restaurar selección previa del usuario
    if (estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual] != null) {
      const prev = estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual];
      const radioPrev = document.querySelector(`input[value="${prev}"][name="q${estatDeLaPartida.preguntaActual}"]`);
      if (radioPrev) radioPrev.checked = true;
    }

    const btn = document.createElement("button");
    btn.className = "btn-submit";
    btn.textContent = estatDeLaPartida.preguntaActual === total - 1 ? "Finalitzar" : "Següent";
    btn.addEventListener("click", () => {
      const seleccion = document.querySelector(
        `input[name="q${estatDeLaPartida.preguntaActual}"]:checked`
      );
      if (!seleccion) {
        alert("Selecciona una resposta abans de continuar.");
        return;
      }
      // Guardamos la respuesta
      estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual] = parseInt(seleccion.value, 10);
      estatDeLaPartida.contadorPreguntes++;

      guardarPartida();

      if (estatDeLaPartida.preguntaActual < total - 1) {
        estatDeLaPartida.preguntaActual++;
        mostrarPregunta();
      } else {
        clearInterval(idTimer);
        enviarResultats();
      }
    });
    card.appendChild(btn);

    app.appendChild(card);
    actualitzaMarcador();
  }

  // === ENVIAR RESULTADOS ===
  async function enviarResultats() {
    try {
      const res = await fetch("./finalitza.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respostes: estatDeLaPartida.respostesUsuari,
          preguntes: estatDeLaPartida.preguntes
        }),
      });
      if (!res.ok) throw new Error("Error al enviar respuestas");
      const resultat = await res.json();
      localStorage.removeItem("partida"); // limpiar al terminar
      mostrarResultat(resultat);
    } catch (e) {
      app.innerHTML = `<p>Error al enviar respostes: ${e.message}</p>`;
    }
  }

  // === MOSTRAR RESULTADOS ===
  function mostrarResultat(resultat) {
    app.innerHTML = `
      <div class="result">
        <h2 class="final-msg">Has encertat ${resultat.correctes} de ${resultat.total} preguntes!</h2>
      </div>
    `;
    resultat.detall.forEach((d, i) => {
      const card = document.createElement("div");
      card.className = "card resumen";
      card.innerHTML = `
        <h3>${i + 1}. ${d.pregunta}</h3>
        ${d.imatge ? `<img src="${d.imatge}" class="question-img">` : ""}
        <p>Tu resposta: <strong>${d.respostaUsuari ?? "No resp."}</strong></p>
        <p>Resposta correcta: <strong>${d.respostaCorrecta}</strong></p>
      `;
      card.classList.add(d.correcta ? "correcta" : "incorrecta");
      app.appendChild(card);
    });

    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Tornar a jugar";
    restartBtn.className = "btn-restart";
    restartBtn.addEventListener("click", () => esborrarPartida());
    app.appendChild(restartBtn);
  }

  // Inicia el juego (intenta cargar partida previa o empezar nueva)
  carregarPreguntes(NPREGUNTAS);
});
