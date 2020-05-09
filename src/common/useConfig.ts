import { Config, AuthenticationMethod, Language } from '../api';

export function useConfig(): Config {
  // TODO: Get from API and store in context
  return {
    preferredAuthMethod: isEstonianDeployment()
      ? AuthenticationMethod.ESTONIAN_ID
      : AuthenticationMethod.MAGIC_LINK,
    addressRequired: !isEstonianDeployment(),
    defaultLanguage: isEstonianDeployment() ? Language.ESTONIAN : Language.ENGLISH,
    appName: 'COV-Clear',
  };
}

// TODO: Remove once we get the config from the API
function isEstonianDeployment(): boolean {
  return window.location.hostname.split('.')[0] === 'app';
}
