import Isikukood from 'isikukood';

export function validateIdCode(idCode: string): boolean {
  return idCode ? new Isikukood(idCode).validate() : false;
}

export function validateIdCodes(idCodes: string[]): boolean {
  return idCodes.every(validateIdCode);
}
