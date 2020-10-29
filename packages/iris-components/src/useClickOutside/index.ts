import React from "react";

const useClickOutside = (
  ref: React.MutableRefObject<any>,
  handler: EventListener,
  hideOnBlur?: boolean
) => {
  React.useEffect(() => {
    const listener: EventListenerOrEventListenerObject = (e) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(e.target)) {
        return;
      }
      handler(e);
    };

    const loseFocusListener: EventListenerOrEventListenerObject = (e) => {
      if (!document.hasFocus() && hideOnBlur) {
        handler(e);
      }
    };

    document.addEventListener("msvisibilitychange", loseFocusListener);
    document.addEventListener("webkitvisibilitychange", loseFocusListener);
    document.addEventListener("visibilitychange", loseFocusListener);
    window.addEventListener("blur", loseFocusListener);

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("msvisibilitychange", loseFocusListener);
      document.removeEventListener("webkitvisibilitychange", loseFocusListener);
      document.removeEventListener("visibilitychange", loseFocusListener);
      window.removeEventListener("blur", loseFocusListener);

      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, hideOnBlur, handler]);
};

export default useClickOutside;
