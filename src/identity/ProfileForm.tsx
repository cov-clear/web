import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Radio, Label, Input, Button, Text } from 'theme-ui';

import { Profile, Sex } from '../api';

const AnyBox = Box as any;

interface ProfileFormFields {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: Sex | '';
}

export const ProfileForm = ({ onComplete }: { onComplete: (profile: Profile) => Promise<any> }) => {
  const form = useFormik<ProfileFormFields>({
    initialValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      sex: '',
    },
    validationSchema: yup.object().shape({
      firstName: yup
        .string()
        .trim()
        .required('Please fill your first name(s)'),
      lastName: yup
        .string()
        .trim()
        .required('Please fill your last name'),
      dateOfBirth: yup
        .date()
        .required('Please fill your date of birth')
        .max(new Date(), 'Please check your date of birth'),
      sex: yup
        .string()
        .oneOf([Sex.MALE, Sex.FEMALE])
        .required('Please select your legal sex'),
    }),
    onSubmit: ({ firstName, lastName, dateOfBirth, sex }) =>
      onComplete({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        sex: sex as Sex,
      }),
  });

  const fieldError = (key: keyof ProfileFormFields) =>
    form.touched[key] && form.errors[key] ? <Text>{form.errors[key]}</Text> : null;

  return (
    <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit}>
      <Box>
        <Label htmlFor="identity-first-name">First names</Label>
        <Input id="identity-first-name" type="text" {...form.getFieldProps('firstName')} />
        {fieldError('firstName')}
      </Box>

      <Box>
        <Label htmlFor="identity-last-name">Last names</Label>
        <Input
          name="name"
          id="identity-last-name"
          type="text"
          {...form.getFieldProps('lastName')}
        />
        {fieldError('lastName')}
      </Box>

      <Box>
        <Label htmlFor="identity-dateOfBirth">Your date of birth</Label>
        <Input id="identity-dateOfBirth" type="date" {...form.getFieldProps('dateOfBirth')} />
        {fieldError('dateOfBirth')}
      </Box>

      <Box>
        <Label htmlFor="identity-sex-female">Sex</Label>
        <Box sx={{ display: 'flex' }}>
          <Label>
            <Radio
              id="identity-sex-female"
              {...form.getFieldProps({ name: 'sex', type: 'radio', value: Sex.FEMALE })}
            />
            Female
          </Label>
          <Label>
            <Radio {...form.getFieldProps({ name: 'sex', type: 'radio', value: Sex.MALE })} />
            Male
          </Label>
        </Box>
        {fieldError('sex')}
      </Box>

      <Button variant="block" type="submit" disabled={form.isSubmitting}>
        Next
      </Button>
    </AnyBox>
  );
};
