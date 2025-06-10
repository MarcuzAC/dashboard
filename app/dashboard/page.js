"use client";
import React from "react";
import { useEffect, useState } from "react";
import { fetchDashboardStats, fetchRecentVideos, getLatestNews } from "../utils/api";
import { FaUsers, FaVideo, FaList, FaDollarSign, FaNewspaper } from "react-icons/fa";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, videosData, newsData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentVideos(),
          getLatestNews()
        ]);
        setStats(statsData);
        setVideos(videosData);
        setNews(newsData);
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="mt-2 w-10 md:w-12 h-1 bg-blue-600 rounded-full"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
        {loading
          ? [...Array(5)].map((_, index) => <SkeletonStatCard key={index} />)
          : <>
              <StatCard icon={<FaUsers />} title="Total Users" value={stats?.total_users || 0} />
              <StatCard icon={<FaVideo />} title="Total Videos" value={stats?.total_videos || 0} />
              <StatCard icon={<FaList />} title="Categories" value={stats?.total_categories || 0} />
              <StatCard icon={<FaNewspaper />} title="News Articles" value={stats?.total_news || 0} />
              <StatCard icon={<FaDollarSign />} title="Revenue" value={`MWK${stats?.revenue || 0}.00`} />
            </>
        }
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Videos Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-md sm:text-lg font-semibold text-gray-900">Recent Videos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full md:min-w-[600px]">
              <thead className="bg-gray-50 hidden md:table-header-group">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading
                  ? [...Array(3)].map((_, index) => <SkeletonTableRow key={index} />)
                  : videos.length > 0 ? (
                    videos.map((video) => (
                      <React.Fragment key={video.id}>
                        {/* Desktop Row */}
                        <tr className="hidden md:table-row hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 text-gray-700">{video.title}</td>
                          <td className="px-4 sm:px-6 py-4 text-gray-700">{video.category}</td>
                          <td className="px-4 sm:px-6 py-4 text-gray-700">{new Date(video.created_date).toLocaleDateString()}</td>
                        </tr>

                        {/* Mobile Card View */}
                        <tr className="block w-full md:hidden">
                          <td className="block p-4 border-b">
                            <p className="text-sm font-semibold text-gray-900">{video.title}</p>
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-gray-500">{video.category}</p>
                              <p className="text-xs text-gray-400">{new Date(video.created_date).toLocaleDateString()}</p>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 sm:px-6 py-4 text-center text-gray-500">No videos found</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest News Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-md sm:text-lg font-semibold text-gray-900">Latest News</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {loading
              ? [...Array(3)].map((_, index) => (
                  <div key={index} className="p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))
              : news.length > 0 ? (
                news.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      {item.image_url && (
                        <div className="flex-shrink-0 mr-3">
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="h-12 w-12 object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{item.is_published ? 'Published' : 'Draft'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No news articles found</div>
              )
            }
          </div>
          {!loading && news.length > 0 && (
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 text-right">
              <a 
                href="/news" 
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all news →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* Reusable Stat Card Component */
const StatCard = ({ icon, title, value }) => {
  return (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center">
        <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-xl flex items-center justify-center">
          <span className="text-blue-600 text-xl md:text-2xl">{icon}</span>
        </div>
        <div className="ml-3 md:ml-4">
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{title}</h4>
          <p className="text-lg sm:text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

/* Skeleton Stat Card */
const SkeletonStatCard = () => {
  return (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center">
        <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-xl"></div>
        <div className="ml-3 md:ml-4">
          <div className="h-3 md:h-4 bg-gray-200 w-20 mb-2 rounded"></div>
          <div className="h-5 md:h-6 bg-gray-300 w-14 rounded"></div>
        </div>
      </div>
    </div>
  );
};

/* Table Row Component */
const TableRow = ({ title, category, uploadedBy, date }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{title}</td>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-600">
        <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{category}</span>
      </td>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-600">{uploadedBy}</td>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">{date}</td>
    </tr>
  );
};

/* Skeleton Table Row */
const SkeletonTableRow = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
        <div className="h-3 md:h-4 bg-gray-200 rounded w-28"></div>
      </td>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
        <div className="h-3 md:h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
        <div className="h-3 md:h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
        <div className="h-3 md:h-4 bg-gray-200 rounded w-16"></div>
      </td>
    </tr>
  );
};

export default Dashboard;