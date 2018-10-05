import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

class Login extends Component {
  render() {
    return (
      <div>
        <div className="Login-TopBar">
          <div className="Login-TopBar-title">
            Cloud Object Storage / Connection Details
          </div>
        </div>
        <div className="Login-Parent">
          <div className="Login-FormWrapper">
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">
                Resource Instance ID
              </label>
              <input className="Login-FormItem-Input" type="text" />
            </div>
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">Login URL</label>
              <input className="Login-FormItem-Input" type="text" />
            </div>
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">API Key</label>
              <input className="Login-FormItem-Input" type="password" />
            </div>
          </div>
        </div>
        <div className="Login-BottomBar">
          <Link className="Login-Button --Dissabled" to="">
            Continue
          </Link>
        </div>
      </div>
    )
  }
}

export default Login
