import { getApiUrl } from '@/utils/getApiUrl';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
// import { API_BASE_URL } from '../config/constants';


// const originalConsoleError = console.error;

// console.error = (...args) => {
//   const firstArg = args[0];

//   const isSuppressedError =  typeof firstArg === "object" && firstArg?.response?.status && [400, 404].includes(firstArg.response.status);
//   if (!isSuppressedError) {
//     originalConsoleError.apply(console, args);
//   } else {
//     console.log('Suppressed error: ', args);
//   }
// }


const apiClient = axios.create({
  baseURL: getApiUrl(''),
  withCredentials: true,
});



export const getData = async <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.get(endpoint, config);
    return response.data;
}

export const postData = async <T, D>(endpoint: string, data: D, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.post(endpoint, data, config);
  return response.data;
}

// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     console.log('+++++++++++++++interceptors.response+++++++++++++++++');
//     error.toJSON = () => ({
//       message: error.message,
//       name: error.name,
//       description: error.description,
//       number: error.number,
//       fileName: error.fileName,
//       lineNumber: error.lineNumber,
//       columnNumber: error.columnNumber,
//       stack: error.stack
//     });
//     return Promise.reject(error);
//   }
// );


// apiClient.interceptors.request.use(async (config) => {
//   const access_token = localStorage.getItem('access_token');
//   if (access_token && isTokenExpired(access_token)) {
//     const new_token = await refreshAccessToken();
//     localStorage.setItem('access_token', new_token);
//     config.headers['Authorization'] = `Bearer ${new_token}`;
//   }
//   return config;
// });

// here handle if a response fron api is 401_UNAUTHORIZED that means the token in note in httpOnly cookies or is expired
// so you should request api to logout (clear the cookies) and nivaigate to auth page , set user as not logged in
// const navigate = useNavigate();
// const {setIsLoggedIn} = useAuth();


// const refreshAccessToken = async () => {
//   const navigate = useNavigate()
//   try {
//     const response = await axios.post('http://localhost:8000/api/auth/refresh_token/', null, {withCredentials: true})
//     const newAccessToken = response.data.access_token;
//     return newAccessToken;
//   }
//   catch (error) {
//     console.error('Refresh token failed: ', error);
//     navigate('/auth')
//   }
// }

export default apiClient;

// interface ApiResponse<T> {
//   data: T;
// }

// class APIClient<T> {
// //   get = () => {
// //     return axiosInstance.get<T>(this.endpoint);
// //   };

// //   post = (data: T) => {
// //     return axiosInstance.post<T>(this.endpoint, data);
// //   };

//   static async get<T>(endpoint: string) {
//     const response = await axiosInstance.get<T>(endpoint);
//     return response.data;
//   }

//   static async post<T>(endpoint: string, data: T) {
//     const response = await axiosInstance.post(endpoint, data);
//     return response.data;
//   }
// }

// const istokenexpired = (token) => {
//   if (!token) return true; // Token is not available

//   const decoded = jwtDecode(token);
//   const currentTime = Date.now() / 1000; // Current time in seconds

//   return decoded.exp < currentTime; // Check if the token is expired
// };

// const refreshAccessToken = async (refreshToken) => {
//   try {
//     const response = await axios.post('/api/refresh-token', {
//       token: refreshToken,
//     });
//     localStorage.setItem('access_token', response.data);
//   } catch (error) {
//     console.error('Failed to refresh token', error);
//   }
// };

// Adding a request interceptor


// class APIClient {
//   static async get<T>(
//     endpoint: string,
//     config?: AxiosRequestConfig
//   ): Promise<T> {
//     const response: AxiosResponse<T> = await axiosInstance.get(
//       endpoint,
//       config
//     );
//     return response.data;
//   }

//   static async post<T, D>(
//     endpoint: string,
//     data: D,
//     config?: AxiosRequestConfig
//   ): Promise<T> {
//     const response: AxiosResponse<T> = await axiosInstance.post(
//       endpoint,
//       data,
//       config
//     );
//     return response.data;
//   }

  // You can add more methods (put, delete, patch) if needed, similarly typed.
// }

// export default APIClient;

// const useAxios = () => {
//   const { authToken, setUser, setTokens } = useContext(AuthContext);

//   const axiosInstance = axios.create({
//     baseURL,
//     headers: { Authorization: `bearer ${authToken?.access}` },
//   });

//   axiosInstance.interceptors.request.use(async (req) => {
//     const user = jwtDecode(authToken.access);
//     const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

//     if (isExpired) return req;
//     const response = await axios.post(`${baseURL}/token/refresh`, {
//       refresh: authToken.refresh,
//     });
//     localStorage.setItem('authToken', JSON.stringify(response.data));

//     setAuthTokens(response.data);
//     setUser(jwt_decode(response.data.access));

//     req.headers.Authorization = `Bearer ${response.data.access}`;
//     return req;
//   });
// };
