import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Flex, Box, Radio, Label, Input, Button, Text } from 'theme-ui';

import { Profile, Sex } from '../api';
import { Message, useTranslations } from 'retranslate';

const AnyBox = Box as any;

interface ProfileFormFields {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: Sex | '';
}

export const ProfileForm = ({ onComplete }: { onComplete: (profile: Profile) => Promise<any> }) => {
  const { translate } = useTranslations();
  const form = useFormik<ProfileFormFields>({
    initialValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      sex: '',
    },
    validationSchema: yup.object().shape({
      firstName: yup.string().trim().required(translate('profileForm.firstName.required')),
      lastName: yup.string().trim().required(translate('profileForm.lastName.required')),
      dateOfBirth: yup
        .date()
        .required(translate('profileForm.dateOfBirth.required'))
        .max(new Date(), translate('profileForm.dateOfBirth.invalid')),
      sex: yup
        .string()
        .oneOf([Sex.MALE, Sex.FEMALE])
        .required(translate('profileForm.sex.required')),
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
    form.submitCount > 0 && form.errors[key] ? (
      <Text variant="validation">{form.errors[key]}</Text>
    ) : null;

  return (
    <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit}>
      <Box>
        <Label htmlFor="identity-first-name">
          <Message>profileForm.firstName.label</Message>
        </Label>
        <Input id="identity-first-name" type="text" {...form.getFieldProps('firstName')} />
        {fieldError('firstName')}
      </Box>

      <Box>
        <Label htmlFor="identity-last-name">
          <Message>profileForm.lastName.label</Message>
        </Label>
        <Input
          name="name"
          id="identity-last-name"
          type="text"
          {...form.getFieldProps('lastName')}
        />
        {fieldError('lastName')}
      </Box>

      <Box>
        <Label htmlFor="identity-dateOfBirth">
          <Message>profileForm.dateOfBirth.label</Message>
        </Label>
        <Input
          id="identity-dateOfBirth"
          type="date"
          {...form.getFieldProps('dateOfBirth')}
          sx={{ minHeight: '42px' }}
        />
        {fieldError('dateOfBirth')}
      </Box>

      <Box>
        <Label mb={1} htmlFor="identity-sex-female">
          <Message>profileForm.sex.label</Message>
        </Label>
        <Flex>
          <Label>
            <Radio
              id="identity-sex-female"
              {...form.getFieldProps({ name: 'sex', type: 'radio', value: Sex.FEMALE })}
            />
            <Message>profileForm.sex.option.female</Message>
          </Label>
          <Label>
            <Radio {...form.getFieldProps({ name: 'sex', type: 'radio', value: Sex.MALE })} />
            <Message>profileForm.sex.option.male</Message>
          </Label>
        </Flex>
        {fieldError('sex')}
      </Box>

      <Button variant="block" type="submit" disabled={form.isSubmitting}>
        <Message>profileForm.button</Message>
      </Button>
    </AnyBox>
  );
};
