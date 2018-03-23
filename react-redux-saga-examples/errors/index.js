import ExtendableError from 'es6-error'

export class FetchError extends ExtendableError {
  constructor(e, message = 'Failed to fetch resource') {
    super(message)
    this.originalError = e
  }

  getAllMessages() {
    return this.message
  }
}

export class ApiError extends ExtendableError {
  constructor(e, message = 'Received failed response from API') {
    super(message)
    this.errors = e.errors
    this.errorType = e.errorType
  }

  getAllMessages() {
    return this.errors.reduce((acc, e) => `${acc}\n${e.message}`, '')
  }
}

export class NotFoundApiError extends ApiError {
  constructor(e, message = 'Received "Not Found" response from API') {
    super(e, message)
  }
}

export class ForbiddenApiError extends ApiError {
  constructor(e, message = 'Received "Forbidden" response from API') {
    super(e, message)
  }
}

export class UnauthorizedApiError extends ApiError {
  constructor(e, message = 'Received "Unauthorized" response from API') {
    super(e, message)
  }
}

export class UnknownApiError extends ExtendableError {
  constructor(e, message = 'Something went wrong') {
    super(message)
    this.originalError = e
  }

  getAllMessages() {
    return this.message
  }
}

export class NotFoundUnknownApiError extends UnknownApiError {
  constructor(e, message = 'Not formal response "Not found"') {
    super(e, message)
  }
}

export class ForbiddenUnknownApiError extends UnknownApiError {
  constructor(e, message = 'Not formal response "Forbidden"') {
    super(e, message)
  }
}

export class UnauthorizedUnknownApiError extends UnknownApiError {
  constructor(e, message = 'Not formal response "Unauthorized"') {
    super(e, message)
  }
}

export class TokenTimeoutUnknownApiError extends UnknownApiError {
  constructor(e, message = 'API token was not set at the specified time') {
    super(e, message)
  }
}
