class PropertyEmail extends PropertyFormattedString {
  get regex() { return /\S+@\S+\.\S+/ }
  get clearValue() { return this.raw ? this.raw.trim().toLowerCase() : '' }
}