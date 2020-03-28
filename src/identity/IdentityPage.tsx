import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Spinner, Label, Input, Button, Text, Heading, Radio } from 'theme-ui';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';

import { useUser } from '../resources';
import { Profile, Sex } from '../api';

export const IdentityPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, update: updateUser } = useUser(userId);

  if (!user) {
    return <Spinner mx="auto" sx={{ display: 'block' }} />;
  }

  function createProfile(profile: Profile) {
    if (user) {
      return updateUser({ ...user, profile });
    }
    return Promise.reject();
  }

  return (
    <>
      <Heading mb={4}>
        {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Fill your identity'}
      </Heading>
      {!user.profile ? (
        <ProfileForm onComplete={createProfile} />
      ) : (
        <Identity email={user.email} profile={user.profile} />
      )}
    </>
  );
};

const Identity = ({ email, profile }: { email: string; profile: Profile }) => {
  return (
    <>
      <Text>
        Born <strong>{format(new Date(profile.dateOfBirth), 'dd/MM/yyyy')}</strong>
      </Text>
      <Text>
        Contact <strong>{email}</strong>
      </Text>
    </>
  );
};

const ProfileForm = ({ onComplete }: { onComplete: (profile: Profile) => Promise<any> }) => {
  const form = useFormik({
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

  return (
    <form onSubmit={form.handleSubmit}>
      <Label htmlFor="identity-first-name">Your first name(s)</Label>
      <Input id="identity-first-name" type="text" {...form.getFieldProps('firstName')} />
      {form.touched.firstName && form.errors.firstName ? (
        <Text>{form.errors.firstName}</Text>
      ) : null}

      <Label mt={2} htmlFor="identity-last-name">
        Your last name
      </Label>
      <Input name="name" id="identity-last-name" type="text" {...form.getFieldProps('lastName')} />
      {form.touched.lastName && form.errors.lastName ? <Text>{form.errors.lastName}</Text> : null}

      <Label mt={2} htmlFor="identity-dateOfBirth">
        Your date of birth
      </Label>
      <Input id="identity-dateOfBirth" type="date" {...form.getFieldProps('dateOfBirth')} />
      {form.touched.dateOfBirth && form.errors.dateOfBirth ? (
        <Text>{form.errors.dateOfBirth}</Text>
      ) : null}

      <Label mt={2}>
        <Radio {...form.getFieldProps({ name: 'sex', type: 'radio', value: Sex.FEMALE })} />
        Female
      </Label>
      <Label>
        <Radio {...form.getFieldProps({ name: 'sex', type: 'radio', value: Sex.MALE })} />
        Male
      </Label>
      {form.touched.sex && form.errors.sex ? <Text>{form.errors.sex}</Text> : null}

      <Button mt={2} variant="block" type="submit" disabled={form.isSubmitting}>
        Submit
      </Button>
    </form>
  );
};
