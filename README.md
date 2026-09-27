# AI Travel Agent

An interactive web application that dynamically generates itineraries, weather summaries, and postcard artwork for your next trip.



## Features

- **Trip Planning Form:** A UI for inputting origin, destination, travel dates, budget, and number of travelers.
- **Live Weather Integration:** Uses OpenWeather to provide a real 5-day forecast if the trip is imminent, or a general seasonal expectation if the trip is planned further ahead.
- **AI-Powered Itinerary:** Uses OpenAI to suggest flights, accommodations, and activities based on the weather and budget.
- **AI-Generated Postcard:** Generates a painterly postcard illustration of your destination.
- **Shareable Trip Links:** Encodes your trip details into the URL so you can copy and share them.

## Tech Stack

- Vite
- Vanilla JavaScript
- OpenAI API
- OpenWeather API

## How It Works

1. **Geocoding:** Converts both origin and destination city inputs into exact geographical coordinates and official names.
2. **Weather Retrieval:** Fetches a forecast if the trip starts within 5 days, otherwise the current weather, which the AI turns into a seasonal expectation.
3. **Weather Summary:** Compiles a concise text summary of the expected weather conditions to feed into the AI.
4. **AI Generation (Parallel):** Concurrently requests the written itinerary and the visual postcard artwork to minimize loading times.
5. **Results Rendering:** Displays the aggregated data, Google Flights/Hotels links, and artwork on a digital ticket screen.
6. **URL Sharing:** Stores the trip details as Base64 in the URL fragment (#trip=...). Opening the link fills in the form and generates a fresh plan for the same trip.

## Getting Started

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone <repository-url>
   cd ai-travel-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and add your API keys:
   ```env
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Security Note

> **Important:** This is a demo project. API calls are made directly from the browser for simplicity, which exposes the API keys to anyone using the app. In a real production environment, the keys should be kept securely behind a backend server or serverless function.

## Possible Improvements

- **Backend Proxy:** Set up a backend proxy or serverless functions to secure the API keys.
- **Image Caching:** Cache generated postcard images to reduce API costs and improve loading times for frequently searched destinations.
- **City Disambiguation:** Let the user choose between multiple matching cities during the geocoding phase to handle duplicate city names better.
- **Response Streaming:** Implement streaming for the OpenAI response so the user can read the plan as it generates progressively.
