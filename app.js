const express = require('express');
const axios = require('axios');
const requestIp = require('request-ip');
const app = express();
const port = 3000;

// Middleware to get the client's IP address
app.use(requestIp.mw());

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name;
    let clientIp = req.clientIp || req.ip;

    // Handle IPv6 localhost (::1) and IPv4 localhost (127.0.0.1)
    if (clientIp === '::1' || clientIp === '127.0.0.1') {
        clientIp = ''; // Set clientIp to empty to prevent unnecessary API requests in local development
    }

    try {
        let location = 'Unknown';

        // Use ipinfo.io to get the location of the requester based on the IP address, if available
        if (clientIp) {
            const locationResponse = await axios.get(`https://ipinfo.io/${clientIp}/json?token=e6c539ae6f905d`);
            location = locationResponse.data.city || 'Unknown';
        }

        // Use OpenWeatherMap to get the temperature for the city
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=98d479a425d1a70b61341c8f8b615126`);
        const temperature = weatherResponse.data.main.temp;

        res.json({
            client_ip: clientIp,
            location: location,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`
        });

        console.log('Request processed successfully.');
    } catch (error) {
        console.error('Error:', error.message);

        // If the error response contains more information, log it
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
            console.error('Error Response Status:', error.response.status);
        }

        res.status(500).json({ error: 'An error occurred' });
    }
});

// Start the server and log success message
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Server started successfully.');
});
