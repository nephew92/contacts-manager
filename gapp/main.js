const manager = new ContactsManager('DATA_CONTACTS', DocumentPropertiesBase)
const eventQueue = new Queue(eventTrigger => eventTrigger())
const sheet = new ContactsSheet()
const openEvent = new OpenEvent().listen(sheet)

function onEdit(event) {
  new EditSheetEvent()
    .attatch(event)
    .listen(sheet)
    .dispatch()
}

function onOpen(event) {
  openEvent
    .attatch(event)
    .dispatch();
}