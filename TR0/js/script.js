let estatDeLaPartida = {
    contadorPreguntes: 0,
    respostesUsuari: []
};
 function actualitzarMarcador() {
    let marcador = document.getElementById("marcador");
    let htmlString= `Preguntes respostes: ${estatDeLaPartida.contadorPreguntes}/20 <br>`;
    for (let i=0; i<estatDeLaPartida.respostesUsuari.length; i++) {
        htmlString += `<p>Pregunta ${i+1} : Resposta ${estatDeLaPartida.respostesUsuari[i]+1}</p>`;
    }
    marcador.innerHTML += htmlString;
}
function marcarRespuesta(numPregunta,  numResposta){
    estatDeLaPartida.respostesUsuari[numPregunta] = numResposta;
    console.log(estatDeLaPartida.respostesUsuari);
    estatDeLaPartida.contadorPreguntes++;
    actualitzarMarcador();
}

function renderJuego(data) {
    alert("hola");
    console.log(data);
    let contenidor = document.getElementById("questionari");
    let htmlString = "";

    for (let i=0; i<data.preguntes.length; i++) {
        htmlString += `<h3> ${data.preguntes[i].pregunta} </h3>`;
        htmlString += `<img src="${data.preguntes[i].imatge}" alt="Imatge de la pregunta ${i+1}">`;

        for (let j=0; j < data.preguntes[i].respostes.length; j++) {
                htmlString += `<button onclick ="console.log('Has apretat pregunta' + ${i+1} + ' resposta ' + ${j+1})"> 
                ${data.preguntes[i].respostes[j].resposta} </button>`;

            }
            
        }
        contenidor.innerHTML=htmlString; 
}

window.addEventListener("DOMContentLoaded", (event) => {
    fetch('js/data.json')
        .then(response => response.json())
        .then(data => renderJuego(data));

    }

);
