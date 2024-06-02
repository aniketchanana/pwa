var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
);
const titleInput = document.getElementById('title');
const locationInput = document.getElementById('location');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
  // code to un-registering a service worker
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations().then((registrations) => {
  //     for (let i = 0; i < registrations.length; i++) {
  //       registrations[i].unregister();
  //     }
  //   });
  // }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
// no use for now
function onSaveButtonClick() {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested').then(function (cache) {
      cache.add('https://httpbin.org/get');
      cache.add('/src/images/sf-boat.jpg');
    });
  }
}
function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url('${data.image}')`;
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  // const cardSaveButton = document.createElement('button');
  // cardSaveButton.addEventListener('click', onSaveButtonClick);
  // cardSaveButton.textContent = 'Save';
  // cardSupportingText.appendChild(cardSaveButton);
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}
function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}
const httpGetBin =
  'https://pwagram-2d239-default-rtdb.firebaseio.com/posts.json';

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

let networkDataRec = false;
fetch(httpGetBin)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataRec = true;
    console.log('from web data', data);
    const dataArr = [];
    for (const key in data) {
      dataArr.push(data[key]);
    }
    updateUI(dataArr);
  });

if ('indexedDB' in window) {
  readAllData('posts').then((data) => {
    if (!networkDataRec) {
      console.log('From indexedDB', data);
      updateUI(data);
    }
  });
}
function sendData() {
  fetch(httpGetBin, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image:
        'https://fastly.picsum.photos/id/952/200/300.jpg?hmac=TxmAKrqJEDerU9Oz17usv5fHJ4ibYOWOvLK4Q3Z0ytc',
    }),
  }).then((res) => {
    console.log('Send data', res);
    updateUI();
  });
}
form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data');
    return;
  }
  closeCreatePostModal();
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((sw) => {
      var post = {
        id: new Date().toISOString(),
        location: locationInput.value,
        title: titleInput.value,
      };
      writeData('sync-posts', post)
        .then(() => {
          return sw.sync.register('sync-new-posts');
        })
        .then(() => {
          const snackBarContainer = document.querySelector(
            '#confirmation-toast'
          );
          const data = { message: 'Your post is saved for sync' };
          snackBarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch(console.error);
    });
  } else {
    sendData();
  }
});
