import { useSelector, TypedUseSelectorHook, useDispatch } from "react-redux"
// ini ngambil dari redux , typeuser dipake untuk nentuin typenya
// state dari useSelectore, di nyambung untuk pamakaian dari typenya
//  useDispacth ini buat nnentuin milih bagian khusus dari state redux

import { configureStore } from "@reduxjs/toolkit"
// ini khusus untuk ngebuat store di reduxnya yang isinya diambil dari si slice

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
// ini definisiin kunci yang ada di store redux

type AppDispatch = typeof store.dispatch
// ini tipe state dari si redux sama si AppDispacth dari aplikasi


export default store;
// ini fungsinya untuk membagikan apa yang ada di store keseluruh aplikasi

export const useAppSelectore : TypedUseSelectorHook<RootState> = useSelector
// berfungsi untuk milih bagian yang khusu dari state redux 

export const useAppDispatch = () => useDispatch<AppDispatch>()
//  karna tipenya sudah di setting dari rootState , appdispatch untuk dispatcher reduxnya