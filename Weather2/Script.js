// selection of various elements from the HTML using document.querySelector and storing them in variables for further use. These elements include input fields, buttons, and divs used to display weather information.

const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

// The code defines a constant API_KEY which holds the API key required to access the OpenWeatherMap API.

const API_KEY = "674cbd219df91fdcd19914c2c3fa7572";

// there is a function createWeatherCard that takes the city name, weather item, and index as parameters and returns HTML code for a weather card. The function conditionally generates different HTML structures based on the index to create the main weather card or the additional weather cards for the forecast

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) { 
    return `
      <div class="details">
        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
        <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
      </div>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
        <h4>${weatherItem.weather[0].description}</h4>
      </div>`;
  } else {
    return `
      <li class="card">
        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" alt="weather-icon">
        <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
      </li>`;
  }
};

// The getWeatherDetails function takes the city name, latitude, and longitude as parameters. It constructs the URL for the OpenWeatherMap API using the provided API key and the coordinates. It then makes a fetch request to retrieve the weather forecast data for the specified location. The received data is filtered to extract one forecast per day. After clearing the previous weather data on the webpage, it dynamically creates weather cards using the createWeatherCard function and appends them to the DOM.

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // Filter the forecast to get only one forecast per day
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      // Clearing previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      // Creating weather cards and adding them to the DOM
      fiveDaysForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, index);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
        }
      });
    })
    .catch(() => {
      alert("Chyke says an error has occurred while fetching the weather forecast!");
    });
};

// The getCityCoordinates function is called when the search button is clicked. It retrieves the city name from the input field and constructs the URL for the OpenWeatherMap Geocoding API. It makes a fetch request to obtain the coordinates (latitude and longitude) for the specified city. If coordinates are found, it calls getWeatherDetails with the city name and coordinates to fetch and display the weather forecast. Otherwise, it displays an alert indicating that no coordinates were found for the specified city.

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;


    
  fetch(GEOCODING_API_URL)
  .then((res) => res.json())
  .then((data) => {
    if (data.length === 0) {
      alert(`Chyke says no coordinates found for ${cityName}`);
    } else {
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    }
  })
  .catch(() => {
    alert("Chyke says an error has occurred while fetching the coordinates!");
  });

}

// The getUserCoordinates function is called when the location button is clicked. It uses the browser's Geolocation API to obtain the user's coordinates. It then constructs the URL for the OpenWeatherMap Reverse Geocoding API using the obtained coordinates. It makes a fetch request to retrieve the city name based on the coordinates. If a city name is obtained, it calls getWeatherDetails with the city name and coordinates to fetch and display the weather forecast. Otherwise, it displays an error alert.

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords; //Get 
      
      //coordinates of user location
     
      const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=&appid=${API_KEY}`;

      // Get city name from coordinates using reverse geocoding API

      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("Chyke says an error has occurred while fetching the city!");
        });

    },
    error => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please reset location permission to grant access again.");
      }
    }
  );
};

// Event listeners are set up for the location button, search button, and input field. When the location button is clicked, it triggers the getUserCoordinates function. When the search button is clicked, it triggers the getCityCoordinates function. When the Enter key is pressed in the input field, it also triggers the getCityCoordinates function.

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("Keyup", e => e.key === 'Enter' && getCityCoordinates())