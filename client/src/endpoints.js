const _regions = {
  'cross-region': [
    'us',
    'dal.us',
    'wdc.us',
    'sjc.us',
    'eu',
    'ams.eu',
    'fra.eu',
    'mil.eu',
    'ap',
    'tok.ap',
    'seo.ap',
    'hkg.ap'
  ],
  regional: ['us-south', 'us-east', 'eu-gb', 'eu-de', 'jp-tok', 'au-syd'],
  'single-site': [
    'ams03',
    'che01',
    'mel01',
    'osl01',
    'tor01',
    'sao01',
    'seo01',
    'mon01',
    'mex01',
    'sjc04',
    'mil01',
    'hkg02'
  ]
}

let _defaultEndpoint = 's3.private.us.cloud-object-storage.appdomain.cloud'

let _privateEndpoints = {
  us: 's3.private.us.cloud-object-storage.appdomain.cloud',
  'dal.us': 's3.private.dal.us.cloud-object-storage.appdomain.cloud',
  'wdc.us': 's3.private.wdc.us.cloud-object-storage.appdomain.cloud',
  'sjc.us': 's3.private.sjc.us.cloud-object-storage.appdomain.cloud',
  eu: 's3.private.eu.cloud-object-storage.appdomain.cloud',
  'ams.eu': 's3.private.ams.eu.cloud-object-storage.appdomain.cloud',
  'fra.eu': 's3.private.fra.eu.cloud-object-storage.appdomain.cloud',
  'mil.eu': 's3.private.mil.eu.cloud-object-storage.appdomain.cloud',
  ap: 's3.private.ap.cloud-object-storage.appdomain.cloud',
  'tok.ap': 's3.private.tok.ap.cloud-object-storage.appdomain.cloud',
  'seo.ap': 's3.private.seo.ap.cloud-object-storage.appdomain.cloud',
  'hkg.ap': 's3.private.hkg.ap.cloud-object-storage.appdomain.cloud',
  'us-south': 's3.private.us-south.cloud-object-storage.appdomain.cloud',
  'us-east': 's3.private.us-east.cloud-object-storage.appdomain.cloud',
  'eu-gb': 's3.private.eu-gb.cloud-object-storage.appdomain.cloud',
  'eu-de': 's3.private.eu-de.cloud-object-storage.appdomain.cloud',
  'jp-tok': 's3.private.jp-tok.cloud-object-storage.appdomain.cloud',
  'au-syd': 's3.private.au-syd.cloud-object-storage.appdomain.cloud',
  ams03: 's3.private.ams03.cloud-object-storage.appdomain.cloud',
  che01: 's3.private.che01.cloud-object-storage.appdomain.cloud',
  mel01: 's3.private.mel01.cloud-object-storage.appdomain.cloud',
  osl01: 's3.private.osl01.cloud-object-storage.appdomain.cloud',
  tor01: 's3.private.tor01.cloud-object-storage.appdomain.cloud',
  sao01: 's3.private.sao01.cloud-object-storage.appdomain.cloud',
  seo01: 's3.private.seo01.cloud-object-storage.appdomain.cloud',
  mon01: 's3.private.mon01.cloud-object-storage.appdomain.cloud',
  mex01: 's3.private.mex01.cloud-object-storage.appdomain.cloud',
  sjc04: 's3.private.sjc04.cloud-object-storage.appdomain.cloud',
  mil01: 's3.private.mil01.cloud-object-storage.appdomain.cloud',
  hkg02: 's3.private.hkg02.cloud-object-storage.appdomain.cloud'
}

let _endpoints = _privateEndpoints

