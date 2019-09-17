import React, { useState, useCallback, useEffect, useRef } from 'react'

import styles from './DropDown.module.css'
import history from 'globalHistory'
import { clearCookies } from 'Utils'

const Chevron = () => (
  <svg className={styles.chevronIcon} viewBox="0 0 12 7">
    <path
      fillRule="nonzero"
      d="M6.002 5.55L11.27 0l.726.685L6.003 7 0 .685.726 0z"
    />
  </svg>
)

const useOnBlur = (ref, onBlur) => {
  useEffect(() => {
    const currentRef = ref.current
    currentRef.addEventListener('blur', onBlur)
    return () => {
      currentRef.removeEventListener('blur', onBlur)
    }
  }, [ref, onBlur])
}

const DropDown = ({ active, list, onChosen }) => {
  const [open, setOpen] = useState(false)

  const blurListener = useCallback(() => {
    setOpen(false)
  }, [])

  const dropDownRef = useRef(null)
  useOnBlur(dropDownRef, blurListener)

  const handleClick = useCallback(() => {
    setOpen(true)
  }, [])

  const handleChosen = useCallback(
    item => e => {
      e.stopPropagation()
      onChosen(item)
      setOpen(false)
    },
    [onChosen]
  )

  return (
    <div
      tabIndex="0"
      className={open ? styles.open : styles.closed}
      onClick={handleClick}
      ref={dropDownRef}
    >
      <div className={styles.active}>{active}</div>
      <Chevron />
      {open && (
        <div className={styles.droplist}>
          {list.map(item => (
            <div
              key={item.id}
              onClick={handleChosen(item.id)}
              className={styles.dropItem}
            >
              {item.display}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

let baseEndpoint = 'test.cloud.ibm.com'
if (process.env.NODE_ENV === 'production') {
  baseEndpoint = 'cloud.ibm.com'
}

const IMAGE_REGEX = /\.(jpg|jpeg|png)$/i
const Image = ({ photo }) => {
  return (
    <>
      {photo && photo.match(IMAGE_REGEX) ? (
        <img alt="" className={styles.profile} src={photo} />
      ) : (
        <svg
          className={styles.icon}
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
        >
          <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm0 5a4.5 4.5 0 1 1-4.5 4.5A4.49 4.49 0 0 1 16 7zm8 17.92a11.93 11.93 0 0 1-16 0v-.58A5.2 5.2 0 0 1 13 19h6a5.21 5.21 0 0 1 5 5.31v.61z"></path>
        </svg>
      )}
    </>
  )
}

export const ProfileDropDown = ({ profile }) => {
  const [open, setOpen] = useState(false)

  const blurListener = useCallback(() => {
    setOpen(false)
  }, [])

  const dropDownRef = useRef(null)
  useOnBlur(dropDownRef, blurListener)

  const handleClick = useCallback(() => {
    setOpen(true)
  }, [])

  const handleLogout = useCallback(() => {
    clearCookies(['access_token', 'refresh_token'])
    history.push('/login')

    // This won't log us out of IBM, we need to redirect to actually logout:
    const wind = window.open(
      `https://iam.${baseEndpoint}/identity/logout`,
      '_blank'
    )
    setTimeout(() => {
      wind.close()
    }, 10000)
  }, [])

  return (
    <div
      tabIndex="0"
      className={open ? styles.profileOpen : styles.profileClosed}
      onClick={handleClick}
      ref={dropDownRef}
    >
      <Image photo={profile.photo} />
      {open && (
        <div className={styles.profileCard}>
          <div className={styles.detailWrapper}>
            <div className={styles.name}>
              {profile.firstname} {profile.lastname}
            </div>
            <Image photo={profile.photo} />
          </div>
          <div className={styles.userId}>{profile.user_id}</div>
          <div className={styles.logout} onClick={handleLogout}>
            Logout
          </div>
        </div>
      )}
    </div>
  )
}

export default DropDown
