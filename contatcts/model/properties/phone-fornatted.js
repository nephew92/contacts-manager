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