if (process.env.NODE_ENV !== 'production') {
  _defaultEndpoint = 's3.us.cloud-object-storage.appdomain.cloud'
  _endpoints = {
    us: 's3.us.cloud-object-storage.appdomain.cloud',
    'dal.us': 's3.dal.us.cloud-object-storage.appdomain.cloud',
    'wdc.us': 's3.wdc.us.cloud-object-storage.appdomain.cloud',
    'sjc.us': 's3.sjc.us.cloud-object-storage.appdomain.cloud',
    eu: 's3.eu.cloud-object-storage.appdomain.cloud',
    'ams.eu': 's3.ams.eu.cloud-object-storage.appdomain.cloud',
    'fra.eu': 's3.fra.eu.cloud-object-storage.appdomain.cloud',
    'mil.eu': 's3.mil.eu.cloud-object-storage.appdomain.cloud',
    ap: 's3.ap.cloud-object-storage.appdomain.cloud',
    'tok.ap': 's3.tok.ap.cloud-object-storage.appdomain.cloud',
    'seo.ap': 's3.seo.ap.cloud-object-storage.appdomain.cloud',
    'hkg.ap': 's3.hkg.ap.cloud-object-storage.appdomain.cloud',
    'us-south': 's3.us-south.cloud-object-storage.appdomain.cloud',
    'us-east': 's3.us-east.cloud-object-storage.appdomain.cloud',
    'eu-gb': 's3.eu-gb.cloud-object-storage.appdomain.cloud',
    'eu-de': 's3.eu-de.cloud-object-storage.appdomain.cloud',
    'jp-tok': 's3.jp-tok.cloud-object-storage.appdomain.cloud',
    'au-syd': 's3.au-syd.cloud-object-storage.appdomain.cloud',
    ams03: 's3.ams03.cloud-object-storage.appdomain.cloud',
    che01: 's3.che01.cloud-object-storage.appdomain.cloud',
    mel01: 's3.mel01.cloud-object-storage.appdomain.cloud',
    osl01: 's3.osl01.cloud-object-storage.appdomain.cloud',
    tor01: 's3.tor01.cloud-object-storage.appdomain.cloud',
    sao01: 's3.sao01.cloud-object-storage.appdomain.cloud',
    seo01: 's3.seo01.cloud-object-storage.appdomain.cloud',
    mon01: 's3.mon01.cloud-object-storage.appdomain.cloud',
    mex01: 's3.mex01.cloud-object-storage.appdomain.cloud',
    sjc04: 's3.sjc04.cloud-object-storage.appdomain.cloud',
    mil01: 's3.mil01.cloud-object-storage.appdomain.cloud',
    hkg02: 's3.hkg02.cloud-object-storage.appdomain.cloud'
  }
}

const _regionMap = {
  us: 'us',
  'us-geo': 'us',
  'dal.us': 'dal.us',
  'dal-us-geo': 'dal.us',
  'wdc.us': 'wdc.us',
  'wdc-us-geo': 'wdc.us',
  'sjc.us': 'sjc.us',
  'sjc-us-geo': 'sjc.us',
  eu: 'eu',
  'eu-geo': 'eu',
  'ams.eu': 'ams.eu',
  'ams-eu-geo': 'ams.eu',
  'fra.eu': 'fra.eu',
  'fra-eu-geo': 'fra.eu',
  'mil.eu': 'mil.eu',
  'mil-eu-geo': 'mil.eu',
  ap: 'ap',
  'ap-geo': 'ap',
  'tok.ap': 'tok.ap',
  'tok-ap-geo': 'tok.ap',
  'seo.ap': 'seo.ap',
  'seo-ap-geo': 'seo.ap',
  'hkg.ap': 'hkg.ap',
  'hkg-ap-geo': 'hkg.ap',
  'us-south': 'us-south',
  'us-east': 'us-east',
  'eu-gb': 'eu-gb',
  'eu-de': 'eu-de',
  'jp-tok': 'jp-tok',
  'au-syd': 'au-syd',
  ams03: 'ams03',
  che01: 'che01',
  mel01: 'mel01',
  osl01: 'osl01',
  tor01: 'tor01',
  sao01: 'sao01',
  seo01: 'seo01',
  mon01: 'mon01',
  mex01: 'mex01',
  sjc04: 'sjc04',
  mil01: 'mil01',
  hkg02: 'hkg02'
}

// Endpoints that should work.
// s3.us.cloud-object-storage.appdomain.cloud
// s3.private.us.cloud-object-storage.appdomain.cloud
// s3-api.us-geo.objectstorage.service.networklayer.com
// s3.us-south.objectstorage.service.networklayer.com
// s3-api.us-geo.objectstorage.softlayer.net
// s3.us-south.objectstorage.softlayer.net
export const regionFromEndpoint = endpoint => {
  const re = /s3(?:-api)?\.(?:private\.)?(.*)\.(?:cloud-object-storage\.appdomain\.cloud|objectstorage\.(?:service\.networklayer\.com|softlayer\.net))/
  const m = re.exec(endpoint)
  return _regionMap[m[1]]
}

export const endpointFromRegion = region => {
  return _endpoints[region]
}

export const fullPrivateEndpointForLocationConstraint = location => {
  if (location === undefined) {
    return undefined
  }
  location = location.replace(/-standard$/, '')
  location = location.replace(/-vault$/, '')
  location = location.replace(/-cold$/, '')
  location = location.replace(/-flex$/, '')
  return `https://${_privateEndpoints[location]}`
}

export const endpointForLocationConstraint = location => {
  if (location === undefined) {
    return undefined
  }
  location = location.replace(/-standard$/, '')
  location = location.replace(/-vault$/, '')
  location = location.replace(/-cold$/, '')
  location = location.replace(/-flex$/, '')
  return _endpoints[location]
}

export const defaultEndpoint = _defaultEndpoint
export const endpoints = _endpoints
export const regions = _regions
