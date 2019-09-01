import React, { useState, useCallback, useRef } from 'react'
import { connect } from 'react-redux'
import Toggle from 'react-toggle'

import 'react-toggle/style.css'
import './react-toggle-overrides.css'

import { ProfileDropDown } from 'common/DropDown/DropDown'
import history from 'globalHistory'
import { uploadImages, syncAction } from 'redux/collection'

import moon from './moon.png'
import styles from './AppBar.module.css'
import useOnClickOutside from 'hooks/useOnClickOutside'
import { getDataTransferItems, convertToJpeg, videoToJpegs } from 'Utils'

const FPS = 3

const generateFiles = async (images, videos) => {
  const imageFiles = images.map(async image => await convertToJpeg(image))
  const videoFiles = videos.map(async video => await videoToJpegs(video, FPS))
  return (await Promise.all([...imageFiles, ...videoFiles])).flat()
}

const AppBar = ({ bucket, profile, saving, syncAction }) => {
  const optionsRef = useRef(null)
  const fileInputRef = useRef(null)
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

  const handleFileChosen = useCallback(
    async e => {
      const fileList = getDataTransferItems(e)
      const images = fileList.filter(file => file.type.startsWith('image/'))
      const videos = fileList.filter(file => file.type.startsWith('video/'))
      const files = await generateFiles(images, videos)
      syncAction(uploadImages, [files])
      fileInputRef.current.value = null
      fileInputRef.current.blur()
    },
    [syncAction]
  )

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
              className={
                optionsOpen && lastHoveredOption === 'file'
                  ? styles.optionOpen
                  : styles.option
              }
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
                <div className={styles.listItem}>
                  Upload media
                  <input
                    className={styles.upload}
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChosen}
                    multiple
                  />
                </div>
                {/* <div className={styles.listDivider} */}
              </div>
            </div>

            <div
              id="image"
              className={
                optionsOpen && lastHoveredOption === 'image'
                  ? styles.optionOpen
                  : styles.option
              }
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
                <div className={styles.listItem}>Delete</div>
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
const mapDispatchToProps = {
  syncAction
}
export default connect(
  mapPropsToState,
  mapDispatchToProps
)(AppBar)
