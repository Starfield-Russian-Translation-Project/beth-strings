export interface StringEntity extends Directory {
  text?: string;
}

export interface Directory {
  id: string;
  position: number;
}

export type StringType = 'dlstring' | 'ilstring' | 'string';
export type Encoding = 'windows-1251' | 'windows-1252';
export type Language = 'ru' | 'en' | 'fr' | 'gr' | 'it' | 'sp'