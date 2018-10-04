export function getCookie(cname) {
  var name = cname + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

export function generateUUID() {
  var d = new Date().getTime()
  if (Date.now) {
    d = Date.now() //high-precision timer
  }
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
    c
  ) {
    var r = ((d + Math.random() * 16) % 16) | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

export function getDataTransferItems(event) {
  let dataTransferItemsList = []
  if (event.dataTransfer) {
    const dt = event.dataTransfer
    if (dt.files && dt.files.length) {
      dataTransferItemsList = dt.files
    } else if (dt.items && dt.items.length) {
      // During the drag even the dataTransfer.files is null
      // but Chrome implements some drag store, which is accesible via dataTransfer.items
      return Array.prototype.slice
        .call(dt.items)
        .filter(item => item.kind === 'file')
    }
  } else if (event.target && event.target.files) {
    dataTransferItemsList = event.target.files
  }
  // Convert from DataTransferItemsList to the native Array
  return Array.prototype.slice.call(dataTransferItemsList)
}

export function arrayBufferToBase64(buffer) {
  var binary = ''
  var bytes = [].slice.call(new Uint8Array(buffer))
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return window.btoa(binary)
}

export function readFile(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export function shrinkImage(imageSrc) {
  return new Promise((resolve, reject) => {
    var img = new Image()
    img.onload = () => {
      const c = window.document.createElement('canvas')
      const ctx = c.getContext('2d')
      c.width = 224
      c.height = 224
      ctx.drawImage(img, 0, 0, 224, 224)

      resolve(c)
    }
    img.src = imageSrc
  })
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(result => {
      resolve(result)
    }, 'image/jpeg')
  })
}

export function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText)
  }
  return response
}

export function validateCookies() {
  return new Promise((resolve, reject) => {
    const cookie = getCookie('token')
    if (cookie === '') {
      const apiKey = prompt('apikey')
      const url = 'api/auth?apikey=' + apiKey
      const options = {
        method: 'GET'
      }
      const request = new Request(url)
      fetch(request, options)
        .then(response => {
          if (!response.ok) {
            // Fake a forbidden.
            throw Error('Forbidden')
          }
          return response
        })
        .then(resolve)
        .catch(reject)
    } else {
      resolve()
    }
  })
}
