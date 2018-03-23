jest.mock('redux-saga-thunk')
jest.mock('redux-form')
/* eslint-disable import/first */
import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'
import { ApiError } from 'errors'
import { isPending, hasFailed } from 'redux-saga-thunk'
import { formValueSelector } from 'redux-form'
import { fromResource } from 'store/selectors'
import * as actions from 'store/actions'
import { mapDispatchToProps, mapStateToProps, CreateInvoicesButtonContainer } from '../CreateInvoicesButton'
/* eslint-enable import/first */

export const createSelected = (...ids) => (new Set(ids))

export const createProps = (props = {}) => (Object.assign({
  count: 0,
  selected: new Set(),
  loading: false,
  failed: false,
  failedGenerate: false,
  loadingGenerate: false,
  generateInvoicesByIds: jest.fn(),
  parentFormName: 'parentFormName',
  parentModalName: 'parent_modal_name',
}, props))

const dateParams = { year: 2018, month: 1, day: 1, hour: 10, minute: 10, second: 10 }
const dateFrom = moment(dateParams).toISOString()
const dateTo = moment(dateParams).toISOString()
const documentDate = moment(dateParams).toISOString()
const invoiceDate = documentDate
const restaurantIds = [1, 2, 3, 4, 5]
formValueSelector.mockImplementation(formName => (state, name) => (state.form[formName][name]))

const expectedDateFrom = moment(Object.assign({}, dateParams, { hour: 0, minute: 0, second: 0 })).toISOString()
const expectedInvoiceDate = moment(Object.assign({}, dateParams, { hour: 0, minute: 0, second: 0 })).toISOString()
const expectedDateTo = moment(Object.assign({}, dateParams, { hour: 23, minute: 59, second: 59 })).toISOString()
const callParams = { dateFrom: expectedDateFrom, dateTo: expectedDateTo, restaurantIds, invoiceDate: expectedInvoiceDate }
const errContent = {
  errorType: 'ERR_BAD_REQUEST',
  errors: [
    {
      message: 'Some api error',
      code: 1,
    },
  ],
}

const spyResource = jest.spyOn(fromResource, 'getSelection')
isPending.mockImplementation(() => false)
hasFailed.mockImplementation(() => false)

const dispatchSpy = jest.fn().mockImplementation(({ payload, meta }) => {
  if (meta) {
    const { defer } = meta
    if (defer) {
      defer.resolve(payload)
    }
  }
})

const parentModalName = 'parent_modal_name'

