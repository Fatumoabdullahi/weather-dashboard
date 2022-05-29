const weatherCardsContainer = $("#weather-cards-container");

// Open weather API
const API_KEY = "60687e3c50614663696f05b189c2493e";

// Get current data from API
const getCurrentData = function (name, forecastData) {
  return {
    name: name,
    temperature: forecastData.current.temp,
    wind: forecastData.current.wind_speed,
    humidity: forecastData.current.humidity,
    uvi: forecastData.current.uvi,
    date: getFormattedDate(forecastData.current.dt, "ddd DD/MM/YYYY HH:mm"),
    iconCode: forecastData.current.weather[0].icon,
  };
};

const getFormattedDate = function (unixTimestamp, format = "DD/MM/YYYY") {
  return moment.unix(unixTimestamp).format(format);
};
