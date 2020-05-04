import Isikukood from 'isikukood';

export function validateIdCode(idCode: string): boolean {
  return idCode ? new Isikukood(idCode).validate() : false;
}
