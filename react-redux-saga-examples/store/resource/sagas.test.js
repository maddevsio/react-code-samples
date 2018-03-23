// https://github.com/diegohaz/arc/wiki/Sagas#unit-testing-sagas
// https://github.com/diegohaz/arc/wiki/Example-redux-modules#resource
import { take, put, call, takeEvery, race } from 'redux-saga/effects'
import * as actions from './actions'
import saga, * as sagas from './sagas'

const api = {
  post: () => {},
  get: () => {},
  put: () => {},
  delete: () => {},
}

const thunk = '123'
const resource = 'resources'
const meta = { thunk, resource }

describe('createResource', () => {
  const payload = { data: 'foo' }
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }

  beforeEach(() => {
    tokenSeeker.isReceived.mockClear()
  })

  it('calls success', () => {
    const detail = 'detail'
    const generator = sagas.createResource(api, tokenSeeker, payload, meta)
    expect(generator.next().value).toEqual(call([tokenSeeker, tokenSeeker.isReceived]))
    expect(generator.next().value)
      .toEqual(call(sagas.retry, 5, api, 'post', `/${resource}`, 'foo'))
    expect(generator.next({ json: detail, headers: { 'X-Total-Count': 1 } }).value)
      .toEqual(put(actions.resourceCreateSuccess(resource, detail,
        { data: 'foo', headers: { 'X-Total-Count': 1 } }, thunk)))
  })

  it('calls failure', () => {
    const generator = sagas.createResource(api, tokenSeeker, payload, meta)
    expect(generator.next().value).toEqual(call([tokenSeeker, tokenSeeker.isReceived]))
    expect(generator.next().value)
      .toEqual(call(sagas.retry, 5, api, 'post', `/${resource}`, 'foo'))
    expect(generator.throw('test').value)
      .toEqual(put(actions.resourceCreateFailure(resource, 'test', payload, thunk)))
  })
})

describe('readResourceList', () => {
  const payload = { params: { _limit: 1 } }
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }

  beforeEach(() => {
    tokenSeeker.isReceived.mockClear()
  })

  it('calls success', () => {
    const detail = [1, 2, 3]
    const generator = sagas.readResourceList(api, tokenSeeker, payload, meta)
    expect(generator.next().value).toEqual(call([tokenSeeker, tokenSeeker.isReceived]))
    expect(generator.next().value)
      .toEqual(call(sagas.retry, 5, api, 'get', `/${resource}`, payload))
    expect(generator.next({ json: detail, headers: { 'X-Total-Count': 1 } }).value)
      .toEqual(put(actions.resourceListReadSuccess(resource, detail, payload,
        { headers: { 'X-Total-Count': 1 } }, thunk)))
  })

  it('calls failure', () => {
    const generator = sagas.readResourceList(api, tokenSeeker, payload, meta)
    expect(generator.next().value).toEqual(call([tokenSeeker, tokenSeeker.isReceived]))
    expect(generator.next().value)
      .toEqual(call(sagas.retry, 5, api, 'get', `/${resource}`, payload))
    expect(generator.throw('test').value)
      .toEqual(put(actions.resourceListReadFailure(resource, 'test', payload, thunk)))
  })
})

describe('readResourceDetail', () => {
  const payload = { needle: 1, params: {} }
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }

  beforeEach(() => {
    tokenSeeker.isReceived.mockClear()
  })

  it('calls success', () => {
    const detail = 'foo'
    const generator = sagas.readResourceDetail(api, tokenSeeker, payload, meta)
    expect(generator.next().value).toEqual(call([tokenSeeker, tokenSeeker.isReceived]))
    expect(generator.next().value)
      .toEqual(call(sagas.retry, 5, api, 'get', `/${resource}/1`, { params: {} }))
    expect(generator.next({ json: detail }).value)
      .toEqual(put(actions.resourceDetailReadSuccess(resource, detail, payload, thunk)))
  })

  it('calls failure', () => {
    const generator = sagas.readResourceDetail(api, tokenSeeker, payload, meta)
    expect(generator.next().value).toEqual(call([tokenSeeker, tokenSeeker.isReceived]))
    expect(generator.next().value)
      .toEqual(call(sagas.retry, 5, api, 'get', `/${resource}/1`, { params: {} }))
    expect(generator.throw('test').value)
      .toEqual(put(actions.resourceDetailReadFailure(resource, 'test', payload, thunk)))
  })
})

