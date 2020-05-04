import { Config, AuthenticationMethod, Language } from '../api';

export function useConfig(): Config {
  // TODO: Get from API and store in context
  return {
    authenticationMethod: AuthenticationMethod.ESTONIAN_ID,
    defaultLanguage: Language.ESTONIAN,
  };
}
