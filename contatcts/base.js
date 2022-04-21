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