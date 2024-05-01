import type { Encoding, Language } from "../types";

export const UINT32_BYTE_COUNT = 4;
export const ELEMENT_ATTRS_COUNT = 2;
export const HEADER_ATTRS_COUNT = 2;
export const LANGUAGE_ENCODING_MAP: Record<Language, Encoding> = {
  en: 'windows-1252',
  gr: 'windows-1252',
  fr: 'windows-1252',
  sp: 'windows-1252',
  it: 'windows-1252',
  ru: 'windows-1251',
}