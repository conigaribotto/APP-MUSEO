// Constantes para las URLs de las API del Museo Metropolitano
const URL_DEPARTAMENTOS = "https://collectionapi.metmuseum.org/public/collection/v1/departments";
const URL_OBJETOS = "https://collectionapi.metmuseum.org/public/collection/v1/objects";
const URL_SEARCH_IMAGES = "https://collectionapi.metmuseum.org/public/collection/v1/search?q=&hasImages=true";
const URL_SEARCH = "https://collectionapi.metmuseum.org/public/collection/v1/search?q=&hasImages=true";

// Variables de control de paginación y búsqueda
let currentPage = 1;  // Página actual
const itemsPerPage = 20; // Cantidad de objetos por página
let totalPages = 0; // Total de páginas
let currentSearchParams = {}; // Parámetros de la búsqueda actual

// Función para obtener los departamentos y llenar el select
function fetchDepartamentos() {
    fetch(URL_DEPARTAMENTOS)
        .then(response => response.json())
        .then(data => {
            const departamentoSelect = document.getElementById("departamento");
            data.departments.forEach(departamento => {
                const option = document.createElement("option");
                option.value = departamento.departmentId;  
                option.textContent = departamento.displayName;
                departamentoSelect.appendChild(option); 
            });
        })
        .catch(error => {
            console.error("Error al obtener los departamentos:", error);
        });
}

// Funciones para mostrar y ocultar el tooltip
function showTooltip(event, fecha) {
    const tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = `Fecha de creación: ${fecha}`;
    tooltip.style.display = "block";

    // Posicionamiento del tooltip
    const tooltipWidth = tooltip.offsetWidth;
    const offsetX = event.pageX - (tooltipWidth / 2);
    const offsetY = event.pageY - 20;

    tooltip.style.left = `${offsetX}px`;
    tooltip.style.top = `${offsetY}px`;
}

function hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none";
}

// Función para obtener los objetos y mostrarlos en la grilla
async function fetchObjetos(objectIDs) {
    let objetosHtml = "";
    const promises = []; 

    // Calcular los índices para la paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedObjectIDs = objectIDs.slice(startIndex, endIndex);

    for (const objectId of paginatedObjectIDs) {
        const promise = fetch(`${URL_OBJETOS}/${objectId}`)
            .then(response => response.json())
            .then(async data => {
                const titulo = data.title || "Sin título";
                const cultura = data.culture || "Desconocida";
                const dinastia = data.dynasty || "Desconocida";

                // Traducir título, cultura y dinastía
                const tituloTraducido = await traducirTexto(titulo);
                const culturaTraducida = await traducirTexto(cultura);
                const dinastiaTraducida = await traducirTexto(dinastia);

                const imagen = (data.primaryImageSmall && data.primaryImageSmall !== "") 
                    ? data.primaryImage 
                    : "img/noimg.jpg";
                const fechaCreacion = data.objectDate || "Fecha desconocida";
                const imagenesAdicionales = data.additionalImages && data.additionalImages.length > 0;

                // Botón para ver imágenes adicionales si existen
                const botonImagenesAdicionales = imagenesAdicionales ? 
                    `<button style="margin-bottom: 10px;" onclick="verImagenesAdicionales(${objectId})">Ver Imágenes Adicionales</button>` 
                    : "";

                objetosHtml += `
                    <div class="objeto">
                        <img src="${imagen}" alt="${titulo}" title="${fechaCreacion}" 
                            onmouseenter="showTooltip(event, '${fechaCreacion}')" 
                            onmouseleave="hideTooltip()"
                            onerror="this.src='img/noimg.jpg';"/> 
                        <h3 class="titulo">${tituloTraducido}</h3>
                        <h5 class="cultura">Cultura: ${culturaTraducida}</h5>
                        <h5 class="dinastia">Dinastía: ${dinastiaTraducida}</h5>
                        ${botonImagenesAdicionales}
                    </div>
                `;
            })
            .catch(error => {
                console.error("Error al obtener el objeto:", error);
            });

        promises.push(promise);
    }

    // Esperar a que se resuelvan todas las promesas antes de actualizar la grilla
    Promise.all(promises).then(() => {
        document.getElementById("grilla").innerHTML = objetosHtml;
        actualizarPaginacion(); 
    });
}

// Función para traducir texto usando la API
async function traducirTexto(texto) {
    try {
        const response = await fetch('/traducir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ texto }) 
        });

        if (!response.ok) {
            throw new Error('Error en la traducción');
        }

        const data = await response.json();
        return data.traduccion; 
    } catch (error) {
        console.error("Error al traducir el texto:", error);
        return texto; 
    }
}

// Función para buscar objetos según los parámetros proporcionados
function fetchSearch(queryParams) {
    const urlParams = new URLSearchParams(queryParams).toString();
    fetch(`${URL_SEARCH}?${urlParams}&hasImages=true`)
        .then(response => response.json())
        .then(data => {
            totalPages = Math.ceil(data.objectIDs.length / itemsPerPage);
            fetchObjetos(data.objectIDs);
        })
        .catch(error => {
            console.error("Error al obtener los objetos:", error);
        });
}

// Event listener para el botón de búsqueda
document.getElementById("buscar").addEventListener("click", (event) => {
    event.preventDefault();
    currentPage = 1; // Reiniciar a la primera página
    const departamento = document.getElementById("departamento").value;
    const keyword = document.getElementById("keyword").value;
    const localizacion = document.getElementById("localizacion").value;

    // Establecer los parámetros de búsqueda actuales
    currentSearchParams = {
        q: keyword,
        departamentoId: departamento,
        geoLocation: localizacion
    };

    fetchSearch(currentSearchParams);
});

// Función para actualizar la paginación en la interfaz
function actualizarPaginacion() {
    const paginacionDiv = document.getElementById("paginacion");
    paginacionDiv.innerHTML = `
        <button onclick="anteriorPagina()" ${currentPage === 1 ? "disabled" : ""}>Anterior</button>
        <span>Página ${currentPage} de ${totalPages}</span>
        <button onclick="siguientePagina()" ${currentPage === totalPages ? "disabled" : ""}>Siguiente</button>
    `;
}

// Funciones para navegar entre páginas
function siguientePagina() {
    if (currentPage < totalPages) {
        currentPage++;
        fetchSearch(currentSearchParams);
    }
}

function anteriorPagina() {
    if (currentPage > 1) {
        currentPage--;
        fetchSearch(currentSearchParams);
    }
}

// Función para ver imágenes adicionales de un objeto
function verImagenesAdicionales(objectId) {
    window.location.href = `imagenes-adicionales.html?objectId=${objectId}`;
}

// Inicializar la aplicación
fetchDepartamentos();
fetchSearch({}); // Cargar la búsqueda inicial
