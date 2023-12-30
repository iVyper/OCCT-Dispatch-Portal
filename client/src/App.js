import './App.css';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from './components/Authentication/LoginPage';

import axios from 'axios';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import DispatchDashboard from './components/DispatchDashboard/DispatchDashboard';
import { useSnackbar } from './context/SnackbarProvider';
import Recover from './components/Authentication/Recover';
import Register from './components/Authentication/Register';
import { Flex, Spinner } from '@chakra-ui/react';

axios.defaults.baseURL = process.env.REACT_APP_URL
  ? process.env.REACT_APP_URL
  : 'https://occt-dispatch-website-006ef2bb4dfc.herokuapp.com';

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem('admin-login-token');
  config.headers['x-access-token'] = token;
  return config;
});

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState({
    isFetching: true,
  });

  const { showSuccessToast, showErrorToast } = useSnackbar();

  const login = async (credentials) => {
    try {
      const { data } = await axios.post('/auth/login', credentials);
      await localStorage.setItem('admin-login-token', data.token);
      setUser(data);
      showSuccessToast('Sucessfully logged in!');
    } catch (error) {
      console.error(error);
      setUser({ error: error.response.data.error || 'Server Error' });
      showErrorToast(error.response.data.error);
    }
  };

  const logout = async (id) => {
    try {
      await axios.delete('/auth/logout');
      await localStorage.removeItem('admin-login-token');
      setUser({});
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };
  const checkAuth = async (token) => {
    try {
      const response = await axios.post(`/auth/password/check-auth/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error checking authentication:', error);
      showErrorToast(error.response.data.error);
      return { valid: false };
    }
  };

  const recoverPassword = async (email) => {
    try {
      await axios.post('/auth/password/recover', {
        email,
      });
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };

  const recoveryChangePassword = async (token, password) => {
    try {
      await axios.post(`/auth/password/set/${token}`, {
        newPassword: password,
      });
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
    }
  };
  const registerInvitedUser = async (token, password, tempPassword) => {
    try {
      const { data } = await axios.post(`/auth/user/create`, {
        token,
        tempPassword,
        password,
      });
      await localStorage.setItem('admin-login-token', data.token);
      setUser(data);
      showSuccessToast('Sucessfully logged in!');
    } catch (error) {
      console.error(error);
      setUser({ error: error.response.data.error || 'Server Error' });
      showErrorToast(error.response.data.error);
      throw error;
    }
  };
  const changePasswordWithToken = async (password) => {
    try {
      await axios.post(`/auth/password/change`, {
        newPassword: password,
      });
    } catch (error) {
      console.error(error);
      showErrorToast(error.response.data.error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setUser((prev) => ({ ...prev, isFetching: true }));
      try {
        const { data } = await axios.get('/auth/user');

        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setUser((prev) => ({ ...prev, isFetching: false }));
      }
    };

    fetchUser();
  }, []);
  useEffect(() => {
    const newSocket = io(
      process.env.REACT_APP_URL
        ? process.env.REACT_APP_URL
        : 'https://occt-dispatch-website-006ef2bb4dfc.herokuapp.com'
    );
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);
  if (user?.isFetching) {
    return (
      <Flex
        height="100vh"
        justifyContent="center"
        alignItems="center">
        <Spinner
          size="xl"
          color="teal.500"
        />
      </Flex>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user.id ? (
              user.userType === 'admin' ? (
                <Navigate
                  to="/admin-dashboard"
                  replace={true}
                />
              ) : (
                <Navigate
                  to="/dispatch"
                  replace={true}
                />
              )
            ) : (
              <LoginPage
                login={login}
                recoverPassword={recoverPassword}
              />
            )
          }
        />
        <Route
          path="/change-password"
          element={
            <Recover
              recoveryChangePassword={recoveryChangePassword}
              checkAuth={checkAuth}
            />
          }
        />
        <Route
          path="/set-up-account"
          element={
            <Register
              registerInvitedUser={registerInvitedUser}
              checkAuth={checkAuth}
            />
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            user.id && user.userType === 'admin' ? (
              <AdminDashboard
                socket={socket}
                user={user}
                logout={logout}
                changePasswordWithToken={changePasswordWithToken}
              />
            ) : (
              <Navigate
                to="/"
                replace={true}
              />
            )
          }
        />
        <Route
          path="/dispatch"
          element={
            user.id && user.userType === 'dispatcher' ? (
              <DispatchDashboard
                socket={socket}
                user={user}
                logout={logout}
                changePasswordWithToken={changePasswordWithToken}
              />
            ) : (
              <Navigate
                to="/"
                replace={true}
              />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
