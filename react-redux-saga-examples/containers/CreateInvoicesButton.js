import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isPending, hasFailed } from 'redux-saga-thunk'
import { fromResource } from 'store/selectors'
import {
  resourceCreateRequestAsync,
  notificationShow,
  selectionListClear,
  modalHide,
  buttonSetUnpressed,
} from 'store/actions'
import { CreateInvoicesButton } from 'components'
import { formValueSelector } from 'redux-form'
import { ApiError } from 'errors'
import { ISODateFrom, ISODateTo, ISODate } from './mappers'

export const CreateInvoicesButtonContainer = props => (
  <CreateInvoicesButton {...props} />
)

CreateInvoicesButtonContainer.propTypes = {
  parentFormName: PropTypes.string.isRequired,
  parentModalName: PropTypes.string.isRequired,
}

export const mapStateToProps = (state, { parentFormName }) => ({
  selected: fromResource.getSelection(state, 'restaurants'),
  count: fromResource.getSelection(state, 'restaurants').size,
  loading: isPending(state, 'restaurantsListRead'),
  failed: hasFailed(state, 'restaurantsListRead'),
  loadingGenerate: isPending(state, 'invoice_generation_requestsCreate'),
  failedGenerate: hasFailed(state, 'invoice_generation_requestsCreate'),
  dateFrom: formValueSelector(parentFormName)(state, 'dateFrom'),
  dateTo: formValueSelector(parentFormName)(state, 'dateTo'),
  invoiceDate: formValueSelector(parentFormName)(state, 'documentDate'),
})

export const mapDispatchToProps = (dispatch, { parentModalName }) => ({
  generateInvoicesByIds: async (restaurantIds, invoiceDate, dateFrom, dateTo) => {
    try {
      const result = await resourceCreateRequestAsync(
        dispatch,
        'invoice_generation_requests',
        {
          restaurantIds,
          dateFrom: ISODateFrom(dateFrom),
          dateTo: ISODateTo(dateTo),
          invoiceDate: ISODate(invoiceDate),
        }
      )

      const countOriginal = restaurantIds.length
      const countGenerated = result.restaurantIds.length
      dispatch(notificationShow('globalnotify', `Generated ${countGenerated} invoices for ${countOriginal} restaurants`))
      dispatch(selectionListClear('restaurants'))
      dispatch(buttonSetUnpressed('select_all_restaurants'))
      dispatch(modalHide(parentModalName))
    } catch (e) {
      if (e instanceof ApiError) {
        dispatch(notificationShow('globalnotify', e.getAllMessages()))
      } else {
        dispatch(notificationShow('globalnotify', 'Failed to generate invoices'))
      }
    }
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateInvoicesButtonContainer)
