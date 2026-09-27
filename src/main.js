import './style.css';
import { getCoordinates, getWeather } from './weather.js';

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
  
  try {
    const coords = await getCoordinates(trip.to);
    const weather = await getWeather(coords.lat, coords.lon, trip.start);
    console.log("Trip Details:", trip);
    console.log("Found Coordinates:", coords);
    console.log("Weather:", weather);
    showScreen('results');
  } catch (err) {
    console.error(err);
    if (err.message === "City not found") {
      errorEl.textContent = "We couldn't find that destination. Check the spelling.";
    } else {
      errorEl.textContent = "Couldn't reach the weather service. Try again.";
    }
  }
});
