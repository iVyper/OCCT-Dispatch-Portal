import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Image,
  Spacer,
  Stack,
} from '@chakra-ui/react';

import DispatchForm from './DispatchForm';
import RouteAccordion from './RouteAccordion';
function DispatchDashboard({ socket, logout, user }) {
  const [activeTab, setActiveTab] = useState('dispatchDashboard');
  return (
    <Box>
      <Flex
        align="center"
        justify={{ base: 'center', md: 'flex-start' }}
        bgColor="#2596be"
        h="80px"
        p="1rem">
        <Center
          flex="1"
          display={{ base: 'flex', md: 'none' }}
          justify={{ base: 'center', md: 'flex-start' }}>
          <Image
            src="/occtlogo.png"
            alt="Logo"
            maxH="40px"
          />
        </Center>
        <Box
          flex="1"
          display={{ base: 'none', md: 'flex' }}
          alignItems="center">
          <Image
            src="/occtlogo.png"
            alt="Logo"
            maxH="40px"
          />
        </Box>
        <Spacer display={{ base: 'none', md: 'block' }} />
      </Flex>
      <Center>
        <Box
          p={4}
          maxWidth="650px"
          width="100%">
          <Stack spacing={8}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'center', md: 'center' }}
              justify={{ base: 'center', md: 'center' }}
              mt={4}>
              <Button
                variant={
                  activeTab === 'dispatchDashboard' ? 'solid' : 'outline'
                }
                onClick={() => setActiveTab('dispatchDashboard')}
                mb={{ base: 2, md: 0 }}
                mr={{ base: 0, md: 2 }}>
                Dispatch Dashboard
              </Button>

              <Button
                variant={activeTab === 'dispatchReport' ? 'solid' : 'outline'}
                onClick={() => setActiveTab('dispatchReport')}
                mb={{ base: 2, md: 0 }}
                mr={{ base: 0, md: 2 }}>
                Dispatch Report
              </Button>
            </Flex>
            {activeTab === 'dispatchDashboard' && (
              <Stack spacing={4}>
                <RouteAccordion socket={socket} />
              </Stack>
            )}{' '}
            {activeTab === 'dispatchReport' && (
              <Stack spacing={4}>
                <DispatchForm />
              </Stack>
            )}
          </Stack>
          <Divider mt={8} />
          <Center mt={8}>
            <Button
              colorScheme="red"
              onClick={() => logout(user.id)}>
              Logout
            </Button>
          </Center>
        </Box>
      </Center>
    </Box>
  );
}

export default DispatchDashboard;
