class Crawler {
  constructor(type) {
    this.typeTester = type || Crawler.ALL
    return this.handle()
  }

  get COLUMNS() { return [7, 8, 9, 10, 12] }

  static isUnsubscribed(tr) { return !tr.select(`td .bg-red.div-paso-inscripcion`).empty() }
  static isInvited(tr) { return !tr.select(`td .bg-olive.div-paso-inscripcion`).empty() }
  static UNSUBSCRIBED(tr) { return Crawler.isUnsubscribed(tr) }
  static INVITED(tr) { return Crawler.isInvited(tr) }
  static TO_INVITE(tr) { return !Crawler.isUnsubscribed(tr) && !Crawler.isInvited(tr) }
  static ALL() { return true }

  assignToData(data) {
    return function (_, ...indexes) {
      const text = d3.select(this).text()
      indexes.reverse()
        .reduce((parent, idx, i, { length }) => {
          return parent[idx] = parent[idx] || (i < length - 1 ? [] : text)
        }, data)
      return text
    }
  }

  handle() {
    const data = []
    const self = this
    d3.selectAll('#table_wrapper table.table tbody tr')
      .filter(function () { return self.typeTester(d3.select(this)) })
      .selectAll(this.COLUMNS.map(c => `td:nth-child(${c})`).join(','))
      .each(this.assignToData(data))

    return data
  }
}