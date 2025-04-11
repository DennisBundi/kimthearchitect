import React, { useEffect } from "react";
import { useUserContext } from "@/store/UserContext";
import { userService } from "@/services/userService";
import { useApi } from "@/hooks/useApi";

export function UserList() {
  const { state, dispatch } = useUserContext();
  const { users, loading, error } = state;

  // Example of using the useApi hook
  const {
    data,
    loading: fetchLoading,
    error: fetchError,
  } = useApi(() => userService.getUsers(), []);

  useEffect(() => {
    if (data) {
      dispatch({ type: "SET_USERS", payload: data });
    }
  }, [data, dispatch]);

  const handleAddUser = async (userData: Partial<User>) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const newUser = await userService.createUser(userData);
      dispatch({ type: "ADD_USER", payload: newUser });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const updatedUser = await userService.updateUser(id, userData);
      dispatch({ type: "UPDATE_USER", payload: updatedUser });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await userService.deleteUser(id);
      dispatch({ type: "DELETE_USER", payload: id });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  if (loading || fetchLoading) {
    return <div>Loading...</div>;
  }

  if (error || fetchError) {
    return <div>Error: {error || fetchError}</div>;
  }

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}
            <button
              onClick={() =>
                handleUpdateUser(user.id, { name: "Updated Name" })
              }
            >
              Update
            </button>
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          handleAddUser({ name: "New User", email: "new@example.com" })
        }
      >
        Add User
      </button>
    </div>
  );
}
