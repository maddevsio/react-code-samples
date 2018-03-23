// https://github.com/diegohaz/arc/wiki/Selectors
// https://github.com/diegohaz/arc/wiki/Example-redux-modules#resource
import cloneDeep from 'lodash/cloneDeep'

export const initialState = {}

export const initialResourceState = {
  list: [],
  detail: null,
  pagination: {
    total: 0,
    page: 1,
    rowsPerPage: [50, 100, 150],
    numberOfRows: 50,
  },
  filter: {},
  selection: new Set(),
}

export const getResourceState = (state = initialState, resource) =>
  state[resource] || cloneDeep(initialResourceState)

export const getList = (state = initialState, resource) =>
  getResourceState(state, resource).list

export const getDetail = (state = initialState, resource) =>
  getResourceState(state, resource).detail

export const getPagination = (state = initialState, resource) => getResourceState(state, resource).pagination

export const getListFilter = (state = initialState, resource) =>
  getResourceState(state, resource).filter

export const getSelection = (state = initialState, resource) => getResourceState(state, resource).selection

export const getSelectionArray = (state = initialState, resource) => Array.from(getSelection(state, resource))
