import fetch from 'node-fetch';

export default async function handler(req, res) {
    try {
        // APIキーが設定されているか確認
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error("Google Maps API key is missing.");
            return res.status(500).json({ error: "Google Maps API key is not configured on the server." });
        }

        // クエリにaddressパラメータがあれば住所検索を実行
        const address = req.query.address;
        if (address) {
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

            const response = await fetch(geocodeUrl);
            const data = await response.json();

            // Google Maps Geocoding APIのステータスを確認
            if (data.status === 'OK' && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                return res.json({ location });
            } else {
                console.error("Geocoding failed:", data.status);
                return res.status(500).json({ error: "Failed to retrieve location data", details: data.status });
            }
        } else {
            // addressパラメータがない場合はAPIキーのみを返す
            res.json({ apiKey });
        }
    } catch (error) {
        console.error("Error in /api/myapi:", error);
        res.status(500).json({ error: "Server error occurred", details: error.message });
    }
}
