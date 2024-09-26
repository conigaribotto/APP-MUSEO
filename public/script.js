//const { response } = require("express");

const URL_DEPARTAMENTOS = "https://collectionapi.metmuseum.org/public/collection/v1/departments";

const URL_OBJETOS = "https://collectionapi.metmuseum.org/public/collection/v1/objects";

const URL_OBJETO = "https://collectionapi.metmuseum.org/public/collection/v1/objects";
 
const URL_SEARCH_IMAGES = "https://collectionapi.metmuseum.org/public/collection/v1/search?q=&hasImages=true";

const URL_SEARCH = "https://collectionapi.metmuseum.org/public/collection/v1/search?q=&hasImages=true";


function fetchDepartamentos() {
    fetch(URL_DEPARTAMENTOS)
        .then((response) => response.json())
        .then((data) => {
            const departamentoSelect = document.getElementById("departamento");
            data.departments.forEach((departamento) => {
                const option = document.createElement("option");
                option.value = departamento.departmentId;  
                option.textContent = departamento.displayName;
                departamentoSelect.appendChild(option); 
            });
        })
        .catch((error) => {
            console.error("Error al obtener los departamentos:", error);
        });
}

function fetchObjetos(objectIDs) {
    let objetosHtml = "";
    const promises = []; 
    const tooltip = document.getElementById("tooltip"); // Obtener el tooltip

    for (const objectId of objectIDs) {
        const promise = fetch(`${URL_OBJETOS}/${objectId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const titulo = data.title || "Sin título";
                const cultura = data.culture ? `Cultura: ${data.culture}` : "Cultura: Desconocida";
                const dinastia = data.dynasty ? `Dinastía: ${data.dynasty}` : "Dinastía: Desconocida";
                const imagen = (data.primaryImageSmall && data.primaryImageSmall !== "") 
                    ? data.primaryImage 
                    : "img/noimg.jpg";
                
                // Obtener la fecha de creación
                const fechaCreacion = data.objectDate || "Fecha desconocida";

                // Verificar si hay imágenes adicionales
                const imagenesAdicionales = data.additionalImages && data.additionalImages.length > 0;

                // Botón para ver imágenes adicionales, si existen
                const botonImagenesAdicionales = imagenesAdicionales ? 
                    `<button style="margin-bottom: 10px;" onclick="verImagenesAdicionales(${objectId})">Ver Imágenes Adicionales</button>` 
                    : "";

                objetosHtml += `
                    <div class="objeto" style="position: relative;">
                        <img src="${imagen}" alt="${titulo}" onerror="this.src='img/noimg.jpg';" 
                            onmouseenter="showTooltip(event, '${fechaCreacion}')" 
                            onmouseleave="hideTooltip()"/> 
                        <h3 class="titulo">${titulo}</h3>
                        <h5 class="cultura">${cultura}</h5>
                        <h5 class="dinastia">${dinastia}</h5>
                        ${botonImagenesAdicionales} <!-- Añadir el botón si hay imágenes adicionales -->
                    </div>
                `;
            })
            .catch((error) => {
                console.error("Error al obtener el objeto:", error);
            });

        promises.push(promise);
    }

    Promise.all(promises).then(() => {
        document.getElementById("grilla").innerHTML = objetosHtml;
    });
}

// Función para mostrar el tooltip
function showTooltip(event, fecha) {
    const tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = `Fecha: ${fecha}`; // Mostrar la fecha en el tooltip
    tooltip.style.display = "block"; // Hacer visible el tooltip

    // Posicionar el tooltip centrado sobre la imagen
    tooltip.style.left = event.pageX + "px"; // Establecer la posición horizontal
    tooltip.style.top = event.pageY + "px"; // Establecer la posición vertical
}

// Función para ocultar el tooltip
function hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none"; 
}

fetchDepartamentos();

fetch(URL_SEARCH_IMAGES)
    .then((response) => response.json())
    .then((data) => {
        fetchObjetos(data.objectIDs.slice(0, 20));
    })
    .catch((error) => {
        console.error("Error al obtener los objetos:", error);
    });


    document.getElementById("buscar").addEventListener("click",(event)=>{
        event.preventDefault();
        const departamento = document.getElementById("departamento").value;
        const keyword = document.getElementById("keyword").value;
        const localizacion = document.getElementById("localizacion").value;
        const paramLocalizacion = localizacion != '' ? `&geoLocalization=${localizacion}` : ""; 


        fetch(URL_SEARCH + `?q=${keyword}&departamentoId=${departamento}&geoLocation=${localizacion}`)
        .then((response) => response.json())
        .then((data) => {
            fetchObjetos(data.objectIDs.slice(0, 20));
        });
    
    });

    function verImagenesAdicionales(objectId) {
        window.location.href = `imagenes-adicionales.html?objectId=${objectId}`;
    }
    