describe('updateResource', () => {
  const payload = { needle: 1, data: 'foo' }
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }

  beforeEach(() => {
    tokenSeeker.isReceived.mockClear()
  })

  it('calls success', () => {
    const detail = 'foo'
    const generator = sagas.updateResource(api, tokenSeeker, payload, meta)
    expect(generator.next().value).toEqual(call([tokenSeeker, tokenSeeker.isReceived]))
    expect(generator.next().value)
      .toEqual(call(sagas.retry, 5, api, 'put', `/${resource}/1`, 'foo'))
    expect(generator.next({ json: detail }).value)
      .toEqual(put(actions.resourceUpdateSuccess(resource, detail, payload, thunk)))
  })

  it('calls failure', () => {
    const generator = sagas.updateResource(api, tokenSeeker, payload, meta)
    expect(generator.next().value).toEqual(call([tokenSeeker, tokenSeeker.isReceived]))
    expect(generator.next().value)
      .toEqual(call(sagas.retry, 5, api, 'put', `/${resource}/1`, 'foo'))
    expect(generator.throw('test').value)
      .toEqual(put(actions.resourceUpdateFailure(resource, 'test', payload, thunk)))
  })
})

describe('deleteResource', () => {
  const payload = { needle: 1 }
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }

  beforeEach(() => {
    tokenSeeker.isReceived.mockClear()
  })

  it('calls success', () => {
    const generator = sagas.deleteResource(api, tokenSeeker, payload, meta)
    expect(generator.next().value).toEqual(call([tokenSeeker, tokenSeeker.isReceived]))
    expect(generator.next().value)
      .toEqual(call(sagas.retry, 5, api, 'delete', `/${resource}/1`))
    expect(generator.next().value)
      .toEqual(put(actions.resourceDeleteSuccess(resource, payload, thunk)))
  })

  it('calls failure', () => {
    const generator = sagas.deleteResource(api, tokenSeeker, payload, meta)
    expect(generator.next().value).toEqual(call([tokenSeeker, tokenSeeker.isReceived]))
    expect(generator.next().value)
      .toEqual(call(sagas.retry, 5, api, 'delete', `/${resource}/1`))
    expect(generator.throw('test').value)
      .toEqual(put(actions.resourceDeleteFailure(resource, 'test', payload, thunk)))
  })
})

test('watchResourceCreateRequest', () => {
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }
  const payload = { data: 1 }
  const generator = sagas.watchResourceCreateRequest(api, tokenSeeker, { payload, meta })
  expect(generator.next().value)
    .toEqual(call(sagas.createResource, api, tokenSeeker, payload, meta))
})

test('watchResourceListReadRequest', () => {
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }
  const payload = { params: { _limit: 1 } }
  const generator = sagas.watchResourceListReadRequest(api, tokenSeeker, { payload, meta })
  expect(generator.next({ payload, meta }).value)
    .toEqual(call(sagas.readResourceList, api, tokenSeeker, payload, meta))
})

test('watchResourceDetailReadRequest', () => {
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }
  const payload = { needle: 1 }
  const generator = sagas.watchResourceDetailReadRequest(api, tokenSeeker, { payload, meta })
  expect(generator.next({ payload, meta }).value)
    .toEqual(call(sagas.readResourceDetail, api, tokenSeeker, payload, meta))
})

test('watchResourceUpdateRequest', () => {
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }
  const payload = { needle: 1, data: { id: 1 } }
  const generator = sagas.watchResourceUpdateRequest(api, tokenSeeker, { payload, meta })
  expect(generator.next({ payload, meta }).value)
    .toEqual(call(sagas.updateResource, api, tokenSeeker, payload, meta))
})

test('watchResourceDeleteRequest', () => {
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }
  const payload = { needle: 1 }
  const generator = sagas.watchResourceDeleteRequest(api, tokenSeeker, { payload, meta })
  expect(generator.next({ payload, meta }).value)
    .toEqual(call(sagas.deleteResource, api, tokenSeeker, payload, meta))
})

