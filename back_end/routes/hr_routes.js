let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt');
let User = require('../models/User');
let Visit = require('../models/Visit');

router.post('/login', async (req, res) => {
    try {
        let hr = await User.findOne({ email: req.body.email, role: 'HR' });
        if (!hr) return res.send('HR account not found');
        let match = await bcrypt.compare(req.body.password, hr.password);
        if (match) res.send('HR login successful');
        else res.send('Invalid password');
    } catch (err) {
        res.send({ error: err.message });
    }
});

router.post('/assign-visit', async (req, res) => {
    try {
        let newVisit = new Visit(req.body);
        let result = await newVisit.save();
        res.send(result);
    } catch (err) {
        res.send({ error: err.message });
    }
});

router.get('/employees', async (req, res) => {
    try {
        let employees = await User.find({ role: 'EMPLOYEE' }, { password: 0 });
        res.send(employees);
    } catch (err) {
        res.send({ error: err.message });
    }
});

router.get('/visits', async (req, res) => {
    try {
        let visits = await Visit.find().populate('assignedTo', 'name email');
        res.send(visits);
    } catch (err) {
        res.send({ error: err.message });
    }
});

router.patch('/freeze-employee/:id', async (req, res) => {
    try {
        let updated = await User.findByIdAndUpdate(req.params.id, { status: 'FREEZE' }, { new: true });
        res.send(updated);
    } catch (err) {
        res.send({ error: err.message });
    }
});

router.get('/automated-payroll/:empId', async (req, res) => {
    try {
        let employee = await User.findById(req.params.empId);
        if (!employee) return res.send('Employee not found');
        
        let completedVisits = await Visit.find({ assignedTo: req.params.empId, status: 'GEO_VERIFIED' });
        
        let totalDistance = completedVisits.reduce((sum, item) => sum + (item.distanceTraveled || 0), 0);
        let travelReimbursement = totalDistance * employee.travelAllowancePerKm;
        let netPayable = employee.baseSalary + travelReimbursement;

        res.send({
            employeeName: employee.name,
            verifiedVisits: completedVisits.length,
            totalDistanceKm: totalDistance,
            baseSalary: employee.baseSalary,
            travelReimbursement: travelReimbursement,
            netPayable: netPayable
        });
    } catch (err) {
        res.send({ error: err.message });
    }
});

module.exports = router;
