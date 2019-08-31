import React, { useState, useCallback, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import Toggle from 'react-toggle'

import 'react-toggle/style.css'
import './react-toggle-overrides.css'

import { ProfileDropDown } from 'common/DropDown/DropDown'
import history from 'globalHistory'

import moon from './moon.png'
import styles from './AppBar.module.css'

const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = e => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(e.target)) {
        return
      }
      handler(e)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

const AppBar = ({ bucket, profile, saving }) => {
  const optionsRef = useRef(null)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [lastHoveredOption, setLastHoveredOption] = useState(undefined)
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

  const handleOptionClick = useCallback(() => {
    setOptionsOpen(true)
  }, [])

  const handleClickOutside = useCallback(() => {
    setOptionsOpen(false)
  }, [])

  const handleOptionHover = useCallback(e => {
    setLastHoveredOption(e.currentTarget.id)
  }, [])

  useOnClickOutside(optionsRef, handleClickOutside)

  return (
    <div className={styles.wrapper}>
      <div onClick={handleClick} className={styles.home}>
        <svg className={styles.homeIcon} viewBox="0 0 32 32">
          <path d="M11.17 6l3.42 3.41.58.59H28v16H4V6h7.17m0-2H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H16l-3.41-3.41A2 2 0 0 0 11.17 4z" />
        </svg>
      </div>
      <div className={styles.headerWrapper}>
        <div className={styles.bucketName}>{bucket}</div>
        <div className={styles.options}>
          <div ref={optionsRef} className={styles.options}>
            <div
              id="file"
              className={styles.option}
              onClick={handleOptionClick}
              onMouseEnter={handleOptionHover}
            >
              File
              <div
                className={
                  optionsOpen && lastHoveredOption === 'file'
                    ? styles.optionCardOpen
                    : styles.optionCard
                }
              >
                Bloop
              </div>
            </div>
            <div
              id="edit"
              className={styles.option}
              onClick={handleOptionClick}
              onMouseEnter={handleOptionHover}
            >
              Edit
              <div
                className={
                  optionsOpen && lastHoveredOption === 'edit'
                    ? styles.optionCardOpen
                    : styles.optionCard
                }
              >
                Bloop
              </div>
            </div>
            <div
              id="image"
              className={styles.option}
              onClick={handleOptionClick}
              onMouseEnter={handleOptionHover}
            >
              Image
              <div
                className={
                  optionsOpen && lastHoveredOption === 'image'
                    ? styles.optionCardOpen
                    : styles.optionCard
                }
              >
                Bloop
              </div>
            </div>
          </div>
          <div className={styles.saved}>
            {saving > 0 ? 'Saving...' : 'Saved'}
          </div>
        </div>
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

const mapPropsToState = state => ({
  saving: state.editor.saving
})
export default connect(mapPropsToState)(AppBar)
