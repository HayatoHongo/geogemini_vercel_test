// api/myapi.js

export default async function handler(req, res) {
    // APIキーが正しく読み込まれているかを確認
    console.log("GOOGLE_MAPS_API_KEY:", process.env.GOOGLE_MAPS_API_KEY);

    // APIキーをクライアントに返す
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
}
