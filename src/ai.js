import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function getTripPlan(trip, destination, weatherSummary) {
  const systemMessage = `You are a helpful travel assistant. You must output only a JSON object.

Rules:
- If the weather data says it is current weather because the trip is too far ahead, do not present it as the trip's weather. Instead, describe what the weather is typically like at the destination during those months, and make clear it is a general seasonal expectation, not a forecast.
- If the weather data is a forecast for the trip dates, use those exact temperatures and conditions and say it is a forecast.
- If the budget is clearly too low for the trip, say so honestly in the flight and hotel fields instead of pretending it works.

The JSON object must exactly match the following structure, with no additional keys:
{
  "weather": "A short, friendly sentence summarizing the weather info provided.",
  "flight": "A short suggestion about flight routes or airlines appropriate for this budget.",
  "hotel": "A short recommendation for accommodation type/tier within this budget.",
  "activities": [
    "A short sentence about activity 1",
    "A short sentence about activity 2",
    "A short sentence about activity 3",
    "A short sentence about activity 4",
    "A short sentence about activity 5",
    "A short sentence about activity 6"
  ]
}`;

  const userMessage = `Please create a trip plan based on the following details:
- Departure: ${trip.from}
- Destination: ${destination.name}, ${destination.country}
- Dates: ${trip.start} to ${trip.end}
- Travelers: ${trip.travelers}
- Total Budget: $${trip.budget}
- Weather Data: ${weatherSummary}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateDestinationImage(destination) {
  const prompt = `A warm, painterly postcard illustration of ${destination.name}, ${destination.country}, showing a recognizable landmark or street scene. No text, no letters, no words anywhere in the image.`;
  const response = await openai.images.generate({
    model: "gpt-image-1-mini",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    quality: "low"
  });

  const imgData = response.data[0];
  if (imgData.b64_json) {
    return "data:image/png;base64," + imgData.b64_json;
  }
  return imgData.url;
}
