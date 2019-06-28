import React, { useState, useCallback } from 'react'

import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import './react-toggle-overrides.css'
import moon from './moon.png'

import styles from './AppBar.module.css'

const AppBar = () => {
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

  return (
    <div className={styles.wrapper}>
      <Toggle
        className={styles.toggle}
        checked={darkModeToggle}
        icons={{
          checked: null,
          unchecked: (
            <img
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
    </div>
  )
}

export default AppBar
