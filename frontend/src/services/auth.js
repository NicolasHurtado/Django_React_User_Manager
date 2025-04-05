import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, {
      username,
      password,
    });
    
    if (response.data.access) {
      localStorage.setItem('user_token', JSON.stringify(response.data));
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/`, {
      username,
      email,
      password,
    });
    
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const getToken = () => {
  try {
    const userToken = localStorage.getItem('user_token');
    return userToken ? JSON.parse(userToken).access : null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const getRefreshToken = () => {
  try {
    const userToken = localStorage.getItem('user_token');
    return userToken ? JSON.parse(userToken).refresh : null;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem('user_token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Comprobamos si el token ha expirado (con un margen de 10 segundos)
    return payload.exp * 1000 < Date.now() - 10000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {}; 
}; 