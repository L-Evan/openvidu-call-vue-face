export class StorageService {
  constructor () {
    this.storage = window.localStorage
  }

  set (key, item) {
    const value = JSON.stringify({ item: item })
    // this.log.d('Storing on localStorage "' + key + '" with value "' + value + '"');
    this.storage.setItem(key, value)
  }
  get (key) {
    const value = JSON.parse(this.storage.getItem(key))
    return value?.item ? value.item : null
  }
  clear () {
    console.log("Clearing localStorage")
    this.storage.clear()
  }
}
