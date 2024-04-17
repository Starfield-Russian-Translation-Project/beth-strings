import { expect, test, describe } from "bun:test";
import { decodeText, parseHeader } from "./util";

const MOCK_HEADER = new Int8Array([191, 31, 0, 0, 40, 78, 14, 0, 23, 14, 0, 0, 0, 0, 0, 0, 24, 14, 0, 0, 77, 0, 0, 0]);

describe('Testing utils', () => {
  test('Should correctly parse count, length and offset from header', () => {
    const view = new DataView(MOCK_HEADER.buffer);

    expect(parseHeader(view)).toEqual({stringsCount: 8127, textLength: 937512, textStartOffset: -937488});
  });

  test('Should throw an error when decoding text with wrong encoding', () => {
    const array = new Uint8Array([232, 232, 232]);
    const buffer = array.buffer;

    expect(() => decodeText(buffer, 'utf-8')).toThrowError();
  });
});