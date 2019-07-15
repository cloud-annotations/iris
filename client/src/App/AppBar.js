import React, { useState, useCallback } from 'react'
import Toggle from 'react-toggle'

import 'react-toggle/style.css'
import './react-toggle-overrides.css'

import { ProfileDropDown } from 'common/DropDown/DropDown'
import history from 'globalHistory'

import moon from './moon.png'
import styles from './AppBar.module.css'

const AppBar = ({ profile }) => {
  const [darkModeToggle, setDarkModeToggle] = useState(
    localStorage.getItem('darkMode') === 'true'
  )

  const handleToggleDarkMode = useCallback(e => {
    e.target.blur() // give up focus so other inputs work properly.
    const darkMode = !(localStorage.getItem('darkMode') === 'true')
    setDarkModeToggle(darkMode)
    localStorage.setItem('darkMode', darkMode)
    document.body.className = darkMode ? 'dark' : 'light'
  }, [])

  const handleClick = useCallback(() => {
    history.push('/')
  }, [])

  return (
    <div className={styles.wrapper}>
      <div onClick={handleClick} className={styles.home}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={styles.homeIcon}
          viewBox="0 0 32 32"
        >
          <path d="M11.17 6l3.42 3.41.58.59H28v16H4V6h7.17m0-2H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H16l-3.41-3.41A2 2 0 0 0 11.17 4z" />
        </svg>
      </div>
      <Toggle
        className={styles.toggle}
        checked={darkModeToggle}
        icons={{
          checked: null,
          unchecked: (
            <img
              alt=""
              src={moon}
              width="16"
              height="16"
              role="presentation"
              style={{ pointerEvents: 'none' }}
            />
          )
        }}
        onChange={handleToggleDarkMode}
      />
      <ProfileDropDown profile={profile} />
    </div>
  )
}

export default AppBar
