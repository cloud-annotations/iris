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

let _endpoints = {
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

if (process.env.NODE_ENV === 'development') {
  _defaultEndpoint = 's3.us-west.cloud-object-storage.test.appdomain.cloud'
  _endpoints = {
    us: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'dal.us': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'wdc.us': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'sjc.us': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    eu: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'ams.eu': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'fra.eu': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'mil.eu': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    ap: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'tok.ap': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'seo.ap': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'hkg.ap': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'us-south': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'us-east': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'eu-gb': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'eu-de': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'jp-tok': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    'au-syd': 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    ams03: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    che01: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    mel01: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    osl01: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    tor01: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    sao01: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    seo01: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    mon01: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    mex01: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    sjc04: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    mil01: 's3.us-west.cloud-object-storage.test.appdomain.cloud',
    hkg02: 's3.us-west.cloud-object-storage.test.appdomain.cloud'
  }
}

export const endpointForLocationConstraint = location => {
  location = location.replace(/-standard$/, '')
  location = location.replace(/-vault$/, '')
  location = location.replace(/-cold$/, '')
  location = location.replace(/-flex$/, '')
  return _endpoints[location]
}

export const defaultEndpoint = _defaultEndpoint
export const endpoints = _endpoints
export const regions = _regions
