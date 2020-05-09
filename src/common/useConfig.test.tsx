import React from 'react';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { useConfig } from './useConfig';
import { AuthenticationMethod, Language } from '../api';

const TestComponent = () => {
  const config = useConfig();
  if (config) {
    return (
      <>
        Loaded
        <div id="preferredAuthMethod">{config.preferredAuthMethod}</div>
        <div id="addressRequired">{config.addressRequired ? 'yes' : 'no'}</div>
        <div id="defaultLanguage">{config.defaultLanguage}</div>
        <div id="appName">{config.appName}</div>
      </>
    );
  }
  return <div>Loading</div>;
};

describe(useConfig, () => {
  it('loads the config on startup and stores it', async () => {
    const config = {
      preferredAuthMethod: AuthenticationMethod.MAGIC_LINK,
      addressRequired: false,
      defaultLanguage: Language.ENGLISH,
      appName: 'an app name',
    };
    nock(/./).get('/api/v1/config').reply(200, config);

    const { unmount } = await render(<TestComponent />);
    await screen.findByText(/loaded/i);

    const configValue = (name) => document.getElementById(name).innerHTML;
    expect(configValue('preferredAuthMethod')).toBe(AuthenticationMethod.MAGIC_LINK);
    expect(configValue('addressRequired')).toBe('no');
    expect(configValue('defaultLanguage')).toBe('en');
    expect(configValue('appName')).toBe('an app name');

    unmount();
    await render(<TestComponent />);
    expect(configValue('preferredAuthMethod')).toBe(AuthenticationMethod.MAGIC_LINK);
  });
});
