import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: localStorage.getItem('accessToken') || null,
  groupData: localStorage.getItem('groupData')
    ? JSON.parse(localStorage.getItem('groupData'))
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },
    setGroupData: (state, action) => {
      state.groupData = action.payload;
      localStorage.setItem('groupData', JSON.stringify(action.payload));
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.groupData = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('groupData');
    },
  },
});

export const { setAccessToken, setGroupData, clearAuth } = authSlice.actions;
export default authSlice.reducer;
