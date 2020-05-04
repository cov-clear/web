declare class Isikukood {
  constructor(idCode: string);
  validate(): boolean;
}

declare module 'isikukood' {
  export = Isikukood;
}
