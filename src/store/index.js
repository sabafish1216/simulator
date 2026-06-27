import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from './storage';
import flowReducer from './flowSlice';
import flowsReducer from './flowsSlice';

const persistConfig = {
  key: 'simulate-simulator',
  storage,
  whitelist: ['flow', 'flows'],
};

const rootReducer = combineReducers({
  flow: flowReducer,
  flows: flowsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
