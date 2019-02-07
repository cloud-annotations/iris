type CompletionHandler = () => void
type ToDoFunction<T> = (object: T, completion: CompletionHandler) => T

interface Worker<T> {
  func: ToDoFunction<T>
  promise: DeferredPromise<T>
}

class DeferredPromise<T> {
  private _promise: Promise<T>
  public resolve?: (value?: T | PromiseLike<T> | undefined) => void
  public reject?: (reason?: any) => void
  public then: (
    onfulfilled?: ((value: T) => {} | PromiseLike<{}>) | null | undefined,
    onrejected?: ((reason: any) => {} | PromiseLike<{}>) | null | undefined
  ) => Promise<{}>
  public catch: (
    onrejected?: ((reason: any) => {} | PromiseLike<{}>) | null | undefined
  ) => Promise<{} | T>
  constructor() {
    this._promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
    this.then = this._promise.then.bind(this._promise)
    this.catch = this._promise.catch.bind(this._promise)
  }
  get [Symbol.toStringTag]() {
    return 'Promise'
  }
}

// TODO: This won't actually work, because we will get huge lag...
export default class PromiseQueue<T> {
  private _working: Worker<T>[] = []

  constructor(private _object: T) {
    this._object = _object
  }

  get length() {
    return this._working.length
  }

  // side effects.
  private _dequeue = () => {
    if (this._working.length > 0) {
      this._object = this._working[0].func(
        this._object,
        this._completionHandler
      )
      if (this._working[0].promise.resolve) {
        this._working[0].promise.resolve(this._object)
      }
    }
  }

  private _completionHandler = () => {
    this._working.shift()
    this._dequeue()
  }

  public push = (toDo: ToDoFunction<T>) => {
    const promise = new DeferredPromise<T>()
    this._working.push({ func: toDo, promise: promise })
    // If there's only one item we need to jumpstart the recursion.
    if (this._working.length === 1) {
      this._dequeue()
    }
    return promise
  }
}
