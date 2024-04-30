export interface StringEntity extends Directory {
  text?: string;
}

export interface Directory {
  id: string;
  position: number;
}

export type StringType = 'dlstring' | 'ilstring' | 'string';
export type Encoding = 'windows1251' | 'windows1252';