describe('readResourceListAsync', () => {
  const payload = { params: { _limit: 1 } }
  const defer = { resolve: () => { }, reject: () => { } }
  const successPayload = [{ id: 1 }, { id: 2 }]
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }

  it('calls async success', () => {
    const generator = sagas.readResourceListAsync(api, tokenSeeker, payload, { defer, ...meta })
    expect(generator.next().value).toEqual(call(sagas.readResourceList, api, tokenSeeker, payload, meta))
    expect(generator.next({ success: true }).value).toEqual(race({
      success: take(actions.RESOURCE_LIST_READ_SUCCESS),
      failure: take(actions.RESOURCE_LIST_READ_FAILURE),
    }))
    expect(generator.next(
      { success: { payload: successPayload }, failure: null }
    ).value).toEqual(call(defer.resolve, successPayload))
  })

  it('calls async failed', () => {
    const failedPayload = new Error('Failed err')
    const generator = sagas.readResourceListAsync(api, tokenSeeker, payload, { defer, ...meta })
    expect(generator.next().value).toEqual(call(sagas.readResourceList, api, tokenSeeker, payload, meta))
    expect(generator.next().value).toEqual(race({
      success: take(actions.RESOURCE_LIST_READ_SUCCESS),
      failure: take(actions.RESOURCE_LIST_READ_FAILURE),
    }))
    expect(generator.next(
      { success: null, failure: { payload: failedPayload } }
    ).value).toEqual(call(defer.reject, failedPayload))
  })
})

describe('createResourceAsync', () => {
  const payload = { data: { name: 'some name' } }
  const defer = { resolve: () => { }, reject: () => { } }
  const entity = { id: 1 }
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }

  it('calls async success', () => {
    const generator = sagas.createResourceAsync(api, tokenSeeker, payload, { defer, ...meta })
    expect(generator.next().value).toEqual(call(sagas.createResource, api, tokenSeeker, payload, meta))
    expect(generator.next().value).toEqual(race({
      success: take(actions.RESOURCE_CREATE_SUCCESS),
      failure: take(actions.RESOURCE_CREATE_FAILURE),
    }))
    expect(generator.next(
      { success: { entity }, failure: null }
    ).value).toEqual(call(defer.resolve, entity))
  })

  it('calls async failed', () => {
    const failedPayload = new Error('Failed err')
    const generator = sagas.createResourceAsync(api, tokenSeeker, payload, { defer, ...meta })
    expect(generator.next().value).toEqual(call(sagas.createResource, api, tokenSeeker, payload, meta))
    expect(generator.next().value).toEqual(race({
      success: take(actions.RESOURCE_CREATE_SUCCESS),
      failure: take(actions.RESOURCE_CREATE_FAILURE),
    }))
    expect(generator.next(
      { success: null, failure: { payload: failedPayload } }
    ).value).toEqual(call(defer.reject, failedPayload))
  })
})

test('saga', () => {
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }
  const generator = saga({ api, tokenSeeker })
  expect(generator.next().value).toEqual(takeEvery(actions.RESOURCE_CREATE_REQUEST, sagas.watchResourceCreateRequest, api, tokenSeeker))
  expect(generator.next().value).toEqual(takeEvery(actions.RESOURCE_LIST_READ_REQUEST, sagas.watchResourceListReadRequest, api, tokenSeeker))
  expect(generator.next().value).toEqual(takeEvery(actions.RESOURCE_DETAIL_READ_REQUEST, sagas.watchResourceDetailReadRequest, api, tokenSeeker))
  expect(generator.next().value).toEqual(takeEvery(actions.RESOURCE_UPDATE_REQUEST, sagas.watchResourceUpdateRequest, api, tokenSeeker))
  expect(generator.next().value).toEqual(takeEvery(actions.RESOURCE_DELETE_REQUEST, sagas.watchResourceDeleteRequest, api, tokenSeeker))
  expect(generator.next().value).toEqual(takeEvery(actions.FORM_SUBMIT, sagas.watchFormSubmitRequest, api, tokenSeeker))
  expect(generator.next().value).toEqual(takeEvery(actions.RESOURCE_CREATE_REQUEST_ASYNC, sagas.watchCreateResourceAsyncRequest, api, tokenSeeker))
  expect(generator.next().value).toEqual(takeEvery(actions.RESOURCE_LIST_READ_REQUEST_ASYNC, sagas.watchResourceListReadAsyncRequest, api, tokenSeeker))
})
