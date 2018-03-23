import React from 'react'
import { mount } from 'enzyme'
import PropTypes from 'prop-types'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import CreateInvoicesButton from './index'
import { createProps, createSelected } from './factories'


const muiTheme = getMuiTheme()
const renderButton = props => mount(
  <CreateInvoicesButton {...props} />, {
    context: {
      muiTheme,
    },
    childContextTypes: {
      muiTheme: PropTypes.object.isRequired,
    },
  })

describe('CreateInvoicesButton', () => {
  describe('rendering', () => {
    it('should display button', () => {
      expect(renderButton(createProps())).toHaveLength(1)
    })
  })

  describe('default props', () => {
    it('should display default text', () => {
      const button = renderButton(createProps())
      expect(button.text()).toEqual('Create 0 invoice(s)')
    })

    it('should display disabled button', () => {
      const button = renderButton(createProps())
      const raisedButton = button.find('RaisedButton')
      expect(raisedButton.props().disabled).toBeTruthy()
    })
  })

  describe('selected restaurants', () => {
    it('should display count', () => {
      const button = renderButton(createProps({ count: 2 }))
      expect(button.text()).toEqual('Create 2 invoice(s)')
    })

    it('should be enabled', () => {
      const button = renderButton(createProps({ count: 2 }))
      const raisedButton = button.find('RaisedButton')
      expect(raisedButton.props().disabled).toBeFalsy()
    })

    it('should be enabled for any count greater then zero', () => {
      const button = renderButton(createProps({ count: 2 }))
      const raisedButton = button.find('RaisedButton')
      expect(raisedButton.props().disabled).toBeFalsy()
      button.setProps({ count: 0 })
      expect(raisedButton.props().disabled).toBeTruthy()
    })
  })

  describe('loading prop is true', () => {
    it('should be disabled if count > 0', () => {
      const button = renderButton(createProps({ count: 2, loading: true }))
      const raisedButton = button.find('RaisedButton')
      expect(raisedButton.props().disabled).toBeTruthy()
    })

    it('should be disabled if count == 0', () => {
      const button = renderButton(createProps({ count: 0, loading: true }))
      const raisedButton = button.find('RaisedButton')
      expect(raisedButton.props().disabled).toBeTruthy()
    })
  })

  describe('loadingGenerate prop is true', () => {
    it('should be disabled if count > 0', () => {
      const button = renderButton(createProps({ count: 2, loadingGenerate: true }))
      const raisedButton = button.find('RaisedButton')
      expect(raisedButton.props().disabled).toBeTruthy()
    })

    it('should be disabled if count == 0', () => {
      const button = renderButton(createProps({ count: 0, loadingGenerate: true }))
      const raisedButton = button.find('RaisedButton')
      expect(raisedButton.props().disabled).toBeTruthy()
    })
  })

  describe('actions', () => {
    it('should not call action on click', () => {
      const selected = createSelected(1, 2, 3, 4, 5, 6, 7)
      const dateFrom = '2017-01-01'
      const dateTo = '2017-02-02'
      const invoiceDate = '2017-05-05'
      const props = createProps({ count: selected.size, selected, dateFrom, dateTo, invoiceDate })
      const button = renderButton(props).find('RaisedButton button')
      button.simulate('click')
      expect(props.generateInvoicesByIds).not.toHaveBeenCalled()
    })
    it('should call action on click', () => {
      const selected = createSelected(1, 2, 3, 4, 5, 6, 7)
      const dateFrom = '2017-01-01'
      const dateTo = '2017-02-02'
      const invoiceDate = '2017-05-05'
      const canCreate = true
      const props = createProps({ count: selected.size, selected, dateFrom, dateTo, invoiceDate, canCreate })
      const button = renderButton(props).find('RaisedButton button')
      button.simulate('click')
      expect(props.generateInvoicesByIds).toHaveBeenCalled()
    })
  })
})
