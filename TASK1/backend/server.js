import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve paths for local backup JSON file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_FILE_PATH = path.join(__dirname, 'registrations_backup.json');

// Middleware
app.use(cors());
app.use(express.json());

// Database connection status flag
let isMongoConnected = false;
let dbStatusMessage = "Connecting to database...";

// Define Mongoose Schema and Model
const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  technology: {
    type: String,
    required: [true, 'Technology selection is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

let Registration;
try {
  Registration = mongoose.model('Registration', registrationSchema);
} catch (error) {
  Registration = mongoose.models.Registration;
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/internship_registration')
  .then(() => {
    isMongoConnected = true;
    dbStatusMessage = "Successfully connected to MongoDB";
    console.log('MongoDB connection established successfully.');
  })
  .catch((err) => {
    isMongoConnected = false;
    dbStatusMessage = "MongoDB offline (using local JSON storage fallback)";
    console.warn('MongoDB connection failed. Falling back to local JSON storage.');
    console.warn(`Reason: ${err.message}`);
  });

// Helper functions for local fallback storage
const readBackupData = () => {
  try {
    if (!fs.existsSync(BACKUP_FILE_PATH)) {
      fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(BACKUP_FILE_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading backup file:', error);
    return [];
  }
};

const writeBackupData = (data) => {
  try {
    fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing backup file:', error);
    return false;
  }
};

// API Endpoints

// 1. Get all registrations
app.get('/api/registrations', async (req, res) => {
  try {
    let records = [];
    if (isMongoConnected) {
      records = await Registration.find().sort({ createdAt: -1 });
    } else {
      records = readBackupData();
      // Sort backup by date descending
      records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      dbStatus: isMongoConnected ? 'connected' : 'offline_fallback',
      message: dbStatusMessage,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve registrations',
      error: error.message
    });
  }
});

// 2. Submit new registration
app.post('/api/register', async (req, res) => {
  const { name, email, technology } = req.body;

  // Simple validation
  if (!name || !email || !technology) {
    return res.status(400).json({
      success: false,
      message: 'All fields (Name, Email, Technology) are required.'
    });
  }

  // Email format validation regex
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  try {
    let savedRecord;

    if (isMongoConnected) {
      savedRecord = await Registration.create({ name, email, technology });
    } else {
      const records = readBackupData();
      savedRecord = {
        _id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        technology,
        createdAt: new Date()
      };
      records.push(savedRecord);
      writeBackupData(records);
    }

    res.status(201).json({
      success: true,
      dbStatus: isMongoConnected ? 'connected' : 'offline_fallback',
      message: isMongoConnected ? 'Registration saved successfully in MongoDB' : 'Registration saved in local fallback storage',
      data: savedRecord
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete registration',
      error: error.message
    });
  }
});

// 3. System status endpoint
app.get('/api/status', (req, res) => {
  const records = isMongoConnected ? null : readBackupData();
  res.status(200).json({
    status: 'online',
    dbStatus: isMongoConnected ? 'connected' : 'offline_fallback',
    message: dbStatusMessage,
    port: PORT,
    localBackupSize: records ? records.length : 'N/A'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`Server is running on port: ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Database Status: ${dbStatusMessage}`);
  console.log(`==================================================\n`);
});
