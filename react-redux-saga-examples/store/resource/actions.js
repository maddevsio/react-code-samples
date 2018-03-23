// https://github.com/diegohaz/arc/wiki/Actions
// https://github.com/diegohaz/arc/wiki/Example-redux-modules#resource
export const RESOURCE_CREATE_REQUEST = 'RESOURCE_CREATE_REQUEST'
export const RESOURCE_CREATE_REQUEST_ASYNC = 'RESOURCE_CREATE_REQUEST_ASYNC'
export const RESOURCE_CREATE_SUCCESS = 'RESOURCE_CREATE_SUCCESS'
export const RESOURCE_CREATE_FAILURE = 'RESOURCE_CREATE_FAILURE'

export const resourceCreateRequest = (resource, data) => ({
  type: RESOURCE_CREATE_REQUEST,
  payload: { data },
  meta: {
    resource,
    // https://github.com/diegohaz/arc/wiki/Actions#async-actions
    thunk: `${resource}Create`,
  },
})

export const resourceCreateRequestAsync = (dispatch, resource, data) => (
  new Promise((resolve, reject) => {
    dispatch({
      type: RESOURCE_CREATE_REQUEST_ASYNC,
      payload: { data },
      meta: {
        resource,
        defer: { resolve, reject },
        // https://github.com/diegohaz/arc/wiki/Actions#async-actions
        thunk: `${resource}Create`,
      },
    })
  })
)

export const resourceCreateSuccess = (resource, detail, request, thunk) => ({
  type: RESOURCE_CREATE_SUCCESS,
  payload: detail,
  meta: {
    request,
    thunk,
    resource,
    // https://github.com/diegohaz/arc/wiki/Example-redux-modules#entities
    entities: resource,
  },
})

export const resourceCreateFailure = (resource, error, request, thunk) => ({
  type: RESOURCE_CREATE_FAILURE,
  error: true,
  payload: error,
  meta: {
    request,
    resource,
    // https://github.com/diegohaz/arc/wiki/Actions#async-actions
    thunk,
  },
})

export const RESOURCE_LIST_READ_REQUEST = 'RESOURCE_LIST_READ_REQUEST'
export const RESOURCE_LIST_READ_REQUEST_ASYNC = 'RESOURCE_LIST_READ_REQUEST_ASYNC'
export const RESOURCE_LIST_CLEAR = 'RESOURCE_LIST_CLEAR'
export const RESOURCE_LIST_READ_SUCCESS = 'RESOURCE_LIST_READ_SUCCESS'
export const RESOURCE_LIST_READ_FAILURE = 'RESOURCE_LIST_READ_FAILURE'

export const resourceListReadRequest = (resource, params, resourceAlias) => ({
  type: RESOURCE_LIST_READ_REQUEST,
  payload: { params },
  meta: {
    resource,
    resourceAlias,
    thunk: `${resource}ListRead`,
  },
})

export const resourceListReadRequestAsync = (dispatch, resource, params, resourceAlias) => (
  new Promise((resolve, reject) => dispatch({
    type: RESOURCE_LIST_READ_REQUEST_ASYNC,
    payload: { params },
    meta: {
      resource,
      resourceAlias,
      defer: { resolve, reject },
      thunk: `${resource}ListRead`,
    },
  })))

export const resourceListClear = resource => ({
  type: RESOURCE_LIST_CLEAR,
  payload: [],
  meta: {
    resource,
    thunk: `${resource}ListClear`,
  },
})

export const resourceListReadSuccess = (resource, list, request, response, thunk) => ({
  type: RESOURCE_LIST_READ_SUCCESS,
  payload: list,
  meta: {
    request,
    response,
    thunk,
    resource,
    entities: resource,
  },
})

export const resourceListReadFailure = (resource, error, request, thunk) => ({
  type: RESOURCE_LIST_READ_FAILURE,
  error: true,
  payload: error,
  meta: {
    request,
    thunk,
    resource,
  },
})

export const RESOURCE_DETAIL_READ_REQUEST = 'RESOURCE_DETAIL_READ_REQUEST'
export const RESOURCE_DETAIL_CLEAR = 'RESOURCE_DETAIL_CLEAR'
export const RESOURCE_DETAIL_READ_SUCCESS = 'RESOURCE_DETAIL_READ_SUCCESS'
export const RESOURCE_DETAIL_READ_FAILURE = 'RESOURCE_DETAIL_READ_FAILURE'

export const resourceDetailReadRequest = (resource, needle, params, resourceAlias) => ({
  type: RESOURCE_DETAIL_READ_REQUEST,
  payload: { needle, params },
  meta: {
    resource,
    resourceAlias,
    thunk: `${resource}DetailRead`,
  },
})

export const resourceDetailClear = resource => ({
  type: RESOURCE_DETAIL_CLEAR,
  payload: {},
  meta: {
    resource,
    thunk: `${resource}DetailClear`,
  },
})

export const resourceDetailReadSuccess = (resource, detail, request, thunk) => ({
  type: RESOURCE_DETAIL_READ_SUCCESS,
  payload: detail,
  meta: {
    request,
    thunk,
    resource,
    entities: resource,
  },
})

export const resourceDetailReadFailure = (resource, error, request, thunk) => ({
  type: RESOURCE_DETAIL_READ_FAILURE,
  error: true,
  payload: error,
  meta: {
    request,
    thunk,
    resource,
  },
})

