const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const register = async (
  email: string,
  password: string,
  name: string,
  role: string
) => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    email,
    password,
    name,
    role,
  });
  return response.data;
}; 