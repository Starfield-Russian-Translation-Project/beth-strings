import { expect, test, describe, beforeAll } from "bun:test";
import { decode } from "./decode";
import { parseHeader } from "./util";

let arrayBufferDlStrings;
let arrayBufferStrings;

beforeAll(async () => {
  const dlStringsFile = Bun.file('.mock/starfield_en.dlstrings');
  const stringsFile = Bun.file('.mock/starfield_en.strings');

  arrayBufferDlStrings = await dlStringsFile.arrayBuffer();
  arrayBufferStrings = await stringsFile.arrayBuffer();
});

describe('Testing decoding *.strings files', () => {
  test('Should decode *.strings file without errors', () => {
    expect(() => decode(arrayBufferStrings, 'string')).not.toThrow();
  });

  test('Elements count should be equal to count in *.strings file header' , () => {
    const view = new DataView(arrayBufferStrings)
    const decodedStrings = decode(arrayBufferStrings, 'string');
    const {stringsCount: countFromHeader} = parseHeader(view);

    expect(decodedStrings.length).toEqual(countFromHeader);
  });

  test('Decoded *.strings files shouldn\'t contain c-null', () => {
    const decodedStrings = decode(arrayBufferStrings, 'string');
    const encoder = new TextEncoder();
    let isNullFound = false;

    decodedStrings.forEach(({text}) => {
      const buffer = encoder.encode(text);
      
      if (~buffer.indexOf(0)) {
        isNullFound = true;
      }
    });

    expect(isNullFound).toBe(false);
  });
});

describe('Testing decoding *.dlstrings/*.ilstrings files', () => {
  test('Should decode *.dlstrings/*.ilstrings file without errors', () => {
    expect(() => decode(arrayBufferDlStrings, 'dlstring')).not.toThrow();
  });

  test('Elements count should be equal to count in *.dlstrings/*.ilstrings file header' , () => {
    const view = new DataView(arrayBufferDlStrings)
    const decodedStrings = decode(arrayBufferDlStrings, 'dlstring');
    const {stringsCount: countFromHeader} = parseHeader(view);

    expect(decodedStrings.length).toEqual(countFromHeader);
  });

  test('Decoded *.dlstrings/*.ilstrings files shouldn\'t contain c-null', () => {
    const decodedStrings = decode(arrayBufferDlStrings, 'dlstring');
    const encoder = new TextEncoder();
    let isNullFound = false;

    decodedStrings.forEach(({text}) => {
      const buffer = encoder.encode(text);
      
      if (~buffer.indexOf(0)) {
        isNullFound = true;
      }
    });

    expect(isNullFound).toBe(false);
  });
});

describe('Testing common cases with decoding', () => {
  test('Should throw an error when give wrong string type', () => {
    expect(() => decode((new ArrayBuffer(10)), 'wrong-type')).toThrowError();
  })
});
