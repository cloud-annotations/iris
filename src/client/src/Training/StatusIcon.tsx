import React from 'react'

function StatusIcon({
  status,
}: {
  status:
    | 'ready'
    | 'completed'
    //
    | 'initializing'
    | 'updating'
    | 'queued'
    | 'pending'
    | 'running'
    | 'storing'
    //
    | 'canceled'
    //
    | 'failed'
}) {
  switch (status) {
    case 'ready':
    case 'completed':
      return (
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          style={{ height: '14px', flexShrink: 0 }}
        >
          <path
            fill="#24a148"
            d="M6,0C2.7,0,0,2.7,0,6s2.7,6,6,6s6-2.7,6-6S9.3,0,6,0z"
          ></path>
          <polygon
            fill="#ffffff"
            points="5.2,8.2 3,6 3.8,5.2 5.2,6.8 8.2,3.8 9,4.5 "
          ></polygon>
        </svg>
      )

    case 'initializing':
    case 'updating':
    case 'queued':
    case 'pending':
    case 'running':
    case 'storing':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          style={{ height: '14px', flexShrink: 0 }}
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="1s"
            repeatCount="indefinite"
          ></animateTransform>
          <path
            fill="#252629"
            d="M6,2A4,4,0,1,1,2,6,4,4,0,0,1,6,2M6,0a6,6,0,1,0,6,6A6,6,0,0,0,6,0"
          ></path>
          <path fill="#979899" d="M6,0V2A4,4,0,1,1,2,6H0A6,6,0,1,0,6,0"></path>
        </svg>
      )
    case 'canceled':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          style={{ height: '14px', flexShrink: 0 }}
        >
          <path
            fill="#6f6f6f"
            d="M29.4162,14.5905,17.41,2.5838a1.9937,1.9937,0,0,0-2.8192,0L2.5838,14.5905a1.9934,1.9934,0,0,0,0,2.819L14.5905,29.4162a1.9937,1.9937,0,0,0,2.8192,0L29.4162,17.41A1.9934,1.9934,0,0,0,29.4162,14.5905ZM21,18H11V14H21Z"
          />
        </svg>
      )
    case 'failed':
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          style={{ height: '14px', flexShrink: 0 }}
        >
          <circle fill="#da1e28" cx="6" cy="6" r="6"></circle>
          <rect x="5" y="8" fill="#FFFFFF" width="2" height="2"></rect>
          <rect x="5" y="2" fill="#FFFFFF" width="2" height="4"></rect>
        </svg>
      )
  }
}

export default StatusIcon
