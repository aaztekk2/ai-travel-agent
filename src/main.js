import './style.css';
import { getCoordinates, getWeather, summarizeWeather } from './weather.js';
import { getTripPlan } from './ai.js';
import { encodeTrip, decodeTrip } from './share.js';

function showScreen(name) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
    screen.removeAttribute('data-anim');
  });
  
  const targetScreen = document.getElementById(`screen-${name}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
    targetScreen.setAttribute('data-anim', 'in');
    window.scrollTo(0, 0); // Mobilde ekranın en üstüne kaydırmak için iyi bir pratik
  }
}

function renderResults(trip, coords, weather, plan) {
  document.getElementById('res-from').textContent = trip.from;
  document.getElementById('res-to').textContent = `${coords.name}, ${coords.country}`;
  
  const formatOpt = { day: 'numeric', month: 'short', year: 'numeric' };
  const dStart = new Date(trip.start + "T00:00:00").toLocaleDateString('en-GB', formatOpt);
  const dEnd = new Date(trip.end + "T00:00:00").toLocaleDateString('en-GB', formatOpt);
  document.getElementById('res-dates').textContent = `${dStart} – ${dEnd}`;
  
  document.getElementById('res-travelers').textContent = trip.travelers === 1 ? "1 traveller" : `${trip.travelers} travellers`;
  
  document.getElementById('res-weather').textContent = plan.weather;
  const noteEl = document.getElementById('res-weather-note');
  if (weather.type === "forecast") {
    noteEl.textContent = "Live forecast for your dates.";
  } else {
    noteEl.textContent = "Typical weather for the season, not a live forecast.";
  }
  
  document.getElementById('res-flight').textContent = plan.flight;
  document.getElementById('res-hotel').textContent = plan.hotel;
  
  const activitiesList = document.getElementById('res-activities');
  activitiesList.innerHTML = '';
  plan.activities.forEach(act => {
    const li = document.createElement('li');
    li.textContent = act;
    activitiesList.appendChild(li);
  });
  
  const flightQuery = encodeURIComponent(`Flights from ${trip.from} to ${coords.name} on ${trip.start} returning ${trip.end}`);
  document.getElementById('link-flight').href = `https://www.google.com/travel/flights?q=${flightQuery}`;
  
  const hotelQuery = encodeURIComponent(`Hotels in ${coords.name} from ${trip.start} to ${trip.end}`);
  document.getElementById('link-hotel').href = `https://www.google.com/travel/hotels?q=${hotelQuery}`;
}

// --- Travellers Stepper Mantığı ---
let travelers = 1;
const travelersCountEl = document.getElementById('travelers-count');
const decTravelersBtn = document.getElementById('dec-travelers');
const incTravelersBtn = document.getElementById('inc-travelers');

function renderTravelers() {
  travelersCountEl.textContent = travelers;
  decTravelersBtn.disabled = travelers <= 1;
  incTravelersBtn.disabled = travelers >= 12;
}

decTravelersBtn.addEventListener('click', () => {
  if (travelers > 1) {
    travelers--;
    renderTravelers();
  }
});

incTravelersBtn.addEventListener('click', () => {
  if (travelers < 12) {
    travelers++;
    renderTravelers();
  }
});

// Sayfa açılışında başlangıç durumu (disabled etc.) ayarlansın diye
renderTravelers();

// --- Swap (Yer Değiştirme) Mantığı ---
document.getElementById('swap-btn').addEventListener('click', () => {
  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');
  const temp = fromInput.value;
  fromInput.value = toInput.value;
  toInput.value = temp;
});

document.getElementById('btn-begin').addEventListener('click', () => {
  showScreen('form');
});

document.getElementById('btn-edit').addEventListener('click', () => {
  showScreen('form');
});

document.getElementById('trip-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const errorEl = document.getElementById('form-error');
  errorEl.textContent = ''; 
  
  const from = document.getElementById('from').value.trim();
  const to = document.getElementById('to').value.trim();
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  const budgetRaw = document.getElementById('budget').value.trim();
  const budget = Number(budgetRaw);
  
  if (!from || !to) {
    errorEl.textContent = "Please add both a starting point and a destination.";
    return;
  }
  
  if (!start || !end) {
    errorEl.textContent = "Please select your departure and return dates.";
    return;
  }
  
  const today = new Date().toISOString().slice(0, 10);
  if (start < today) {
    errorEl.textContent = "Departure date cannot be in the past.";
    return;
  }
  
  if (end <= start) {
    errorEl.textContent = "Return date needs to be after the departure date.";
    return;
  }
  
  if (!budgetRaw || isNaN(budget) || budget < 0) {
    errorEl.textContent = "Please add a budget of 0 or more.";
    return;
  }
  
  const trip = { from, to, start, end, budget, travelers };
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Planning your trip...";
  
  showScreen('loading');
  document.getElementById('loading-city').textContent = `Checking the weather in ${trip.to}...`;
  
  try {
    const coords = await getCoordinates(trip.to);
    const weather = await getWeather(coords.lat, coords.lon, trip.start);
    const summary = summarizeWeather(weather, trip.start, trip.end);
    
    console.log("Trip Details:", trip);
    console.log("Found Coordinates:", coords);
    console.log("Weather Summary:", summary);
    
    document.getElementById('loading-city').textContent = "Putting your plan together...";
    const plan = await getTripPlan(trip, coords, summary);
    console.log("Trip Plan:", plan);
    
    renderResults(trip, coords, weather, plan);
    history.replaceState(null, '', location.pathname + location.search + '#trip=' + encodeTrip(trip));
    showScreen('results');
  } catch (err) {
    console.error(err);
    showScreen('form');
    if (err.message === "City not found") {
      errorEl.textContent = "We couldn't find that destination. Check the spelling.";
    } else if (err.message.startsWith("Weather API error") || err.message.startsWith("Geocoding API error")) {
      errorEl.textContent = "Couldn't reach the weather service. Try again.";
    } else {
      errorEl.textContent = "Couldn't generate your trip plan. Try again.";
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Plan my trip";
  }
});

// --- Share Button Mantığı ---
document.getElementById('btn-share').addEventListener('click', async () => {
  const url = window.location.href;
  
  try {
    await navigator.clipboard.writeText(url);
    const toast = document.getElementById('toast');
    toast.textContent = "Link copied";
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  } catch (err) {
    console.error("Failed to copy link");
  }
});

// --- URL'den Yükleme (Page Load) Mantığı ---
function loadTripFromHash() {
  if (location.hash.startsWith('#trip=')) {
    const hashData = location.hash.substring(6);
    const trip = decodeTrip(hashData);
    if (trip) {
      document.getElementById('from').value = trip.from || '';
      document.getElementById('to').value = trip.to || '';
      document.getElementById('start').value = trip.start || '';
      document.getElementById('end').value = trip.end || '';
      document.getElementById('budget').value = trip.budget ?? '';
      if (trip.travelers) {
        travelers = Math.min(Math.max(trip.travelers, 1), 12);
        renderTravelers();
      }
      
      showScreen('form');
      const form = document.getElementById('trip-form');
      form.requestSubmit();
    }
  }
}

loadTripFromHash();
window.addEventListener('hashchange', loadTripFromHash);
