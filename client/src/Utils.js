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

export async function convertToJpeg(blob) {
  return new Promise((resolve, reject) => {
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d')
    if (!ctx) {
      return reject()
    }
    const image = new Image()
    image.src = URL.createObjectURL(blob)
    image.onload = function() {
      c.width = image.width
      c.height = image.height
      ctx.drawImage(image, 0, 0)
      const result = dataURItoBlob(c.toDataURL('image/jpeg'))
      resolve(result)
    }
  })
}

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1])
  const mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  const blob = new Blob([ab], { type: mimeString })
  return blob
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

export const parseXML = xmlString => {
  const xml = new window.DOMParser().parseFromString(xmlString, 'text/xml')
  const recursivelyGenerateJson = (json, rootNode) => {
    Array.prototype.forEach.call(rootNode, element => {
      const mutate = item => {
        if (Array.isArray(json)) {
          json.push(item)
        } else {
          json[element.tagName] = item
        }
      }

      if (element.children.length === 0) {
        mutate(element.innerHTML)
      } else if (
        element.children.length > 1 &&
        element.children[0].tagName === element.children[1].tagName // assume array
      ) {
        mutate(recursivelyGenerateJson([], element.children))
      } else {
        mutate(recursivelyGenerateJson({}, element.children))
      }
    })
    return json
  }
  return recursivelyGenerateJson({}, xml.children)
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

export const checkLoginStatus = () => {
  // Check IAM login.
  // const resourceId = localStorage.getItem('resourceId')
  const accessToken = getCookie('access_token')
  const refreshToken = getCookie('refresh_token')
  if (accessToken && refreshToken) {
    return true
  }

  // Used for HMAC login.
  // const accessKeyId = localStorage.getItem('accessKeyId')
  // const secretAccessKey = localStorage.getItem('secretAccessKey')
  // if (accessKeyId && secretAccessKey) {
  //   return true
  // }

  // If we make it here, we are not logged in, clear any tokens.
  clearCookies(['token', 'refresh_token'])
  throw new Error('Forbidden')
}

// export function validateCookies() {
//   const token = getCookie('token')
//   const refreshToken = getCookie('refresh_token')
//   if (token === '' || refreshToken === '') {
//     // If either of the tokens are expired, clear them both.
//     clearCookies(['token', 'refresh_token'])
//     throw new Error('Forbidden')
//   }
// }
