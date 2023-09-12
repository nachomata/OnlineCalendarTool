function utf8Base64UrlSafeEncode(inputString) {
  const utf8Encoded = new TextEncoder().encode(inputString);
  const base64Encoded = btoa(String.fromCharCode.apply(null, utf8Encoded));
  return base64Encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function utf8Base64UrlSafeDecode(encodedString) {
  while (encodedString.length % 4 !== 0) {
    encodedString += '=';
  }
  encodedString = encodedString.replace('-', '+').replace('_', '/');
  return new TextDecoder().decode(Uint8Array.from(atob(encodedString), c => c.charCodeAt(0)));
}