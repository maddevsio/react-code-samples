
const userIsAuthenticatedDefaults = {
  authenticatedSelector: state => state.social.user !== null,
  authenticatingSelector: state => state.social.isUserLoading,
  wrapperDisplayName: 'UserIsAuthenticated',
}

export default userIsAuthenticatedDefaults
