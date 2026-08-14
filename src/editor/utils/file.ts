import axios from 'axios';

/**
 * Returns true if the file type matches the types passed within the acceptableMimeTypes array, false otherwise.
 * The types passed must be strings and are CASE-SENSITIVE.
 * eg. if file is of type 'text' and acceptableMimeTypes = ['TEXT', 'IMAGE'] the function will return false.
 * @param file - The file you want to type check.
 * @param acceptableMimeTypes - An array of strings of types which the file is checked against.
 * @returns true if the file is an acceptable mime type, false otherwise.
 */
export function isMimeType(
  file: File,
  acceptableMimeTypes: Array<string>,
): boolean {
  for (const acceptableType of acceptableMimeTypes) {
    if (file.type.startsWith(acceptableType)) {
      return true;
    }
  }
  return false;
}

/**
 * Loads the given resource as a File. Note this assumes the resource is publicly accessible and allows CORS
 * requests. It also accepts base64 encoded `data:` URIs as well, which sites like Google Search will provide.
 * Otherwise, this will throw a request error to be handled by the caller.
 * @param url
 * @param allowedTypes
 */
export const getFileFromUrl = async (url: string, allowedTypes: string[]) => {
  const name = globalThis.crypto.randomUUID();

  // Handle data URIs (see: https://stackoverflow.com/a/38935990)
  if (url.startsWith('data:')) {
    const arr = url.split(',');
    const mime = arr[0]?.match(/:(.*?);/)?.[1];
    const data = atob(arr[arr.length - 1]);
    let n = data.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = data.charCodeAt(n);
    }
    const file = new File([u8arr], name, { type: mime });
    return Promise.resolve(file);
  }

  const client = axios.create({
    headers: {
      Accept: allowedTypes.join(', '),
    },
    responseType: 'blob',
  });

  const response = await client.get<Blob>(url);
  return new File([response.data], name, {
    type: response.data.type,
  });
};
