// https://github.com/diegohaz/arc/wiki/Sagas
// https://github.com/diegohaz/arc/wiki/Example-redux-modules#resourcer
import { delay } from 'redux-saga'
import { take, put, call, takeEvery, race } from 'redux-saga/effects'
import { SubmissionError } from 'redux-form'
import {
  UnauthorizedApiError,
  UnauthorizedUnknownApiError,
  ForbiddenApiError,
  ForbiddenUnknownApiError,
} from 'errors'
import * as actions from './actions'

const extractError = e => (e.jsonError && e.jsonError) || e

const RETRY_COUNT = 5
const RETRY_DELAY = 2000

export function* retry(retryCount, api, method, ...args) {
  for (let i = 0; i < retryCount; i += 1) {
    try {
      const response = yield call([api, api[method]], ...args)
      return response
    } catch (err) {
      if (err instanceof UnauthorizedApiError ||
          err instanceof UnauthorizedUnknownApiError ||
          err instanceof ForbiddenApiError ||
          err instanceof ForbiddenUnknownApiError) {
        if (i < retryCount - 1) {
          yield call(delay, RETRY_DELAY * retryCount)
        } else {
          throw err
        }
      } else {
        throw err
      }
    }
  }
  return new Error('Retry error')
}

export function* createResource(api, tokenSeeker, { data }, { resource, thunk }) {
  try {
    yield call([tokenSeeker, tokenSeeker.isReceived])
    // https://github.com/diegohaz/arc/wiki/API-service
    const { json, headers } = yield call(retry, RETRY_COUNT, api, 'post', `/${resource}`, data)
    // https://github.com/diegohaz/arc/wiki/Actions#async-actions
    yield put(actions.resourceCreateSuccess(resource, json, { data, headers }, thunk))
  } catch (e) {
    yield put(actions.resourceCreateFailure(resource, extractError(e), { data }, thunk))
  }
}

export function* readResourceList(api, tokenSeeker, { params }, { resource, resourceAlias, thunk }) {
  try {
    yield call([tokenSeeker, tokenSeeker.isReceived])
    const { json, headers } = yield call(retry, RETRY_COUNT, api, 'get', `/${resourceAlias || resource}`, { params })
    yield put(actions.resourceListReadSuccess(resource, json, { params }, { headers }, thunk))
  } catch (e) {
    yield put(actions.resourceListReadFailure(resource, e, { params }, thunk))
  }
}

export function* readResourceDetail(api, tokenSeeker, { needle, params }, { resource, thunk, resourceAlias }) {
  try {
    yield call([tokenSeeker, tokenSeeker.isReceived])
    const { json } = yield call(retry, RETRY_COUNT, api, 'get', `/${resourceAlias || resource}/${needle}`, { params })
    yield put(actions.resourceDetailReadSuccess(resource, json, { needle, params }, thunk))
  } catch (e) {
    yield put(actions.resourceDetailReadFailure(resource, e, { needle, params }, thunk))
  }
}

export function* updateResource(api, tokenSeeker, { needle, data }, { resource, thunk, resourceAlias }) {
  try {
    yield call([tokenSeeker, tokenSeeker.isReceived])
    const { json } = yield call(retry, RETRY_COUNT, api, 'put', `/${resourceAlias || resource}/${needle}`, data)
    yield put(actions.resourceUpdateSuccess(resource, json, { needle, data }, thunk))
  } catch (e) {
    yield put(actions.resourceUpdateFailure(resource, e, { needle, data }, thunk))
  }
}

export function* deleteResource(api, tokenSeeker, { needle }, { resource, thunk, resourceAlias }) {
  try {
    yield call([tokenSeeker, tokenSeeker.isReceived])
    yield call(retry, RETRY_COUNT, api, 'delete', `/${resourceAlias || resource}/${needle}`)
    yield put(actions.resourceDeleteSuccess(resource, { needle }, thunk))
  } catch (e) {
    yield put(actions.resourceDeleteFailure(resource, e, { needle }, thunk))
  }
}

