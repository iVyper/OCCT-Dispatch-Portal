import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  FormControl,
  FormErrorMessage,
} from '@chakra-ui/react';

function LoginPage({ login, recoverPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateForm = () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    return isEmailValid && isPasswordValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setIsButtonDisabled(true);

        await login({ email, password });
        setLoginMessage('Login failed. Please check your credentials.');
      } catch (error) {
        setLoginMessage('');
        console.error(error);
      } finally {
        setIsButtonDisabled(false);
      }
    }
  };

  const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    try {
      setIsButtonDisabled(true);
      await recoverPassword(email);
      setEmail('');
      setNotificationMessage(
        'Password recovery email sent successfully. Check your email.'
      );

      setTimeout(() => {
        setIsPasswordRecovery(false);
        setIsButtonDisabled(false);
      }, 5000);
    } catch (error) {
      setNotificationMessage('Email not found. Please check your email.');
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const toggleForm = () => {
    setEmail('');
    setPassword('');
    setEmailError('');
    setPasswordError('');
    setLoginMessage('');
    setIsPasswordRecovery(!isPasswordRecovery);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setNotificationMessage('');
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [notificationMessage]);

  useEffect(() => {
    setEmailError('');
  }, [email]);

  return (
    <Flex
      as="form"
      onSubmit={isPasswordRecovery ? handlePasswordRecovery : handleLogin}
      direction="column"
      justify="center"
      bg="#2596be"
      align="center"
      p={8}
      width="100%"
      minHeight="100vh">
      <Box
        width="100%"
        p={6}
        maxWidth="400px"
        bg="#fff"
        borderRadius="lg"
        boxShadow="xl"
        textAlign="center"
        justifyContent="center"
        justifyItems="center"
        color="black">
        <Box
          width="100%"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          p={2}
          textAlign="center"
          color="black">
          <img
            src="/loginFormLogo.png"
            alt=""
            style={{ marginBottom: '16px', width: '60%', height: '70%' }}
          />
        </Box>
        <Text
          fontSize="24px"
          fontWeight="bold"
          mb={4}
          color="#000">
          {isPasswordRecovery ? 'Password Recovery' : ''}
        </Text>
        {!isPasswordRecovery && (
          <Text
            fontSize="24px"
            fontWeight="bold"
            mb={4}
            color="#000">
            OCC Transport Employee Portal
          </Text>
        )}
        {loginMessage && (
          <Text
            fontSize="16px"
            mb={4}
            color="red"
            fontWeight="normal">
            {loginMessage}
          </Text>
        )}
        {notificationMessage && (
          <Text
            fontSize="16px"
            mb={4}
            color={
              notificationMessage.includes('successfully') ? 'green' : 'red'
            }
            fontWeight="normal">
            {notificationMessage}
          </Text>
        )}

        {isPasswordRecovery && !notificationMessage && (
          <Text
            fontSize="16px"
            mb={4}
            color="#000"
            fontWeight="normal">
            Enter your email address and we’ll send you an email to get back
            into your account.
          </Text>
        )}
        <FormControl
          mb={3}
          isInvalid={emailError !== ''}>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="lg"
            borderRadius="lg"
            autoComplete="email"
          />
          <FormErrorMessage color="red">{emailError}</FormErrorMessage>
        </FormControl>
        {!isPasswordRecovery && (
          <FormControl
            mb={3}
            isInvalid={passwordError !== ''}>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="lg"
              borderRadius="lg"
              autoComplete="current-password"
            />
            <FormErrorMessage color="red">{passwordError}</FormErrorMessage>
          </FormControl>
        )}
        <Button
          type="submit"
          bg="#2596be"
          colorScheme="teal"
          size="lg"
          width="100%"
          borderRadius="lg"
          mt={4}
          isDisabled={isButtonDisabled}>
          {isPasswordRecovery ? 'Recover Password' : 'Log In'}
        </Button>
        <Text
          mt={4}
          color="#2596be"
          textDecoration="underline"
          cursor="pointer"
          onClick={toggleForm}>
          {isPasswordRecovery
            ? 'Back to Login'
            : 'Forgot your password? Click here to recover.'}
        </Text>
      </Box>
    </Flex>
  );
}

export default LoginPage;
