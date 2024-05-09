import { API } from "@/utils/api"
import getError from "@/utils/getError"
import { PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"

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

const detailUserSlice:any = createSlice({
    name: "detailUser",
    initialState,
    reducers: {}, 
    extraReducers: (builder) => {
        builder.addCase(getDetailUser.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(
            getDetailUser.fulfilled,
            (state, action: PayloadAction<UserProfileType>) => {
                state.data = action.payload;
                state.isLoading = false;
                state.isError = false;
                state.error = "";
            }
        );
        builder.addCase(
            getDetailUser.rejected,
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