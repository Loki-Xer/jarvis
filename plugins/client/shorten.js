const axios = require('axios');

async function shorten(url) {
    try {
        const { data } = await axios.post(
            'https://zip1.io/api/create',
            { url },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        return data;
    } catch (error) {
        console.error('URL shortening failed:', error.message);
        return null;
    }
}

module.exports = { shorten };
