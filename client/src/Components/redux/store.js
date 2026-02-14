import { combineReducers, configureStore } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import configReducer from './config/configSlice'
import themeReducer from './theme/themeSlice'

import ctaReducer from './cta/ctaSlice';

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  config: configReducer,
  cta: ctaReducer,
})

const persistConfig = {
  key: "root",
  storage,
  version: 1,
};
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
})

export const persistor = persistStore(store)