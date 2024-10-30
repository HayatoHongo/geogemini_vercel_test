let map;
let geocoder;
let userPin = null;
let answerPin = null;
let userLocation = null;
let currentQuizNumber = null;
let totalDistance = 0;
let searchMarker = null;
let distanceCalculated = false;

async function loadGoogleMapsAPI() {
    try {
        const response = await fetch('/api/myapi');
        const data = await response.json();
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry&callback=onMapsApiLoaded`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } catch (error) {
        console.error('Failed to load Google Maps API:', error);
        alert('Google Maps APIの読み込みに失敗しました。');
    }
}

function onMapsApiLoaded() {
    initMap();
    setEventListeners();
}

function initMap() {
    const mapContainer = document.getElementById('map-container');
    map = new google.maps.Map(mapContainer, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        mapTypeId: 'satellite'
    });
    geocoder = new google.maps.Geocoder();
}

function setEventListeners() {
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

    document.getElementById('search-button').addEventListener('click', searchLocation);
    document.getElementById('reset-button').addEventListener('click', resetGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);
    document.getElementById('ok-button').addEventListener('click', confirmQuizNumber);
    document.getElementById('confirm-pin-button').addEventListener('click', () => {
        confirmPin();
        zoomOutEffect();
    });

    const locationInput = document.getElementById('location-input');
    locationInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') searchLocation();
    });

    document.getElementById('quiz-input').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') confirmQuizNumber();
    });

    toggleButtons('init');
}

async function searchLocation() {
    const address = document.getElementById('location-input').value;
    console.log("Searching location for address:", address); // 入力された住所をログ出力

    try {
        const response = await fetch(`/api/myapi?address=${address}`);
        
        console.log("API response status:", response.status); // ステータスコードをログ出力
        console.log("API response ok:", response.ok); // レスポンスが正常かどうか

        const result = await response.json();
        console.log("API response JSON:", result); // APIから返されたデータ全体を確認

        if (result.location) {
            console.log("Location found:", result.location); // 緯度・経度情報をログ出力
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
            console.warn("Location search failed:", result.error || "Location not found"); // エラー情報がない場合のデフォルトメッセージ
            alert(`Location search failed: ${result.error || "Location not found."}`);
        }
    } catch (error) {
        console.error("An error occurred while searching for location:", error); // エラー内容を詳細にログ出力
        alert('An error occurred while searching for location.');
    }
}


// 他の関数 (restartGame, confirmQuizNumber, confirmPin, showDistancePopup, calculateDistance, toggleButtons, clearPins, zoomOutEffect) は元のコードをそのまま使用します

function resetGame() {
    document.getElementById('quiz-input').value = '';
    currentQuizNumber = null;
    toggleButtons('reset');
    clearPins();
    distanceCalculated = false; // リセット時にフラグをリセット
  
    // 検索マーカーが存在する場合は削除
    if (searchMarker) {
      searchMarker.setMap(null);
      searchMarker = null; // マーカー変数をリセット
    }
  
    // ポップアップを消す
    const popup = document.getElementById('distance-popup');
    popup.style.display = 'none';
}
  

function restartGame() {
  resetGame();
  totalDistance = 0;
  document.getElementById('total-distance').textContent = `Total ${totalDistance.toFixed(2)} km`;
}

function confirmQuizNumber() {
  currentQuizNumber = document.getElementById('quiz-input').value;
  if (quizLocations[currentQuizNumber]) {
    toggleButtons('confirmQuiz');
    distanceCalculated = false; // 新しいクイズ番号が確定したときにフラグをリセット
  } else {
    alert('Invalid quiz number. Please enter a valid number.');
  }
}

function confirmPin() {
  if (userLocation && quizLocations[currentQuizNumber] && !distanceCalculated) {
    const answerLocation = quizLocations[currentQuizNumber];
    const distance = calculateDistance(userLocation.lat, userLocation.lng, answerLocation.lat, answerLocation.lng);

    totalDistance += distance;
    document.getElementById('total-distance').textContent = `Total ${totalDistance.toFixed(2)} km`;

    if (answerPin) {
      answerPin.setMap(null);
    }
    answerPin = new google.maps.Marker({
      position: { lat: answerLocation.lat, lng: answerLocation.lng },
      map: map,
      icon: {
        url: 'https://maps.google.com/mapfiles/kml/paddle/red-stars.png',
        scaledSize: new google.maps.Size(32, 32)
      }
    });

    // 距離をポップアップに表示
    showDistancePopup(`${distance.toFixed(2)} km`);
    distanceCalculated = true; // 距離が計算されたことを記録する
  }
}

function showDistancePopup(distanceText) {
  const popup = document.getElementById('distance-popup');
  const popupText = document.getElementById('popup-text');
  popupText.textContent = distanceText;
  popup.style.display = 'block';

  // 5秒後にポップアップを消す
  setTimeout(() => {
    popup.style.display = 'none';
  }, 5000);
}

function calculateDistance(userLat, userLng, answerLat, answerLng) {
    if (google && google.maps && google.maps.geometry && google.maps.geometry.spherical) {
        const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(userLat, userLng),
            new google.maps.LatLng(answerLat, answerLng)
        );
        return distanceInMeters / 1000; // 距離をキロメートルで返す
    } else {
        console.error("Geometry ライブラリが利用できません。");
        alert("距離の計算に失敗しました。Geometry ライブラリが読み込まれていません。");
        return 0; // エラーを回避するためのデフォルト値
    }
}

function toggleButtons(action) {
  const okButton = document.getElementById('ok-button');
  const resetButton = document.getElementById('reset-button');
  const confirmPinButton = document.getElementById('confirm-pin-button');

  if (action === 'init') {
    okButton.classList.add('active');
    okButton.classList.remove('inactive');
    okButton.disabled = false;

    resetButton.classList.add('inactive');
    resetButton.classList.remove('active');
    resetButton.disabled = true;

    confirmPinButton.classList.add('inactive');
    confirmPinButton.classList.remove('active');
    confirmPinButton.disabled = true;
  } else if (action === 'reset' || action === 'restart') {
    okButton.classList.add('active');
    okButton.classList.remove('inactive');
    okButton.disabled = false;

    resetButton.classList.add('inactive');
    resetButton.classList.remove('active');
    resetButton.disabled = true;

    confirmPinButton.classList.add('inactive');
    confirmPinButton.classList.remove('active');
    confirmPinButton.disabled = true;
  } else if (action === 'confirmQuiz') {
    okButton.classList.add('inactive');
    okButton.classList.remove('active');
    okButton.disabled = true;

    resetButton.classList.add('active');
    resetButton.classList.remove('inactive');
    resetButton.disabled = false;

    confirmPinButton.classList.add('active');
    confirmPinButton.classList.remove('inactive');
    confirmPinButton.disabled = false;
  }
}

function clearPins() {
  if (userPin) {
    userPin.setMap(null);
    userPin = null;
  }
  if (answerPin) {
    answerPin.setMap(null);
    answerPin = null;
  }
}

function zoomOutEffect() {
    let zoomLevel = map.getZoom();
    const zoomOutInterval = setInterval(() => {
        if (zoomLevel > 2) {
            zoomLevel--;
            map.setZoom(zoomLevel);
        } else {
            clearInterval(zoomOutInterval);
            map.setCenter({ lat: 0, lng: 0 });
        }
    }, 200); // 200ミリ秒ごとにズームアウト
}

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

// Google Maps APIを読み込む
window.onload = loadGoogleMapsAPI;