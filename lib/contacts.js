class ContactsBaseParser {
  constructor({ contacts = {}, phones = {}, emails = {} } = {}) {
    this.contacts = contacts
    this.phones = phones
    this.emails = emails
  }
}

class CustomString extends String {
  constructor(value) {
    value = `${value || ''}`
    super(value)
    this.rawValue = value
    this.value = this.parseValue()
  }

  get regex() { return new RegExp() }
  get clearValue() { return this.rawValue || '' }
  get isValid() { return this.regex.test(this.clearValue) }

  parseValue() { return this.isValid ? this.clearValue : undefined }

  valueOf() { return this.value }
  toString() { return this.value || '' }
  toJSON() { return this.value && { raw: this.rawValue, formatted: this.value } }
}

class PhoneContact extends CustomString {
  get regex() { return /^(?<country>55)*(?<ddd>\d\d)(?<digit>9)*(?<phone>\d\d\d\d\d\d\d\d)$/ }
  get clearValue() { return this.rawValue ? this.rawValue.replace(/\D/g, '') : '' }

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

class EmailContact extends CustomString {
  get regex() { return /\S+@\S+\.\S+/ }
  get clearValue() { return this.rawValue ? this.rawValue.trim().toLowerCase() : '' }
  toJSON() { return this.value && this.value !== this.rawValue && { raw: this.rawValue, formatted: this.value } || this.value }

}

class Contact {
  /**
   * @param {Object} data
   * @param {ContactsBase} manager 
   */
  constructor({ id = null, phone, email, name }, manager) {
    this.id = id
    this.phone = new PhoneContact(phone)
    this.email = new EmailContact(email)
    this.name = name

    this.manager = manager
  }

  isValid() { return this.phone.isValid || this.email.isValid }

  sync({ phone, email, name }) {
    if (this.phone != phone)
      this.phone = phone

    if (this.email != email)
      this.email = email

    if (this.name != name)
      this.name = name
  }

  update(other) {
    if (!(!this.id ^ !other.id) && this.id != other.id)
      throw new Error("Invalid update: Both contacts should have the same ID or at least one must be saved.")

    this.id = other.id = this.id || other.id

    this.sync(other)

    return this.manager.bulkInsert(this)
  }

  insert() {
    const existent = this.manager.find(this)

    if (existent)
      return this.update(existent)


    return this.manager.bulkInsert(this)
  }
}

class ContactsBase {
  constructor() {
    this.base = new LocalStorageBase('contacts', ContactsBaseParser)
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
    const { [type]: { value } } = contact

    const contactId = source[value]

    if (!contactId)
      return null

    const contactData = contacts[contactId]

    return this.build(contactData)
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

    const { email, phone } = contact

    if (email.value)
      emails[email] = id

    if (phone.value)
      phones[phone] = id

    this.base.set({ emails, phones, contacts })

    return contact
  }

  build(data) {
    return new Contact(data, this)
  }
}

class ContactsManager {
  constructor() {
    this.contacts = new ContactsBase()
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
}