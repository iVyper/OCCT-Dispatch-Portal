import React, { useState, useEffect } from 'react';
import { Accordion, Box, Heading, Stack } from '@chakra-ui/react';
import axios from 'axios';

import { useSnackbar } from '../../context/SnackbarProvider';
import RouteAccordionItem from './RouteAccordionItem';

function RouteAccordion({ socket }) {
  const [routes, setRoutes] = useState([]);
  const { showSuccessToast, showErrorToast } = useSnackbar();
  useEffect(() => {
    fetchRoutesAndServiceUpdates();
  }, []);

  const fetchRoutesAndServiceUpdates = async () => {
    try {
      const { data } = await axios.get('/api/service-updates');
      setRoutes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateServiceUpdate = async (
    routeId,
    primaryServiceUpdate,
    secondaryServiceUpdate
  ) => {
    try {
      const { data } = await axios.post(`/api/service-updates/${routeId}`, {
        primaryServiceUpdate,
        secondaryServiceUpdate,
      });

      setRoutes((prev) => {
        return prev.map((routeToFind) =>
          routeToFind.id === routeId
            ? {
                ...routeToFind,
                serviceUpdates: [...data.serviceUpdates],
              }
            : routeToFind
        );
      });
      showSuccessToast('Route service update created!');
      socket.emit('new-update');
    } catch (error) {
      console.error(error);

      showErrorToast(error.response.data.error);
    }
  };
  const handleEnableDisableRoute = async (routeId) => {
    try {
      const { data } = await axios.put(`/api/routes/update/enabled/${routeId}`);

      setRoutes((prev) => {
        return prev.map((routeToFind) =>
          routeToFind.id === routeId
            ? {
                ...routeToFind,
                enabled: data.enabled,
              }
            : { ...routeToFind }
        );
      });
      showSuccessToast('Route service updated!');
      socket.emit('new-update');
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };

  const handleUpdateServiceUpdate = async (
    routeId,
    primaryServiceUpdate,
    secondaryServiceUpdate
  ) => {
    try {
      const { data } = await axios.put(`/api/service-updates/${routeId}`, {
        primaryServiceUpdate,
        secondaryServiceUpdate,
      });

      setRoutes((prev) => {
        return prev.map((routeToFind) =>
          routeToFind.id === routeId
            ? {
                ...routeToFind,
                serviceUpdates: [...data.serviceUpdates],
              }
            : { ...routeToFind }
        );
      });
      showSuccessToast('Route service updated!');
      socket.emit('new-update');
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };

  const handleServiceUpdateDelete = async (routeId, serviceUpdateId) => {
    try {
      await axios.delete(`/api/service-updates/${routeId}/${serviceUpdateId}`);

      await fetchRoutesAndServiceUpdates();
      showSuccessToast('Service update deleted!');
      socket.emit('new-update');
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };

  return (
    <Box>
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
          Dispatch Dashboard
        </Heading>
        <Accordion allowToggle>
          {routes.map((route) => (
            <RouteAccordionItem
              key={route.id}
              route={route}
              handleCreateServiceUpdate={handleCreateServiceUpdate}
              handleUpdateServiceUpdate={handleUpdateServiceUpdate}
              handleServiceUpdateDelete={handleServiceUpdateDelete}
              handleEnableDisableRoute={handleEnableDisableRoute}
              setRoutes={setRoutes}
            />
          ))}
        </Accordion>
      </Stack>
    </Box>
  );
}

export default RouteAccordion;
