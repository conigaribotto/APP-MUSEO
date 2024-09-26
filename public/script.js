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

// Función para mostrar el tooltip
function showTooltip(event, fecha) {
    const tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = `Fecha de creación: ${fecha}`; // Mostrar la fecha en el tooltip
    tooltip.style.display = "block"; // Hacer visible el tooltip

    // Ajustar el tooltip basado en la posición del mouse y centrado
    const tooltipWidth = tooltip.offsetWidth; // Obtener el ancho del tooltip
    const offsetX = event.pageX - (tooltipWidth / 2); // Centrar horizontalmente
    const offsetY = event.pageY - 20; // Establecer la posición vertical un poco arriba del mouse

    tooltip.style.left = `${offsetX}px`; // Establecer la posición horizontal
    tooltip.style.top = `${offsetY}px`; // Establecer la posición vertical
}

// Función para ocultar el tooltip
function hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none"; 
}

function fetchObjetos(objectIDs) {
    let objetosHtml = "";
    const promises = []; 

    for (const objectId of objectIDs) {
        const promise = fetch(`${URL_OBJETOS}/${objectId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Primary Image URL:", data.primaryImageSmall);

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

                // Agregar el evento de hover para el tooltip en cada imagen
                objetosHtml += `
                    <div class="objeto">
                        <img src="${imagen}" alt="${titulo}" title="${fechaCreacion}" 
                            onmouseenter="showTooltip(event, '${fechaCreacion}')" 
                            onmouseleave="hideTooltip()"
                            onerror="this.src='img/noimg.jpg';"/> 
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



fetchDepartamentos();

fetch(URL_SEARCH_IMAGES)
    .then((response) => response.json())
    .then((data) => {
        fetchObjetos(data.objectIDs.slice(0, 22));
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
            fetchObjetos(data.objectIDs.slice(0, 21));
        });
    
    });

    function verImagenesAdicionales(objectId) {
        window.location.href = `imagenes-adicionales.html?objectId=${objectId}`;
    }
    