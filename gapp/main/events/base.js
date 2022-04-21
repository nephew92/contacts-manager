class BaseEvent {
  constructor(event) {
    this.event = event
  }
}

class EditEvent extends BaseEvent {
  get range() { return this.event.range }
  get cell() { return this.range }
  get rangeValue() { return this.range.getValue() }
  get eventValue() { return this.event.value }
}