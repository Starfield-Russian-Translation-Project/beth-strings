export interface StringEntity extends Directory {
  text?: string;
}

export interface Directory {
  id: string;
  position: number;
}