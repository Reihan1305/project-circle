import { useSelector, TypedUseSelectorHook, useDispatch } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"

import detailUserSlice from "./user/DetailUserSlice"
import profileSlice from "./user/ProfileSlice"
import suggestedSlice from "./user/suggestedSlice"

const store = configureStore({
    reducer: {
        detailUser: detailUserSlice,
        profile: profileSlice,
        suggested: suggestedSlice
    }
})

type RootState = ReturnType<typeof store.getState>

type AppDispatch = typeof store.dispatch


export default store;

export const useAppSelectore : TypedUseSelectorHook<RootState> = useSelector

export const useAppDispatch = () => useDispatch<AppDispatch>()
