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
            // Return 204 instead of 404 to avoid console error
            return { status: 204, body: null };
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
        let updateData;
        if (file) {
            // Si hay archivo, lo convierte a Base64
            updateData = { libroDeApoyo: file.buffer.toString('base64') };
        } else {
            // Si no hay archivo, se interpreta como una solicitud para eliminar el libro.
            updateData = { libroDeApoyo: null };
        }

        const rama = await RamaConfig.findByIdAndUpdate(
            id,
            updateData,
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
