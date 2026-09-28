let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt');
let User = require('../models/User');
let Visit = require('../models/Visit');

router.post('/register', async (req, res) => {
    try {
        let data = req.body;
        data.password = await bcrypt.hash(data.password, 10);
        let newUser = new User(data);
        let result = await newUser.save();
        res.send(result);
    } catch (err) {
        res.send({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) return res.send('Email invalid');
        if (user.status === 'FREEZE') return res.send('Account Frozen.');
        let passmatch = await bcrypt.compare(req.body.password, user.password);
        if (passmatch) res.send('Login successful');
        else res.send('Password invalid');
    } catch (err) {
        res.send({ error: err.message });
    }
});

router.get('/my-visits/:empId', async (req, res) => {
    try {
        let visits = await Visit.find({ assignedTo: req.params.empId });
        res.send(visits);
    } catch (err) {
        res.send({ error: err.message });
    }
});

router.patch('/geo-checkin/:visitId', async (req, res) => {
    try {
        let { checkInLat, checkInLng, distanceTraveled } = req.body;
        let updated = await Visit.findByIdAndUpdate(
            req.params.visitId, 
            { 
                checkInLat: checkInLat,
                checkInLng: checkInLng,
                distanceTraveled: distanceTraveled,
                status: 'GEO_VERIFIED' 
            }, 
            { new: true }
        );
        res.send(updated);
    } catch (err) {
        res.send({ error: err.message });
    }
});

router.get('/my-payroll/:empId', async (req, res) => {
    try {
        let employee = await User.findById(req.params.empId);
        let completedVisits = await Visit.find({ assignedTo: req.params.empId, status: 'GEO_VERIFIED' });
        
        let totalDistance = completedVisits.reduce((sum, item) => sum + (item.distanceTraveled || 0), 0);
        let travelReimbursement = totalDistance * employee.travelAllowancePerKm;

        res.send({
            name: employee.name,
            totalDistanceKm: totalDistance,
            baseSalary: employee.baseSalary,
            travelReimbursement: travelReimbursement,
            netPayable: employee.baseSalary + travelReimbursement
        });
    } catch (err) {
        res.send({ error: err.message });
    }
});

module.exports = router;
