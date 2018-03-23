const userIsNotAuthenticatedDefaults = {
  allowRedirectBack: false,
  authenticatedSelector: state => state.social.user === null && state.social.isUserLoading === false,
  wrapperDisplayName: 'UserIsNotAuthenticated',
}

export default userIsNotAuthenticatedDefaults
