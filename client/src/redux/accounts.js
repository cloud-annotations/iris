// Actions
const SET = 'cloud-annotations/accounts/SET'

// Reducer
const defaultAccounts = {
  accounts: [],
  activeAccount: null
}

export default function reducer(accounts = defaultAccounts, action = {}) {
  switch (action.type) {
    case SET:
      return action.accounts
    default:
      return accounts
  }
}

// Action Creators
export const setAccounts = a => ({ type: SET, accounts: a })
