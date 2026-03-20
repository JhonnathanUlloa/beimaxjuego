const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'backend', 'beimax.db'), (err) => {
    if (err) {
        console.error('Error connecting to DB:', err);
        process.exit(1);
    }
});

db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (err) {
        console.error('Error fetching admin:', err);
    } else {
        console.log('Admin user:', row);
    }
    db.close();
});
