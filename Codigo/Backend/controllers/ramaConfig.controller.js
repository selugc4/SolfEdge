const RamaConfig = require('../models/ramaConfig.model');

// Obtener todas las ramas
exports.getAllRamas = async () => {
    try {
        // Excluimos el campo libroDeApoyo para no enviar todos los PDFs a la vez
        const ramas = await RamaConfig.find().select('-libroDeApoyo');
        return { status: 200, body: ramas };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

// Obtener el PDF de una rama específica
exports.getRamaPdf = async (id) => {
    try {
        const rama = await RamaConfig.findById(id).select('libroDeApoyo');
        if (!rama || !rama.libroDeApoyo) {
            return { status: 404, body: { error: `PDF no encontrado para la rama con ID '${id}'.` } };
        }
        // El PDF está en Base64, lo decodificamos y enviamos como buffer binario
        const pdfBuffer = Buffer.from(rama.libroDeApoyo, 'base64');
        return { status: 200, body: pdfBuffer, contentType: 'application/pdf' };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

// Actualizar el PDF de una rama
exports.updateRamaPdf = async (id, file) => {
    try {
        if (!file) {
            return { status: 400, body: { error: 'No se ha subido ningún archivo.' } };
        }

        // Convertir el buffer del archivo a Base64
        const base64Pdf = file.buffer.toString('base64');

        const rama = await RamaConfig.findByIdAndUpdate(
            id,
            { libroDeApoyo: base64Pdf },
            { new: true, runValidators: true }
        );

        if (!rama) {
            return { status: 404, body: { error: `Rama con ID '${id}' no encontrada.` } };
        }

        // Devolvemos la rama actualizada sin el contenido del PDF para no sobrecargar la respuesta
        const ramaResponse = rama.toObject();
        delete ramaResponse.libroDeApoyo;

        return { status: 200, body: ramaResponse };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};
