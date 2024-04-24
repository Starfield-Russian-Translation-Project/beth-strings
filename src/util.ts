import { UINT32_BYTE_COUNT } from "./const";

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

  return resultArray.buffer as ArrayBuffer;
}
