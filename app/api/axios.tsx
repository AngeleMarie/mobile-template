import axios from 'axios';


const BASE_URL = 'http://10.11.73.214:3001:'; // Update this to your current IP if needed
//  const BASE_URL = 'https://6815048c225ff1af162adc2f.mockapi.io/api/v1';


// Public instance (no auth required)
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});
