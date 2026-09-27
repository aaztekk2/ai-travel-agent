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

export async function getWeather(lat, lon, startDate) {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    // Bugün ile startDate arasındaki gün farkını hesaplıyoruz
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate + "T00:00:00");
    start.setHours(0, 0, 0, 0);
    
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Fark 5 günden azsa 5 günlük tahmin (forecast), fazlaysa anlık hava durumu (weather)
    const type = diffDays < 5 ? "forecast" : "current";
    const endpoint = diffDays < 5 ? "forecast" : "weather";
    
    const url = `https://api.openweathermap.org/data/2.5/${endpoint}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return { type, data };
}
