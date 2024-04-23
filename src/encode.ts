import { ELEMENT_ATTRS_COUNT, HEADER_ATTRS_COUNT, UINT32_BYTE_COUNT } from "./const";
import type { StringEntity } from "./types";

export const encodeHeader = (strings: StringEntity[], stringsLength: number): ArrayBuffer => {
  const bytesCount = UINT32_BYTE_COUNT * ELEMENT_ATTRS_COUNT * strings.length + HEADER_ATTRS_COUNT * UINT32_BYTE_COUNT;
  const directoryBuffer = new ArrayBuffer(bytesCount);
  const directoryView = new DataView(directoryBuffer);

  directoryView.setUint32(0 * UINT32_BYTE_COUNT, strings.length, true);
  directoryView.setUint32(1 * UINT32_BYTE_COUNT, stringsLength, true);

  for (let index = 0; index < strings.length; index++) {
    const idOffset = (index * ELEMENT_ATTRS_COUNT + HEADER_ATTRS_COUNT) * UINT32_BYTE_COUNT;
    const positionOffset = (index * ELEMENT_ATTRS_COUNT + HEADER_ATTRS_COUNT + 1) * UINT32_BYTE_COUNT;

    try {
      directoryView.setUint32(idOffset, parseInt(strings[index]?.id, 16), true);
      directoryView.setUint32(positionOffset, strings[index]?.position, true);
    } catch(error) {
      console.log(error);
    }
  }

  return directoryView.buffer;
}

