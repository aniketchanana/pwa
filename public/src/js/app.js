var deferredPrompt;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    // .register('/sw.js', {scope: ''}) by using scope property in the register we can tell sw which folder to target
    .register('/sw.js')
    .then(() => console.log('Service worker registered'));
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  return false;
});
