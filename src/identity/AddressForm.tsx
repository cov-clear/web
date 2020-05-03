import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Label, Input, Button, Text } from 'theme-ui';

import { Address } from '../api';
import { useTranslations, Message } from 'retranslate';

const AnyBox = Box as any;

const requiredString = (message: string) => yup.string().trim().required(message);

interface AddressFormFields {
  address1: string;
  address2?: string;
  city: string;
  region?: string;
  postcode: string;
  countryCode: string;
}

export const AddressForm = ({ onComplete }: { onComplete: (address: Address) => Promise<any> }) => {
  const { translate } = useTranslations();
  const form = useFormik<AddressFormFields>({
    initialValues: {
      address1: '',
      address2: '',
      city: '',
      region: '',
      postcode: '',
      countryCode: 'GB',
    },
    validationSchema: yup.object().shape({
      address1: requiredString(translate('addressForm.address1.required')),
      address2: yup.string().trim(),
      city: requiredString(translate('addressForm.city.required')),
      region: yup.string().trim(),
      postcode: requiredString(translate('addressForm.postcode.required')),
      countryCode: requiredString(translate('addressForm.countryCode.required')),
    }),
    onSubmit: ({ address1, address2, city, region, postcode, countryCode }) =>
      onComplete({
        address1: address1.trim(),
        address2: address2?.trim() || undefined,
        city: city.trim(),
        region: region?.trim() || undefined,
        postcode: postcode.trim(),
        countryCode: countryCode.trim(),
      }),
  });

  const fieldError = (key: keyof AddressFormFields) =>
    form.touched[key] && form.errors[key] ? <Text>{form.errors[key]}</Text> : null;

  const field = (name: keyof AddressFormFields, label: string) => {
    const id = `identity-${name}`;
    return (
      <Box>
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} type="text" {...form.getFieldProps(name)} />
        {fieldError(name)}
      </Box>
    );
  };

  return (
    <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit}>
      {field('address1', `${translate('addressForm.address1.label')} *`)}
      {field('address2', translate('addressForm.address2.label'))}
      {field('city', `${translate('addressForm.city.label')} *`)}
      {field('region', translate('addressForm.region.label'))}
      {field('postcode', `${translate('addressForm.postcode.label')} *`)}

      <Box>
        <Label htmlFor="identity-country">
          <Message>addressForm.countryCode.label</Message> *
        </Label>
        <Input
          id="identity-country"
          type="text"
          disabled
          value={translate('addressForm.countryCode.values.uk')} // TODO: Make dynamic for Estonian implementation
        />
      </Box>

      <Button variant="block" type="submit" disabled={form.isSubmitting}>
        <Message>addressForm.button</Message>
      </Button>
    </AnyBox>
  );
};
