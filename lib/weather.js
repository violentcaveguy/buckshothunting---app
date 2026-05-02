export const getGibsonWeather = async () => {
  const latitude = 33.2335
  const longitude = -82.5957

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
    `&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=America%2FNew_York` +
    `&temperature_unit=fahrenheit` +
    `&wind_speed_unit=mph` +
    `&precipitation_unit=inch`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to load weather')
  }

  return response.json()
}
