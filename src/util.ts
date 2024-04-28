import { UINT32_BYTE_COUNT } from "./constants";

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
