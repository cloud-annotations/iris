import Base64 from "crypto-js/enc-base64";
import MD5 from "crypto-js/md5";

import { parseXML } from "src/Utils";

const xmlAsJsonFetch = async (url, options) => {
  const res = await fetch(url, options);
  const textXML = await res.text();
  const json = parseXML(textXML);

  if (json.Error) {
    const error = new Error();
    error.message = json.Error.Message;
    error.name = json.Error.Code;
    throw error;
  }

  return json;
};

const blobFetch = async (url, options, forceBinary) => {
  const res = await fetch(url, options);

  if (forceBinary) {
    return res.blob();
  }

  if (url.endsWith(".json")) {
    return res.json();
  }
  if (url.endsWith(".txt")) {
    return res.text();
  }
  return res.blob();
};

export default class COS {
  constructor({ endpoint, accessKeyId, secretAccessKey }) {
    this.endpoint = endpoint;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
  }

  /**
   * Creates a new bucket.
   *
   * @param {string} Bucket
   * @param {string} [IBMServiceInstanceId]
   */
  createBucket = async ({ Bucket, IBMServiceInstanceId }) => {
    const url = `/api/proxy/${this.endpoint}/${Bucket}`;
    const options = {
      method: "PUT",
      headers: {
        "ibm-service-instance-id": IBMServiceInstanceId,
      },
    };
    return await xmlAsJsonFetch(url, options);
  };

  /**
   * Deletes the bucket.
   * All objects (including all object versions and Delete Markers) in the
   * bucket must be deleted before the bucket itself can be deleted.
   *
   * @param {string} Bucket
   */
  deleteBucket = async ({ Bucket }) => {
    const url = `/api/proxy/${this.endpoint}/${Bucket}`;
    const options = {
      method: "DELETE",
    };
    return await xmlAsJsonFetch(url, options);
  };

  /**
   * If object versioning is not enabled, deletes an object.
   * If versioning is enabled, removes the null version (if there is one) of an
   * object and inserts a delete marker, which becomes the latest version of the
   * object. If there isn't a null version, IBM COS does not remove any objects.
   *
   * @param {string} Bucket
   * @param {string} Key
   */
  deleteObject = async ({ Bucket, Key }) => {
    const url = `/api/proxy/${this.endpoint}/${Bucket}/${Key}`;
    const options = {
      method: "DELETE",
    };
    return await xmlAsJsonFetch(url, options);
  };

  /**
   * TODO
   * This operation enables you to delete multiple objects from a bucket using a
   * single HTTP request.
   * You may specify up to 1000 keys.
   *
   * @param {string} Bucket
   * @param {Object} Delete
   * @param {Object[]} Delete.Objects
   * @param {string} Delete.Objects[].Key Key name of the object to delete.
   */
  deleteObjects = async ({ Bucket, Delete }) => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const objectString = Delete.Objects.map(
      (object) => `<Object><Key>${object.Key}</Key></Object>`
    ).join("");
    const deleteXml = `${xmlHeader}<Delete>${objectString}</Delete>`;
    const md5Hash = MD5(deleteXml).toString(Base64);

    const url = `/api/proxy/${this.endpoint}/${Bucket}?delete=`;
    const options = {
      method: "POST",
      body: deleteXml,
      headers: {
        "Content-MD5": md5Hash,
      },
    };
    return await xmlAsJsonFetch(url, options);
  };

  /**
   * Returns the region the bucket resides in.
   *
   * @param {string} Bucket
   */
  getBucketLocation = async ({ Bucket }) => {
    const url = `/api/proxy/${this.endpoint}/${Bucket}?location`;
    const options = {
      method: "GET",
    };
    return await xmlAsJsonFetch(url, options);
  };

  /**
   * Retrieves objects from IBM COS.
   *
   * @param {string} Bucket
   * @param {string} Key
   */
  getObject = async ({ Bucket, Key }, forceBinary) => {
    const url = `/api/proxy/${this.endpoint}/${Bucket}/${Key}`;
    const options = {
      method: "GET",
    };
    return await blobFetch(url, options, forceBinary);
  };

  /**
   * Returns a list of all buckets owned by the authenticated sender of the
   * request.
   *
   * @param {string} [IBMServiceInstanceId]
   */
  listBuckets = async ({ IBMServiceInstanceId }) => {
    const url = `/api/proxy/${this.endpoint}`;
    const options = {
      method: "GET",
      headers: {
        "ibm-service-instance-id": IBMServiceInstanceId,
      },
    };
    return await xmlAsJsonFetch(url, options);
  };

  /**
   * Returns a list of all buckets owned by the authenticated sender of the
   * request, along with the LocationConstraint describing the region that the
   * bucket resides in and the bucket's storage tier.
   *
   * @param {string} [IBMServiceInstanceId]
   */
  listBucketsExtended = async ({ IBMServiceInstanceId }) => {
    const url = `/api/proxy/${this.endpoint}?extended`;
    const options = {
      method: "GET",
      headers: {
        "ibm-service-instance-id": IBMServiceInstanceId,
      },
    };
    return await xmlAsJsonFetch(url, options);
  };

  /**
   * Returns some or all (up to 1000) of the objects in a bucket.
   *
   * @param {string} Bucket Name of the bucket to list.
   * @param {string} [Prefix] Limits the response to keys that begin with the
   * specified prefix.
   * @param {string} [ContinuationToken] ContinuationToken indicates Amazon S3
   * that the list is being continued on this bucket with a token.
   * ContinuationToken is obfuscated and is not a real key
   */
  listObjectsV2 = async ({ Bucket, Prefix, ContinuationToken }) => {
    const params = { "list-type": 2 };
    if (ContinuationToken) {
      params["continuation-token"] = ContinuationToken;
    }

    if (Prefix) {
      params["prefix"] = Prefix;
    }

    const search = new URLSearchParams(params);
    const url = `/api/proxy/${this.endpoint}/${Bucket}?${search.toString()}`;

    const options = {
      method: "GET",
    };
    return await xmlAsJsonFetch(url, options);
  };

  /**
   * Adds an object to a bucket.
   *
   * @param {string} Bucket Name of the bucket to which the PUT operation was
   * initiated.
   * @param {string} Key Object key for which the PUT operation was initiated.
   * @param {Buffer, Typed Array, Blob, String, ReadableStream} Body Object
   * data.
   */
  putObject = async ({ Bucket, Key, Body }) => {
    const url = `/api/proxy/${this.endpoint}/${Bucket}/${Key}`;
    const options = {
      method: "PUT",
      body: Body,
    };
    return await xmlAsJsonFetch(url, options);
  };
}
