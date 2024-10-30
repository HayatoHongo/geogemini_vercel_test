// api/myapi.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;  // Vercelの環境変数からAPIキーを取得
    const address = req.query.address;

    if (!address) {
        return res.status(400).json({ error: 'Address parameter is required' });
    }

    try {
        // Google Maps APIでジオコーディングを行う
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
        );
        const data = await response.json();

        if (data.status === 'OK') {
            res.status(200).json({ location: data.results[0].geometry.location });
        } else {
            res.status(500).json({ error: data.status });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch location data' });
    }
}
