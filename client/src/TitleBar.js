import React, { Component } from 'react'
import { validateCookies } from './Utils'
import history from './history'
import './TitleBar.css'

class TitleBar extends Component {
  state = {
    showDropDown: false
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = e => {
    if (
      this.dropDownRef &&
      !this.dropDownRef.contains(e.target) &&
      (this.dropDownTriggerRef && !this.dropDownTriggerRef.contains(e.target))
    ) {
      this.setState({
        showDropDown: false
      })
    }
  }

  showDropDown = () => {
    this.setState(prevState => ({
      showDropDown: !prevState.showDropDown
    }))
  }

  logout = () => {
    this.setState({
      showDropDown: false
    })
    document.cookie = 'token=; Max-Age=-99999999; path=/'
    document.cookie = 'refresh_token=; Max-Age=-99999999; path=/'
    validateCookies().catch(error => {
      if (error.message === 'Forbidden') {
        history.push('/login')
      }
    })
  }

  render() {
    const resourceId = (localStorage.getItem('resourceId') || '').split(':')
    let shortId = ''
    if (resourceId.length > 7) {
      shortId = resourceId[7]
    }

    return (
      <div>
        <div className="TitleBar">
          <div className="TitleBar-title">Yet Another Cloud Annotations</div>
          {this.props.location.pathname !== '/login' ? (
            <div
              className={`TitleBar-user ${
                this.state.showDropDown ? '--Active' : ''
              }`}
              onClick={this.showDropDown}
              ref={input => {
                this.dropDownTriggerRef = input
              }}
            >
              <svg viewBox="0 0 32 32" className="TitleBar-user-Icon">
                <path d="M15.9.1C7.3.1.1 7.2.1 15.9c0 8.7 7.1 15.7 15.8 15.7 8.7 0 15.8-7 15.8-15.7S24.6.1 15.9.1zm7.3 24.3H8.6c-1.4 0-2.6.8-3.2 1.9C2.7 23.6 1 19.9 1 15.8 1 7.7 7.6 1 15.8 1 24 1 30.7 7.7 30.7 15.8c0 4.1-1.7 7.8-4.4 10.4-.5-1.1-1.8-1.8-3.1-1.8z" />
                <path d="M15.9 6.5c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zm0-2c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9z" />
              </svg>
            </div>
          ) : (
            ''
          )}
        </div>

        <div
          className={`TitleBar-user-Dropdown ${
            this.state.showDropDown ? '--Active' : ''
          }`}
          ref={input => {
            this.dropDownRef = input
          }}
        >
          <div className="TitleBar-user-Dropdown-profile">
            <div className="TitleBar-user-Dropdown-svg-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="none" d="M0-215.2h47.9v10.7H0z" />
                <path fill="#8CD211" d="M26-23.6l-9 4.8v-9l9-4.8z" />
                <path fill="#20343e" d="M14.9-19l-8-4.2v-8.9l8 4.2z" />
                <path
                  fill="#5AAAFA"
                  d="M31-36.2l-8.8-4.5-3 1.5 8.6 4.5v16.6l3.2-1.7z"
                />
                <path
                  fill="#8CD211"
                  d="M26-21.2L16-16 1-24v4.2l15 7.7 10-5.1z"
                />
                <path
                  fill="#20343e"
                  d="M20.1-41.7l-4.2-2.2L1-36.1v9.9l4 2.1v-9.8z"
                />
                <path fill="#5AAAFA" d="M16.1-29.7l-7.7-3.9 8.7-4.5 7.6 3.9z" />
                <path fill="#8CD211" d="M19.1 14.9l-6 3.2v-5.9l6-3.2z" />
                <path fill="#20343e" d="M11.1 18.4l-5.8-3V9.2l5.8 3z" />
                <path
                  fill="#5AAAFA"
                  d="M23.3 5.9l-6.4-3.3-2.2 1.2 6.5 3.3-.1 12.3 2.2-1.2z"
                />
                <path
                  fill="#8CD211"
                  d="M19.2 17.1L12 21 .7 15.4v2.8L12 24l7.2-3.7z"
                />
                <path
                  fill="#20343e"
                  d="M15.1 1.8L12 .1.7 5.9V13l2.6 1.4V7.8z"
                />
                <path fill="#5AAAFA" d="M12 10.5L6.9 7.8l5.9-3.1 5 2.7z" />
                <path fill="#8CD211" d="M41.2-74.3l-14.9 7.7v-15.3l14.9-7.7z" />
                <path fill="#20343e" d="M23.9-66.7l-13.7-7V-89l13.7 7.2z" />
                <path
                  fill="#5AAAFA"
                  d="M48.5-94l-14.4-7.4-4.7 2.5 14 7.2v25.9l5.1-2.7z"
                />
                <path
                  fill="#8CD211"
                  d="M41.1-71.7l-16 8.3L1.5-75.6v7.2L25-56.3l16.1-8.3z"
                />
                <path
                  fill="#20343e"
                  d="M31.5-102.7l-6.6-3.4L1.5-94v15.8L7.8-75v-15.5z"
                />
                <path
                  fill="#5AAAFA"
                  d="M25.1-83.8l-12.5-6.5 14.2-7.3 12.5 6.4z"
                />
                <path fill="#8CD211" d="M52.8-139.4l-18.9 9.8V-149l18.9-9.9z" />
                <path fill="#20343e" d="M30.8-129.6l-17.4-9V-158l17.4 9z" />
                <path
                  fill="#5AAAFA"
                  d="M62.2-164.4l-18.3-9.4-6.1 3.1 17.9 9.2v32.9l6.5-3.3z"
                />
                <path
                  fill="#8CD211"
                  d="M52.8-136.1l-20.4 10.6-30-15.5-.1 9.2 29.9 15.3L52.8-127z"
                />
                <path
                  fill="#20343e"
                  d="M40.5-175.5l-8.3-4.3-29.8 15.4-.1 20.1 8.1 4.1v-19.7z"
                />
                <path
                  fill="#5AAAFA"
                  d="M32.4-151.5l-15.9-8.2 18.1-9.3 15.8 8.2z"
                />
                <path fill="none" d="M1-194.6h56.4v9.3H1z" />
              </svg>
            </div>
            <div className="TitleBar-user-Dropdown-profile-id">{shortId}</div>
          </div>
          <div className="TitleBar-user-Dropdown-logout" onClick={this.logout}>
            Log out
          </div>
        </div>
      </div>
    )
  }
}

export default TitleBar
