
const URL_OBJETO = "https://collectionapi.metmuseum.org/public/collection/v1/objects";

document.addEventListener("DOMContentLoaded", function() {
    // Obtener el objectId de la URL
    const params = new URLSearchParams(window.location.search);
    const objectId = params.get("objectId");

    if (objectId) {
        fetch(`${URL_OBJETO}/${objectId}`) 
            .then((response) => response.json())
            .then((data) => {
                const grillaImagenes = document.getElementById("grilla-imagenes");
                let imagenesHtml = "";

                // Verificar si hay imágenes adicionales
                if (data.additionalImages && data.additionalImages.length > 0) {
                    data.additionalImages.forEach((imagenUrl) => {
                        imagenesHtml += `
                            <div class="objeto">
                                <img src="${imagenUrl}" alt="Imagen Adicional" />
                            </div>
                        `;
                    });
                } else {
                    imagenesHtml = "<p>No hay imágenes adicionales disponibles.</p>";
                }

                grillaImagenes.innerHTML = imagenesHtml;
            })
            .catch((error) => {
                console.error("Error al obtener las imágenes adicionales:", error);
            });
    } else {
        console.error("No se encontró el objectId en la URL.");
    }
});
