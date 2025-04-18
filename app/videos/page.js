"use client";

import { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrashAlt, FaPlus, FaUpload } from "react-icons/fa";
import { fetchVideos, fetchCategories, uploadVideo, deleteVideo, updateVideo } from "../utils/api";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [videoData, categoryData] = await Promise.all([fetchVideos(), fetchCategories()]);
        setVideos(videoData);
        setCategories(categoryData);
      } catch (error) {
        toast.error("Failed to load data");
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleModal = (video = null) => {
    setCurrentVideo(video);
    setIsModalOpen(!isModalOpen);
  };

  const handleUploadOrEdit = async (formData) => {
    try {
      let response;
      if (currentVideo) {
        const updatedData = {
          title: formData.get("title"),
          category_id: formData.get("category_id") || null,
        };
        response = await updateVideo(currentVideo.id, updatedData);
      } else {
        response = await uploadVideo(formData);
      }

      if (!response || response.error) {
        throw new Error(response?.error || "Unexpected API response");
      }

      if (currentVideo) {
        setVideos(videos.map((v) => (v.id === currentVideo.id ? response : v)));
        toast.success("Video updated successfully!");
      } else {
        setVideos([...videos, response]);
        toast.success("Video uploaded successfully!");
      }

      return { success: true };
    } catch (error) {
      toast.error(error.message || "Failed to upload or update video.");
      return { error: error.message || "Failed to upload or update video." };
    }
  };

  const confirmDelete = (video) => {
    setVideoToDelete(video);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);

    try {
      await deleteVideo(videoToDelete.id);
      setVideos(videos.filter((video) => video.id !== videoToDelete.id));
      toast.success("Video deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete video");
      console.error("Failed to delete video", error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-900">Video Library</h2>
        <p className="text-gray-500 mb-8">Manage your video collection</p>

        <div className="flex justify-end mb-6">
          <button
            className="bg-indigo-600 text-white px-5 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md"
            onClick={() => toggleModal()}
          >
            <FaPlus /> Add New Video
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
            : videos.map((video) => (
                <div key={video.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-video">
                    <iframe
                      src={`https://player.vimeo.com/video/${video.vimeo_id}?title=0&byline=0&portrait=0`}
                      className="absolute w-full h-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800 mb-1">{video.title}</h3>
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                          {video.category}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-yellow-600 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors"
                          onClick={() => toggleModal(video)}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          onClick={() => confirmDelete(video)}
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "<b>{videoToDelete?.title}</b>"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {isModalOpen && (
        <VideoModal categories={categories} onSubmit={handleUploadOrEdit} onClose={toggleModal} video={currentVideo} />
      )}
    </div>
  );
};


const VideoModal = ({ categories, onSubmit, onClose, video }) => {
  const [title, setTitle] = useState(video?.title || "");
  const [category, setCategory] = useState(video?.category_id || "");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null); // Add this state
  const [isProcessing, setIsProcessing] = useState(false);
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null); // Add this ref

  const handleFileSelect = (event, setFile) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const triggerFileInput = (ref) => {
    ref.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category_id", category);

    // Append video file (only for new videos)
    if (!video && videoFile) {
      formData.append("file", videoFile);
    }

    // Append thumbnail file (if provided)
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    try {
      const response = await onSubmit(formData);
      if (response?.error) {
        throw new Error(response.error);
      }
      setIsProcessing(false);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Failed to ${video ? "update" : "upload"} video. Please try again.`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-100 backdrop-blur-sm flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="bg-white rounded-xl p-6 shadow-2xl w-full m-4 max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">{video ? "Edit Video" : "Upload New Video"}</h3>
        <form onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Title</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category Dropdown */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Category</label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
              value={category || ""}
              onChange={(e) => setCategory(e.target.value || "")}
              required
            >
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Video Upload (Only for Adding New Video) */}
          {!video && (
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Video</label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
                onClick={() => triggerFileInput(videoInputRef)}
              >
                <input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => handleFileSelect(e, setVideoFile)}
                  required
                />
                <FaUpload className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-sm text-gray-600">
                  {videoFile ? videoFile.name : "Click to upload a video"}
                </p>
              </div>
            </div>
          )}

          {/* Thumbnail Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Thumbnail</label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
              onClick={() => triggerFileInput(thumbnailInputRef)}
            >
              <input
                type="file"
                ref={thumbnailInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, setThumbnailFile)}
              />
              <FaUpload className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-sm text-gray-600">
                {thumbnailFile ? thumbnailFile.name : "Click to upload a thumbnail"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button type="button" className="px-5 py-3 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" disabled={isProcessing}>
              {isProcessing ? (video ? "Updating..." : "Uploading...") : video ? "Update Video" : "Upload Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ); 

};
// Skeleton Loader for Video Cards
const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="relative aspect-video bg-gray-300"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default Videos;
