import React, { useState, useCallback, useEffect, useRef } from 'react'

import styles from './DropDown.module.css'
import history from 'globalHistory'
import { clearCookies } from 'Utils'

const Chevron = () => (
  <svg className={styles.chevronIcon} viewBox="0 0 12 7">
    <path
      fill-rule="nonzero"
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

const DropDown = ({ active, list }) => {
  const [open, setOpen] = useState(false)

  const blurListener = useCallback(() => {
    setOpen(false)
  }, [])

  const dropDownRef = useRef()
  useOnBlur(dropDownRef, blurListener)

  const handleClick = useCallback(() => {
    setOpen(true)
  }, [])

  return (
    <div
      tabindex="0"
      className={open ? styles.open : styles.closed}
      onClick={handleClick}
      ref={dropDownRef}
    >
      <div className={styles.active}>{active}</div>
      <Chevron />
      {open && (
        <div className={styles.droplist}>
          {list.map(item => (
            <div className={styles.dropItem}>{item}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export const ProfileDropDown = ({ profile }) => {
  const [open, setOpen] = useState(false)

  const blurListener = useCallback(() => {
    setOpen(false)
  }, [])

  const dropDownRef = useRef()
  useOnBlur(dropDownRef, blurListener)

  const handleClick = useCallback(() => {
    setOpen(true)
  }, [])

  const handleLogout = useCallback(() => {
    clearCookies(['access_token', 'refresh_token'])
    history.push('/login')
  }, [])

  return (
    <div
      tabindex="0"
      className={open ? styles.profileOpen : styles.profileClosed}
      onClick={handleClick}
      ref={dropDownRef}
    >
      <img alt="" className={styles.profile} src={profile.photo} />
      {open && (
        <div className={styles.profileCard}>
          <div className={styles.detailWrapper}>
            <div className={styles.name}>
              {profile.firstname} {profile.lastname}
            </div>
            <img alt="" className={styles.profile2} src={profile.photo} />
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
