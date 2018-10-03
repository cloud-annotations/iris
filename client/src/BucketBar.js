import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './BucketBar.css'

class BucketBar extends Component {
  render() {
    const { bucket, onChange } = this.props
    return (
      <div className="BucketBar">
        <Link to="/" className="BucketBar-Button BucketBar-buckets-Wrapper">
          <svg
            className="BucketBar-back-Icon"
            width="16"
            height="14"
            viewBox="0 0 16 14"
          >
            <path d="M4.044 8.003l4.09 3.905-1.374 1.453-6.763-6.356L6.759.639 8.135 2.09 4.043 6.003h11.954v2H4.044z" />
          </svg>Buckets
        </Link>
        <div className="BucketBar-bucketID">{bucket}</div>
        <div className="BucketBar-Button BucketBar-addImages">
          <svg className="BucketBar-addImages-Icon" width="16" height="16" viewBox="0 0 16 16">
            <path d="M7 7H4v2h3v3h2V9h3V7H9V4H7v3zm1 9A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" />
          </svg>Add Images
          <input type="file" accept="image/*" onChange={onChange} multiple />
        </div>
      </div>
    )
  }
}

export default BucketBar
