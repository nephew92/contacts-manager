class EditEvent extends BaseEvent {
  get range() { return this.event.range }
  get rangeSheetName() { return this.range.getSheet().getSheetName() }
  get rangeValue() { return this.range.getValue() }
  get eventValue() { return this.event.value }
}

class CellEditEvent extends EditEvent {
  get cellValue() { return this.range.getValue() }
  get cell() { return this.range }

  get column() { return this.cell.getColumn() }
  get lastColumn() { return this.cell.getLastColumn() }

  get row() { return this.cell.getRow() }
  get lastRow() { return this.cell.getLastRow() }

  get a1Notation() { return this.cell.getA1Notation() }
}

class EditSheetEvent extends EditEvent {
  dispatch() {
    switch (this.rangeSheetName) {
      case this.sheet.pages.message:
        new EditMessageSheetEvent(this).dispatch()
        break;
      case this.sheet.pages.contact_list:
        new EditContactSheetEvent(this).dispatch()
        break;
      default: break;
    }
  }
}

class EditMessageSheetEvent extends CellEditEvent {
  dispatch() {
    const { message_select, message_content } = this.sheet.ranges

    switch (this.a1Notation) {
      case message_select.getA1Notation():
        new EditMessageSelectorEvent(this).dispatch()
        break;
      case message_content.getA1Notation():
        new EditMensagemContentEvent(this).dispatch()
        break;
      default: break;
    }
  }
}

class EditMessageSelectorEvent extends EditEvent {
  dispatch() {
    const { cellValue: selected } = this
    const { message_name_options, message_content_options, message_content } = this.sheet.ranges
    const options = message_name_options.getValues()

    let new_option = false

    const rowIdx = options.findIndex(([opt]) => {
      if (!opt) return new_option = true
      return opt === selected
    })

    if (new_option)
      message_name_options.getCell(rowIdx + 1, 1).setValue(selected)

    const content = message_content_options.getCell(rowIdx + 1, 1).getValue()
    message_content.setValue(content)
  }
}

class EditMensagemContentEvent extends EditEvent {
  dispatch() {
    const { cellValue } = this
    const { message_select, message_name_options, message_content_options } = this.sheet.ranges

    const selected = message_select.getValue()
    const options = message_name_options.getValues()

    const rowIdx = options.findIndex(([opt]) => {
      return opt === selected
    })

    message_content_options.getCell(rowIdx + 1, 1).setValue(cellValue)
  }
}

class EditContactSheetEvent extends CellEditEvent {
  dispatch() {
    const { column } = this
    const { whatsapp_action, names, phones, emails, whatsapps, optouts } = this.sheet.ranges

    switch (column) {
      case whatsapp_action.getColumn():
        new WhatsappActionEvent(this).dispatch()
        break;
      case names.getColumn():
        new EditNameContactPropertyEvent(this).dispatch().refresh()
        break;
      case phones.getColumn():
        new EditPhoneContactPropertyEvent(this).dispatch().refresh()
        break;
      case emails.getColumn():
        new EditEmailContactPropertyEvent(this).dispatch().refresh()
        break;
      case whatsapps.getColumn():
        new EditWhatsappContactPropertyEvent(this).dispatch().refresh()
        break;
      case optouts.getColumn():
        new EditOptoutContactPropertyEvent(this).dispatch().refresh()
        break;
      default: break;
    }
  }
}

class EditContactEvent extends CellEditEvent {
  constructor(...args) {
    super(...args)
    this.contact = this.getContact(this.cell)
  }

  getContact() {
    const { row } = this
    const { view, ids } = this.sheet.ranges
    const contactIdColumn = ids.getColumn()

    const contactId = view.getCell(row, contactIdColumn).getValue()

    if (!contactId)
      return showLog('no id found')

    const contact = manager.getContactById(contactId)

    if (!contact)
      return showLog('no contact found')

    return contact
  }

  dispatchChange() { this.notImplemented() }

  dispatch() {
    this.dispatchChange()
    return this
  }

  refresh() {
    updateContact(this.contact)
  }
}

class WhatsappActionEvent extends EditContactEvent {
  get text() {
    const { contact: { name } } = this
    const { message_content } = this.sheet.ranges

    const vars = {
      name: name.value
    }
    const compile = str => str.replace(/{{(\w+)}}/g, ($, $1) => vars[$1])
    const messageTemplate = message_content.getValue()

    return compile(messageTemplate)
  }

  get whatsappUrl() {
    const { contact: { phone }, text } = this
    return `https://api.whatsapp.com/send/?phone=${phone.value}&text=${text}`
  }

  dispatch() {
    const { cellValue, row, whatsappUrl } = this
    const { whatsapp_action_url, message_select } = this.sheet.ranges

    const nextCell = whatsapp_action_url.getCell(row, 1)

    if (cellValue) {
      const selectedMessage = message_select.getValue()

      nextCell.setRichTextValue(SpreadsheetApp.newRichTextValue()
        .setText(`Open Whatsapp (${selectedMessage} enviado em ${new Date().toLocaleString()})`)
        .setLinkUrl(whatsappUrl)
        .build())
    } else {
      nextCell.clearContent()
    }
  }
}

class EditContactPropertyEvent extends EditContactEvent {
  setValue() { this.notImplemented() }

  dispatchChange() {
    this.setValue()
    this.contact.update()
    // showLog(`Whatsapp change to ${JSON.stringify(value)} for contact ${contact.id}`)
  }
}

class EditWhatsappContactPropertyEvent extends EditContactPropertyEvent {
  setValue() {
    contact.setWhatsapp(this.cellValue)
  }
}

class EditOptoutContactPropertyEvent extends EditContactPropertyEvent {
  setValue() {
    contact.setOptout(this.cellValue)
  }
}

class EditNameContactPropertyEvent extends EditContactPropertyEvent {
  setValue() { }
}

class EditPhoneContactPropertyEvent extends EditContactPropertyEvent {
  setValue() { }
}

class EditEmailContactPropertyEvent extends EditContactPropertyEvent {
  setValue() { }
}