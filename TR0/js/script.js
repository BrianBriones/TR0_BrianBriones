import data from './data.js';
alert ("hola")
console.log(data);
let contenidor = document.getElementById("questionari");
let htmlString="";
for (let i=0; i<data.preguntes.length; i++) {
    htmlString += `<h3> ${data.preguntes[i].pregunta} </h3>`;
    htmlString += `<img src="${data.preguntes[i].imatge}" alt="Imatge de la pregunta ${i+1}">`;

    for (let j=0; j < data.preguntes[i].respostes.length; j++) {
        htmlString += `<button onclick ="console.log('Has apretat pregunta' + ${i+1} + ' resposta ' + ${j+1})"> 
        ${data.preguntes[i].respostes[j].resposta} </button>`;

    }
    
}
contenidor.innerHTML=htmlString;    