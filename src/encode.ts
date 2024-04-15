import type { StringEntity } from './types';
import { ELEMENT_ATTRS_COUNT, HEADER_ATTRS_COUNT, UINT32_BYTE_COUNT } from './const';
import { decode, parseHeader } from './util';

export const encode = (
  buffer: ArrayBuffer, 
  type: 'dlstring' | 'ilstring' | 'string', 
  lang?: string, 
  encoding?: string
): StringEntity[] => {
  if (type !== 'dlstring' && type !== 'ilstring' && type !== 'string') {
    throw Error('Incorrect type. Correct types: "dlstring", "ilstring", "string"');
  }

  if (type === 'string') {
    return encodeStrings(buffer);
  }

  return encodeDlStrings(buffer);
}

const encodeStrings = (buffer: ArrayBuffer): StringEntity[] => {
  return [];
}

const encodeDlStrings = (buffer: ArrayBuffer): StringEntity[] => {
  const dataView = new DataView(buffer);
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
    const text = decode(textBuffer);

    result.push({ id: elementId, position: elementOffset, text });
  }

  return result;
}