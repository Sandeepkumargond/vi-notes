import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;

import connectDB from './src/db/db.js';
import app from './src/app.js';


connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});