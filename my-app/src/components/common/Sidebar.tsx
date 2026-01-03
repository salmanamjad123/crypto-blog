'use client';

import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <ul>
        <li 
          className={`cursor-pointer p-2 rounded ${activeTab === 'createBlog' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('createBlog')}
        >
          Create New Blog
        </li>
        <li 
          className={`cursor-pointer p-2 rounded ${activeTab === 'manageBlogs' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('manageBlogs')}
        >
          Manage Blogs
        </li>
        <li 
          className={`cursor-pointer p-2 rounded ${activeTab === 'createNews' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('createNews')}
        >
          Create New News
        </li>
        <li 
          className={`cursor-pointer p-2 rounded ${activeTab === 'manageNews' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('manageNews')}
        >
          Manage News
        </li>
      </ul>
    </div>
  );
};
