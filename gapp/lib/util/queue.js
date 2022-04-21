class Queue {
  constructor(processor) {
    const coro = function* () {
      console.log("STARTED")
      while (self.running) {
        const job = yield
        processor(job)
      }
      console.log("FINISHED")
    }

    const self = this
    const consumer = coro()
    this.running = false
    const process = (job) => consumer.next(job)
    this.start = () => {
      this.running = true
      this.process = process
      this.process(null)
      this.end = end
      delete this.start
    }
    const end = () => {
      this.running = false
      this.process(null)
      delete this.process
      delete this.end
    }

    this.start()
  }
}