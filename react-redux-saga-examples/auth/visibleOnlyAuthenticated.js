import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper'

const visibleOnlyAuthenticated = connectedAuthWrapper({
  authenticatedSelector: state => state.social.user !== null,
  wrapperDisplayName: 'VisibleOnlyAuthenticated',
})

export default visibleOnlyAuthenticated
