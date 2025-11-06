import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in',
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // Don't set Content-Type for FormData requests
    if (endpoint !== 'updateProfile') {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Token expired or invalid, logout user
    api.dispatch({ type: 'auth/logout' });
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Profile'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/api/auth/customer/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: '/api/auth/customer/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Profile endpoints
    getMe: builder.query({
      query: () => '/api/auth/customer/me',
      providesTags: ['Profile'],
      transformResponse: (response) => {
        return response.data || response;
      },
    }),

    updateProfile: builder.mutation({
      query: ({ userId, profileData }) => {
        const formData = new FormData();



        // Append text fields
        Object.keys(profileData).forEach(key => {
          if (profileData[key] !== null && profileData[key] !== undefined &&
            !['adhar_front_photo', 'adhar_back_photo', 'pan_card_photo', 'profile_picture'].includes(key)) {
            formData.append(key, profileData[key]);

          }
        });

        // Append file fields
        if (profileData.adhar_front_photo) {
          formData.append('adhar_front_photo', profileData.adhar_front_photo);

        }
        if (profileData.adhar_back_photo) {
          formData.append('adhar_back_photo', profileData.adhar_back_photo);
        }
        if (profileData.pan_card_photo) {
          formData.append('pan_card_photo', profileData.pan_card_photo);
        }
        if (profileData.profile_picture) {
          formData.append('profile_picture', profileData.profile_picture);
        }


        return {
          url: `/api/auth/customer/${userId}`,
          method: 'PUT',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['Profile'],
      transformResponse: (response) => {
        const transformedData = response.data || response;
        return transformedData;
      },
    }),

    getWalletTransactionsByUser: builder.query({
      query: (userId) => `/api/wallet-manager/${userId}`,
      providesTags: ['WalletTransactions'],
      transformResponse: (response) => response.data || [],
    }),

    getCustomerById: builder.query({
      query: (customerId) => `/api/auth/customer/${customerId}`,
      providesTags: ['Customer'],
      transformResponse: (response) => response.data || {},
    }),


    findNearestDC: builder.mutation({
      query: (body) => ({
        url: '/api/dc-manager/find-nearest-dc',
        method: 'POST',
        body, // expects { lat, lng, rangeType }
      }),
    }),

    // ✅ Get all Time Windows
    getAllTimeWindows: builder.query({
      query: () => ({
        url: '/api/time-window/all', // from your backend router
        method: 'GET',
      }),
      providesTags: ['TimeWindows'],
      transformResponse: (response) => response.data || [],
    }),

    // ✅ Get all DCs
    getAllDCs: builder.query({
      query: () => ({
        url: '/api/dc-manager',
        method: 'GET',
      }),
      providesTags: ['DCs'],
      transformResponse: (response) => response.data || [],
    }),

    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/api/auth/customer/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),

    // Get all orders
    getAllOrders: builder.query({
      query: () => ({
        url: '/api/order-manager',
        method: 'GET',
      }),
      providesTags: ['Order'],
      transformResponse: (response) => response.data || [],
    }),

    // Get order by ID
    getOrderById: builder.query({
      query: (orderId) => ({
        url: `/api/order-manager/${orderId}`,
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
      transformResponse: (response) => response.data || {},
    }),

    // Get orders by Customer ID
    getOrdersByCustomerId: builder.query({
      query: (customerId) => ({
        url: `/api/order-manager/customer/${customerId}`,
        method: 'GET',
      }),
      providesTags: ['Order'],
      transformResponse: (response) => response.data || [],
    }),

  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetWalletTransactionsByUserQuery,
  useFindNearestDCMutation,
  useGetAllTimeWindowsQuery,
  useGetAllDCsQuery,
  useGetCustomerByIdQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrdersByCustomerIdQuery,
} = apiSlice;