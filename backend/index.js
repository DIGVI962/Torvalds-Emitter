require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const { errorHandler: authErrorHandler } = require('./middleware/auth');
const chatRoutes = require('./routes/generativeRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');

const app = express();

// Connect to MongoDB
// connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/api/lawyers', lawyerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB before starting the server
const startServer = async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();