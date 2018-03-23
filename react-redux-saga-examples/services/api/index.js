// https://github.com/diegohaz/arc/wiki/API-service
import 'whatwg-fetch'
import { stringify } from 'query-string'
import merge from 'lodash/merge'
import omit from 'lodash/omit'
import locale2 from 'locale2'

import { apiUrl } from 'config'
import { promiseTimeout } from 'utils'

import {
  FetchError,

  ApiError,
  NotFoundApiError,
  ForbiddenApiError,
  UnauthorizedApiError,

  UnknownApiError,
  NotFoundUnknownApiError,
  ForbiddenUnknownApiError,
  UnauthorizedUnknownApiError,
  TokenTimeoutUnknownApiError,
} from 'errors'

export const parseJSONErrorFromResponse = async (response, ErrorType, UnknownErrorType) => {
  let errResponse = null
  try {
    errResponse = await response.json()
  } catch (e) {
    throw new UnknownErrorType(e, response.statusText)
  }
  throw new ErrorType(errResponse)
}

export const checkStatus = async (response) => {
  if (response.ok) {
    return response
  }

  switch (response.status) {
    case 404:
      return parseJSONErrorFromResponse(response, NotFoundApiError, NotFoundUnknownApiError)
    case 401:
      return parseJSONErrorFromResponse(response, UnauthorizedApiError, UnauthorizedUnknownApiError)
    case 403:
      return parseJSONErrorFromResponse(response, ForbiddenApiError, ForbiddenUnknownApiError)
    default:
      return parseJSONErrorFromResponse(response, ApiError, UnknownApiError)
  }
}

export const parseJSON = response => response.json().then(json => ({
  json,
  headers: {
    'X-Total-Count': (
      Number(response.headers.get('X-Total-Count')) ||
      Number(response.headers.get('x-total-count')) ||
      Number(response.headers.get('X-Pagination-Total-Count')) ||
      Number(response.headers.get('x-pagination-total-count'))
    ),
  },
}))

export const parseSettings = ({ method = 'get', data, locale, ...otherSettings } = {}) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Accept-Language': locale || locale2,
  }
  const settings = merge({
    body: data ? JSON.stringify(data) : undefined,
    method,
    headers,
  }, otherSettings)
  return settings
}

export const parseEndpoint = (endpoint, params) => {
  const url = endpoint.indexOf('http') === 0 ? endpoint : apiUrl + endpoint
  const querystring = params ? `?${stringify(params)}` : ''
  return `${url}${querystring}`
}

const api = {}

api.request = async (endpoint, { params, ...settings } = {}) => {
  let httpResponse = null

  try {
    httpResponse = await fetch(parseEndpoint(endpoint, params), parseSettings(settings))
  } catch (e) {
    throw new FetchError(e)
  }

  const response = await checkStatus(httpResponse)
  return parseJSON(response)
}

;['delete', 'get'].forEach((method) => {
  api[method] = (endpoint, settings) => api.request(endpoint, { method, ...settings })
})

;['post', 'put', 'patch'].forEach((method) => {
  api[method] = (endpoint, data, settings) => api.request(endpoint, { method, data, ...settings })
})

api.create = (settings = {}) => ({
  settings,

  setToken(token) {
    if (token) {
      this.settings.headers = {
        ...this.settings.headers,
        Authorization: `Bearer ${token}`,
      }
    }
  },

  unsetToken() {
    this.settings.headers = omit({
      ...this.settings.headers,
      Authorization: undefined,
    }, ['Authorization'])
  },

  request(endpoint, settings) {
    return api.request(endpoint, merge({}, this.settings, settings))
  },

  post(endpoint, data, settings) {
    return this.request(endpoint, { method: 'post', data, ...settings })
  },

  get(endpoint, settings) {
    return this.request(endpoint, { method: 'get', ...settings })
  },

  put(endpoint, data, settings) {
    return this.request(endpoint, { method: 'put', data, ...settings })
  },

  patch(endpoint, data, settings) {
    return this.request(endpoint, { method: 'patch', data, ...settings })
  },

  delete(endpoint, settings) {
    return this.request(endpoint, { method: 'delete', ...settings })
  },
})

class TokenSeeker {
  constructor() {
    this.isStarted = false
  }

  start() {
    const ONE_MINUTE = 60 * 1000
    if (this.isStarted) return Promise.resolve()
    return new Promise((resolve, reject) => {
      try {
        const seeker = this
        this.pending = true
        this.tokenPromise = promiseTimeout(ONE_MINUTE, new Promise((resolve, reject) => {
          seeker.tokenResolve = resolve
          seeker.tokenReject = reject
        }), new TokenTimeoutUnknownApiError())
        this.isStarted = true
        resolve(true)
      } catch (e) {
        this.isStarted = false
        reject(e)
      }
    })
  }

  isReceived() {
    return this.tokenPromise
  }

  isPending() {
    return this.pending
  }

  tokenReceiveSuccess(data) {
    this.pending = false
    if (this.isStarted) {
      this.isStarted = false
      return this.tokenResolve(data)
    }
    return Promise.reject(new Error('Token seeker was not started'))
  }

  tokenReceiveFailed(e) {
    this.pending = false
    if (this.isStarted) {
      this.isStarted = false
      return this.tokenReject(e)
    }
    return Promise.reject(new Error('Token seeker was not started'))
  }

  stop() {
    return new Promise((resolve) => {
      if (this.isStarted) {
        this.isStarted = false
        this.tokenReject(new Error('Token seeker stop waiting'))
      }
      resolve(true)
    })
  }
}

export const tokenSeeker = new TokenSeeker()

export default api