describe('CreateInvoicesButton', () => {
  beforeEach(() => {
    spyResource.mockClear()
    isPending.mockClear()
    hasFailed.mockClear()
    formValueSelector.mockClear()
    dispatchSpy.mockClear()
  })

  describe('mapStateToProps', () => {
    it('should return valid state and call appropriate actions', () => {
      const emptyState = {
        resource: {
          restaurants: { selection: new Set([1, 2, 3, 4, 5]) },
        },
        form: {
          someFormName: {
            dateFrom,
            dateTo,
            documentDate,
          },
        },
      }
      const resultState = mapStateToProps(emptyState, { parentFormName: 'someFormName' })
      expect(resultState).toEqual({
        count: 5,
        selected: new Set([1, 2, 3, 4, 5]),
        loading: false,
        failed: false,
        loadingGenerate: false,
        failedGenerate: false,
        dateFrom,
        dateTo,
        invoiceDate,
      })

      expect(spyResource).toHaveBeenCalledTimes(2)
      expect(isPending).toHaveBeenCalledTimes(2)
      expect(hasFailed).toHaveBeenCalledTimes(2)
      expect(isPending).toHaveBeenCalledWith(emptyState, 'restaurantsListRead')
      expect(isPending).toHaveBeenCalledWith(emptyState, 'invoice_generation_requestsCreate')
      expect(hasFailed).toHaveBeenCalledWith(emptyState, 'restaurantsListRead')
      expect(hasFailed).toHaveBeenCalledWith(emptyState, 'invoice_generation_requestsCreate')
      expect(spyResource).toBeCalledWith(emptyState, 'restaurants')
    })

    it('should return valid default state', () => {
      const state = {
        form: {
          someFormName: {
            dateFrom,
            dateTo,
            documentDate,
          },
        },
      }

      const resultState = mapStateToProps(state, { parentFormName: 'someFormName' })

      expect(resultState).toEqual({
        selected: new Set(),
        count: 0,
        loading: false,
        failed: false,
        loadingGenerate: false,
        failedGenerate: false,
        dateFrom,
        dateTo,
        invoiceDate,
      })
    })
  })

  describe('mapDispatchToProps', () => {
    it('should dispatch valid actions on success', async () => {
      const expectedResult = {
        restaurantIds,
      }

      const spyResourceCreateRequestAsync = jest.spyOn(actions, 'resourceCreateRequestAsync').mockImplementation(() => Promise.resolve(expectedResult))

      const { generateInvoicesByIds } = mapDispatchToProps(dispatchSpy, { parentModalName })
      await generateInvoicesByIds(restaurantIds, invoiceDate, dateFrom, dateTo)

      expect(spyResourceCreateRequestAsync).toBeCalledWith(dispatchSpy, 'invoice_generation_requests', callParams)
      expect(dispatchSpy.mock.calls[0][0]).toEqual(actions.notificationShow('globalnotify', 'Generated 5 invoices for 5 restaurants'))
      expect(dispatchSpy.mock.calls[1][0]).toEqual(actions.selectionListClear('restaurants'))
      expect(dispatchSpy.mock.calls[2][0]).toEqual(actions.buttonSetUnpressed('select_all_restaurants'))
      expect(dispatchSpy.mock.calls[3][0]).toEqual(actions.modalHide(parentModalName))
    })

    describe('not for all restaurants generated documents', () => {
      it('should dispatch valid notification', async () => {
        jest.spyOn(actions, 'resourceCreateRequestAsync').mockImplementation(() => Promise.resolve({ restaurantIds: [1, 2, 5] }))

        const { generateInvoicesByIds } = mapDispatchToProps(dispatchSpy, { parentModalName })
        await generateInvoicesByIds(restaurantIds, invoiceDate, dateFrom, dateTo)

        expect(dispatchSpy.mock.calls[0]).toEqual([actions.notificationShow('globalnotify', 'Generated 3 invoices for 5 restaurants')])
      })
    })

    it('should dispatch valid action on failed', async () => {
      const spyResourceCreateRequestAsync = jest.spyOn(actions, 'resourceCreateRequestAsync').mockImplementation(() => Promise.reject(new Error()))

      const { generateInvoicesByIds } = mapDispatchToProps(dispatchSpy, { parentModalName })
      await generateInvoicesByIds(restaurantIds, invoiceDate, dateFrom, dateTo)

      expect(spyResourceCreateRequestAsync).toBeCalledWith(dispatchSpy, 'invoice_generation_requests', callParams)
      expect(dispatchSpy).toBeCalledWith(actions.notificationShow('globalnotify', 'Failed to generate invoices'))
    })

    it('should dispatch valid action on failed with ApiError', async () => {
      const spyResourceCreateRequestAsync = jest.spyOn(actions, 'resourceCreateRequestAsync').mockImplementation(() => Promise.reject(new ApiError(errContent)))

      const { generateInvoicesByIds } = mapDispatchToProps(dispatchSpy, { parentModalName })
      await generateInvoicesByIds(restaurantIds, invoiceDate, dateFrom, dateTo)

      expect(spyResourceCreateRequestAsync).toBeCalledWith(dispatchSpy, 'invoice_generation_requests', callParams)
      expect(dispatchSpy).toBeCalledWith(actions.notificationShow('globalnotify', '\nSome api error'))
    })
  })
})

describe('rendering', () => {
  const wrap = (props = {}) => shallow(<CreateInvoicesButtonContainer {...props} />)

  it('should display component', () => {
    const wrapper = wrap(createProps())
    expect(wrapper.find('CreateInvoicesButton')).toHaveLength(1)
  })
})
