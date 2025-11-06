import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  profile: null,
  vendorProfile: null,
  profileLoading: false,
  vendorProfileLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, jwt, token } = action.payload
      state.user = user
      state.token = jwt || token
      state.isAuthenticated = true
      localStorage.setItem('token', jwt || token)
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    setProfile: (state, action) => {
      state.profile = action.payload
    },
    setVendorProfile: (state, action) => {
      state.vendorProfile = action.payload
      state.vendorProfileLoading = false
    },
    setVendorProfileLoading: (state, action) => {
      state.vendorProfileLoading = action.payload
    },
    setProfileLoading: (state, action) => {
      state.profileLoading = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.profile = null
      state.vendorProfile = null
      state.profileLoading = false
      state.vendorProfileLoading = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, updateUser, setProfile, setVendorProfile, setVendorProfileLoading, setProfileLoading, logout } = authSlice.actions
export default authSlice.reducer