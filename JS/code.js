// Importar Firebase y Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDRfsJQOPndcp3vgTG8ugcUoD9ckROhrQI",  // Tu apiKey
    authDomain: "tempcode-945aa.firebaseapp.com",     // Tu authDomain
    projectId: "tempcode-945aa",                      // Tu projectId
    storageBucket: "tempcode-945aa.firebasestorage.app", // Tu storageBucket
    messagingSenderId: "797634623015",                // Tu messagingSenderId
    appId: "1:797634623015:web:651f5557f5afd2f9e54002", // Tu appId
};

// Inicializamos Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function () {
    // Seleccionamos todos los elementos <select>
    const selects = document.querySelectorAll('select');
    
    // Añadir un evento de cambio a cada <select>
    selects.forEach(function (select) {
        select.addEventListener('change', function () {
            if (select.classList.contains('grado-selector')) return;
            select.classList.remove('red-text', 'blue-text');
            
            if (this.value === 'C') {
                select.classList.add('red-text');
            } else {
                select.classList.add('blue-text');
            }
        });
    });

    const boton = document.querySelector('button');
    
    // Agregar el evento click al botón
    boton.addEventListener('click', async function (event) {
        // Limpia los elementos <p> antes de cualquier validación
        document.getElementById('situacion').textContent = 'Para calcular tu situación final, solicita un código';
        document.getElementById('mensaje').textContent = '';
        
        let todosSeleccionados = true;
        
        // Verificar que todos los campos de selección estén completos
        const selects = document.querySelectorAll('select');
        selects.forEach(function (select) {
            if (select.value === "") {
                todosSeleccionados = false;
                select.style.border = "2px solid red";
            } else {
                select.style.border = "1px solid #ccc";
            }
        });

        // Si falta alguna selección, no continuar
        if (!todosSeleccionados) {
            alert("Por favor, selecciona un valor en todos los campos.");
            event.preventDefault();
        } else {
            // Si todas las selecciones son válidas, solicitamos el código temporal
            const codigoValido = await solicitarCodigoYVerificar();

            if (codigoValido) {
                alert("Código válido. Acepta para calcular");
                
                // Aquí empiezan los cálculos
                const gradoSelect = document.querySelector('.grado-selector');
                const grado = gradoSelect ? parseInt(gradoSelect.value) : null;
                
                // Llamar a la función correspondiente según el grado
                if (grado === 1 || grado === 3 || grado === 4) {
                    CalcularR();
                } else if (grado === 2 || grado === 5) {
                    CalcularY();
                }
            } else {
                alert("Tu código no existe o ya expiró");
            }
        }
    });

    // Función para solicitar y verificar el código temporal
   async function solicitarCodigoYVerificar() {
        const codigoIngresado = prompt("Por favor, ingresa tu código de acceso:");

        if (codigoIngresado) {
            console.log(`Buscando código en Firestore: ${codigoIngresado}`);
            
            const querySnapshot = await getDocs(collection(db, "codeList"));
            
            for (const doc of querySnapshot.docs) {  
                const codigoData = doc.data();
                
                // Comparamos el campo 'code' con el código ingresado
                if (codigoData.code === codigoIngresado) {
                    if (!codigoData.used) {
                        await updateDoc(doc.ref, { used: true }); // Marcamos el código como utilizado
                        return true; // Retornamos true si el código es válido y no estaba usado
                    } else {
                        return false; // Retornamos false si el código ya estaba usado
                    }
                }
            }

            return false; // Retornamos false si no se encontró el código
        } else {
            return false;
        }
    }

    // Función de cálculo para grado R
    function CalcularR() {
        const cursos = {
            MATEMATICA: ["MAT1", "MAT2", "MAT3", "MAT4"],
            COMUNICACION: ["COM1", "COM2", "COM3"],
            "CIENCIA Y TECNOLOGIA": ["CT1", "CT2", "CT3"],
            DPCC: ["DPCC1", "DPCC2"],
            "CIENCIAS SOCIALES": ["CS1", "CS2", "CS3"],
            "ED. FISICA": ["FIS1", "FIS2", "FIS3"],
            "ARTE Y CULTURA": ["ART1", "ART2"],
            INGLES: ["ING1", "ING2", "ING3"],
            RELIGION: ["REL1", "REL2"],
            EPT: ["EPT1"]
        };

        let cursosDp = 0;
        let resultadoText = "";
        let cursosDesaprobados = []; // Lista de cursos con estado "Dp"

        // Calcular el estado de cada curso
        for (const [curso, competencias] of Object.entries(cursos)) {
            let countC = 0;
            competencias.forEach(compId => {
                const comp = document.getElementById(compId);
                if (comp && comp.value === "C") {
                    countC++;
                }
            });

            // Calcular la mitad de competencias, considerando redondeo hacia arriba para competencias impares
            const halfCompetencias = Math.ceil(competencias.length / 2);

            // Verificar si la cantidad de "C" es mayor que la mitad para el estado Dp
            if (competencias.length % 2 === 0) { // Si el número de competencias es par
                if (countC > halfCompetencias) {
                    resultadoText += `${curso}: Dp, `;
                    cursosDp++;
                    cursosDesaprobados.push(curso); // Agregar a la lista de cursos "Dp"
                } else {
                    resultadoText += `${curso}: Ap, `;
                }
            } else { // Si el número de competencias es impar
                if (countC >= halfCompetencias) {
                    resultadoText += `${curso}: Dp, `;
                    cursosDp++;
                    cursosDesaprobados.push(curso); // Agregar a la lista de cursos "Dp"
                } else {
                    resultadoText += `${curso}: Ap, `;
                }
            }
        }

        // Calcular el estado final del estudiante
        let estadoFinal = "";
        let mensajeFinal = "";

        if (cursosDp >= 4) {
            estadoFinal = "Desaprobado";
            mensajeFinal = "Permaneces en el mismo grado por haber desaprobado 4 o más cursos.";
        } else if (cursosDp >= 1) {
            estadoFinal = "Recuperación";
            mensajeFinal = "Debes recuperar las competencias con 'C' de los cursos listados: " + cursosDesaprobados.join(", ");
        } else {
            estadoFinal = "Aprobado";
            mensajeFinal = "Felicitaciones, promoviste de grado.";
        }

        // Mostrar el estado final del estudiante y mensaje adicional
        document.getElementById("situacion").textContent = `Situación Final: ${estadoFinal}`;
        document.getElementById("mensaje").textContent = ` ${mensajeFinal}`;

        // Mostrar el resultado y preparar el enlace de descarga
        mostrarResultado();
    }

    // Función de cálculo para grado Y
    function CalcularY() {
        const cursos = {
            MATEMATICA: ["MAT1", "MAT2", "MAT3", "MAT4"],
            COMUNICACION: ["COM1", "COM2", "COM3"],
            "CIENCIA Y TECNOLOGIA": ["CT1", "CT2", "CT3"],
            DPCC: ["DPCC1", "DPCC2"],
            "CIENCIAS SOCIALES": ["CS1", "CS2", "CS3"],
            "ED. FISICA": ["FIS1", "FIS2", "FIS3"],
            "ARTE Y CULTURA": ["ART1", "ART2"],
            INGLES: ["ING1", "ING2", "ING3"],
            RELIGION: ["REL1", "REL2"],
            EPT: ["EPT1"]
        };

        let cursosDp = 0;
        let cursosAp = 0;
        let cursosRp = 0;
        let resultadoText = "";
        let cursosDesaprobados = [];

        // Calcular el estado de cada curso
        for (const [curso, competencias] of Object.entries(cursos)) {
            let countC = 0;
            let countRp = 0;
            let countAp = 0;

            competencias.forEach(compId => {
                const comp = document.getElementById(compId);
                if (comp && comp.value === "C") {
                    countC++;
                } else if (comp && comp.value === "Rp") {
                    countRp++;
                } else if (comp && comp.value === "Ap") {
                    countAp++;
                }
            });

            const halfCompetencias = Math.ceil(competencias.length / 2);
            
            // Evaluar los cursos
            if (competencias.length % 2 === 0) {
                if (countC > halfCompetencias) {
                    resultadoText += `${curso}: Dp, `;
                    cursosDp++;
                    cursosDesaprobados.push(curso);
                } else {
                    resultadoText += `${curso}: Ap, `;
                    cursosAp++;
                }
            } else {
                if (countC >= halfCompetencias) {
                    resultadoText += `${curso}: Dp, `;
                    cursosDp++;
                    cursosDesaprobados.push(curso);
                } else {
                    resultadoText += `${curso}: Ap, `;
                    cursosAp++;
                }
            }
        }

        let estadoFinal = "";
        let mensajeFinal = "";

        if (cursosDp >= 4) {
            estadoFinal = "Desaprobado";
            mensajeFinal = "Permaneces en el mismo grado por haber desaprobado 4 o más cursos.";
        } else if (cursosDp >= 1) {
            estadoFinal = "Recuperación";
            mensajeFinal = "Debes recuperar las competencias con 'C' de los cursos listados: " + cursosDesaprobados.join(", ");
        } else {
            estadoFinal = "Aprobado";
            mensajeFinal = "Felicitaciones, promoviste de grado.";
        }

        // Mostrar el estado final del estudiante y mensaje adicional
        document.getElementById("situacion").textContent = `Situación Final: ${estadoFinal}`;
        document.getElementById("mensaje").textContent = ` ${mensajeFinal}`;

        // Mostrar el resultado y preparar el enlace de descarga
        mostrarResultado();
    }

    // Función para mostrar el resultado y preparar el enlace de descarga
    function mostrarResultado() {
        document.getElementById("resultado").style.display = "block"; 
        document.querySelector(".whatsapp-button").style.display = "none"; // Ocultar WhatsApp
        document.getElementById("download-link").style.display = "inline-block"; // Mostrar enlace de descarga
		document.querySelector('.whatsapp-button').parentElement.style.textAlign = 'center'; // Centra el contenido
    }

    // Función para capturar y descargar la imagen del contenedor
function capturarYDescargarImagen() {
    console.log('Capturando imagen...');
    html2canvas(document.getElementById('contenedor'), {
        onrendered: function (canvas) {
            var imageURL = canvas.toDataURL("image/png");
            var link = document.createElement('a');
            link.href = imageURL;
            link.download = 'situacion_final.png';  // Nombre del archivo a descargar
            link.click();
        }
    });
}

    // Preparar el enlace de descarga
    function prepararDescarga() {
        const downloadLink = document.getElementById("download-link");

        // Añadir un evento de clic al enlace de descarga
        downloadLink.addEventListener("click", function(event) {
            event.preventDefault(); // Evitar el comportamiento predeterminado de un enlace
            capturarYDescargarImagen(); // Ejecutar la captura y descarga
        });
    }

    prepararDescarga(); // Llamar a esta función al cargar el documento
});
