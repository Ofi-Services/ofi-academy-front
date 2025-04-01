
// src/store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../modules/auth/store/authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;