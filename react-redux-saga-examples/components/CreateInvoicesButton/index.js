import React from 'react'
import PropTypes from 'prop-types'
import RaisedButton from 'material-ui/RaisedButton'
import { orange300 } from 'material-ui/styles/colors'

const CountLabel = props => (
  <span>
    Create <strong style={{ color: orange300 }}>{props.count}</strong> invoice(s)
  </span>)

CountLabel.propTypes = {
  count: PropTypes.number,
}

const CreateInvoicesButton = ({
  selected, count, loading, loadingGenerate,
  generateInvoicesByIds,
  failed,
  failedGenerate,
  dateFrom,
  dateTo,
  invoiceDate,
  canCreate,
  parentFormName,
  parentModalName,
  ...props
}) => {
  const handleClick = () => {
    canCreate && generateInvoicesByIds(Array.from(selected), invoiceDate, dateFrom, dateTo)
  }

  return (
    <RaisedButton
      style={{ minWidth: '174px' }}
      label={<CountLabel count={count} />}
      primary
      {...props}
      disabled={!count || loading || loadingGenerate}
      onClick={handleClick}
    />
  )
}

CreateInvoicesButton.propTypes = {
  count: PropTypes.number.isRequired,
  selected: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  failed: PropTypes.bool.isRequired,
  failedGenerate: PropTypes.bool.isRequired,
  loadingGenerate: PropTypes.bool.isRequired,
  generateInvoicesByIds: PropTypes.func.isRequired,
  dateFrom: PropTypes.any,
  dateTo: PropTypes.any,
  invoiceDate: PropTypes.any,
  canCreate: PropTypes.bool,
  parentFormName: PropTypes.string,
  parentModalName: PropTypes.string,
  onClick: PropTypes.func,
}

export default CreateInvoicesButton
