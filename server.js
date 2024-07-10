// Import required modules
const express = require("express");
const http = require('http');
const bodyParser = require('body-parser');
const path = require("path");
const DataStore = require("nedb");

// Import NodeCache for caching
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 * 60 * 30 }); // Cache with a TTL of 30 minutes

// Middleware to verify and use cache
const verifyCache = (req, res, next) => {
    try {
        var id = req.method + req.body.url;
        if (cache.has(id)) {
            // If cache hit, return cached response
            return res.status(200).json(cache.get(id));
        }
        // Proceed to next middleware if cache miss
        return next();
    } catch (err) {
        throw new Error(err);
    }
};

// Initialize NeDB database
const db = new DataStore({ filename: path.join(__dirname, 'oeis_cache.json'), autoload: true });

// Initialize Express application
const app = express();
const server = http.createServer(app);

// Configure Express settings
app.set('view engine', 'ejs'); // Set EJS as the view engine
const PORT_TO_USE = 8081; // Define port for the server

// Middleware setup for handling JSON and large payloads
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 500000 }));

// Serve static files from the 'public' directory
app.use("/static", express.static(path.join(__dirname, 'public')));

// Set the 'views' directory for rendering views
app.set('views', path.join(__dirname, 'public'));

// Log the path to the 'public' directory
console.log(path.join(__dirname, 'public'));

// Route for rendering index page
app.get("/", (req, resp) => {
    resp.render("index.ejs"); // Render 'index.ejs' view
});

// API endpoint to clear cache (optional key parameter)
app.get('/api/cache/clear/:key?', function (req, res, next) {
    res.send(200, verifyCache.clear(req.params.key || req.query.key)); // Clear cache for specified key
});

// Proxy endpoint for fetching data from OEIS API with caching
app.post("/oeis_proxy", verifyCache, async (req, resp) => {
    const this_key = req.body.url; // Extract URL from request body

    // Check if data is cached
    const this_cached_response = await get_oeis_data_from_cache(this_key);

    if (this_cached_response) {
        // If cached data exists, return it
        return resp.json(this_cached_response[0].data);
    } else {
        // If not cached, fetch data from OEIS API
        fetch(encodeURI(req.body.url))
            .then(req => req.json())
            .then(async function (data) {
                // Save fetched data to cache and respond with data
                save_oeis_data_to_cache(data, this_key);
                cache.set(req.body.url, data);
                return resp.json(data);
            })
            .catch(async function (reason) {
                // Handle fetch errors gracefully
                const data = { results: [] };
                return resp.json(data);
            });
    }
});

// Function to save OEIS data to NeDB cache
async function save_oeis_data_to_cache(data, key) {
    // Parse and format data for caching
    const parsed_data = {
        query: data.query,
        results: (function () {
            if (data.results != null) {
                data.results.splice(2); // Limit results to first two entries if available

                // Map and extract necessary data fields
                const new_data_results = data.results.map(x => ({
                    id: x.id,
                    name: x.name,
                    data: x.data,
                    comment: x.comment
                }));

                return new_data_results;
            } else {
                return [];
            }
        })()
    };

    // Check if data already exists in cache
    const already_cached_seq = await get_oeis_data_from_cache(key);

    // Insert data into NeDB if not already cached
    if (already_cached_seq == null) {
        return db.insert({ key: key, data: parsed_data }, function (err, newDocs) { });
    }
}

// Function to retrieve OEIS data from NeDB cache
async function get_oeis_data_from_cache(key) {
    // Retrieve data from NeDB based on key
    return await new Promise((resolve, reject) => {
        db.find({ key: key }, function (err, docs) {
            if (err) {
                console.log(err, "llllllllllll"); // Log error if any
                return resolve(null);
            }

            // Return null if no matching documents found
            if (docs.length <= 0) {
                return resolve(null);
            }

            // Resolve with the found documents
            return resolve(docs);
        });
    });
}

// Start the server
server.listen(PORT_TO_USE, () => {
    console.log(`Server running on http://localhost:${PORT_TO_USE}.`);
});
