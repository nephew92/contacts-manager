class BaseEvent {
  constructor(parent) {
    parent && this.setParent(parent)
  }

  /**
   * @param {ContactsSheet} sheet 
   */
   listen(sheet) {
    this.sheet = sheet
    return this
  }

  setParent({ event, sheet }) {
    this.attatch(event)
    this.listen(sheet)
  }

  attatch(event) {
    this.event = event
    return this
  }

  notImplemented() { throw 'not implemented' }

  dispatch() { this.notImplemented() }
}