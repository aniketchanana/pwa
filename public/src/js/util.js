const dbPromise = idb.open('posts-db', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {
      keyPath: 'id',
    });
  }
});

function writeData(st, data) {
  return dbPromise
    .then((db) => {
      const tx = db.transaction(st, 'readwrite');
      const store = tx.objectStore(st);
      store.put(data);
      return tx.complete;
    })
    .then(() => {
      console.log('Data written successfully');
    })
    .catch((error) => {
      console.error('Error writing data', error);
    });
}

function readAllData(st) {
  return dbPromise
    .then((db) => {
      const tx = db.transaction(st, 'readonly');
      const store = tx.objectStore(st);
      return store.getAll();
    })
    .then((allData) => {
      console.log(`Data read from ${st} ==>`, allData);
      return allData;
    })
    .catch((error) => {
      console.error('Error reading data', error);
    });
}

function clearStorage(st) {
  return dbPromise
    .then(function (db) {
      const tx = db.transaction(st, 'readwrite');
      const store = tx.objectStore(st);
      store.clear();
      return tx.complete;
    })
    .then(() => {
      console.log('Data cleared successfully');
    })
    .catch((error) => {
      console.error('Error clearing data', error);
    });
}
