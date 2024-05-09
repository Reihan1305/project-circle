// Apa itu redux?
// Redux merupokan sebuah package yang membantu mendistribusikan pemanggilan ke seluruh Aplikasi kita

// Contohnya adalah pengeras suara yang berfungsi untuk menyampaikan sebuah informasi secara global
// jadi setiap yang ada di aplikasi dapat menerima informasi tersebut tanpa harus berada dalam ruang yang sama

import { API } from "@/utils/api"
import getError from "@/utils/getError"
import { PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
// payload action ini tipe dari si redux toolkit yang secara default membawa payload
// createAsyncThunk ini sama aaja fungsinya kaya async, memanggil data secara asinkron dalam pemanggilan API


import { createSlice } from "@reduxjs/toolkit"
// ini untuk ngebuat slice di reduxnya. fungsinya untuk membagi kode agar mudah dikelola

type initialStateT = {
    data: UserProfileType | null;
    isLoading: boolean;
    isError: boolean;
    error: string;
};

const initialState: initialStateT = {
    data: null,
    isLoading: true,
    isError: false,
    error: "",
};
const jwtToken = localStorage.getItem("jwtToken");

export const getDetailUser = createAsyncThunk(
    "detailUser",
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await API.get("findbyUserid/" + userId, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue({ errorMessage: getError(error) });
        }
    }
);
// asinkron getDetailUser menggunakan createAsyncThunk. 
// Ini membuat pemanggilan API untuk mendapatkan detail pengguna berdasarkan ID pengguna 
// yang diberikan. Jika berhasil, ia mengembalikan data pengguna. Jika terjadi kesalahan, 
// ia menolak dengan nilai yang menunjukkan pesan kesalahan.


const detailUserSlice:any = createSlice({
    name: "detailUser",
    initialState,
    reducers: {}, // tidak diisi karena memakai extraReducers
    extraReducers: (builder) => {
        builder.addCase(getDetailUser.pending, (state) => {
            state.isLoading = true;
            // data sedang diproses dari API kita setting true
        });
        builder.addCase(
            getDetailUser.fulfilled,
            // pemanggilan data API berhasil lalu di ambil datanya
            (state, action: PayloadAction<UserProfileType>) => {
                state.data = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = "";
            }
        );
        builder.addCase(
            getDetailUser.rejected,
            // datanya gagal diambil, lalu diambil juga data kesalahannya
            (state, action: PayloadAction<any>) => {
                state.data = null;
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload?.errorMessage || "Unknown Error Occured";
            }
        );
    },
});

export default detailUserSlice.reducer;