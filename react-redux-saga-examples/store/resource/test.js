// https://github.com/diegohaz/arc/wiki/Testing-redux-modules
// https://github.com/diegohaz/arc/wiki/Example-redux-modules#resource
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import delay from 'delay'
import reducer from './reducer'
import sagas from './sagas'
import {
  resourceCreateRequest,
  resourceListReadRequest,
  resourceDetailReadRequest,
  resourceUpdateRequest,
  resourceDeleteRequest,
  selectionListAdd,
  selectionListRemove,
  selectionListClear,
} from './actions'
import { getList, getDetail, getSelection } from './selectors'

const sagaMiddleware = createSagaMiddleware()

const api = {
  post: (path, data) => Promise.resolve({ json: data, headers: {} }),
  get: () => Promise.resolve({ json: [1, 2, 3], headers: {} }),
  put: (path, data) => Promise.resolve({ json: data, headers: {} }),
  delete: () => Promise.resolve(),
}

const getStore = (initialState) => {
  const tokenSeeker = { isReceived: jest.fn().mockReturnValue(Promise.resolve()) }
  const store = createStore(reducer, initialState, applyMiddleware(sagaMiddleware))
  sagaMiddleware.run(sagas, { api, tokenSeeker })
  return store
}

describe('resource', () => {
  test('resourceCreateRequest', async () => {
    const { getState, dispatch } = getStore()

    expect(getList(getState(), 'resources')).toEqual([])

    dispatch(resourceCreateRequest('resources', { title: 'foo' }))
    await delay()
    expect(getList(getState(), 'resources')).toEqual([{ title: 'foo' }])

    dispatch(resourceCreateRequest('resources', { title: 'bar' }))
    await delay()
    expect(getList(getState(), 'resources')).toEqual([{ title: 'bar' }, { title: 'foo' }])
  })

  test('resourceListReadRequest', async () => {
    const { getState, dispatch } = getStore()

    expect(getList(getState(), 'resources')).toEqual([])

    dispatch(resourceListReadRequest('resources'))
    await delay()
    expect(getList(getState(), 'resources')).toEqual([1, 2, 3])

    dispatch(resourceListReadRequest('resources'))
    await delay()
    expect(getList(getState(), 'resources')).toEqual([1, 2, 3])
  })

  test('resourceDetailReadRequest', async () => {
    const { getState, dispatch } = getStore()

    expect(getDetail(getState(), 'resources')).toBeNull()

    dispatch(resourceDetailReadRequest('resources'))
    await delay()
    expect(getDetail(getState(), 'resources')).toEqual([1, 2, 3])

    dispatch(resourceDetailReadRequest('resources'))
    await delay()
    expect(getDetail(getState(), 'resources')).toEqual([1, 2, 3])
  })

  test('resourceUpdateRequest', async () => {
    const { getState, dispatch } = getStore({ resources: { list: [1, 2, 3] } })

    expect(getList(getState(), 'resources')).toEqual([1, 2, 3])

    dispatch(resourceUpdateRequest('resources', 1, 4))
    await delay()
    expect(getList(getState(), 'resources')).toEqual([4, 2, 3])

    dispatch(resourceUpdateRequest('resources', 4, { title: 'foo' }))
    await delay()
    expect(getList(getState(), 'resources')).toEqual([{ title: 'foo' }, 2, 3])

    dispatch(resourceUpdateRequest('resources', { title: 'foo' }, { foo: 'bar' }))
    await delay()
    expect(getList(getState(), 'resources')).toEqual([{ title: 'foo', foo: 'bar' }, 2, 3])
  })

  test('resourceDeleteRequest', async () => {
    const { getState, dispatch } = getStore({ resources: { list: [1, 2, { foo: 'bar' }] } })

    expect(getList(getState(), 'resources')).toEqual([1, 2, { foo: 'bar' }])

    dispatch(resourceDeleteRequest('resources', 1))
    await delay()
    expect(getList(getState(), 'resources')).toEqual([2, { foo: 'bar' }])

    dispatch(resourceDeleteRequest('resources', { foo: 'bar' }))
    await delay()
    expect(getList(getState(), 'resources')).toEqual([2])
  })

  test('selectionListAdd', () => {
    const { getState, dispatch } = getStore({})

    expect(getSelection(getState(), 'birds')).toEqual(new Set())
    expect(getSelection(getState(), 'animals')).toEqual(new Set())

    dispatch(selectionListAdd('birds', [1, 2]))

    expect(getSelection(getState(), 'birds')).toEqual(new Set([1, 2]))
    expect(getSelection(getState(), 'animals')).toEqual(new Set())
  })

  test('selectionListRemove', () => {
    const { getState, dispatch } = getStore({ birds: { selection: new Set([1, 2, 3, 4, 5]) } })
    expect(getSelection(getState(), 'birds')).toEqual(new Set([1, 2, 3, 4, 5]))

    dispatch(selectionListRemove('birds', [1, 3, 5]))
    expect(getSelection(getState(), 'birds')).toEqual(new Set([2, 4]))
  })

  test('selectionListClear', () => {
    const { getState, dispatch } = getStore({ birds: { selection: new Set([1, 2, 3]) } })
    expect(getSelection(getState(), 'birds')).toEqual(new Set([1, 2, 3]))

    dispatch(selectionListClear('birds'))
    expect(getSelection(getState(), 'birds')).toEqual(new Set())
  })
})
