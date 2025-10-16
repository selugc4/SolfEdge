const RamaConfig = require('../models/ramaConfig.model');

exports.getAllRamas = async () => {
    try {
        const ramas = await RamaConfig.find();
        return { status: 200, body: ramas };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.updateRamaPdf = async (id, file) => {
    try {
        const pdfId = file ? file.id : null;
        const rama = await RamaConfig.findByIdAndUpdate(
            id,
            { libroDeApoyo: pdfId },
            { new: true, runValidators: true }
        );
        if (!rama) {
            return { status: 404, body: { error: `Rama con ID '${id}' no encontrada.` } };
        }
        return { status: 200, body: rama };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

