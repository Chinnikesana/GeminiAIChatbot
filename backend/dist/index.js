// import app from './app.js';
// import db from './db/connection.js';
// import axios from 'axios'
// const PORT = 5000;
// const axios = require('axios');
// db.connectionToDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server is running successfully on port ${PORT}`);
//   });
// }).catch((err) => {
//   console.error("Failed to start server due to database connection error", err);
// });
import app from './app.js';
import db from './db/connection.js';
const PORT = 5000;
db.connectionToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running successfully on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to start server due to database connection error", err);
});
//# sourceMappingURL=index.js.map