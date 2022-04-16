class DefaultBase {
  constructor(key, DefaultValue) {
    this.key = key
    this.DefaultValue = DefaultValue
  }

  get defaultValue() { return new this.DefaultValue() }

  load() { throw 'not implemented yet' }

  save(value) { throw 'not implemented yet' }

  set(properties) {
    const { value } = this
    this.save({ ...value, ...properties })
  }

  get value() {
    const value = this.load()

    if (value === null) {
      this.save(this.defaultValue)
      return this.defaultValue
    }

    return new this.DefaultValue(JSON.parse(value))
  }
}

class LocalStorageBase extends DefaultBase {

  load() { return localStorage.getItem(this.key) }

  save(value) {
    value = JSON.stringify(value)
    localStorage.setItem(this.key, value)
  }
}

class DocumentPropertiesBase extends DefaultBase {
  constructor(...args) {
    super(...args)
    this.documentProperties = PropertiesService.getDocumentProperties();
  }

  load() { return this.documentProperties.getProperty(this.key) }

  save(value) {
    value = JSON.stringify(value)
    this.documentProperties.setProperty(this.key, value)
  }
}