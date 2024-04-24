import { expect, test, describe } from "bun:test";
import { decodeText, parseHeader, concatBuffers, NumberEncoder } from "./util";
import { concatArrayBuffers } from "bun";

const MOCK_HEADER = new Int8Array([191, 31, 0, 0, 40, 78, 14, 0, 23, 14, 0, 0, 0, 0, 0, 0, 24, 14, 0, 0, 77, 0, 0, 0]);

describe('Utils', () => {
  test('Should correctly parse count, length and offset from header', () => {
    const view = new DataView(MOCK_HEADER.buffer);

    expect(parseHeader(view)).toEqual({stringsCount: 8127, textLength: 937512, textStartOffset: -937488});
  });

  test('Should throw an error when decoding text with wrong encoding', () => {
    const array = new Uint8Array([232, 232, 232]);
    const buffer = array.buffer;

    expect(() => decodeText(buffer, 'utf-8')).toThrowError();
  });

  test('Should correctly concat two ArrayBuffers', () => {
    const test1 = MOCK_HEADER.slice(0, 4);
    const test2 = MOCK_HEADER.slice(4, MOCK_HEADER.length);;

    expect(concatBuffers(test1, test2)).toEqual(concatArrayBuffers([test1,test2]));
  });

  test('Should correctly convert number to pseudo Uint32Array', () => {
    const numEncoder = new NumberEncoder();

    expect(numEncoder.convertToPseudoUint32(8127, true)).toEqual([191, 31, 0, 0]);
    expect(numEncoder.convertToPseudoUint32(937512, true)).toEqual([40, 78, 14, 0]);
  })
});
