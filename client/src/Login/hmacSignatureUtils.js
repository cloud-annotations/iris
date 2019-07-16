import crypto from 'crypto'
import moment from 'moment'

export const getSignatureHeaders = config => {
  // please don't store credentials directly in code
  const accessKey = config.accessKeyId
  const secretKey = config.secretAccessKey

  const httpMethod = 'GET'
  const host = config.endpoint
  const region = 'us-standard'
  const bucket = '' // add a '/' before the bucket name to list buckets
  const objectKey = ''
  const requestParameters = ''

  // hashing and signing methods
  function hash(key, msg) {
    var hmac = crypto.createHmac('sha256', key)
    hmac.update(msg, 'utf8')
    return hmac.digest()
  }

  function hmacHex(key, msg) {
    var hmac = crypto.createHmac('sha256', key)
    hmac.update(msg, 'utf8')
    return hmac.digest('hex')
  }

  function hashHex(msg) {
    var hash = crypto.createHash('sha256')
    hash.update(msg)
    return hash.digest('hex')
  }

  // region is a wildcard value that takes the place of the AWS region value
  // as COS doesn't use the same conventions for regions, this parameter can accept any string
  function createSignatureKey(key, datestamp, region, service) {
    var keyDate = hash('AWS4' + key, datestamp)
    var keyString = hash(keyDate, region)
    var keyService = hash(keyString, service)
    var keySigning = hash(keyService, 'aws4_request')
    return keySigning
  }

  // assemble the standardized request
  var time = moment().utc()
  var timestamp = time.format('YYYYMMDDTHHmmss') + 'Z'
  var datestamp = time.format('YYYYMMDD')

  var standardizedResource = bucket + '/' + objectKey
  var standardizedQuerystring = requestParameters
  var standardizedHeaders =
    'host:' + host + '\n' + 'x-amz-date:' + timestamp + '\n'
  var signedHeaders = 'host;x-amz-date'
  var payloadHash = hashHex('')

  var standardizedRequest =
    httpMethod +
    '\n' +
    standardizedResource +
    '\n' +
    standardizedQuerystring +
    '\n' +
    standardizedHeaders +
    '\n' +
    signedHeaders +
    '\n' +
    payloadHash

  // assemble string-to-sign
  var hashingAlgorithm = 'AWS4-HMAC-SHA256'
  var credentialScope =
    datestamp + '/' + region + '/' + 's3' + '/' + 'aws4_request'
  var sts =
    hashingAlgorithm +
    '\n' +
    timestamp +
    '\n' +
    credentialScope +
    '\n' +
    hashHex(standardizedRequest)

  // generate the signature
  var signatureKey = createSignatureKey(secretKey, datestamp, region, 's3')
  var signature = hmacHex(signatureKey, sts)

  // assemble all elements into the 'authorization' header
  var v4authHeader =
    hashingAlgorithm +
    ' ' +
    'Credential=' +
    accessKey +
    '/' +
    credentialScope +
    ', ' +
    'SignedHeaders=' +
    signedHeaders +
    ', ' +
    'Signature=' +
    signature

  // create and send the request
  var authHeaders = { 'x-amz-date': timestamp, Authorization: v4authHeader }
  // the 'requests' package automatically adds the required 'host' header

  return authHeaders
}
