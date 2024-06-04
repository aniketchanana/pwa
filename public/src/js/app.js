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
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        {
          action: 'confirm',
          title: 'Okay',
          icon: '/src/images/icons/app-icon-96x96.png',
        },
        {
          action: 'cancel',
          title: 'Cancel',
          icon: '/src/images/icons/app-icon-96x96.png',
        },
      ],
    };
    console.log(options);
    navigator.serviceWorker.ready.then(async function (reg) {
      await reg.showNotification('Successfully subscribed', options);
    });
  }
}
function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  var reg;
  navigator.serviceWorker.ready
    .then((swReg) => {
      reg = swReg;
      return swReg.pushManager.getSubscription();
    })
    .then((sub) => {
      console.log({ sub, reg });
      if (!sub) {
        const vapidPublicKey =
          'BKs5V_LcV6fY7kn3-pDMgjkqjo6gZhDS2jYr44OW5kNLD6DMAEvLVuqaR7uTc0tlPtd_XJScw-WKx5DsbaKcc7c';
        const key = base64UrlToUint8Array(vapidPublicKey);
        // create new sub
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
      } else {
        // use existing sub
      }
    })
    .then((newSub) => {
      console.log(newSub);
      return fetch('http://localhost:3000/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(newSub),
      });
    })
    .then((res) => {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch((err) => {
      console.error(err);
    });
}
function askForNotification() {
  Notification.requestPermission(function (result) {
    console.log('user choice', result);
    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      // displayConfirmNotification();
      configurePushSub();
    }
  });
}
if ('Notification' in window) {
  for (let i = 0; i < enableNotification.length; i++) {
    enableNotification[i].style.display = 'block';
    enableNotification[i].addEventListener('click', askForNotification);
  }
}