export const RESOURCE_UPDATE_REQUEST = 'RESOURCE_UPDATE_REQUEST'
export const RESOURCE_UPDATE_SUCCESS = 'RESOURCE_UPDATE_SUCCESS'
export const RESOURCE_UPDATE_FAILURE = 'RESOURCE_UPDATE_FAILURE'

export const resourceUpdateRequest = (resource, needle, data, resourceAlias) => ({
  type: RESOURCE_UPDATE_REQUEST,
  payload: { needle, data },
  meta: {
    resource,
    resourceAlias,
    thunk: `${resource}Update`,
  },
})

export const resourceUpdateSuccess = (resource, detail, request, thunk) => ({
  type: RESOURCE_UPDATE_SUCCESS,
  payload: detail,
  meta: {
    request,
    thunk,
    resource,
    entities: resource,
  },
})

export const resourceUpdateFailure = (resource, error, request, thunk) => ({
  type: RESOURCE_UPDATE_FAILURE,
  error: true,
  payload: error,
  meta: {
    request,
    thunk,
    resource,
  },
})

export const RESOURCE_DELETE_REQUEST = 'RESOURCE_DELETE_REQUEST'
export const RESOURCE_DELETE_SUCCESS = 'RESOURCE_DELETE_SUCCESS'
export const RESOURCE_DELETE_FAILURE = 'RESOURCE_DELETE_FAILURE'

export const resourceDeleteRequest = (resource, needle, resourceAlias) => ({
  type: RESOURCE_DELETE_REQUEST,
  payload: { needle },
  meta: {
    resource,
    resourceAlias,
    thunk: `${resource}Delete`,
  },
})

export const resourceDeleteSuccess = (resource, request, thunk) => ({
  type: RESOURCE_DELETE_SUCCESS,
  meta: {
    request,
    thunk,
    resource,
  },
})

export const resourceDeleteFailure = (resource, error, request, thunk) => ({
  type: RESOURCE_DELETE_FAILURE,
  error: true,
  payload: error,
  meta: {
    request,
    thunk,
    resource,
  },
})

// ReduxForm actions for resources
export const FORM_SUBMIT = 'FORM_SUBMIT'

export const formCreateSubmit = (form, resource, data, defer) => ({
  type: FORM_SUBMIT,
  payload: { data },
  meta: {
    form,
    action: 'create',
    resource,
    defer,
    // https://github.com/diegohaz/arc/wiki/Actions#async-actions
    thunk: `${resource}Create`,
  },
})

export const formUpdateSubmit = (form, resource, needle, data, defer, resourceAlias) => ({
  type: FORM_SUBMIT,
  payload: { needle, data },
  meta: {
    form,
    action: 'update',
    resource,
    defer,
    resourceAlias,
    // https://github.com/diegohaz/arc/wiki/Actions#async-actions
    thunk: `${resource}Update`,
  },
})

export const formCreateSubmitAsync = (dispatch, form, resource, data) => (
  new Promise((resolve, reject) => {
    dispatch(formCreateSubmit(form, resource, data, { resolve, reject }))
  })
)

export const formUpdateSubmitAsync = (dispatch, form, resource, needle, data) => (
  new Promise((resolve, reject) => {
    dispatch(formUpdateSubmit(form, resource, needle, data, { resolve, reject }))
  })
)

export const PAGINATION_INIT = 'PAGINATION_INIT'
export const PAGINATION_CHANGE_PAGE = 'PAGINATION_CHANGE_PAGE'
export const PAGINATION_CHANGE_ROWS_PER_PAGE = 'PAGINATION_CHANGE_ROWS_PER_PAGE'

export const paginationInit = (resource, { total, page, rowsPerPage, numberOfRows }) => ({
  type: PAGINATION_INIT,
  payload: {
    total,
    page,
    rowsPerPage,
    numberOfRows,
  },
  meta: {
    resource,
  },
})

export const paginationChangePage = (resource, page) => ({
  type: PAGINATION_CHANGE_PAGE,
  payload: {
    page,
  },
  meta: {
    resource,
  },
})

export const paginationChangeRowsPerPage = (resource, numberOfRows, page) => ({
  type: PAGINATION_CHANGE_ROWS_PER_PAGE,
  payload: {
    numberOfRows,
    page,
  },
  meta: {
    resource,
  },
})

export const FILTER_LIST_CHANGED = 'FILTER_LIST_CHANGED'

export const filterListChanged = (resource, filters) => ({
  type: FILTER_LIST_CHANGED,
  payload: {
    ...filters,
  },
  meta: {
    resource,
  },
})

export const FILTER_LIST_CLEAR = 'FILTER_LIST_CLEAR'

export const filterListClear = resource => ({
  type: FILTER_LIST_CLEAR,
  payload: {},
  meta: {
    resource,
  },
})

export const SELECTION_LIST_ADD = 'SELECTION_LIST_ADD'

export const selectionListAdd = (resource, ids) => ({
  type: SELECTION_LIST_ADD,
  payload: {
    ids,
  },
  meta: {
    resource,
  },
})

export const SELECTION_LIST_REMOVE = 'SELECTION_LIST_REMOVE'

export const selectionListRemove = (resource, ids) => ({
  type: SELECTION_LIST_REMOVE,
  payload: {
    ids,
  },
  meta: {
    resource,
  },
})

export const SELECTION_LIST_CLEAR = 'SELECTION_LIST_CLEAR'

export const selectionListClear = resource => ({
  type: SELECTION_LIST_CLEAR,
  payload: {},
  meta: {
    resource,
  },
})
