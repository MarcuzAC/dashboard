"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../utils/api"; // Importing API functions
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        toast.error("Failed to fetch categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Add Category Handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    try {
      setIsAdding(true);
      const addedCategory = await createCategory({ name: newCategory });
      setCategories([...categories, addedCategory]);
      setNewCategory("");
      toast.success("Category added successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to add category.");
    } finally {
      setIsAdding(false);
    }
  };

  // Open Delete Confirmation Dialog
  const confirmDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  // Delete Category Handler
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCategory(categoryToDelete.id);
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id));
      toast.success("Category deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete category.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Edit Category Handler
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
  };

  // Save Edited Category Handler
  const handleSaveEditCategory = async () => {
    if (!editCategoryName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);
      const updatedCategory = await updateCategory(editingCategory.id, {
        name: editCategoryName,
      });

      setCategories(categories.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat)));
      setEditingCategory(null);
      setEditCategoryName("");
      toast.success("Category updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update category.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 px-6 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold text-gray-900">Manage Categories</h2>

      <div className="bg-white p-8 rounded-2xl shadow transition-all duration-300 border border-gray-200 mt-8 group w-full ">
  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
    <span className="mr-2 text-blue-600">📁</span> Add New Category
  </h3>

  <form onSubmit={handleAddCategory} className="space-y-4">
    <div className="flex flex-col sm:flex-row gap-4">
      <input
        type="text"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        placeholder="Enter category name"
        className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 placeholder-gray-500 text-gray-700 transition-all duration-200 bg-gray-50 hover:border-blue-400"
        required
      />
      <button
        type="submit"
        className="px-6 py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center w-full sm:w-auto"
        disabled={isAdding}
      >
        {isAdding ? (
          <span className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l3 3"></path>
            </svg>
            Adding...
          </span>
        ) : (
          "Add Category"
        )}
      </button>
    </div>
  </form>
</div>


      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mt-8 transition-all">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Category List</h3>
        {loadingCategories ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 bg-gray-300 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left text-sm font-medium text-gray-700">Category Name</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-all">
                    <td className="p-4 text-sm text-gray-700">
                      {editingCategory?.id === category.id ? (
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="p-4 flex space-x-4">
                      {editingCategory?.id === category.id ? (
                        <button
                          onClick={handleSaveEditCategory}
                          className="text-blue-600 hover:text-blue-800 font-medium transition-all"
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                      ) : (
                        <button onClick={() => handleEditCategory(category)} className="text-blue-600 hover:text-blue-800">
                          <FaEdit />
                        </button>
                      )}
                      <button onClick={() => confirmDeleteCategory(category)} className="text-red-600 hover:text-red-800">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center p-4 text-gray-600">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete "{categoryToDelete?.name}"?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCategory} color="error" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
