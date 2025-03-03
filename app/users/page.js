"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUsers, updateUser, deleteUser } from "../utils/api"; // API integration
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({ fullname: "", email: "", number: "", subscribed: false });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        toast.error("Failed to fetch users.");
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Open Delete Confirmation Dialog
  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await deleteUser(userToDelete.id);
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      toast.success("User deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Edit User Handler
  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditUserData(user);
  };

  // Save Edited User Handler
  const handleSaveEditUser = async () => {
    if (!editUserData.first_name.trim() || !editUserData.last_name.trim() || !editUserData.email.trim() || !editUserData.phone_number.trim()) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setIsSaving(true);
      const updatedUser = await updateUser(editingUser, editUserData);

      setUsers(users.map((user) => (user.id === editingUser ? updatedUser : user)));
      setEditingUser(null);
      toast.success("User updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 px-6 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold text-gray-900">Users List</h2>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 w-full">
  {loadingUsers ? (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-10 bg-gray-300 rounded animate-pulse"></div>
      ))}
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm">
            <th className="p-4 text-left font-medium">First Name</th>
            <th className="p-4 text-left font-medium">Last Name</th>
            <th className="p-4 text-left font-medium">Phone</th>
            <th className="p-4 text-left font-medium">Email</th>
            <th className="p-4 text-left font-medium">Subscription</th>
            <th className="p-4 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-all">
                <td className="p-4 text-sm text-gray-700">
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      value={editUserData.first_name}
                      onChange={(e) => setEditUserData({ ...editUserData, first_name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    user.first_name
                  )}
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      value={editUserData.last_name}
                      onChange={(e) => setEditUserData({ ...editUserData, last_name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    user.last_name
                  )}
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {editingUser === user.id ? (
                    <input
                      type="tel"
                      value={editUserData.phone_number}
                      onChange={(e) => setEditUserData({ ...editUserData, phone_number: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    user.phone_number
                  )}
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {editingUser === user.id ? (
                    <input
                      type="email"
                      value={editUserData.email}
                      onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {user.subscribed ? (
                    <span className="text-green-600 font-medium">Subscribed</span>
                  ) : (
                    <span className="text-red-600 font-medium">Not Subscribed</span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-700 flex items-center space-x-3">
                  {editingUser === user.id ? (
                    <button
                      onClick={handleSaveEditUser}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-all disabled:opacity-50"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-md transition-all"
                      title="Edit User"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => confirmDeleteUser(user)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md transition-all"
                    title="Delete User"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-600">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}
</div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete "{userToDelete?.first_name}"?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UsersPage;
