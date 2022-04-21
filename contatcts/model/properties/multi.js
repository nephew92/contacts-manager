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