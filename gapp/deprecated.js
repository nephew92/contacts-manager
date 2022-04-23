function getBounds(range) {
  const x1 = range.getRow()
  const y1 = range.getColumn()
  const x2 = range.getLastRow()
  const y2 = range.getLastColumn()

  return new Rect(x1, y1, x2, y2)
}

function isR1partOfR2(range1, range2) {
  const rect1 = getBounds(range1)
  const rect2 = getBounds(range2)

  return rect2.contains(rect1)
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
