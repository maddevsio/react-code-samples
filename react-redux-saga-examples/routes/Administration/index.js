import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { AdministrationPage,
  AllCitiesTaxesFormPage,
  CityTaxesFormPage,
  CountryTaxesDetailPage,
  SigningInPage,
  NotFound,
} from 'components'

import { userIsAuthenticatedRedir } from 'auth'

import { CityTaxesDetailPage } from 'containers'

const AdministrationPageWrapped = userIsAuthenticatedRedir(SigningInPage)(AdministrationPage)
const CountryTaxesDetailPageWrapped = userIsAuthenticatedRedir(SigningInPage)(CountryTaxesDetailPage)
const CityTaxesDetailPageWrapped = userIsAuthenticatedRedir(SigningInPage)(CityTaxesDetailPage)
const AllCitiesTaxesFormPageWrapped = userIsAuthenticatedRedir(SigningInPage)(AllCitiesTaxesFormPage)
const CityTaxesFormPageWrapped = userIsAuthenticatedRedir(SigningInPage)(CityTaxesFormPage)

const ROOT = '/billing/administration'

const Administration = () => (
  <Switch>
    <Route
      exact
      path={ROOT}
      component={AdministrationPageWrapped}
    />
    <Route
      exact
      path={`${ROOT}/countries`}
      component={CountryTaxesDetailPageWrapped}
    />
    <Route
      exact
      path={`${ROOT}/countries/:countryCode/taxes`}
      component={AllCitiesTaxesFormPageWrapped}
    />
    <Route
      exact
      path={`${ROOT}/countries/:countryCode/cities/:cityId/taxes`}
      component={CityTaxesDetailPageWrapped}
    />
    <Route
      path={`${ROOT}/countries/:countryCode/cities/:cityId/taxes/new`}
      component={CityTaxesFormPageWrapped}
    />
    <Route
      exact
      path={`${ROOT}/countries/:countryCode/taxes/:taxId`}
    />
    <Route
      exact
      path={`${ROOT}/countries/:countryCode/cities/:cityId/taxes/:taxId`}
      component={CityTaxesFormPageWrapped}
    />
    <Route path="*" component={NotFound} />
  </Switch>
)

export default Administration
