/**
 * Class representing an API for fetching sequences from OEIS.
 */
class OES_API {
    /**
     * Creates an OES_API instance.
     */
    constructor() {
        // Base URL for the OEIS API
        this.oes_api_url = `https://oeis.org/search?fmt=json`;
    }

    /**
     * Fetches a sequence from OEIS based on the given array of numbers.
     * @param {Array<number>} sequence_arr - The array of numbers representing the sequence.
     * @returns {Promise<Object|null>} The sequence information or null if not found.
     */
    async fetch_oes_sequence(sequence_arr) {
        // Return null if the sequence array length is less than or equal to 1
        if (sequence_arr.length <= 1) {
            return null;
        }

        // Convert the sequence array to a comma-separated string
        var sequence_string = sequence_arr.join(", ");

        // Construct the URL with the sequence query
        var this_url = `${this.oes_api_url}&q=${sequence_string}`;

        // Create the proxy request object
        var this_proxy_obj = {
            method: "POST",
            body: JSON.stringify({ url: this_url }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        };

        // Fetch the sequence information through the proxy
        return fetch("/oeis_proxy", this_proxy_obj)
            .then(req => req.json())
            .then(data => {
                var results = data.results;

                // Return null if no results are found
                if (results == null || results.length <= 0) {
                    return null;
                } else {
                    // Construct the OEIS page URL for the sequence
                    var this_page_url = `https://oeis.org/search?q=${sequence_string}`;
                    return { url: this_page_url, data: results[0] };
                }
            });
    }
}
