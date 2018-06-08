const store = {}

class AlexaStore {

  static save (id, key, val) {
    console.log( 'save', id, key, val)
    if (! store[id]) {
      store[id] = {}
    }
    
    store[id][key] = val
  }

  static retrieve (id, key) {
    let val = store[id][key]
    console.log( 'get', id, key, val)
    return val
  }
}

module.exports = AlexaStore
