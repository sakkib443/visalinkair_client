import { createSlice } from "@reduxjs/toolkit";

const getInitialCart = () => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("visalinkair-cart");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [];
            }
        }
    }
    return [];
};

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: getInitialCart(),
        isOpen: false,
    },
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.items.find(
                (item) => item._id === action.payload._id
            );
            if (!existingItem) {
                state.items.push(action.payload);
                if (typeof window !== "undefined") {
                    localStorage.setItem("visalinkair-cart", JSON.stringify(state.items));
                }
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => item._id !== action.payload);
            if (typeof window !== "undefined") {
                localStorage.setItem("visalinkair-cart", JSON.stringify(state.items));
            }
        },
        clearCart: (state) => {
            state.items = [];
            if (typeof window !== "undefined") {
                localStorage.removeItem("visalinkair-cart");
            }
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        openCart: (state) => {
            state.isOpen = true;
        },
        closeCart: (state) => {
            state.isOpen = false;
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.length;
export const selectCartTotal = (state) =>
    state.cart.items.reduce((total, item) => total + (item.salePrice || item.price), 0);
export const selectIsCartOpen = (state) => state.cart.isOpen;
