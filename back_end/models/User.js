let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['HR', 'EMPLOYEE'], default: 'EMPLOYEE' },
    status: { type: String, enum: ['ACTIVE', 'FREEZE'], default: 'ACTIVE' },
    baseSalary: { type: Number, default: 15000 },
    travelAllowancePerKm: { type: Number, default: 10 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
