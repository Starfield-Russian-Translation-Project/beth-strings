import { test, describe, beforeAll, expect } from "bun:test";
import { decode } from './decode';
import { encodeDlStrings, encodeHeader } from './encode';
import { ELEMENT_ATTRS_COUNT, HEADER_ATTRS_COUNT, UINT32_BYTE_COUNT } from "./constants";

let dlStrings;
let strings;
let dlStringsBuffer;
let stringsBuffer;

beforeAll(async () => {
  const dlStringsFile = Bun.file('.mock/starfield_en.dlstrings');
  const stringsFile = Bun.file('.mock/starfield_en.strings');

  dlStringsBuffer = await dlStringsFile.arrayBuffer();
  stringsBuffer = await stringsFile.arrayBuffer();

  dlStrings = decode(dlStringsBuffer, 'dlstring');
  strings = decode(stringsBuffer, 'string');
});

describe('Encoding *.dlstrings/*.ilstrings', () => {
  test.todo('Should encode without errors');

  test('Should correctly encode header', () => {
    const headerLength = dlStrings.length * ELEMENT_ATTRS_COUNT * UINT32_BYTE_COUNT + HEADER_ATTRS_COUNT * UINT32_BYTE_COUNT;
    const headerBuffer = dlStringsBuffer.slice(0, headerLength);
    const stringsLength = 937512;

    expect(encodeHeader(dlStrings, stringsLength)).toEqual(headerBuffer);
  });

  test('Should correctly create directories from raw string data', () => {
    const {directories} = encodeDlStrings(dlStrings, 'windows1252');

    expect(directories).toEqual(dlStrings.map(({id, position}) => ({id, position})));
  });

  test('Should correctly convert raw string data into pseudo ArrayBuffer', () => {
    const headerLength = dlStrings.length * ELEMENT_ATTRS_COUNT * UINT32_BYTE_COUNT + HEADER_ATTRS_COUNT * UINT32_BYTE_COUNT;
    const strings = dlStringsBuffer.slice(headerLength, dlStringsBuffer.length);
    const { pseudoBuffer } = encodeDlStrings(dlStrings, 'windows1252');

    expect(new Uint8Array(pseudoBuffer).buffer).toEqual(strings);
  });

  test.todo('Elements count should be equal to source elements count');

  test.todo('Hash of decoded result should be equal to hash of source file');
});
  
describe('Encoding *.strings', () => {
  test.todo('Should encode without errors');

  test('Should correctly encode header', () => {
    const headerLength = strings.length * ELEMENT_ATTRS_COUNT * UINT32_BYTE_COUNT + HEADER_ATTRS_COUNT * UINT32_BYTE_COUNT;
    const headerBuffer = stringsBuffer.slice(0, headerLength);
    const stringsLength = 1145601;

    expect(encodeHeader(strings, stringsLength)).toEqual(headerBuffer);
  });

  test.todo('Elements count should be equal to source elements count');

  test.todo('Hash of decoded result should be equal to hash of source file');
});
