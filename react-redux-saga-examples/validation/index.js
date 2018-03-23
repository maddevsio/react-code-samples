import isEmail from 'validator/lib/isEmail'
import isInt from 'validator/lib/isInt'
import isFloat from 'validator/lib/isFloat'
import isIn from 'validator/lib/isIn'
import isURL from 'validator/lib/isURL'
import moment from 'moment'
import { formatFloat } from 'utils'

const isEmpty = value => value === undefined || value === null || value === ''
const isNullOrUndefined = value => value === undefined || value === null

const isInvalidNoteNumber = (value) => {
  const isValidPrefix = /[a-zA-Z]{4}/.test(value)
  const isValidDateAndNumber = /[0-9]{10}/.test(value)
  return !(isValidPrefix && isValidDateAndNumber)
}

const isObject = o => typeof o === 'object' && !Array.isArray(o)

const join = rules => (value, data) =>
  rules.map(rule => rule(value, data)).filter(error => !!error)[0]

const isAlpha = value => /^[a-zA-Z]+$/.test(value)

export const email = value => !isEmpty(value) && !isEmail(value) &&
  'Invalid email address'

export const url = value => !isEmpty(value) && !isURL(value) &&
  'Invalid URL'

export const required = value => isEmpty(value) &&
  'Required field'

export const noteNumber = value => isInvalidNoteNumber(value) &&
  'Invalid note number'

export const minLength = min => value => !isEmpty(value) && value.length < min &&
  `Must be at least ${min} characters`

export const maxLength = max => value => !isEmpty(value) && value.length > max &&
  `Must be no more than ${max} characters`

export const integer = value => !isInt(value) &&
  'Must be an integer'

export const intOrFloat = value => (!isInt(`${value}`) && !isFloat(`${value}`)) &&
  'Must be an integer of float'

export const alpha = value => !isAlpha(value) &&
  'Must be a letters only'

export const maxPercent = value =>
  (parseInt(value, 10) < 0 || parseInt(value, 10) > 100) &&
  'Must be a positive integer in range 0 to 100'

export const minValue = min => function minValue(value) {
  return !isEmpty(value) && parseInt(value, 10) < min &&
    `Must be no less than ${min}`
}

export const greaterThan = minValue => function moreOrEqual(value) {
  return !isEmpty(value) && Number(value) <= Number(minValue) &&
    `Must be greater than ${minValue}`
}

export const oneOf = values => value => !isIn(value, values) &&
  `Must be one of: ${values.join(', ')}`

export const match = field => (value, data) => data && value !== data[field] &&
  'Must match'

export const laterThan = fieldName => (value, data) => {
  const laterDate = moment(value, moment.ISO_8601, true)
  const earlierDate = moment(data[fieldName], moment.ISO_8601, true)
  if (earlierDate.isAfter(laterDate, 'day')) return `Must be later than ${earlierDate.format('YYYY-MM-DD')}`
  return false
}

export const aboveZero = value =>
  parseInt(value, 10) <= 0 &&
  'Must be above zero'

export const moreThenZero = value =>
  !isEmpty(value) && Number(value) <= 0 && 'Must be more then zero'

export const dependsOfDisountType = (typeIdValidators, fieldName) => {
  return function dependsOfDisountType(value, data) {
    const errMessage = intOrFloat(value)
    if (errMessage) return errMessage
    const hasField = data && data[fieldName]
    if (!hasField) return false
    const typeIdValidator = typeIdValidators[data[fieldName]]
    return typeIdValidator && typeIdValidator(String(value))
  }
}

export const isMoreThanTwoDecimals = (value) => {
  return !isNullOrUndefined(value) && !/^\d*(\.\d{1,2})?$/.test(String(value)) && 'There can not be more than two decimals'
}

export const lessOrEqualBalance = balance => (value) => {
  return Number(formatFloat(value)) > Number(formatFloat(balance)) && 'Cannot be greater than balance'
}

export const sumDependsOfAmount = (value, data) => {
  const numAmount = Number(data.receipt && data.receipt.amount)
  const sumOfInvoicesAmounts = data.invoicesAmounts && Object.values(data.invoicesAmounts).reduce((a, b) => {
    return Number(a || 0) + Number(b || 0)
  }, 0)
  return numAmount < sumOfInvoicesAmounts && 'Sum of values cannot be greater than receipt amount'
}

export const amountDependsOfSum = sum => (value) => {
  return (Number(value) > sum && `Not all amount is allocated. Extra ${Number(value) - sum}`) ||
    (Number(value) < sum && `Less than the sum allocated for invoices. Not enough ${sum - Number(value)}`)
}

const createErrorsObject = (rules, data) => {
  const errors = {}

  Object.keys(rules).forEach((key) => {
    if (isObject(rules[key])) {
      const dataValue = data[key] || {}
      errors[key] = createErrorsObject(rules[key], dataValue)
    } else {
      const rule = join([].concat(rules[key]))
      const error = rule(data[key], data)
      if (error) {
        errors[key] = error
      }
    }
  })

  return errors
}

export const createValidator = rules => (data = {}) => createErrorsObject(rules, data)
