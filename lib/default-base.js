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