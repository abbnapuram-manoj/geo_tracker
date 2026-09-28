let express = require('express');
let mongoose = require('mongoose');

let hrRoutes = require('./routes/hr_routes');
let empRoutes = require('./routes/emp_routes');

let app = express();

app.use(express.json());

app.use('/api/hr', hrRoutes);
app.use('/api/emp', empRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/geotracker')
    .then(() => console.log('Connected to MongoDB: geotracker'))
    .catch((err) => console.log('DB Connection Error:', err));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
