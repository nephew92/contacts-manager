class LocalStorageBase extends DefaultBase {

  load() { return localStorage.getItem(this.key) }

  save(value) {
    value = JSON.stringify(value)
    localStorage.setItem(this.key, value)
  }
}