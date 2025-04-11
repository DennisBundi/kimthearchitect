import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { User } from "@/types";

// State type
interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

// Action types
type UserAction =
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_SELECTED_USER"; payload: User }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string };

// Initial state
const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// Create context
const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Reducer
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "SET_USERS":
      return {
        ...state,
        users: action.payload,
        error: null,
      };
    case "SET_SELECTED_USER":
      return {
        ...state,
        selectedUser: action.payload,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.payload],
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        ),
        error: null,
      };
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
        error: null,
      };
    default:
      return state;
  }
}

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for using the user context
export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
