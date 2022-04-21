class PropertyFormattedString extends PropertyString {
  constructor(value) {
    if (typeof value === 'object')
      value = value.raw

    value = `${value || ''}`
    super(value)
    this.raw = value
    this.value = this.parseValue()
  }

  get regex() { return new RegExp() }
  get clearValue() { return this.raw || '' }
  get isValid() { return this.regex.test(this.clearValue) }

  parseValue() { return this.isValid ? this.clearValue : undefined }

  valueOf() { return this.toJSON() }
  toString() { return this.value || '--' }
  valueOfJSON() { return this.toJSON().valueOf() }
  toJSON() { return this.value === this.raw ? this.value : { raw: this.raw, formatted: this.value, isInvalid: !this.value || undefined, valueOf() { return this.formatted || this.raw } } }
}