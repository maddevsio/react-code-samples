// https://github.com/diegohaz/arc/wiki/Selectors#unit-testing-selectors
// https://github.com/diegohaz/arc/wiki/Example-redux-modules#resource
import * as selectors from './selectors'

const altState = {
  resources: {
    list: [1, 2, 3],
    detail: 1,
    selection: new Set([1]),
  },
  others: {
    list: [1, 2, 3],
    detail: 1,
    selection: new Set([1, 2, 3]),
  },
}

test('initialState', () => {
  expect(selectors.initialState).toEqual({})
})

test('initialResourceState', () => {
  expect(selectors.initialResourceState).toEqual({
    list: [],
    detail: null,
    filter: {},
    pagination: {
      numberOfRows: 50,
      page: 1,
      rowsPerPage: [50, 100, 150],
      total: 0,
    },
    selection: new Set(),
  })
})

test('getResourceState', () => {
  expect(selectors.getResourceState()).toEqual(selectors.initialResourceState)
  expect(selectors.getResourceState(undefined, 'resources')).toEqual(selectors.initialResourceState)
  expect(selectors.getResourceState(altState, 'resources')).toEqual(altState.resources)
})

test('getList', () => {
  expect(selectors.getList()).toEqual(selectors.initialResourceState.list)
  expect(selectors.getList({})).toEqual(selectors.initialResourceState.list)
  expect(selectors.getList(undefined, 'resources')).toEqual(selectors.initialResourceState.list)
  expect(selectors.getList(altState, 'resources')).toEqual(altState.resources.list)
})

test('getDetail', () => {
  expect(selectors.getDetail()).toEqual(selectors.initialResourceState.detail)
  expect(selectors.getDetail({})).toEqual(selectors.initialResourceState.detail)
  expect(selectors.getDetail(undefined, 'resources')).toEqual(selectors.initialResourceState.detail)
  expect(selectors.getDetail(altState, 'resources')).toEqual(altState.resources.detail)
})

test('getSelection', () => {
  expect(selectors.getSelection()).toEqual(new Set())
  expect(selectors.getSelection({}, 'others')).toEqual(new Set())
  expect(selectors.getSelection({}, 'resources')).toEqual(new Set())
  expect(selectors.getSelection(altState, 'others')).toEqual(new Set([1, 2, 3]))
  expect(selectors.getSelection(altState, 'resources')).toEqual(new Set([1]))
})

test('getResourceState should clone default resource state', () => {
  const birdsSelection = selectors.getResourceState({}, 'birds')
  const defaultResourceState = { detail: null, filter: {}, list: [], pagination: { numberOfRows: 50, page: 1, rowsPerPage: [50, 100, 150], total: 0 }, selection: new Set() }
  expect(birdsSelection).toEqual(defaultResourceState)
  birdsSelection.selection.add(1)
  birdsSelection.list.push(1)
  expect(selectors.getResourceState({}, 'animals')).toEqual(defaultResourceState)
})
