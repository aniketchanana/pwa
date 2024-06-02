var deferredPrompt;
const enableNotification = document.querySelectorAll('.enable-notifications');
if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});
function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    const options = {
      body: 'Congrats you are now part of elite club',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/icons/app-icon-96x96.png',
      dir: 'ltr',
      lang: 'en-US',
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
    };
    navigator.serviceWorker.ready.then(function (reg) {
      reg.showNotification('Hello from service worker', options);
    });
  }
}
function askForNotification() {
  Notification.requestPermission(function (result) {
    console.log('user choice', result);
    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      displayConfirmNotification();
    }
  });
}
if ('Notification' in window) {
  for (let i = 0; i < enableNotification.length; i++) {
    enableNotification[i].style.display = 'block';
    enableNotification[i].addEventListener('click', askForNotification);
  }
}
