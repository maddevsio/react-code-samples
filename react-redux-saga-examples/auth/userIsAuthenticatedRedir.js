import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect'
import { userIsAuthenticatedDefaults } from 'auth'

const userIsAuthenticatedRedir = AuthenticatingComponent => connectedRouterRedirect({
  ...userIsAuthenticatedDefaults,
  AuthenticatingComponent,
  redirectPath: '/',
})

export default userIsAuthenticatedRedir
