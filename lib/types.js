class MultiProperty extends Array {
  constructor(type) {
    super()
    this.Type = type
  }

  parse(...items) {
    for (let item of Array.prototype.concat(...items)) {
      if (item && !this.includes(item))
        this.push(new this.Type(item))
    }
    return this
  }

  extend(...items) { return this.parse(...items) }

  includes(another) {
    another = new this.Type(another)
    return this.some(item => item.valueOf().valueOf() == another.valueOf().valueOf())
  }

  toJSON() {
    if (this.length == 0)
      return undefined

    const self = [...this]
      .map(item => item.toJSON ? item.toJSON() : item.toString())

    return self.length > 1 ? self : self[0]
  }

  isSame(other, bicheck = true) {
    for (let anotherItem of other) {
      if (!this.includes(anotherItem))
        return false
    }

    if (bicheck && !other.isSame(this, false)) {
      return false
    }

    return true
  }

  get value() {
    return this[0]
  }
}

class PropertyBoolean extends Boolean {
  constructor(...args) {
    super(...args)
    this.onceTrueEverTrue = false
  }

  setOnceTrueEverTrue(value = true) {
    this.onceTrueEverTrue = value
    return this
  }

  /**
   * @returns {PropertyBoolean}
   */
  parse(value) {
    if (this.onceTrueEverTrue)
      value = this.valueOf() || value

    return new this.constructor(value)
      .setOnceTrueEverTrue(this.onceTrueEverTrue)
  }

  extend(value) { return this.parse(value) }

  isSame(another) { return this.valueOf() == another.valueOf() }
}

class PropertyString extends String { }

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

class PropertyPhone extends PropertyFormattedString {
  get regex() { return /^(?<country>55)*(?<ddd>\d\d)(?<digit>9)*(?<phone>\d\d\d\d\d\d\d\d)$/ }
  get clearValue() { return this.raw ? this.raw.replace(/\D/g, '') : '' }

  parseValue() {
    const { clearValue } = this
    const { groups: { country = '55', ddd, digit = '9', phone } = {} } = clearValue.match(this.regex) || {}

    this.country = country
    this.ddd = ddd
    this.digit = digit
    this.phone = phone

    if (!this.isValid)
      return undefined

    if (!ddd)
      return undefined

    if (!phone)
      return undefined

    return `${country}${ddd}${digit}${phone}`
  }
}

class PropertyEmail extends PropertyFormattedString {
  get regex() { return /\S+@\S+\.\S+/ }
  get clearValue() { return this.raw ? this.raw.trim().toLowerCase() : '' }
}