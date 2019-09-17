// Actions
const SET = 'cloud-annotations/accounts/SET'
const SET_LOADING = 'cloud-annotations/accounts/SET_LOADING'

// Reducer
const defaultAccounts = {
  loading: true,
  accounts: [],
  activeAccount: null
}

export default function reducer(accounts = defaultAccounts, action = {}) {
  switch (action.type) {
    case SET:
      return action.accounts
    case SET_LOADING:
      return { ...accounts, loading: action.loading }
    default:
      return accounts
  }
}

// Action Creators
export const setAccounts = a => ({ type: SET, accounts: a })

export const setLoadingAccounts = l => ({ type: SET_LOADING, loading: l })
