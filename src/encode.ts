import { ELEMENT_ATTRS_COUNT, HEADER_ATTRS_COUNT, UINT32_BYTE_COUNT } from "./const";
import type { Directory, StringEntity } from "./types";
import { NumberEncoder } from "./util";

export const encodeHeader = (directories: Directory[], rawStringsLength: number): ArrayBuffer => {
  const bytesCount = UINT32_BYTE_COUNT * ELEMENT_ATTRS_COUNT * directories.length + HEADER_ATTRS_COUNT * UINT32_BYTE_COUNT;
  const directoryBuffer = new ArrayBuffer(bytesCount);
  const directoryView = new DataView(directoryBuffer);

  directoryView.setUint32(0 * UINT32_BYTE_COUNT, directories.length, true);
  directoryView.setUint32(1 * UINT32_BYTE_COUNT, rawStringsLength, true);

  for (let index = 0; index < directories.length; index++) {
    const idOffset = (index * ELEMENT_ATTRS_COUNT + HEADER_ATTRS_COUNT) * UINT32_BYTE_COUNT;
    const positionOffset = (index * ELEMENT_ATTRS_COUNT + HEADER_ATTRS_COUNT + 1) * UINT32_BYTE_COUNT;

    try {
      directoryView.setUint32(idOffset, parseInt(directories[index]?.id, 16), true);
      directoryView.setUint32(positionOffset, directories[index]?.position, true);
    } catch {
      throw new Error('An error while encoding id and position of string.');
    }
  }

  return directoryView.buffer;
}

export const encodeDlStrings = (strings: StringEntity[]): {pseudoBuffer: number[], directories: Directory[]} => {
  const numEncoder = new NumberEncoder();
  const textEncoder = new TextEncoder();
  const positionsMap = new Map<string, number>();
  const pseudoBuffer: number[] = [];
  const directories: Directory[] = [];

  strings.forEach(({id, text}, index) => {
    if (!text) {
      text = '';
    }

    const duplicate = positionsMap.get(text);

    if (duplicate) {
      directories.push({id, position: duplicate});
      return;
    }

    positionsMap.set(text, pseudoBuffer.length);
    directories.push({id, position: pseudoBuffer.length});

    // +1 for null at the end of the string
    const encodedLength = numEncoder.convertToPseudoUint32(text.length + 1, true);
    const encodedText = textEncoder.encode(text);

    pseudoBuffer.push(...encodedLength);
    pseudoBuffer.push(...encodedText);
    // adding null
    pseudoBuffer.push(0);
  });

  return {pseudoBuffer, directories};
}

