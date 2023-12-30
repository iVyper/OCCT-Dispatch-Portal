import React from 'react';
import {
  Box,
  Button,
  Select,
  Text,
  Flex,
  Spacer,
  Stack,
  Heading,
  Divider,
  HStack,
} from '@chakra-ui/react';

const UserManagement = ({
  users,
  deleteUser,
  updateUserPrivileges,
  openModal,
}) => {
  return (
    <Stack
      spacing={[4, 8]}
      p={[2, 4]}
      boxShadow="md"
      borderRadius="md"
      bg="white">
      <Heading
        as="h3"
        size="md"
        mb={4}>
        Manage Users
      </Heading>
      <Button
        colorScheme="blue"
        onClick={() => openModal('inviteUser')}>
        New User
      </Button>
      <Box>
        <Divider />
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map((user) => (
            <li key={user.id}>
              <Flex
                direction={['column', 'row']}
                alignItems={['flex-start', 'center']}
                justifyContent="space-between"
                bg="white"
                p={3}
                borderRadius="md">
                <Text
                  mb={[2, 0]}
                  fontWeight="bold">
                  {user.email}
                </Text>
                <HStack spacing={[2, 4]}>
                  <Select
                    value={user.userType}
                    onChange={(e) =>
                      updateUserPrivileges(user.id, e.target.value)
                    }
                    size="sm">
                    <option value="dispatcher">Dispatcher</option>
                    <option value="admin">Admin</option>
                  </Select>
                  <Button
                    onClick={() => deleteUser(user.id)}
                    colorScheme="red"
                    size="sm">
                    Delete
                  </Button>
                </HStack>
              </Flex>
              <Spacer h={2} />
              <Divider />
            </li>
          ))}
        </ul>
      </Box>
    </Stack>
  );
};

export default UserManagement;
