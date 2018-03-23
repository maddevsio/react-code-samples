export const createSelected = (...ids) => (new Set(ids))

export const createProps = (props = {}) => (Object.assign({
  count: 0,
  selected: new Set(),
  loading: false,
  failed: false,
  failedGenerate: false,
  loadingGenerate: false,
  generateInvoicesByIds: jest.fn(),
  canCreate: false,
}, props))


export default {
  createProps,
  createSelected,
}
