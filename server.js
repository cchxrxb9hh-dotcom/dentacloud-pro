
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise'); // Use mysql2 for MariaDB compatibility
const multer = require('multer');
const fs = require('fs');

// Load environment variables from a .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 80;

// --- DATABASE CONNECTION (Example) ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dentacloud',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Attempting to connect to MariaDB...');
pool.getConnection()
  .then(conn => {
    console.log('Successfully connected to the database.');
    conn.release();
  })
  .catch(err => {
    console.error('Failed to connect to the database:', err.message);
  });


// --- FILE UPLOAD CONFIGURATION ---
// Define storage paths. In production, these should be in your .env file!
const SSD_UPLOAD_PATH = path.join(__dirname, 'uploads', 'ssd');
const HDD_UPLOAD_PATH = 'D:/large_storage/uploads/hdd'; // IMPORTANT: Configure this to your actual HDD path

// Ensure upload directories exist on server startup
fs.mkdirSync(SSD_UPLOAD_PATH, { recursive: true });
fs.mkdirSync(HDD_UPLOAD_PATH, { recursive: true });

// Configure Multer's storage engine
const storage = multer.diskStorage({
  /**
   * New File Management Strategy:
   * 1. Everything goes to SSD by default for speed.
   * 2. Large clinical assets (Documents, Photos, X-Rays) go to HDD for capacity.
   */
  destination: function (req, file, cb) {
    const mimetype = file.mimetype.toLowerCase();
    const extension = path.extname(file.originalname).toLowerCase();
    
    // Define clinical asset types that belong on HDD
    const isPhoto = mimetype.startsWith('image/');
    const isDocument = mimetype.includes('pdf') || 
                       mimetype.includes('word') || 
                       mimetype.includes('officedocument') ||
                       mimetype.includes('text/plain') ||
                       ['.pdf', '.doc', '.docx', '.txt', '.rtf'].includes(extension);
    
    // X-Rays are usually images or specific data files
    const isXRay = isPhoto || extension === '.dcm' || extension === '.dicom';

    if (isPhoto || isDocument || isXRay) {
      console.log(`Routing clinical asset (${file.originalname}) to HDD at ${HDD_UPLOAD_PATH}`);
      cb(null, HDD_UPLOAD_PATH);
    } else {
      // General system uploads (avatars, small UI assets, etc.)
      console.log(`Routing general file (${file.originalname}) to SSD at ${SSD_UPLOAD_PATH}`);
      cb(null, SSD_UPLOAD_PATH);
    }
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwriting files with the same name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// --- MIDDLEWARE ---
app.get('/config.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(`window.ENV_API_KEY = "${process.env.API_KEY || ''}";`);
});

app.use(express.json());

// --- PUBLIC ROUTES FOR UPLOADED FILES ---
// This makes the uploaded files accessible via a URL.
// IMPORTANT: These must come BEFORE your API routes.
app.use('/uploads/ssd', express.static(SSD_UPLOAD_PATH));
app.use('/uploads/hdd', express.static(HDD_UPLOAD_PATH));


// --- API ROUTES ---
app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM patients ORDER BY lastName ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to retrieve patient data.' });
  }
});

/**
 * @api {post} /api/upload/:patientId Upload a file for a patient
 * This endpoint handles file uploads and routes them to SSD/HDD based on type.
 */
app.post('/api/upload/:patientId', upload.single('patientFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded.' });
  }

  try {
    const { patientId } = req.params;
    const { originalname, path: filePath } = req.file;

    // Determine the public URL for the file based on where it was saved
    let publicUrl = '';
    const absoluteSsdPath = path.resolve(SSD_UPLOAD_PATH);
    const absoluteHddPath = path.resolve(HDD_UPLOAD_PATH);
    const absoluteFilePath = path.resolve(filePath);
    
    if (absoluteFilePath.startsWith(absoluteSsdPath)) {
        publicUrl = `/uploads/ssd/${path.basename(filePath)}`;
    } else if (absoluteFilePath.startsWith(absoluteHddPath)) {
        publicUrl = `/uploads/hdd/${path.basename(filePath)}`;
    } else {
        throw new Error('File saved to an unknown or misconfigured location.');
    }

    console.log(`File processed. Name: ${originalname}, Public URL: ${publicUrl}`);

    // Mock ID for demonstration
    const newFileId = Math.round(Math.random() * 1000); 

    res.status(201).json({
      message: 'File uploaded successfully!',
      file: {
        id: newFileId,
        name: originalname,
        url: publicUrl,
        category: 'Document', // This would ideally come from req.body.category
        date: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Failed to process file upload.' });
  }
});


// --- STATIC FILE SERVING ---
app.use(express.static(path.join(__dirname, '.')));


// --- CATCH-ALL FOR REACT ROUTING ---
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found.' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(PORT, () => {
  console.log(`DentaCloud Pro server is running on http://localhost:${PORT}`);
  console.log('Strategy: Logic-based routing (SSD default, Clinical assets to HDD).');
  console.log('Press Ctrl+C to stop.');
});
