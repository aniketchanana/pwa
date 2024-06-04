const dbPromise = idb.open('posts-db', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {
      keyPath: 'id',
    });
  }
  if (!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', {
      keyPath: 'id',
    });
  }
});

function writeData(st, data) {
  return dbPromise.then((db) => {
    const tx = db.transaction(st, 'readwrite');
    const store = tx.objectStore(st);
    store.put(data);
    return tx.complete;
  });
}

function readAllData(st) {
  return dbPromise.then((db) => {
    const tx = db.transaction(st, 'readonly');
    const store = tx.objectStore(st);
    return store.getAll();
  });
}

function clearStorage(st) {
  return dbPromise.then(function (db) {
    const tx = db.transaction(st, 'readwrite');
    const store = tx.objectStore(st);
    store.clear();
    return tx.complete;
  });
}

function deleteItemFromData(st, id) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite');
      const store = tx.objectStore(st);
      store.delete(id);
      return tx.complete;
    })
    .then(() => {
      console.log(`Item deleted::${id}`);
    })
    .catch(() => {
      console.log(`Error while delete item::${id}`);
    });
}

function base64UrlToUint8Array(base64Url) {
  // Decode base64 URL to regular base64
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/\-/g, '+').replace(/_/g, '/');

  // Decode base64 to binary string
  const binaryString = atob(base64);

  // Create a Uint8Array from the binary string
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }

  return byteArray;
}
