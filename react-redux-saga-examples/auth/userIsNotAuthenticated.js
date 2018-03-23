import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper'
import { userIsNotAuthenticatedDefaults } from 'auth'

const userIsNotAuthenticated = connectedAuthWrapper(userIsNotAuthenticatedDefaults)

export default userIsNotAuthenticated
