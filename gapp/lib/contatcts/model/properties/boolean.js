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