import { ELEMENT_ATTRS_COUNT, HEADER_ATTRS_COUNT, UINT32_BYTE_COUNT } from "./constants";
import type { Directory, StringEntity, Encoding } from "./types";
import { NumberEncoder, TextEncoder } from "./util";

export const encodeHeader = (directories: Directory[], rawStringsLength: number): ArrayBuffer => {
  const bytesCount = UINT32_BYTE_COUNT * ELEMENT_ATTRS_COUNT * directories.length + HEADER_ATTRS_COUNT * UINT32_BYTE_COUNT;
  const directoryBuffer = new ArrayBuffer(bytesCount);
  const directoryView = new DataView(directoryBuffer);

  directoryView.setUint32(0 * UINT32_BYTE_COUNT, directories.length, true);
  directoryView.setUint32(1 * UINT32_BYTE_COUNT, rawStringsLength, true);

  directories.forEach(({id, position}, index) => {
    const idOffset = (index * ELEMENT_ATTRS_COUNT + HEADER_ATTRS_COUNT) * UINT32_BYTE_COUNT;
    const positionOffset = (index * ELEMENT_ATTRS_COUNT + HEADER_ATTRS_COUNT + 1) * UINT32_BYTE_COUNT;

    try {
      directoryView.setUint32(idOffset, parseInt(id, 16), true);
      directoryView.setUint32(positionOffset, position, true);
    } catch {
      throw new Error('An error while encoding id and position of string.');
    }
  });

  return directoryView.buffer;
}

export const encodeDlStrings = (strings: StringEntity[], encoding: Encoding): {pseudoBuffer: number[], directories: Directory[]} => {
  const numEncoder = new NumberEncoder();
  const textEncoder = new TextEncoder(encoding);
  const positionsMap = new Map<string, number>();
  const pseudoBuffer: number[] = [];
  const directories: Directory[] = [];
  const nil = 0;
  const nilLength = 1;

  strings.forEach(({id, text}) => {
    if (!text) {
      text = '';
    }

    if (positionsMap.has(text)) {
      directories.push({id, position: <number>positionsMap.get(text)});
      return;
    }

    positionsMap.set(text, pseudoBuffer.length);
    directories.push({id, position: pseudoBuffer.length});

    const encodedLength = numEncoder.convertToPseudoUint32(text.length + nilLength, true);
    const encodedText = textEncoder.encode(text);

    pseudoBuffer.push(...encodedLength);
    pseudoBuffer.push(...encodedText);
    pseudoBuffer.push(nil);
  });

  return {pseudoBuffer, directories};
}

