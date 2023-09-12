import base64


def utf8_base64_url_safe_encode(input_string):
    utf8_encoded = input_string.encode('utf-8')
    base64_encoded = base64.urlsafe_b64encode(utf8_encoded)
    encoded_string = base64_encoded.decode('utf-8').rstrip('=')
    return encoded_string


def utf8_base64_url_safe_decode(encoded_string):
    encoded_string = encoded_string.replace('-', '+').replace('_', '/')
    while len(encoded_string) % 4 != 0:
        encoded_string += '='
    base64_decoded = base64.urlsafe_b64decode(encoded_string.encode('utf-8'))
    decoded_string = base64_decoded.decode('utf-8')
    return decoded_string
