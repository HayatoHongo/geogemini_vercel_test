import fetch from 'node-fetch';

export default async function handler(req, res) {
    // クエリから住所を取得
    const address = req.query.address;

    // address が指定されていない場合は、APIキーのみ返す
    if (!address) {
        return res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
    }

    // Google Maps Geocoding API を使用して住所の緯度・経度を取得
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

        const response = await fetch(geocodeUrl);
        const data = await response.json();

        // Geocoding APIからのレスポンスがOKかつ結果が存在するか確認
        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            res.json({ location }); // 緯度・経度情報を返す
        } else {
            res.json({ error: "Location not found" });
        }
    } catch (error) {
        console.error("Error fetching location data:", error);
        res.status(500).json({ error: "Failed to fetch location data" });
    }
}
