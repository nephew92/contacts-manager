class Contact {
  /**
   * @param {Object} data
   * @param {ContactsBase} manager 
   */
  constructor({ id = null, phone, email, name, whatsapp, optout }, manager) {
    this.id = id
    this.phone = new MultiProperty(PropertyPhone).parse(phone)
    this.email = new MultiProperty(PropertyEmail).parse(email)
    this.name = new MultiProperty(PropertyString).parse(name)
    this.whatsapp = new PropertyBoolean().parse(whatsapp)
    this.optout = new PropertyBoolean().setOnceTrueEverTrue().parse(optout)
    this.manager = manager
  }

  isValid() { return (this.phone.value && this.phone.value.isValid) || (this.email.value && this.email.value.isValid) }

  setWhatsapp(value) {
    this.whatsapp = this.whatsapp.extend(value)
  }

  setOptout(value) {
    this.optout = this.optout.extend(value)
  }

  parseProperty(property, parser) {
    if (Array.isArray(property))
      return property.map(parser)

    return parser(property)
  }

  sync({ phone, email, name, whatsapp, optout }) {
    if (!this.phone.isSame(phone))
      this.phone = this.phone.extend(phone)

    if (!this.email.isSame(email))
      this.email = this.email.extend(email)

    if (!this.name.isSame(name))
      this.name = this.name.extend(name)

    if (!this.whatsapp.isSame(whatsapp))
      this.whatsapp = this.whatsapp.extend(whatsapp)

    if (!this.optout.isSame(optout))
      this.optout = this.optout.extend(optout)
  }

  update(other = this) {
    if (other !== this) {
      if (!(!this.id ^ !other.id) && this.id != other.id)
        throw new Error("Invalid update: Both contacts should have the same ID or at least one must be saved.")

      this.id = other.id = this.id || other.id

      this.sync(other)
    }

    return this.manager.bulkInsert(this)
  }

  delete() {
    return this.manager.bulkDelete(this)
  }

  insert() {
    const existent = this.manager.find(this)

    if (existent)
      return this.update(existent)

    return this.manager.bulkInsert(this)
  }
}