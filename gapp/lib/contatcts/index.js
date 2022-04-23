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