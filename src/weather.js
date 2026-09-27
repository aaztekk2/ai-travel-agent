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

export function summarizeWeather(weatherObj, startDate, endDate) {
    const { type, data } = weatherObj;
    
    if (type === "current") {
        const temp = Math.round(data.main.temp);
        const desc = data.weather[0].description;
        return `Current weather today (trip is too far ahead for a forecast): ${temp}°C, ${desc}.`;
    }
    
    if (type === "forecast") {
        let filtered = data.list.filter(item => {
            const dateStr = item.dt_txt.slice(0, 10);
            return dateStr >= startDate && dateStr <= endDate;
        });
        
        if (filtered.length === 0) {
            filtered = data.list;
        }
        
        let minTemp = Infinity;
        let maxTemp = -Infinity;
        const descCounts = {};
        
        for (const item of filtered) {
            const temp = item.main.temp;
            if (temp < minTemp) minTemp = temp;
            if (temp > maxTemp) maxTemp = temp;
            
            const desc = item.weather[0].description;
            descCounts[desc] = (descCounts[desc] || 0) + 1;
        }
        
        let mostFrequentDesc = "";
        let maxCount = 0;
        for (const desc in descCounts) {
            if (descCounts[desc] > maxCount) {
                maxCount = descCounts[desc];
                mostFrequentDesc = desc;
            }
        }
        
        minTemp = Math.round(minTemp);
        maxTemp = Math.round(maxTemp);
        
        return `Forecast for the trip dates: ${minTemp}°C to ${maxTemp}°C, mostly ${mostFrequentDesc}.`;
    }
    
    return "Weather summary unavailable.";
}
