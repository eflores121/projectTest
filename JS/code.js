document.addEventListener('DOMContentLoaded', function () {
    const selects = document.querySelectorAll('select');

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
    boton.addEventListener('click', function (event) {
        let todosSeleccionados = true;

        selects.forEach(function (select) {
            if (select.value === "") {
                todosSeleccionados = false;
                select.style.border = "2px solid red";
            } else {
                select.style.border = "1px solid #ccc";
            }
        });

        if (!todosSeleccionados) {
            alert("Por favor, selecciona un valor en todos los campos.");
            event.preventDefault();
        } else {
            const gradoSelect = document.querySelector('.grado-selector');
            const grado = gradoSelect ? parseInt(gradoSelect.value) : null;
            
            // Llamar a la función correspondiente según el grado
            if (grado === 1 || grado === 3 || grado === 4) {
                CalcularR();
            } else if (grado === 2 || grado === 5) {
                CalcularY();
            }
        }
    });

"Aquí está la función de 1,3,4"	

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
	document.getElementById("mensaje").textContent= ` ${mensajeFinal}`;
}

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
    let cursosDesaprobadosRecuperacion = []; // Lista de cursos con estado "Dp" o "Rp"

    // Calcular el estado de cada curso según el grado 2 o 5
    for (const [curso, competencias] of Object.entries(cursos)) {
        let countC = 0;
        let countA_AD = 0;
        let countB = 0;

        competencias.forEach(compId => {
            const comp = document.getElementById(compId);
            if (comp) {
                if (comp.value === "C") {
                    countC++;
                } else if (comp.value === "A" || comp.value === "AD") {
                    countA_AD++;
                } else if (comp.value === "B") {
                    countB++;
                }
            }
        });

        const halfCompetencias = Math.ceil(competencias.length / 2);

        // Lógica para grados 2 y 5
        if (countC >= halfCompetencias) {
            resultadoText += `${curso}: Dp, `;
            cursosDp++;
            cursosDesaprobadosRecuperacion.push(curso);
        } else if (countA_AD >= halfCompetencias && countB + countA_AD === competencias.length) {
            resultadoText += `${curso}: Ap, `;
            cursosAp++;
        } else {
            resultadoText += `${curso}: Rp, `;
            cursosRp++;
            cursosDesaprobadosRecuperacion.push(curso);
        }
    }

    // Calcular el estado final del estudiante
    let estadoFinal = "";
    let mensajeFinal = "";

    if (cursosDp >= 4) {
        estadoFinal = "Desaprobado";
        mensajeFinal = "Permaneces en el mismo grado por haber desaprobado 4 o más cursos.";
    } else if (cursosAp >= 3 && cursosRp === 0) {
        estadoFinal = "Aprobado";
        mensajeFinal = "Felicitaciones, promoviste de grado.";
    } else {
        estadoFinal = "Recuperación";
        mensajeFinal = "Debes recuperar las competencias con de los cursos listados: " + cursosDesaprobadosRecuperacion.join(", ");
    }

    // Mostrar el estado final del estudiante y mensaje adicional
    document.getElementById("situacion").textContent = `Situación Final: ${estadoFinal}`;
	document.getElementById("mensaje").textContent= ` ${mensajeFinal}`;
}


});