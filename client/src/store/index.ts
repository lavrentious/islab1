import {
  Action,
  combineReducers,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { carsApi } from "src/modules/cars/api";
import { humanBeingsApi } from "src/modules/humanbeings/api";
import { importsApi } from "src/modules/imports/api";

const rootReducer = combineReducers({
  [humanBeingsApi.reducerPath]: humanBeingsApi.reducer,
  [carsApi.reducerPath]: carsApi.reducer,
  [importsApi.reducerPath]: importsApi.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(humanBeingsApi.middleware)
      .concat(carsApi.middleware)
      .concat(importsApi.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
