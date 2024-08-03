const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
    host: '127.0.0.1', // Force IPv4
    user: 'root',
    password: 'root', // replace with your MySQL password
    database: 'shopping_app' // replace with your database name
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup multer
const upload = multer();
app.use(upload.array()); // For parsing multipart/form-data

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve signup.html
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

// Handle form submission
app.post('/signup', (req, res) => {
    const { firstName, surname, email, password } = req.body;
    if (!firstName || !surname || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if the email is already registered
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error checking for existing email:', err);
            return res.status(500).json({ error: 'Error checking for existing email.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        // Insert new user
        const query = 'INSERT INTO users (firstName, surname, email, password) VALUES (?, ?, ?, ?)';
        db.query(query, [firstName, surname, email, password], (err, result) => {
            if (err) {
                console.error('Error saving user to database:', err);
                return res.status(500).json({ error: 'Error saving user to database.' });
            }
            res.status(200).json({ success: true });
        });
    });
});

// Handle signin form submission
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) {
            console.error('Error checking credentials:', err);
            return res.status(500).json({ error: 'Error checking credentials.' });
        }

        if (results.length > 0) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ error: 'Invalid email or password.' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
