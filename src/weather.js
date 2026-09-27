export async function getCoordinates(city) {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
        throw new Error("City not found");
    }

    const { lat, lon, name, country } = data[0];
    return { lat, lon, name, country };
}