export function* formSubmitWorker(api, tokenSeeker, payload, { form, action, defer, ...otherMeta }) {
  const FORM_ACTION_NAME = action.toUpperCase()
  const formActionName = action.toLowerCase()
  const apiAction = {
    create: createResource,
    update: updateResource,
  }[formActionName]

  yield call(apiAction, api, tokenSeeker, payload, otherMeta)

  const { failure, success } = yield race({
    success: take(actions[`RESOURCE_${FORM_ACTION_NAME}_SUCCESS`]),
    failure: take(actions[`RESOURCE_${FORM_ACTION_NAME}_FAILURE`]),
  })

  if (failure) {
    const { payload } = failure
    yield call(defer.reject,
      new SubmissionError({ _error: payload.message }))
  } else {
    const { entity } = success
    yield call(defer.resolve, entity)
  }
}

export function* createResourceAsync(api, tokenSeeker, payload, { defer, ...otherMeta }) {
  yield call(createResource, api, tokenSeeker, payload, otherMeta)

  const { failure, success } = yield race({
    success: take(actions.RESOURCE_CREATE_SUCCESS),
    failure: take(actions.RESOURCE_CREATE_FAILURE),
  })

  if (failure) {
    const { payload } = failure
    yield call(defer.reject, payload)
  } else {
    const { entity } = success
    yield call(defer.resolve, entity)
  }
}

export function* readResourceListAsync(api, tokenSeeker, payload, { defer, ...otherMeta }) {
  yield call(readResourceList, api, tokenSeeker, payload, otherMeta)

  const { failure, success } = yield race({
    success: take(actions.RESOURCE_LIST_READ_SUCCESS),
    failure: take(actions.RESOURCE_LIST_READ_FAILURE),
  })

  if (failure) {
    const { payload } = failure
    yield call(defer.reject, payload)
  } else {
    const { payload } = success
    yield call(defer.resolve, payload)
  }
}

export function* watchResourceCreateRequest(api, tokenSeeker, { payload, meta }) {
  yield call(createResource, api, tokenSeeker, payload, meta)
}

export function* watchResourceListReadRequest(api, tokenSeeker, { payload, meta }) {
  yield call(readResourceList, api, tokenSeeker, payload, meta)
}

export function* watchResourceDetailReadRequest(api, tokenSeeker, { payload, meta }) {
  yield call(readResourceDetail, api, tokenSeeker, payload, meta)
}

export function* watchResourceUpdateRequest(api, tokenSeeker, { payload, meta }) {
  yield call(updateResource, api, tokenSeeker, payload, meta)
}

export function* watchResourceDeleteRequest(api, tokenSeeker, { payload, meta }) {
  yield call(deleteResource, api, tokenSeeker, payload, meta)
}

export function* watchFormSubmitRequest(api, tokenSeeker, { payload, meta }) {
  yield call(formSubmitWorker, api, tokenSeeker, payload, meta)
}

export function* watchCreateResourceAsyncRequest(api, tokenSeeker, { payload, meta }) {
  yield call(createResourceAsync, api, tokenSeeker, payload, meta)
}

export function* watchResourceListReadAsyncRequest(api, tokenSeeker, { payload, meta }) {
  yield call(readResourceListAsync, api, tokenSeeker, payload, meta)
}


export default function* ({ api, tokenSeeker }) {
  yield takeEvery(actions.RESOURCE_CREATE_REQUEST, watchResourceCreateRequest, api, tokenSeeker)
  yield takeEvery(actions.RESOURCE_LIST_READ_REQUEST, watchResourceListReadRequest, api, tokenSeeker)
  yield takeEvery(actions.RESOURCE_DETAIL_READ_REQUEST, watchResourceDetailReadRequest, api, tokenSeeker)
  yield takeEvery(actions.RESOURCE_UPDATE_REQUEST, watchResourceUpdateRequest, api, tokenSeeker)
  yield takeEvery(actions.RESOURCE_DELETE_REQUEST, watchResourceDeleteRequest, api, tokenSeeker)
  yield takeEvery(actions.FORM_SUBMIT, watchFormSubmitRequest, api, tokenSeeker)
  yield takeEvery(actions.RESOURCE_CREATE_REQUEST_ASYNC, watchCreateResourceAsyncRequest, api, tokenSeeker)
  yield takeEvery(actions.RESOURCE_LIST_READ_REQUEST_ASYNC, watchResourceListReadAsyncRequest, api, tokenSeeker)
}
