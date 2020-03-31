import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Label, Input, Button, Text } from 'theme-ui';

import { Address } from '../api';

const AnyBox = Box as any;

const requiredString = (message: string) =>
  yup
    .string()
    .trim()
    .required(message);

interface AddressFormFields {
  address1: string;
  address2?: string;
  city: string;
  region?: string;
  postcode: string;
  countryCode: string;
}

export const AddressForm = ({ onComplete }: { onComplete: (address: Address) => Promise<any> }) => {
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
      address1: requiredString('Please fill line 1 of your address'),
      address2: yup.string().trim(),
      city: requiredString('Please fill the city of your address'),
      region: yup.string().trim(),
      postcode: requiredString('Please fill the postcode of your address'),
      countryCode: requiredString('Please select your country of residence'),
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
      {field('address1', 'Address line 1 *')}
      {field('address2', 'Address line 2')}
      {field('city', 'City *')}
      {field('region', 'State / County / Region')}
      {field('postcode', 'Postcode / Zip code *')}

      <Box>
        <Label htmlFor="identity-country">Country *</Label>
        <Input id="identity-country" type="text" disabled value="United Kingdom" />
      </Box>

      <Button variant="block" type="submit" disabled={form.isSubmitting}>
        Register
      </Button>
    </AnyBox>
  );
};
