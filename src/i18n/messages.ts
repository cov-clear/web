import en from './en.json';
import et from './et.json';

if (process.env.NODE_ENV !== 'production') {
  checkAllKeysMatch(en, et);
  checkAllKeysMatch(et, en);
}

export const messages = {
  en,
  et,
};

function checkAllKeysMatch(a: Object, b: Object) {
  Object.keys(a).forEach((key) => {
    if (!b.hasOwnProperty(key)) {
      throw new Error(`Translation key ${key} not provided in all translations`);
    }
  });
}
