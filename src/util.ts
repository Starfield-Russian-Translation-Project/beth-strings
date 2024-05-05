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
      case 'windows-1252':
        return this.#encodeWithCharMap(string, WIN_1252.byPointer, fatal);

      case 'windows-1251':  
        return this.#encodeWithCharMap(string, WIN_1251.byPointer, fatal);

      default:
        throw new Error('Can\'t encode string without setting encoding.')  
    }
  }

  #encodeWithCharMap(string: string, charMap: Map<number, number>, fatal?: boolean): Uint8Array {
    const result = new Uint8Array(string.length);

    for (let index = 0; index < string.length; index++) {
      const codePoint = string.charCodeAt(index);

      if (0x00 <= codePoint && codePoint <= 0x7F) {
        result[index] = codePoint;
        continue;
      }

      if (charMap.has(codePoint)) {
        result[index] = <number>charMap.get(codePoint) + 0x80;
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

export class TextDecoder {
  #encoding: Encoding;

  constructor(encoding: Encoding) {
    this.#encoding = encoding;
  }

  decode(array: Uint8Array, fatal?: boolean): string {
    switch(this.#encoding) {
      case 'windows-1252':
        return this.#decodeWithCharMap(array, WIN_1252.byCodePoint, fatal);

      case 'windows-1251':  
        return this.#decodeWithCharMap(array, WIN_1251.byCodePoint, fatal);

      default:
        throw new Error('Can\'t decode Uint8Array without setting encoding.')  
    }
  }

  #decodeWithCharMap(array: Uint8Array, charMap: Map<number, number>, fatal?: boolean): string {
    let result = '';

    array.forEach((codePoint, index) => {
      if (0x00 <= codePoint && codePoint <= 0x7F) {
        result += String.fromCharCode(codePoint);
        
        return;
      }

      if (charMap.has(codePoint - 0x80)) {
        result += String.fromCharCode(<number>charMap.get(codePoint - 0x80));
      } else {
        if (fatal) {
          throw new Error(`Unknown symbol at ${index} position.`);
        }

        result += String.fromCharCode(0xFFFD);
      }
    });

    return result;
  }
}
