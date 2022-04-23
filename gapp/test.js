
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

function showLog(...args) {
  Logger.log(...args)
  SpreadsheetApp.getActiveSpreadsheet().toast(Logger.getLog(), 'Log');
  Logger.clear()
}

