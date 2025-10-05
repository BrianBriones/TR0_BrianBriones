document.addEventListener("DOMContentLoaded", () => {
  const NPREGUNTAS = 10;
  const app = document.getElementById("app");
  const marcadorDiv = document.getElementById("marcador");

  let estatDeLaPartida = {
    preguntaActual: 0,
    contadorPreguntes: 0,
    respostesUsuari: [],
    tempsRestant: 30,
    preguntes: []
  };

  let idTimer;

  //iniciar cuenta atrás
  function iniciarCuentaAtras(callback) {
    let introModal = document.getElementById("introModal");
    if (!introModal) {

      introModal = document.createElement("div");
      introModal.id = "introModal";
      introModal.innerHTML = `
        <div class="intro-content">
          <h2>Prepárate 🧠</h2>
          <p>Tendrás <strong>30 segundos</strong> por pregunta. ¡Concéntrate y da lo mejor de ti!</p>
          <p class="motivadora">¿Listo?</p>
          <div id="countdown" class="countdown">5</div>
        </div>
      `;
      document.body.appendChild(introModal);
    }

    const countdownEl = introModal.querySelector("#countdown");

    introModal.style.display = "flex";
    introModal.style.opacity = "1";

    let count = 5;
    countdownEl.textContent = count;
    // Evitar que se ejecute dos veces si ya hay un intervalo activo
    if (introModal.dataset.countdownActive === "true") return;
    introModal.dataset.countdownActive = "true";
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.textContent = count;
      } else {
        clearInterval(timer);
        introModal.style.opacity = "0";
        setTimeout(() => {
          introModal.style.display = "none";
          introModal.dataset.countdownActive = "false";
          callback(); 
        }, 800);
      }
    }, 1000);
  }

  //GUARDAR EN LOCALSTORAGE
  function guardarPartida() {
    localStorage.setItem("partida", JSON.stringify(estatDeLaPartida));
  }

  //RECUPERAR DE LOCALSTORAGE
  function carregarPartida() {
    if (localStorage.partida) {
      estatDeLaPartida = JSON.parse(localStorage.getItem("partida"));
      return true;
    }
    return false;
  }

  //BORRAR PARTIDA
  function esborrarPartida() {
    localStorage.removeItem("partida");
    estatDeLaPartida = {
      preguntaActual: 0,
      contadorPreguntes: 0,
      respostesUsuari: [],
      tempsRestant: 30,
      preguntes: []
    };
    clearInterval(idTimer);
    iniciarCuentaAtras(() => carregarPreguntes(NPREGUNTAS)); // ⬅️ ahora se reinicia tras cuenta atrás
  }

  //CARGAR PREGUNTAS
  async function carregarPreguntes(n = NPREGUNTAS) {
    try {
      if (!carregarPartida()) {
        const res = await fetch(`./getPreguntas.php?n=${n}`);
        if (!res.ok) throw new Error("Error cargando preguntas");
        estatDeLaPartida.preguntes = await res.json();
        estatDeLaPartida.respostesUsuari = new Array(
          estatDeLaPartida.preguntes.length
        ).fill(null);
      }
        iniciarTimer();
        mostrarPregunta();


    } catch (e) {
      app.innerHTML = `<p>Error al cargar preguntes: ${e.message}</p>`;
    }
  }

  //Temporizador
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

  //MARCADOR
  function actualitzaMarcador() {
    if (!marcadorDiv) return;
    let htmlString = `
    <div class="contador-top">
      <span>Pregunta ${estatDeLaPartida.preguntaActual + 1}/${estatDeLaPartida.preguntes.length}</span> <br>
    </div>  
      Temps restant: ${estatDeLaPartida.tempsRestant}s
      <div class="progress">
        <div class="progress-bar" style="width:${(estatDeLaPartida.tempsRestant / 30) * 100}%"></div>
      </div>
      <div> <button id="btnBorrar" class="btn btn-danger">Borrar Partida</button> </div>
    `;
    marcadorDiv.innerHTML = htmlString;
    document
      .getElementById("btnBorrar")
      .addEventListener("click", esborrarPartida);
  }

  // MOSTRAR PREGUNTA
  function mostrarPregunta() {
    console.log("Mostrando pregunta:", estatDeLaPartida.preguntaActual);
    const total = estatDeLaPartida.preguntes.length;
    const p = estatDeLaPartida.preguntes[estatDeLaPartida.preguntaActual];
    app.innerHTML = "";

    const contador = document.createElement("div");
    contador.className = "contador";
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
      const prev =
        estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual];
      const radioPrev = document.querySelector(
        `input[value="${prev}"][name="q${estatDeLaPartida.preguntaActual}"]`
      );
      if (radioPrev) radioPrev.checked = true;
    }

    // Botón "Anterior"
    if (estatDeLaPartida.preguntaActual > 0) {
      const btnAnterior = document.createElement("button");
      btnAnterior.textContent = "Anterior";
      btnAnterior.className = "btn-previous";
      btnAnterior.style.marginRight = "10px";
      btnAnterior.addEventListener("click", () => {
        estatDeLaPartida.preguntaActual--;
        mostrarPregunta();
      });
      card.appendChild(btnAnterior);
    }

    // Botón "Següent" o "Finalitzar"
    const btnSeguent = document.createElement("button");
    btnSeguent.className = "btn-submit";
    btnSeguent.textContent =
      estatDeLaPartida.preguntaActual === total - 1
        ? "Finalitzar"
        : "Següent";
    btnSeguent.addEventListener("click", () => {
      const seleccion = document.querySelector(
        `input[name="q${estatDeLaPartida.preguntaActual}"]:checked`
      );
      if (!seleccion) {
        alert("Selecciona una resposta abans de continuar.");
        return;
      }

      // Guardamos la respuesta
      estatDeLaPartida.respostesUsuari[
        estatDeLaPartida.preguntaActual
      ] = parseInt(seleccion.value, 10);
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
    card.appendChild(btnSeguent);

    app.appendChild(card);
    actualitzaMarcador();
  }

  // ENVIAR RESULTADOS
  async function enviarResultats() {
    try {
      const res = await fetch("./finalitza.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respostes: estatDeLaPartida.respostesUsuari,
          preguntes: estatDeLaPartida.preguntes
        })
      });
      if (!res.ok) throw new Error("Error al enviar respuestas");
      const resultat = await res.json();
      localStorage.removeItem("partida");
      mostrarResultat(resultat);
    } catch (e) {
      app.innerHTML = `<p>Error al enviar respostes: ${e.message}</p>`;
    }
  }

  // MOSTRAR RESULTADOS
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


    const backBtn = document.createElement("button");
    backBtn.textContent = "🏠 Tornar a inici";
    backBtn.className = "btn-home back";
    backBtn.style.marginLeft = "10px";
    backBtn.addEventListener("click", () => {
      location.reload(); 
    });
    app.appendChild(backBtn);
  }

  // Espera a que el usuario pulse "Jugar"
  const btnJugar = document.getElementById("btnJugar");
  const pantallaInicio = document.getElementById("pantallaInicio");
  const gameContainer = document.getElementById("gameContainer");

  btnJugar.addEventListener("click", () => {
    pantallaInicio.style.display = "none"; 
    gameContainer.style.display = "block"; 

    iniciarCuentaAtras(() => {
      carregarPreguntes(NPREGUNTAS);
    });
  });
});
