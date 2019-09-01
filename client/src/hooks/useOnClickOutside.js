import { useEffect } from 'react'

const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = e => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(e.target)) {
        return
      }
      handler(e)
    }

    const loseFocusListener = e => {
      if (!document.hasFocus()) {
        handler(e)
      }
    }

    document.addEventListener('msvisibilitychange', loseFocusListener)
    document.addEventListener('webkitvisibilitychange', loseFocusListener)
    document.addEventListener('visibilitychange', loseFocusListener)
    window.addEventListener('blur', loseFocusListener)

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('msvisibilitychange', loseFocusListener)
      document.removeEventListener('webkitvisibilitychange', loseFocusListener)
      document.removeEventListener('visibilitychange', loseFocusListener)
      window.removeEventListener('blur', loseFocusListener)

      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

export default useOnClickOutside
