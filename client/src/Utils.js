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
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

export function getDataTransferItems(e) {
  let dataTransferItemsList = []
  if (e.dataTransfer) {
    const dt = e.dataTransfer
    if (dt.files && dt.files.length) {
      dataTransferItemsList = dt.files
    } else if (dt.items && dt.items.length) {
      // During the drag even the dataTransfer.files is null
      // but Chrome implements some drag store, which is accessible via dataTransfer.items
      return Array.prototype.slice
        .call(dt.items)
        .filter(item => item.kind === 'file')
    }
  } else if (e.target && e.target.files) {
    dataTransferItemsList = e.target.files
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

export async function readFile(file) {
  return new Promise((resolve, _) => {
    var reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export async function imageToCanvas(imageSrc, width, height, mode) {
  return new Promise((resolve, _) => {
    var img = new Image()
    img.onload = () => {
      const c = window.document.createElement('canvas')
      const ctx = c.getContext('2d')
      if (mode === 'scaleToFill') {
        c.width = width || img.width
        c.height = height || img.height
      } else if (mode === 'scaleAspectFit') {
        if (img.width > img.height) {
          const aspect = img.height / img.width
          c.width = Math.min(img.width, width)
          c.height = c.width * aspect
        } else {
          const aspect = img.width / img.height
          c.height = Math.min(img.height, height)
          c.width = c.height * aspect
        }
      } else {
        c.width = width || img.width
        c.height = height || img.height
      }

      ctx.drawImage(img, 0, 0, c.width, c.height)

      resolve(c)
    }
    img.src = imageSrc
  })
}

export async function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(result => {
      resolve(result)
    }, 'image/jpeg')
  })
}

export async function namedCanvasToFile(namedCanvas) {
  return new Promise((resolve, _) => {
    namedCanvas.canvas.toBlob(blob => {
      resolve({ blob: blob, name: namedCanvas.name })
    }, 'image/jpeg')
  })
}

export function clearCookies(cookies) {
  cookies.forEach(cookie => {
    document.cookie = `${cookie}=; Max-Age=-99999999; path=/`
  })
}

export function handleErrors(response) {
  if (!response.ok) {
    if (response.statusText === 'Forbidden') {
      clearCookies(['token', 'refresh_token'])
    }
    throw new Error(response.statusText)
  }
  return response
}

export function validateCookies() {
  const token = getCookie('token')
  const refreshToken = getCookie('refresh_token')
  if (token === '' || refreshToken === '') {
    // If either of the tokens are expired, clear them both.
    clearCookies(['token', 'refresh_token'])
    throw new Error('Forbidden')
  }
}
