// Actions
const SET = 'cloud-annotations/accounts/SET'
const SET_ACCOUNT = 'cloud-annotations/accounts/SET_ACCOUNT'
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
      let { activeAccount } = accounts
      // If the current active account no longer exists, remove it.
      if (!action.accounts.find(a => a.accountId === activeAccount)) {
        activeAccount = null
      }

      if (!activeAccount) {
        // Check saved account exists.
        const savedAccount = localStorage.getItem('activeAccount')
        if (action.accounts.find(a => a.accountId === savedAccount)) {
          activeAccount = savedAccount
        }
      }
      if (!activeAccount) {
        const [firstAccount] = action.accounts
        if (firstAccount) {
          activeAccount = firstAccount.accountId
        }
      }
      return {
        ...accounts,
        accounts: action.accounts,
        activeAccount: activeAccount
      }
    case SET_ACCOUNT:
      localStorage.setItem('activeAccount', action.account)
      return { ...accounts, activeAccount: action.account }
    case SET_LOADING:
      return { ...accounts, loading: action.loading }
    default:
      return accounts
  }
}

// Action Creators
export const setAccounts = a => ({ type: SET, accounts: a })

export const setActiveAccount = a => ({ type: SET_ACCOUNT, account: a })

export const setLoadingAccounts = l => ({ type: SET_LOADING, loading: l })
