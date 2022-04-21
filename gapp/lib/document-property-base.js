class DocumentPropertiesBase extends DefaultBase {
  constructor(...args) {
    super(...args)
    this.documentProperties = PropertiesService.getDocumentProperties();
  }

  load() { return this.documentProperties.getProperty(this.key) }

  save(value) {
    value = JSON.stringify(value)
    this.documentProperties.setProperty(this.key, value)
  }
}