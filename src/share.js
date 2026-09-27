export function encodeTrip(trip) {
  const jsonStr = JSON.stringify(trip);
  // UTF-8 uyumlu base64 çevirisi
  const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
  // URL güvenli formata dönüştür (+ -> -, / -> _, sondaki = karakterlerini sil)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeTrip(str) {
  try {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) {
      b64 += '=';
    }
    const jsonStr = decodeURIComponent(escape(atob(b64)));
    const trip = JSON.parse(jsonStr);
    
    if (!trip || !trip.from || !trip.to || !trip.start || !trip.end) {
      return null;
    }
    return trip;
  } catch (e) {
    return null;
  }
}
