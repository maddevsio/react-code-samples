import {
  ApiError,
  UnknownApiError,
  NotFoundApiError,
  ForbiddenApiError,
  UnauthorizedApiError,
  NotFoundUnknownApiError,
  UnauthorizedUnknownApiError,
  ForbiddenUnknownApiError,
} from 'errors'
import api, { checkStatus, parseJSON, parseSettings, parseEndpoint } from '.'

jest.mock('config', () => ({
  apiUrl: 'https://api.foo.com',
}))

describe('checkStatus', () => {
  it('returns response when it is ok', () => {
    const response = { ok: true }
    return expect(checkStatus(response)).resolves.toBe(response)
  })

  it('throws when it is not ok', () => {
    const response = { ok: false }
    return expect(checkStatus(response)).rejects.toEqual(new UnknownApiError())
  })

  describe('errors from API', () => {
    it('throws NotFoundApiError', () => {
      const errorDetails = {
        errorType: 'ERR_NOT_FOUND',
        errors: [
          {
            message: 'Resource not found',
            code: 1,
          },
        ],
      }
      const response = {
        ok: false,
        status: 404,
        json: async () => errorDetails,
      }
      expect(checkStatus(response)).rejects.toEqual(new NotFoundApiError(errorDetails))
    })

    it('throws ForbiddenApiError', () => {
      const errorDetails = {
        errorType: 'ERR_FORBIDDEN',
        errors: [
          {
            message: 'Not enouch privilages',
            code: 1,
          },
        ],
      }
      const response = {
        ok: false,
        status: 403,
        json: async () => errorDetails,
      }
      expect(checkStatus(response)).rejects.toEqual(new ForbiddenApiError(errorDetails))
    })

    it('throws UnauthorizedApiError', () => {
      const errorDetails = {
        errorType: 'ERR_UNAUTHORIZED',
        errors: [
          {
            message: 'Not authoraized',
            code: 1,
          },
        ],
      }
      const response = {
        ok: false,
        status: 401,
        json: async () => errorDetails,
      }
      expect(checkStatus(response)).rejects.toEqual(new UnauthorizedApiError(errorDetails))
    })

    it('throws NotFoundUnknownApiError', () => {
      const errorDetails = 'Unexpected token s in JSON at position 0'
      const response = {
        ok: false,
        status: 404,
        body: '404 Not found',
        json: async () => { throw new SyntaxError(errorDetails) },
      }
      expect(checkStatus(response)).rejects.toEqual(new NotFoundUnknownApiError())
    })

    it('throws UnauthorizedUnknownApiError', () => {
      const errorDetails = 'Unexpected token s in JSON at position 0'
      const response = {
        ok: false,
        status: 401,
        body: '401 Unauthorized',
        json: async () => { throw new SyntaxError(errorDetails) },
      }
      expect(checkStatus(response)).rejects.toEqual(new UnauthorizedUnknownApiError())
    })

    it('throws ForbiddenUnknownApiError', () => {
      const errorDetails = 'Unexpected token s in JSON at position 0'
      const response = {
        ok: false,
        status: 403,
        body: '403 Forbidden',
        json: async () => { throw new SyntaxError(errorDetails) },
      }
      expect(checkStatus(response)).rejects.toEqual(new ForbiddenUnknownApiError())
    })

    it('throws UnknownApiError', () => {
      const errorDetails = 'Unexpected token s in JSON at position 0'
      const response = {
        ok: false,
        status: 502,
        body: '502 Service Unavailable',
        json: async () => { throw new SyntaxError(errorDetails) },
      }
      expect(checkStatus(response)).rejects.toEqual(new UnknownApiError('Something went wrong'))
    })

    it('throws ApiError', () => {
      const errorDetails = {
        errorType: 'ERR_BAD_REQUEST',
        errors: [
          {
            message: 'Not valid parameters',
            code: 1,
          },
        ],
      }
      const response = {
        ok: false,
        status: 400,
        body: JSON.stringify(errorDetails),
        json: async () => errorDetails,
      }
      expect(checkStatus(response)).rejects.toEqual(new ApiError(errorDetails))
    })
  })
})

