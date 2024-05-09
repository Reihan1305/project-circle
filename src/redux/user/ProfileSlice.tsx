import { API } from "@/utils/api"
import getError from "@/utils/getError"
import { PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"
import { jwtDecode } from "jwt-decode"

const jwtToken:any = localStorage.getItem("jwtToken")

type initialStateT = {
    data: UserProfileType|any ;
    isLoading: boolean;
    isError: boolean;
    error: string;
}

const initialState: initialStateT = {
    data: null,
    isLoading: true,
    isError: false,
    error: "",
}


export const getProfile = createAsyncThunk(
    "profile",
    async (_, { rejectWithValue }) => {
        const getToken = jwtDecode(jwtToken)
        

        try {
            const id = getToken.User.id;

            const response = await API.get(`findbyUserid/${id}`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`
                }
            })

            return response.data.data
        } catch (error) {
            return rejectWithValue({ errorMessage: getError(error) })
        }
    }
)

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getProfile.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(
            getProfile.fulfilled,
            (state, action: PayloadAction<UserProfileType>) => {
                state.data = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = "";
            }
        );
        builder.addCase(
            getProfile.rejected,
            (state, action: PayloadAction<any>) => {
                state.data = null;
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload?.errorMessage || "Unkwown Error"
            }
        );
    }
})

export default profileSlice.reducer