function onOpen() {
  const menu = SpreadsheetApp.getUi()
    .createMenu('Contacts');

  addToMenuInsertData(menu)
  //  .addSeparator()

  //  addToMenuUpdateNames(menu)

  menu.addToUi();

  updateContactSheet()
}


function onEdit(e) {
  switch (e.range.getSheet().getSheetName()) {
    case 'Base de contatos':
      onEditContact(e)
      break;
    case 'Mensagem':
      onEditMensagem(e)
      break;
  }
}


function onEditMensagem(e) {
  switch (e.range.getA1Notation()) {
    case NAMED_RANGES.message_select.getA1Notation():
      onEditMensagemSeletor(e)
      break;
    case NAMED_RANGES.message_content.getA1Notation():
      onEditMensagemConteudo(e)
      break
  }
}

function onEditMensagemSeletor(e) {
  const cell = e.range
  const selected = cell.getValue()
  const options = NAMED_RANGES.message_name_options.getValues()
  let new_option = false
  const rowIdx = options.findIndex(([opt]) => {
    if (!opt) return new_option = true
    return opt === selected
  })

  if (new_option)
    NAMED_RANGES.message_name_options.getCell(rowIdx + 1, 1).setValue(selected)

  const content = NAMED_RANGES.message_content_options.getCell(rowIdx + 1, 1).getValue()
  NAMED_RANGES.message_content.setValue(content)
}

function onEditMensagemConteudo(e) {
  const cell = e.range
  const content = cell.getValue()
  const selected = NAMED_RANGES.message_select.getValue()
  const options = NAMED_RANGES.message_name_options.getValues()
  const rowIdx = options.findIndex(([opt]) => {
    return opt === selected
  })
  NAMED_RANGES.message_content_options.getCell(rowIdx + 1, 1).setValue(content)
}

function onEditWhatsappAction(e) {
  const cell = e.range
  const nextCell = NAMED_RANGES.whatsapp_action_url.getCell(cell.getRow(), 1)

  if (cell.getValue()) {
    const contact = getCurrentRowContact(cell)
    const whatsappActionUrl = `https://api.whatsapp.com/send/?phone=${contact.phone.value}&text=${compileMessage(contact)}`
    const selectedMessage = NAMED_RANGES.message_select.getValue()

    nextCell.setRichTextValue(SpreadsheetApp.newRichTextValue()
      .setText(`Open Whatsapp (${selectedMessage} enviado em ${new Date().toLocaleString()})`)
      .setLinkUrl(whatsappActionUrl)
      .build())
  } else {
    nextCell.clearContent()
  }

}

function onEditContact(e) {
  const cell = e.range
  const dataView = NAMED_RANGES.view

  Logger.log(cell.getColumn(), cell.getLastColumn(), NAMED_RANGES.whatsapp_action.getColumn())
  if (cell.getColumn() === cell.getColumn() && cell.getColumn() === NAMED_RANGES.whatsapp_action.getColumn())
    return onEditWhatsappAction(e)

  if (cell.getNumRows() > 1 || cell.getNumColumns() > 1)
    return showLog('multiple cells changed')

  if (!isR1partOfR2(cell, dataView))
    return //showLog('outOfRange')

  const contact = getCurrentRowContact(cell)

  try {
    switch (cell.getColumn()) {
      case NAMED_RANGES.names.getColumn():
        onEditName(e.value, contact, cell)
        break;
      case NAMED_RANGES.phones.getColumn():
        onEditPhone(e.value, contact, cell)
        break;
      case NAMED_RANGES.emails.getColumn():
        onEditEmail(e.value, contact, cell)
        break;
      case NAMED_RANGES.whatsapps.getColumn():
        onEditWhatsapp(e.value, contact, cell)
        break;
      case NAMED_RANGES.optouts.getColumn():
        onEditOptout(e.value, contact, cell)
        break;
      default:
        showLog(JSON.stringify('Impossible match the column'))
        break;
    }
  } catch (e) { }

  updateContact(contact)
}

function onEditName(value, contact, cell) { }
function onEditPhone(value, contact, cell) { }
function onEditEmail(value, contact, cell) { }
function onEditWhatsapp(value, contact, cell) {
  value = cell.getValue()

  contact.setWhatsapp(value)
  contact.update()
  showLog(`Whatsapp change to ${JSON.stringify(value)} for contact ${contact.id}`)
}
function onEditOptout(value, contact, cell) {
  value = cell.getValue()

  contact.setOptout(value)
  contact.update()
  showLog(`Optout change to ${JSON.stringify(value)} for contact ${contact.id}`)
}
