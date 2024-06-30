const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// middleware to get the Ip address of the client
app.use(requestIp.mw());

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name;
    const clientIp = req.ip;
    
    try {
        // Use a service to get the location of the requester based on the IP address
        const locationResponse = await axios.get(`https://ipinfo.io/${clientIp}/json?token=e6c539ae6f905d`);
        const location = locationResponse.data.city || 'Unknown';
        
        // Use a weather API to get the temperature for the city (for simplicity, we'll use New York as a placeholder)
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=d685db0dbf3b071871cfa750d989bd28`);
        const temperature = weatherResponse.data.main.temp;

        res.json({
            client_ip: clientIp,
            location: location,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
