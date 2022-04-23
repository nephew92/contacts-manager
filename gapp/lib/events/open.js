const manager = new ContactsManager('DATA_CONTACTS', DocumentPropertiesBase)
const eventQueue = new Queue(eventTrigger => eventTrigger())
const sheet = SpreadsheetApp.getActive();

const NAMED_RANGES = {
  scratch: sheet.getRangeByName('rawData'),
  view: sheet.getRangeByName('dataView'),
  phones: sheet.getRangeByName('dataViewPhone'),
  names: sheet.getRangeByName('dataViewName'),
  emails: sheet.getRangeByName('dataViewEmail'),
  ids: sheet.getRangeByName('dataViewId'),
  whatsapps: sheet.getRangeByName('dataViewWhatsapp'),
  optouts: sheet.getRangeByName('dataViewOptout'),
  message_select: sheet.getRangeByName('mensagemSeletor'),
  message_content: sheet.getRangeByName('mensagemConteudo'),
  message_name_options: sheet.getRangeByName('mensagemNomeOpcoes'),
  message_content_options: sheet.getRangeByName('mensagemConteudoOpcoes'),
  whatsapp_action: sheet.getRangeByName('whatasppAction'),
  whatsapp_action_url: sheet.getRangeByName('whatsappActionUrl'),
}

function addContacts() {
  manager.addContact({ email: 'francisco@qa.com' })
  console.log('aqui')
}

function clearPhone(phone) {
  return new PhoneContact(`${phone}`).toString()
}

function clearPhones(range) {
  const phones = new Set()
  for (let phone of range) {
    phones.add(clearPhone(phone))
  }

  return [...phones]
}

function showLog(...args) {
  Logger.log(...args)
  SpreadsheetApp.getActiveSpreadsheet().toast(Logger.getLog(), 'Log');
  Logger.clear()
}

function getBounds(range) {
  const x1 = range.getRow()
  const y1 = range.getColumn()
  const x2 = range.getLastRow()
  const y2 = range.getLastColumn()

  return new Rect(x1, y1, x2, y2)
}

function test() {
  get()
}

function get() {
  const contact = manager.getContactById(507)
  //const success = contact && contact.update()
  Logger.log(JSON.stringify({ success }))
}

function del() {
  const contact = manager.getContactById(507)
  const success = contact && contact.delete()
  Logger.log(JSON.stringify({ success }))
}

function add() {
  const result = manager.addContact({ phone: ["(94) 981122987", '31 86853353'], name: "Francisco" })
  Logger.log(JSON.stringify({ result }))
}


function insertData(text) {
  const data = JSON.parse(text)

  for (let { phone, name, email } of data) {
    manager.addContact({ phone, name, email })
  }

  showLog(`DONE! ${data.length} contacts saved!`)
}

function addValidationOptions(cell, names) {
  cell.clearDataValidations();

  if (names.length <= 1) {
    cell.setValue(names[0] ? names[0].toString() : '--')
    return
  }

  const regra = SpreadsheetApp.newDataValidation();
  regra.requireValueInList(names, true);
  regra.setAllowInvalid(false);
  regra.setHelpText("Escolha uma entre as opções listadas");

  cell.setDataValidation(regra);
}

function addValidationCheck(cell, checked) {
  cell.clearDataValidations();

  cell.setValue(checked)
  const regra = SpreadsheetApp.newDataValidation();
  regra.requireCheckbox()

  cell.setDataValidation(regra);
}

function importFromScratch() {
  const rawData = NAMED_RANGES.scratch.getValues()

  const added = []
  for (let [phone, name, email, optout, ...tags] of rawData.slice(2350,2800)) {
    const done = manager.addContact({ phone, name, email, optout })
    added.push(done)
  }

  showLog(`
  DONE! 
  ${added.length} contacts found
  ${added.filter(([success]) => success).length} contacts saved!
  ${added.filter(([success]) => !success).length} contacts not saved!
  `)
}

function updateContact(contact) {
  const range = NAMED_RANGES.view

  const row = contact.id + 1
  const idCell = range.getCell(row, 1)
  const nameCell = range.getCell(row, NAMED_RANGES.names.getColumn())
  const phoneCell = range.getCell(row, NAMED_RANGES.phones.getColumn())
  const emailCell = range.getCell(row, NAMED_RANGES.emails.getColumn())
  const whatsappCell = range.getCell(row, NAMED_RANGES.whatsapps.getColumn())
  const optoutCell = range.getCell(row, NAMED_RANGES.optouts.getColumn())

  idCell.setValue(contact.id)
  addValidationOptions(nameCell, contact.name)
  addValidationOptions(phoneCell, contact.phone)
  addValidationOptions(emailCell, contact.email)
  addValidationCheck(whatsappCell, contact.whatsapp.valueOf())
  addValidationCheck(optoutCell, contact.optout.valueOf())
}

function updateContactSheet() {
  showLog("UPDATING SHEET")

  manager
    .getList()
    //.slice(0, 6)
    .forEach(updateContact)

  showLog("UPDATED")
}

function showPromptInsertData() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    'Load Data',
    'Please enter a CSV data content',
    ui.ButtonSet.OK_CANCEL);

  const button = result.getSelectedButton();
  const text = result.getResponseText();


  if (button == ui.Button.OK) {
    insertData(text)
  }
}

function addToMenuInsertData(menu) {
  return menu
    .addItem('Prompt Insert Data', 'showPromptInsertData')
    .addItem('Import data from scratch', 'importFromScratch')
    .addItem('Update Contacts Sheet ', 'updateContactSheet')
}

function addToMenuUpdateNames(menu) {
  return menu.addItem('Update Names', 'updateNames')
}

function updateNames() {
  const sheet = SpreadsheetApp.getActive()
  const names = NAMED_RANGES.names
  const phones = NAMED_RANGES.phones.getValues()

  names.clearDataValidations();

  const rawFormatedPhones = sheet.getRangeByName('rawFormatedPhones').getValues().map(([col], idx) => ({ col, idx }))
  const rawNames = NAMED_RANGES.names.getValues()

  const start = names.getRow() + 1
  const end = names.getLastRow()
  for (let rowId = start; rowId <= end; rowId++) {
    const cell = names.getCell(rowId, 1)
    const phone = phones[rowId - start + 1]

    const filterNames = rawFormatedPhones.filter(({ col }) => col == phone).map(({ idx }) => rawNames[idx][0])
    Logger.log(filterNames)
    updateNameList(cell, filterNames)
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(Logger.getLog(), 'Log', 5);
}

function bulkAddContacts() {

}

function isR1partOfR2(range1, range2) {
  const rect1 = getBounds(range1)
  const rect2 = getBounds(range2)

  return rect2.contains(rect1)
}

function getCurrentRowContact(cell) {
  const dataView = NAMED_RANGES.view
  const contactIdColumn = NAMED_RANGES.ids.getColumn()

  const contactId = dataView.getCell(cell.getRow(), contactIdColumn).getValue()

  if (!contactId)
    return showLog('no id found')

  const contact = manager.getContactById(contactId)

  if (!contact)
    return showLog('no contact found')

  return contact
}

function compileMessage(contact) {
  const vars = {
    name: contact.name.value
  }
  const compile = str => str.replace(/{{(\w+)}}/g, ($, $1) => vars[$1])
  const messageTemplate = NAMED_RANGES.message_content.getValue()

  return compile(messageTemplate)
}


