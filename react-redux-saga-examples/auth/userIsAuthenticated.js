import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper'
import { userIsAuthenticatedDefaults } from 'auth'

const userIsAuthenticated = connectedAuthWrapper(userIsAuthenticatedDefaults)

export default userIsAuthenticated
