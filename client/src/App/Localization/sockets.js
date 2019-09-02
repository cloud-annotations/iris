import io from 'socket.io-client'

const socket = io.connect()

////////////////////////////////////////////////////////////////////////////////
// Receivers
////////////////////////////////////////////////////////////////////////////////
socket.on('patch', res => {
  const { op, value } = res
  const { annotations, images, labels } = value
  if (annotations) {
    if (op === '+') {
      return
    }
    if (op === '-') {
      return
    }
  }

  if (images) {
    if (op === '+') {
      return
    }
    if (op === '-') {
      return
    }
  }

  if (labels) {
    if (op === '+') {
      return
    }
    if (op === '-') {
      return
    }
  }
})

socket.on('theHeadCount', count => {})

////////////////////////////////////////////////////////////////////////////////
// Close connection
////////////////////////////////////////////////////////////////////////////////
socket.close()

////////////////////////////////////////////////////////////////////////////////
// Emitters
////////////////////////////////////////////////////////////////////////////////
// Create label
socket.emit('patch', {
  op: '+',
  value: {
    labels: { label: label }
  }
})

// Delete label
socket.emit('patch', {
  op: '-',
  value: {
    labels: { label: label }
  }
})

// Create annotation
socket.emit('patch', {
  op: '+',
  value: {
    annotations: { image: image, ...box }
  }
})

// Delete annotation
socket.emit('patch', {
  op: '-',
  value: {
    annotations: { image: image, ...box }
  }
})

// Create image
socket.emit('patch', {
  op: '+',
  value: {
    images: { image: image }
  }
})

// Delete image
socket.emit('patch', {
  op: '-',
  value: {
    images: { image: image }
  }
})

// Join room
socket.emit('join', { bucket: bucket, image: image })
