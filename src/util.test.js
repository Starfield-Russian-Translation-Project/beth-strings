import { expect, test, describe } from "bun:test";
import { decodeText, parseHeader, concatBuffers, NumberEncoder, TextEncoder } from "./util";
import { concatArrayBuffers } from "bun";

const generateByteSequence = (start, end) => {
  const length = end - start + 1;
  const array = new Uint8Array(end - start + 1);

  for (let index = 0; index <= length; index++) 
    array[index] = index + start;

  return array;
}

const MOCK_HEADER = new Int8Array([191, 31, 0, 0, 40, 78, 14, 0, 23, 14, 0, 0, 0, 0, 0, 0, 24, 14, 0, 0, 77, 0, 0, 0]);
const TWO_BYTE_CHAR_SEQUENCE_BUFFER = generateByteSequence(0, 255);
const ASCII_CHAR_SEQUENCE = '\0\x01\x02\x03\x04\x05\x06\x07\b\t\n\x0B\f\r\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7F';
const WIN1251_CHAR_SEQUENCE = 'ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬­®Ї°±Ііґµ¶·ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя';
const WIN1252_CHAR_SEQUENCE = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ';

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
  });

  test('Should correctly encode text in Windows1252 encoding', () => {
    const encoder = new TextEncoder('windows-1252');

    expect(encoder.encode(ASCII_CHAR_SEQUENCE + WIN1252_CHAR_SEQUENCE, true).buffer).toEqual(TWO_BYTE_CHAR_SEQUENCE_BUFFER.buffer);
  });

  test('Should correctly encode text in Windows1251 encoding', () => {
    const encoder = new TextEncoder('windows-1251');

    expect(encoder.encode(ASCII_CHAR_SEQUENCE + WIN1251_CHAR_SEQUENCE, true).buffer).toEqual(TWO_BYTE_CHAR_SEQUENCE_BUFFER.buffer);
  });
});
