import { UINT32_BYTE_COUNT, WIN_1251, WIN_1252 } from "./constants";
import type { Encoding } from "./types";

export const parseHeader = (dataView: DataView) => {
  const stringsCount = dataView.getUint32(0, true);
  const textLength = dataView.getUint32(UINT32_BYTE_COUNT, true);
  const textStartOffset = dataView.byteLength - textLength;

  return {
    stringsCount,
    textLength,
    textStartOffset
  };
}

export const decodeText = (buffer: ArrayBuffer, encoding: string = 'cp1252') => {
  const decoder = new TextDecoder(encoding, { fatal: true, });

  try {
    return decoder.decode(buffer);
  } catch(error) {
    throw new Error('Error while decoding strings. Try another encoding property.');
  }
}

export const concatBuffers = (firstBuffer: ArrayBuffer, secondBuffer: ArrayBuffer): ArrayBuffer => {
  const resultArray = new Uint8Array(firstBuffer.byteLength + secondBuffer.byteLength);

  resultArray.set(new Uint8Array(firstBuffer), 0);
  resultArray.set(new Uint8Array(secondBuffer), firstBuffer.byteLength);

  return <ArrayBuffer>resultArray.buffer;
}

export class NumberEncoder {
  #view: DataView;

  constructor() {
    this.#view = new DataView(new ArrayBuffer(4));
  }

  convertToPseudoUint32(value: number, littleEndian?: boolean): number[] {
    this.#view.setUint32(0, value, littleEndian);

    return [this.#view.getUint8(0), this.#view.getUint8(1), this.#view.getUint8(2), this.#view.getUint8(3)];
  }
}

export class TextEncoder {
  #encoding: Encoding;

  constructor(encoding: Encoding) {
    this.#encoding = encoding;
  }

  encode(string: string, fatal?: boolean): Uint8Array {
    switch(this.#encoding) {
      case 'windows1252':
        return this.#encodeWin1252(string, fatal);

      case 'windows1251':  
        return this.#encodeWin1251(string, fatal);

      default:
        throw new Error('Can\'t encode string without setting encoding.')  
    }
  }

  #encodeWin1252(string: string, fatal?: boolean): Uint8Array {
    const result = new Uint8Array(string.length);

    for (let index = 0; index < string.length; index++) {
      const codePoint = string.charCodeAt(index);

      if (0x00 <= codePoint && codePoint <= 0x7F) {
        result[index] = codePoint;
        continue;
      }

      if (WIN_1252.byPointer.has(codePoint)) {
        result[index] = <number>WIN_1252.byPointer.get(codePoint) + 0x80;
      } else {
        if (fatal) {
          throw new Error(`Unknown symbol at ${index} position.`);
        }

        result[index] = 0xFFFD;
      }
    }

    return result;
  }

  #encodeWin1251(string: string, fatal?: boolean): Uint8Array {
    const result = new Uint8Array(string.length);
    const view = new DataView(result.buffer);

    for (let index = 0; index < string.length; index++) {
      const codePoint = string.charCodeAt(index);

      if (0x00 <= codePoint && codePoint <= 0x7F) {
        result[index] = codePoint;
        continue;
      }

      if (WIN_1251.byPointer.has(codePoint)) {
        result[index] = <number>WIN_1251.byPointer.get(codePoint) + ASCII_LENGTH;
      } else {
        if (fatal) {
          throw new Error(`Unknown symbol at ${index} position.`);
        }
        
        result[index] = 0xFFFD;
      }
    }

    return result;
  }
}
