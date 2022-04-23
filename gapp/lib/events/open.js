class OpenEvent extends BaseEvent {
  constructor() {
    super()
    this.ui = SpreadsheetApp.getUi()
  }

  dispatch() {
    this.ui
      .createMenu('Contacts')
      .addItem('Prompt Insert Data', 'openEvent.showPromptInsertData')
      .addItem('Import data from scratch', 'openEvent.importFromScratch')
      .addItem('Update Contacts Sheet ', 'openEvent.updateContactSheet')
      .addToUi();

    this.updateContactSheet()
    return this
  }

  updateContactSheet() {
    showLog("UPDATING SHEET")

    manager
      .getList()
      //.slice(0, 6)
      .forEach(contact => this.sheet.updateContact(contact))

    showLog("UPDATED")
  }

  showPromptInsertData() {
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

  importFromScratch() {
    const rawData = NAMED_RANGES.scratch.getValues()

    const added = []
    for (let [phone, name, email, optout, ...tags] of rawData.slice(2350, 2800)) {
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

  addToMenuUpdateNames(menu) {
    return menu.addItem('Update Names', 'updateNames')
  }

  updateNames() {
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

  insertData(text) {
    const data = JSON.parse(text)

    for (let { phone, name, email } of data) {
      manager.addContact({ phone, name, email })
    }

    showLog(`DONE! ${data.length} contacts saved!`)
  }
}