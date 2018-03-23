// https://github.com/diegohaz/arc/wiki/Reducers
// https://github.com/diegohaz/arc/wiki/Example-redux-modules#resource
import findIndex from 'lodash/findIndex'
import get from 'lodash/get'
import omitBy from 'lodash/omitBy'
import isNil from 'lodash/isNil'

import {
  initialState,
  getResourceState,
  getList,
  getDetail,
  getPagination,
  getListFilter,
  getSelection,
} from './selectors'

import {
  RESOURCE_CREATE_SUCCESS,
  RESOURCE_LIST_READ_REQUEST,
  RESOURCE_LIST_READ_SUCCESS,
  RESOURCE_DETAIL_READ_REQUEST,
  RESOURCE_DETAIL_CLEAR,
  RESOURCE_LIST_CLEAR,
  RESOURCE_DETAIL_READ_SUCCESS,
  RESOURCE_UPDATE_SUCCESS,
  RESOURCE_DELETE_SUCCESS,
  PAGINATION_INIT,
  PAGINATION_CHANGE_PAGE,
  PAGINATION_CHANGE_ROWS_PER_PAGE,
  FILTER_LIST_CHANGED,
  FILTER_LIST_CLEAR,
  SELECTION_LIST_ADD,
  SELECTION_LIST_CLEAR,
  SELECTION_LIST_REMOVE,
} from './actions'

const fixPageNumber = (pagination, total) => ({
  ...pagination,
  total,
})

const updateOrDeleteReducer = (state, { type, payload, meta }) => {
  const resource = get(meta, 'resource')
  const needle = get(meta, 'request.needle')
  const needleIsObject = typeof needle === 'object'
  const list = getList(state, resource)
  const index = needleIsObject ? findIndex(list, needle) : list.indexOf(needle)

  if (index < 0) {
    return state
  }

  switch (type) {
    case RESOURCE_UPDATE_SUCCESS:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: [
            ...list.slice(0, index),
            needleIsObject ? { ...list[index], ...payload } : payload,
            ...list.slice(index + 1),
          ],
        },
      }
    case RESOURCE_DELETE_SUCCESS:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: [
            ...list.slice(0, index),
            ...list.slice(index + 1),
          ],
        },
      }
    // istanbul ignore next
    default:
      return state
  }
}

export default (state = initialState, { type, payload, meta }) => {
  const resource = get(meta, 'resource')
  const headers = get(meta, 'response.headers', {})

  if (!resource) {
    return state
  }

  switch (type) {
    case RESOURCE_CREATE_SUCCESS:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: [payload, ...getList(state, resource)],
        },
      }

    case RESOURCE_LIST_READ_REQUEST:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: getList(initialState, resource),
        },
      }
    case RESOURCE_LIST_CLEAR:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: [],
        },
      }
    case RESOURCE_LIST_READ_SUCCESS: {
      const total = headers['X-Total-Count'] || 0
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          list: payload,
          pagination:
            fixPageNumber(getPagination(state, resource), total),
        },
      }
    }
    case RESOURCE_DETAIL_READ_REQUEST:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          detail: getDetail(initialState, resource),
        },
      }
    case RESOURCE_DETAIL_READ_SUCCESS:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          detail: payload,
        },
      }
    case RESOURCE_DETAIL_CLEAR:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          detail: null,
        },
      }
    case RESOURCE_UPDATE_SUCCESS:
    case RESOURCE_DELETE_SUCCESS:
      return updateOrDeleteReducer(state, { type, payload, meta })
    case PAGINATION_CHANGE_ROWS_PER_PAGE:
    case PAGINATION_CHANGE_PAGE:
    case PAGINATION_INIT:
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          pagination: {
            ...getPagination(state, resource),
            ...payload,
          },
        },
      }
    case FILTER_LIST_CHANGED: {
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          filter: omitBy({
            ...getListFilter(state, resource),
            ...payload,
          }, v => isNil(v) || String(v) === ''),
        },
      }
    }
    case FILTER_LIST_CLEAR: {
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          filter: {},
        },
      }
    }
    case SELECTION_LIST_ADD: {
      const ids = get(payload, 'ids', [])
      const selection = getSelection(state, resource)
      ids.forEach(id => selection.add(id))
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          selection,
        },
      }
    }
    case SELECTION_LIST_REMOVE: {
      const ids = get(payload, 'ids', [])
      const selection = getSelection(state, resource)
      ids.forEach(id => selection.delete(id))
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          selection,
        },
      }
    }
    case SELECTION_LIST_CLEAR: {
      return {
        ...state,
        [resource]: {
          ...getResourceState(state, resource),
          selection: new Set(),
        },
      }
    }
    default:
      return state
  }
}
