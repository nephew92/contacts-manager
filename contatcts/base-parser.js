class ContactsBaseParser {
  constructor({ contacts = {}, phones = {}, emails = {} } = {}) {
    this.contacts = contacts
    this.phones = phones
    this.emails = emails
  }
}