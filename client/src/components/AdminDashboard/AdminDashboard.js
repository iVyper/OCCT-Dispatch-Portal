import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Select,
  Stack,
  Divider,
  Center,
  VStack,
  Flex,
  Spacer,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormErrorMessage,
} from '@chakra-ui/react';
import axios from 'axios';

import { useSnackbar } from '../../context/SnackbarProvider';
import RouteAccordion from '../DispatchDashboard/RouteAccordion';
import RouteManagement from './RouteManagment';
import UserManagement from './UserManagement';
import FormSubmissionManagement from './FormSubmissionManagement/FormSubmissionManagement';
import DispatchForm from '../DispatchDashboard/DispatchForm';

function AdminDashboard({ socket, logout, user, changePasswordWithToken }) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    userType: 'dispatcher',
  });
  const [routes, setRoutes] = useState([]);
  const [newRoute, setNewRoute] = useState({
    name: '',
    hexColor: '',
  });
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isinviteUserModalOpen, setIsinviteUserModalOpen] = useState(false);
  const [updatedRouteName, setUpdatedRouteName] = useState('');
  const [updatedRouteColor, setUpdatedRouteColor] = useState('');
  const [activeTab, setActiveTab] = useState('user');
  const [isValidEmailFormat, setIsValidEmailFormat] = useState(false);
  const { showSuccessToast, showErrorToast } = useSnackbar();
  useEffect(() => {
    fetchUsers();
    fetchRoutes();
  }, []);

  const openModal = (modal) => {
    if (modal === 'route') {
      setIsRouteModalOpen(true);
    } else if (modal === 'inviteUser') {
      setIsinviteUserModalOpen(true);
    }
  };
  const closeModal = (modal) => {
    if (modal === 'route') {
      setIsRouteModalOpen(false);

      setNewRoute({ name: '', hexColor: '' });
    } else if (modal === 'inviteUser') {
      setIsinviteUserModalOpen(false);

      setNewUser({ email: '', password: '', userType: 'dispatcher' });
    }
  };
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/auth/users');
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const inviteUser = async () => {
    try {
      await axios.post(
        `/auth/user/invite?email=${newUser.email}&userType=${newUser.userType}`
      );

      showSuccessToast(
        'User invited! You must wait 5 minutes before sending another invitation.'
      );

      closeModal('inviteUser');
    } catch (error) {
      console.error(error);

      showErrorToast(error.response.data.error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/auth/delete-account/${userId}`);

      showSuccessToast('User succesfully deleted!');
      fetchUsers();
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };

  const updateUserPrivileges = async (userId, newType) => {
    try {
      const updatedUser = { newType };
      await axios.put(`/auth/update-user/${userId}`, updatedUser);

      showSuccessToast('User privileges updated!');
      fetchUsers();
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };

  const addRoute = async () => {
    try {
      const response = await axios.post('/api/routes', {
        name: newRoute.name,
        color: newRoute.hexColor,
      });

      showSuccessToast('New route added!');
      fetchRoutes();
      closeModal('route');
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const { data } = await axios.get('/api/routes');
      setRoutes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateRoute = async (routeId, newName, newColor) => {
    try {
      await axios.put(`/api/routes/update/${routeId}`, {
        name: newName,
        color: newColor,
      });

      showSuccessToast('Route updated!');
      fetchRoutes();
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };

  const deleteRoute = async (routeId) => {
    try {
      await axios.delete(`/api/routes/${routeId}`);

      showSuccessToast('Route deleted!');
      fetchRoutes();
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmailFormat(emailRegex.test(newUser.email));
  }, [newUser.email]);
  return (
    <Box>
      <Flex
        align="center"
        justify={{ base: 'center', md: 'flex-start' }}
        bgColor="#2596be"
        h="80px"
        p="1rem">
        {/* Logo (Centered on mobile, Left-aligned on desktop) */}
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
          maxWidth="1200px"
          width="100%">
          <Stack spacing={8}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'center', md: 'center' }}
              justify={{ base: 'center', md: 'center' }}
              mt={4}>
              <Button
                variant={activeTab === 'user' ? 'solid' : 'outline'}
                onClick={() => setActiveTab('user')}
                mb={{ base: 2, md: 0 }}
                mr={{ base: 0, md: 2 }}>
                User Management
              </Button>

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
                variant={activeTab === 'routes' ? 'solid' : 'outline'}
                onClick={() => setActiveTab('routes')}
                mb={{ base: 2, md: 0 }}
                mr={{ base: 0, md: 2 }}>
                Route Management
              </Button>
              <Button
                variant={activeTab === 'dispatchReport' ? 'solid' : 'outline'}
                onClick={() => setActiveTab('dispatchReport')}
                mb={{ base: 2, md: 0 }}
                mr={{ base: 0, md: 2 }}>
                Dispatch Report
              </Button>
              <Button
                variant={activeTab === 'submissions' ? 'solid' : 'outline'}
                onClick={() => setActiveTab('submissions')}
                mb={{ base: 2, md: 0 }}
                mr={{ base: 0, md: 2 }}>
                Submissions
              </Button>
            </Flex>

            {activeTab === 'user' && (
              <UserManagement
                users={users}
                deleteUser={deleteUser}
                updateUserPrivileges={updateUserPrivileges}
                openModal={openModal}
              />
            )}

            {/* Dispatch Dashboard */}
            {activeTab === 'dispatchDashboard' && (
              <Stack spacing={4}>
                <RouteAccordion socket={socket} />
              </Stack>
            )}
            {activeTab === 'routes' && (
              <RouteManagement
                routes={routes}
                deleteRoute={deleteRoute}
                updateRoute={updateRoute}
                setUpdatedRouteName={setUpdatedRouteName}
                setUpdatedRouteColor={setUpdatedRouteColor}
                openNewRouteModal={() => openModal('route')}
                updatedRouteName={updatedRouteName}
                updatedRouteColor={updatedRouteColor}
              />
            )}
            {activeTab === 'dispatchReport' && (
              <Stack spacing={4}>
                <DispatchForm />
              </Stack>
            )}
            {activeTab === 'submissions' && (
              <FormSubmissionManagement user={user} />
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

      <Modal
        isOpen={isRouteModalOpen}
        onClose={() => closeModal('route')}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Add Routes</ModalHeader>
          <ModalBody>
            <Stack
              spacing={[4, 8]}
              p={[2, 4]}
              boxShadow="md"
              borderRadius="md"
              bg="white">
              <Input
                placeholder="Route Name"
                value={newRoute.name}
                onChange={(e) =>
                  setNewRoute({ ...newRoute, name: e.target.value })
                }
              />
              <Input
                placeholder="Hex Color"
                value={newRoute.hexColor}
                onChange={(e) =>
                  setNewRoute({ ...newRoute, hexColor: e.target.value })
                }
              />
              <Button
                colorScheme="green"
                onClick={addRoute}>
                Add Route
              </Button>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => closeModal('route')}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isinviteUserModalOpen}
        onClose={() => closeModal('inviteUser')}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite New User</ModalHeader>
          <ModalBody>
            <VStack
              spacing={4}
              align="stretch">
              <FormControl isInvalid={!isValidEmailFormat}>
                <Input
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
                <FormErrorMessage>
                  Email is not in a valid format.
                </FormErrorMessage>
              </FormControl>

              <Select
                value={newUser.userType}
                onChange={(e) =>
                  setNewUser({ ...newUser, userType: e.target.value })
                }>
                <option value="dispatcher">Dispatcher</option>
                <option value="admin">Admin</option>
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="green"
              onClick={inviteUser}
              isDisabled={!isValidEmailFormat}>
              Invite User
            </Button>
            <Button
              variant="outline"
              onClick={() => closeModal('inviteUser')}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default AdminDashboard;