describe('parseJSON', () => {
  it('calls response.json', async () => {
    const response = {
      ok: true,
      json: jest.fn(() => Promise.resolve('foo')),
      headers: { get: jest.fn().mockReturnValue(1) },
    }
    const responseJson = await parseJSON(response)
    expect(response.json).toBeCalled()
    expect(response.headers.get).toBeCalled()
    expect(responseJson).toEqual({ headers: { 'X-Total-Count': 1 }, json: 'foo' })
  })

  it('calls response.json and parse total page headers X-Total-Count', async () => {
    const response = {
      ok: true,
      json: jest.fn(() => Promise.resolve('foo')),
      headers: { get: jest.fn().mockImplementation(headerName => ({ 'X-Total-Count': 1 }[headerName])) },
    }
    const responseJson = await parseJSON(response)
    expect(responseJson).toEqual({ headers: { 'X-Total-Count': 1 }, json: 'foo' })
  })

  it('calls response.json and parse total page headers x-total-count', async () => {
    const response = {
      ok: true,
      json: jest.fn(() => Promise.resolve('foo')),
      headers: { get: jest.fn().mockImplementation(headerName => ({ 'x-total-count': 2 }[headerName])) },
    }
    const responseJson = await parseJSON(response)
    expect(responseJson).toEqual({ headers: { 'X-Total-Count': 2 }, json: 'foo' })
  })

  it('calls response.json and parse total page headers X-Pagination-Total-Count', async () => {
    const response = {
      ok: true,
      json: jest.fn(() => Promise.resolve('foo')),
      headers: { get: jest.fn().mockImplementation(headerName => ({ 'X-Pagination-Total-Count': 3 }[headerName])) },
    }
    const responseJson = await parseJSON(response)
    expect(responseJson).toEqual({ headers: { 'X-Total-Count': 3 }, json: 'foo' })
  })

  it('calls response.json and parse total page headers x-pagination-total-count', async () => {
    const response = {
      ok: true,
      json: jest.fn(() => Promise.resolve('foo')),
      headers: { get: jest.fn().mockImplementation(headerName => ({ 'x-pagination-total-count': 4 }[headerName])) },
    }
    const responseJson = await parseJSON(response)
    expect(responseJson).toEqual({ headers: { 'X-Total-Count': 4 }, json: 'foo' })
  })
})

describe('parseSettings', () => {
  it('has method get by default', () => {
    expect(parseSettings().method).toBe('get')
  })

  it('has normal body', () => {
    expect(parseSettings({ body: 'foo' }).body).toBe('foo')
  })

  it('has data body', () => {
    expect(parseSettings({ data: { foo: 'bar' } }).body)
      .toBe(JSON.stringify({ foo: 'bar' }))
  })

  it('has passed method', () => {
    expect(parseSettings({ method: 'post' }).method).toBe('post')
  })

  it('merges headers', () => {
    const otherSettings = { headers: { foo: 'bar' } }
    const settings = parseSettings(otherSettings)
    expect(settings).toHaveProperty('headers.foo', 'bar')
    expect(Object.keys(settings.headers).length)
      .toBeGreaterThan(Object.keys(otherSettings.headers).length)
  })
})

describe('parseEndpoint', () => {
  it('appends endpoint to apiUrl', () => {
    expect(parseEndpoint('/foo')).toBe('https://api.foo.com/foo')
  })

  it('parses params', () => {
    expect(parseEndpoint('/foo', { bar: 'baz' })).toBe('https://api.foo.com/foo?bar=baz')
  })

  it('parses url other than apiUrl', () => {
    expect(parseEndpoint('https://foo.bar/baz')).toBe('https://foo.bar/baz')
  })
})

describe('api', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: jest.fn(() => Promise.resolve({})),
      headers: { get: jest.fn().mockReturnValue(0) },
    }))
  })

  test('request', async () => {
    expect(global.fetch).not.toBeCalled()
    await api.request('/foo')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.foo.com/foo',
      expect.objectContaining({
        method: 'get',
      })
    )
  })

  ;['delete', 'get', 'post', 'put', 'patch'].forEach((method) => {
    test(method, async () => {
      expect(global.fetch).not.toBeCalled()
      await api[method]('/foo')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.foo.com/foo',
        expect.objectContaining({ method })
      )
    })
  })

  describe('create', () => {
    beforeEach(() => {
      api.request = jest.fn()
    })

    it('creates without arguments', () => {
      api.create()
    })

    it('has settings', () => {
      expect(api.create({ foo: 'bar' }).settings).toEqual({ foo: 'bar' })
    })

    test('setToken', () => {
      const obj = api.create({ headers: { foo: 'bar' } })
      obj.setToken('token')
      expect(obj.settings).toEqual({
        headers: {
          foo: 'bar',
          Authorization: 'Bearer token',
        },
      })
    })

    test('unsetToken', () => {
      const obj = api.create({
        headers: {
          foo: 'bar',
          Authorization: 'Bearer token',
        },
      })
      obj.unsetToken()
      expect(obj.settings).toEqual({ headers: { foo: 'bar' } })
    })

    test('request', () => {
      const obj = api.create({ foo: 'bar' })
      expect(api.request).not.toBeCalled()
      obj.request('/foo', { baz: 'qux' })
      expect(api.request).toHaveBeenCalledWith('/foo', {
        foo: 'bar',
        baz: 'qux',
      })
    })

    ;['get', 'delete'].forEach((method) => {
      test(method, () => {
        const obj = api.create({ foo: 'bar' })
        expect(api.request).not.toBeCalled()
        obj[method]('/foo', { baz: 'qux' })
        expect(api.request).toHaveBeenCalledWith('/foo', {
          foo: 'bar',
          baz: 'qux',
          method,
        })
      })
    })

    ;['post', 'put', 'patch'].forEach((method) => {
      test(method, () => {
        const obj = api.create({ foo: 'bar' })
        expect(api.request).not.toBeCalled()
        obj[method]('/foo', { field: 'value' }, { baz: 'qux' })
        expect(api.request).toHaveBeenCalledWith('/foo', {
          foo: 'bar',
          baz: 'qux',
          data: {
            field: 'value',
          },
          method,
        })
      })
    })
  })
})
