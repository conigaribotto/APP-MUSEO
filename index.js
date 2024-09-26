const express = require('express');
const app = express();
const port = 3000;
const translate = require("node-google-translate-skidz");

app.use(express.json()); 
app.use(express.static("public"));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Función para traducir un texto usando node-google-translate-skidz
async function traducirAsync(texto, sourceLang = "en", targetLang = "es") {
  const resultado = await translate({
    text: texto,
    source: sourceLang,
    target: targetLang,
  });
  return resultado.translation;
}

// Ruta para manejar la traducción
app.post('/traducir', async (req, res) => {
    const { texto } = req.body; 
    try {
        const traduccion = await traducirAsync(texto);
        res.json({ traduccion }); 
    } catch (error) {
        res.status(500).json({ error: "Error en la traducción" });
    }
});
