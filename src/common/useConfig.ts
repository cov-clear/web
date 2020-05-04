import { Config, AuthenticationMethod, Language } from '../api';

export function useConfig(): Config {
  // TODO: Get from API and store in context
  return {
    authenticationMethod: isEstonianDeployment()
      ? AuthenticationMethod.ESTONIAN_ID
      : AuthenticationMethod.MAGIC_LINK,
    defaultLanguage: isEstonianDeployment() ? Language.ESTONIAN : Language.ENGLISH,
  };
}

// TODO: Remove once we get the config from the API
function isEstonianDeployment(): boolean {
  return window.location.hostname.split('.')[0] === 'ee';
}
