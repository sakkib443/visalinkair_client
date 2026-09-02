import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("visapro-auth");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return { user: null, token: null, isAuthenticated: false };
            }
        }
    }
    return { user: null, token: null, isAuthenticated: false };
};

const authSlice = createSlice({
    name: "auth",
    initialState: getInitialState(),
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            if (typeof window !== "undefined") {
                localStorage.setItem("visapro-auth", JSON.stringify(state));
            }
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            if (typeof window !== "undefined") {
                localStorage.setItem("visapro-auth", JSON.stringify(state));
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            if (typeof window !== "undefined") {
                localStorage.removeItem("visapro-auth");
            }
        },
    },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
