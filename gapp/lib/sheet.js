class ContactsSheet {
  constructor() {
    this.self = SpreadsheetApp.getActive();
    this.ranges = this.getRanges()
    this.pages = this.getPages()
  }

  getPages() {
    return {
      message: 'Mensagem',
      contact_list: 'Base de contatos'
    }
  }

  getRanges() {
    const { self } = this
    return {
      scratch: self.getRangeByName('rawData'),
      view: self.getRangeByName('dataView'),
      phones: self.getRangeByName('dataViewPhone'),
      names: self.getRangeByName('dataViewName'),
      emails: self.getRangeByName('dataViewEmail'),
      ids: self.getRangeByName('dataViewId'),
      whatsapps: self.getRangeByName('dataViewWhatsapp'),
      optouts: self.getRangeByName('dataViewOptout'),
      message_select: self.getRangeByName('mensagemSeletor'),
      message_content: self.getRangeByName('mensagemConteudo'),
      message_name_options: self.getRangeByName('mensagemNomeOpcoes'),
      message_content_options: self.getRangeByName('mensagemConteudoOpcoes'),
      whatsapp_action: self.getRangeByName('whatasppAction'),
      whatsapp_action_url: self.getRangeByName('whatsappActionUrl'),
    }
  }

  updateContact(contact) {
    const { view, names, phones, emails, whatsapps, optouts } = this.ranges

    const row = contact.id + 1
    const idCell = view.getCell(row, 1)
    const nameCell = view.getCell(row, names.getColumn())
    const phoneCell = view.getCell(row, phones.getColumn())
    const emailCell = view.getCell(row, emails.getColumn())
    const whatsappCell = view.getCell(row, whatsapps.getColumn())
    const optoutCell = view.getCell(row, optouts.getColumn())

    idCell.setValue(contact.id)
    this.addValidationOptions(nameCell, contact.name)
    this.addValidationOptions(phoneCell, contact.phone)
    this.addValidationOptions(emailCell, contact.email)
    this.addValidationCheck(whatsappCell, contact.whatsapp.valueOf())
    this.addValidationCheck(optoutCell, contact.optout.valueOf())
  }

  addValidationOptions(cell, names) {
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

  addValidationCheck(cell, checked) {
    cell.clearDataValidations();

    cell.setValue(checked)
    const regra = SpreadsheetApp.newDataValidation();
    regra.requireCheckbox()

    cell.setDataValidation(regra);
  }
}