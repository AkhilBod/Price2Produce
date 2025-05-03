// Object to keep track of displayed places to avoid duplicates
let displayedPlaces = {};

// Object to store selected places
let selectedPlaces = [];
const places = ['Target', 'ALDI','Fresh Thyme Market', 'Costco Wholesale', 'Giant Eagle Supermarket', "Whole Foods Market"];

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Radius of the Earth in miles
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function callback(results, status, userLat, userLng) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        results.forEach(place => {
            let distance = calculateDistance(userLat, userLng, place.geometry.location.lat(), place.geometry.location.lng());
            // Use place ID to ensure uniqueness
            const placeId = place.place_id;
            if (places.includes(place.name) && !displayedPlaces[placeId] && distance < 6) {
                const geocoder = new google.maps.Geocoder();
                const location = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                geocoder.geocode({ 'location': location }, (geocodeResults, geocodeStatus) => {
                    if (geocodeStatus === google.maps.GeocoderStatus.OK) {
                        if (geocodeResults[0]) {
                            const address = geocodeResults[0].formatted_address;
                            displayPlace(place, distance, address, placeId);
                        } else {
                            displayPlace(place, distance, 'Address not available', placeId);
                        }
                    } else {
                        displayPlace(place, distance, 'Address not available', placeId);
                    }
                });
            }
        });
    }
}

function displayPlace(place, distance, address, placeId) {
    // Check if place is already displayed
    if (displayedPlaces[placeId]) return;

    const list = document.getElementById("places-list");
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = JSON.stringify({ name: place.name, address: address });
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            selectedPlaces.push({ name: place.name, address: address });
        } else {
            selectedPlaces = selectedPlaces.filter(p => p.name !== place.name);
        }
        updateShopList();
    });
    listItem.appendChild(checkbox);

    const img = new Image();
    img.classList.add('store-logo');
    img.src = `static/images/${place.name}.png`;
    img.alt = `${place.name} Logo`;
    listItem.appendChild(img);

    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('details-container');

    const storeName = document.createElement('span');
    storeName.classList.add('store-name');
    storeName.textContent = place.name;
    detailsContainer.appendChild(storeName);

    const storeAddress = document.createElement('span');
    storeAddress.classList.add('store-address');
    storeAddress.textContent = address;
    detailsContainer.appendChild(storeAddress);

    const storeDistance = document.createElement('span');
    storeDistance.classList.add('store-distance');
    storeDistance.textContent = `${distance.toFixed(2)} miles`;
    detailsContainer.appendChild(storeDistance);

    listItem.appendChild(detailsContainer);

    list.appendChild(listItem);
    displayedPlaces[placeId] = true; // Mark this place as displayed
}

function searchPlaces(query, lat, lng) {
    const request = {
        query: query,
        location: new google.maps.LatLng(lat, lng),
        radius: '16093.4', // 10 miles
    };

    const service = new google.maps.places.PlacesService(document.createElement('div'));

    service.textSearch(request, (results, status) => {
        callback(results, status, lat, lng);
    });
}

function getLocation() {
    const x = document.getElementById("demo");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    const x = document.getElementById("demo");
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    x.innerHTML = `Latitude: ${lat.toFixed(6)}<br>Longitude: ${lng.toFixed(6)}`;
    places.forEach(place => {
        searchPlaces(place, lat, lng);
    });
}

function showError(error) {
    const x = document.getElementById("demo");
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred.";
            break;
    }
}

function updateShopList() {
    const shopListInput = document.getElementById('shop_list');
    shopListInput.value = JSON.stringify(selectedPlaces);
}

// Show the loading popup and redirect on form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('shop-form');
    const loadingPopup = document.getElementById('loading-popup');
    const timeSpan = document.getElementById('time');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Show the loading popup
        loadingPopup.style.display = 'flex';

        let timeElapsed = 15;
        const interval = setInterval(() => {
            timeElapsed -= 1;
            timeSpan.textContent = timeElapsed;
        }, 100000); // Update time every second

        // Redirect after a short delay
        setTimeout(() => {
            clearInterval(interval); // Stop updating time
            form.submit(); // Submit the form manually after showing the loading popup
        }, 10); // Adjust the delay as needed
    });

    // Get the user's location on page load
    getLocation();
});

