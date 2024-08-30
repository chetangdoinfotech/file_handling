const fs = require('fs');

class JsonFileDb {
    constructor(filePath) {
        this.filePath = filePath;
        this.loadData();
    }

    // Load data from the JSON file
    loadData() {
        try {
            if (fs.existsSync(this.filePath)) {
                const rawData = fs.readFileSync(this.filePath, 'utf8');
                this.data = JSON.parse(rawData);
            } else {
                // Initialize with an empty object if file does not exist
                this.data = {};
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = {};
        }
    }

    // Save data to the JSON file
    saveData() {
        try {
            const jsonData = JSON.stringify(this.data, null, 2); // Format with 2 spaces
            fs.writeFileSync(this.filePath, jsonData, 'utf8');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Get a value by key
    get(key) {
        return this.data[key];
    }

    // Set a value by key
    set(key, value) {
        this.data[key] = value;
        this.saveData();
    }

    /*
    // Delete a key
    delete(key) {
        delete this.data[key];
        this.saveData();
    }

    // List all keys
    list() {
        return Object.keys(this.data);
    }
    */
}

module.exports = JsonFileDb;

