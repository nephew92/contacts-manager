class ContactsBaseParser {
  constructor({ contacts = {}, phones = {}, emails = {} } = {}) {
    this.contacts = contacts
    this.phones = phones
    this.emails = emails
  }
}

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

class ContactsBase {
  constructor(key, Base) {
    this.base = new Base(key, ContactsBaseParser)
  }

  toJSON() { return undefined }

  /**
   * @return {ContactsBaseParser}
   */
  get baseData() { return this.base.value }

  generateId() {
    const { contacts } = this.baseData
    return Object.keys(contacts).length + 1
  }

  /**
   * @param {Contact} contact 
   */
  findBy(type, contact) {
    const { emails, phones, contacts } = this.baseData

    const { [type]: source } = { email: emails, phone: phones }
    const { [type]: values } = contact

    for (let value of values) {
      const contactId = source[value]

      if (!contactId)
        continue

      const contactData = contacts[contactId]

      return this.build(contactData)
    }

    return null
  }

  /**
  * @param {Contact} contact 
  */
  findByEmail(contact) {
    return this.findBy('email', contact)
  }

  /**
  * @param {Contact} contact 
  */
  findByPhone(contact) {
    return this.findBy('phone', contact)
  }

  /**
  * @param {Contact} contact 
  */
  find(contact) {
    const contactByPhone = this.findByPhone(contact)

    if (contactByPhone)
      return contactByPhone

    const contactByEmail = this.findByEmail(contact)

    if (contactByEmail)
      return contactByEmail

    return null
  }

  /**
   * @param {Contact} contact 
   */
  bulkInsert(contact) {
    const id = contact.id = contact.id || this.generateId()
    const { emails, phones, contacts } = this.baseData

    contacts[id] = contact

    for (let email of contact.email) {
      if (email.value)
        emails[email] = id
    }

    for (let phone of contact.phone) {
      if (phone.value)
        phones[phone] = id
    }

    this.base.set({ emails, phones, contacts })

    return contact
  }

  bulkDelete(contact) {
    if (!contact || !contact.id)
      return null

    const { emails, phones, contacts } = this.baseData

    for (let email of contact.email) {
      if (email.value && emails[email] == contact.id)
        delete emails[email]
    }

    for (let phone of contact.phone) {
      if (phone.value && phones[phone] == contact.id)
        delete phones[phone]
    }

    delete contacts[contact.id]
    contact.id = null

    this.base.set({ emails, phones, contacts })

    return true
  }

  build(data) {
    return new Contact(data, this)
  }
}

class ContactsManager {
  constructor(key, Base) {
    this.contacts = new ContactsBase(key, Base)
  }

  buildContact(data) { return this.contacts.build(data) }

  /**
   * @param {Contact} contact
   * @returns {[Contact,boolean]}
   */
  createOrFind(contact) {
    const existentContact = this.contacts.find(contact)

    if (!existentContact) {
      contact.insert()
      return [contact, true]
    }

    existentContact.update(contact)

    return [existentContact, false]
  }

  /**
   * @param {Contact} data
   * @returns {[boolean, Contact]}
   */
  addContact(data) {
    const contact = this.buildContact(data)

    if (!contact.isValid())
      return [false]

    const [savedContact, created] = this.createOrFind(contact)

    return [created, savedContact]
  }

  deleteContact(contact) {
    if (!contact)
      return false

    return contact.delete()
  }

  deleteContactById(contactId) {
    if (!contactId)
      return false

    const contact = this.getContactById(contactId)

    return contact.delete()
  }

  getList() {
    const contacts = Object.values(this.contacts.baseData.contacts)
      .map(contactData => this.buildContact(contactData))

    return contacts
  }

  getContactById(id) {
    const contactData = this.contacts.baseData.contacts[id]

    if (!contactData)
      return null

    return this.buildContact(contactData)
  }
}