let map;
let geocoder;
let userPin = null;
let answerPin = null;
let userLocation = null;
let currentQuizNumber = null;
let totalDistance = 0;
let searchMarker = null;
let distanceCalculated = false;

function initMap() {
    const mapContainer = document.getElementById('map-container');
    map = new google.maps.Map(mapContainer, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        mapTypeId: 'satellite'
    });

    geocoder = new google.maps.Geocoder();

    google.maps.event.addListener(map, 'click', (event) => {
        const latitude = event.latLng.lat();
        const longitude = event.latLng.lng();

        if (userPin) userPin.setMap(null);

        userPin = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map
        });

        userLocation = { lat: latitude, lng: longitude };
    });

    document.getElementById('reset-button').addEventListener('click', resetGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);
    document.getElementById('ok-button').addEventListener('click', confirmQuizNumber);
    document.getElementById('confirm-pin-button').addEventListener('click', () => {
        confirmPin();
        zoomOutEffect();
    });
    document.getElementById('search-button').addEventListener('click', searchLocation);

    toggleButtons('init');
    const locationInput = document.getElementById('location-input');
    locationInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') searchLocation();
    });

    document.getElementById('quiz-input').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') confirmQuizNumber();
    });
}

async function searchLocation() {
    const address = document.getElementById('location-input').value;
    try {
        const response = await fetch(`/api/myapi?address=${address}`);
        const result = await response.json();

        if (result.location) {
            map.setCenter(result.location);

            if (searchMarker) searchMarker.setMap(null);

            const customIcon = {
                url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            };

            searchMarker = new google.maps.Marker({
                map: map,
                position: result.location,
                icon: customIcon
            });
        } else {
            alert(`Location search failed: ${result.error}`);
        }
    } catch (error) {
        alert('An error occurred while searching for location.');
    }
}

function resetGame() {
    document.getElementById('quiz-input').value = '';
    currentQuizNumber = null;
    document.getElementById('current-distance').textContent = '';
    toggleButtons('reset');
    clearPins();
    distanceCalculated = false;

    if (searchMarker) {
        searchMarker.setMap(null);
        searchMarker = null;
    }

    const popup = document.getElementById('distance-popup');
    popup.style.display = 'none';
}

// 他の関数 (restartGame, confirmQuizNumber, confirmPin, showDistancePopup, calculateDistance, toggleButtons, clearPins, zoomOutEffect) は元のコードをそのまま使用します

const quizLocations = {
    1: { lat: 37.7749, lng: -122.419 },
    2: { lat: 34.0522, lng: -118.244 },
    3: { lat: 40.7128, lng: -74.006 },
    4: { lat: -1.2923, lng: 36.82 },
    5: { lat: 14.527, lng: -90.49 },
    6: { lat: -0.5949, lng: 36.46 },
    7: { lat: 27.56, lng: -113.6 },
    8: { lat: -6.05, lng: 144.6 },
    9: { lat: 59.423748, lng: 24.803393 },
    10: { lat: 46.72221228, lng: 7.798881482 },
    11: { lat: 62.02, lng: 129.72 },
    12: { lat: 19.48678041, lng: -155.8999293 },
    13: { lat: -34.57888022939259, lng:-58.47870559329025 },
    14: { lat: 24.89, lng: 67.02 },
    15: { lat: 37.96977189, lng: 23.74900638 },
    16: { lat: -42.86, lng: 147.33 },
    17: { lat: 61.62837686, lng: -149.0516733 },
    18: { lat: 6.522, lng: 3.33 }
};

window.onload = initMap;
