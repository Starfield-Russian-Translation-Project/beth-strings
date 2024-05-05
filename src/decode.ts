import type { Encoding, Language, StringEntity, StringType } from './types';
import { ELEMENT_ATTRS_COUNT, HEADER_ATTRS_COUNT, UINT32_BYTE_COUNT, LANGUAGE_ENCODING_MAP } from './constants';
import { parseHeader, TextDecoder } from './util';

export const decode = (
  buffer: ArrayBuffer,
  type: StringType,
  lang: Language,
): StringEntity[] => {
  if (type !== 'dlstring' && type !== 'ilstring' && type !== 'string') {
    throw Error('Incorrect type. Correct types: "dlstring", "ilstring", "string"');
  }

  if (type === 'string') {
    return decodeStrings(buffer, LANGUAGE_ENCODING_MAP[lang]);
  }

  return decodeDlStrings(buffer, LANGUAGE_ENCODING_MAP[lang]);
}

const decodeStrings = (buffer: ArrayBuffer, encoding: Encoding): StringEntity[] => {
  const dataView = new DataView(buffer);
  const decoder = new TextDecoder(encoding);
  const result: StringEntity[] = [];

  const { stringsCount, textStartOffset } = parseHeader(dataView);
  const stringsBuffer = buffer.slice(textStartOffset);
  const uint8Array = new Uint8Array(stringsBuffer);

  for (let index = 0; index < stringsCount; index++) {
    const idPosition = (index * ELEMENT_ATTRS_COUNT + HEADER_ATTRS_COUNT) * UINT32_BYTE_COUNT;
    const offsetPosition = (index * ELEMENT_ATTRS_COUNT + HEADER_ATTRS_COUNT + 1) * UINT32_BYTE_COUNT;
    
    const elementId = dataView.getUint32(idPosition, true).toString(16);
    const elementOffset = dataView.getUint32(offsetPosition, true);
    const nullPosition = uint8Array.indexOf(0, elementOffset);

    if (!~nullPosition) {
      throw new Error('Null terminator not found.');
    }

    const textBuffer = stringsBuffer.slice(elementOffset, nullPosition);
    const text = decoder.decode(new Uint8Array(textBuffer));

    result.push({ id: elementId, position: elementOffset, text });
  }

  return result;
}

const decodeDlStrings = (buffer: ArrayBuffer, encoding: Encoding): StringEntity[] => {
  const dataView = new DataView(buffer);
  const decoder = new TextDecoder(encoding);
  const result: StringEntity[] = [];

  const { stringsCount, textStartOffset } = parseHeader(dataView);
  const stringsBuffer = buffer.slice(textStartOffset);
  const stringsView = new DataView(stringsBuffer);

  for (let index = 0; index < stringsCount; index++) {
    const idPosition = (index * ELEMENT_ATTRS_COUNT + HEADER_ATTRS_COUNT) * UINT32_BYTE_COUNT;
    const offsetPosition = (index * ELEMENT_ATTRS_COUNT + HEADER_ATTRS_COUNT + 1) * UINT32_BYTE_COUNT;
    
    const elementId = dataView.getUint32(idPosition, true).toString(16);
    const elementOffset = dataView.getUint32(offsetPosition, true);

    const textLength = stringsView.getUint32(elementOffset, true);
    const nullByte = 1;
    const textStartPosition = elementOffset + UINT32_BYTE_COUNT;
    const textEndPosition = textStartPosition + textLength - nullByte;
    const textBuffer = stringsBuffer.slice(textStartPosition, textEndPosition);
    const text = decoder.decode(new Uint8Array(textBuffer));

    result.push({ id: elementId, position: elementOffset, text });
  }

  return result;
}
