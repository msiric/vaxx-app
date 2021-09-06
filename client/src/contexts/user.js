import create from "zustand";

const initialState = {
  authenticated: false,
  token: null,
  id: null,
  name: null,
  email: null,
  reminders: null,
  loading: true,
};

const initState = () => ({
  ...initialState,
});

const initActions = (set, get) => ({
  setUser: ({ authenticated, token, id, name, email, reminders, loading }) => {
    set((state) => ({
      ...state,
      authenticated,
      token,
      id,
      name,
      email,
      reminders,
      loading,
    }));
  },
  updateUser: ({ token, email }) => {
    set((state) => ({
      ...state,
      token,
      email,
    }));
  },
  updateToken: ({ token }) => {
    set((state) => ({
      ...state,
      token,
    }));
  },
  updateReminders: ({ reminders }) => {
    set((state) => ({
      ...state,
      reminders,
    }));
  },
  resetUser: () => {
    set({ ...initialState });
  },
});

export const useUserStore = create((set, get) => ({
  ...initState(),
  ...initActions(set, get),
}));
