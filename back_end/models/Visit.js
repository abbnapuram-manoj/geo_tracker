let mongoose = require('mongoose');

let visitSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    targetLat: { type: Number, required: true },
    targetLng: { type: Number, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    checkInLat: { type: Number },
    checkInLng: { type: Number },
    distanceTraveled: { type: Number, default: 0 },
    status: { type: String, enum: ['PENDING', 'GEO_VERIFIED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Visit', visitSchema);
