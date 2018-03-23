
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper'
import { userIsNotAuthenticatedDefaults } from 'auth'
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect'

const locationHelper = locationHelperBuilder({})

const userIsNotAuthenticatedRedir = connectedRouterRedirect({
  ...userIsNotAuthenticatedDefaults,
  redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/billing/restaurants',
  allowRedirectBack: false,
})

export default userIsNotAuthenticatedRedir
