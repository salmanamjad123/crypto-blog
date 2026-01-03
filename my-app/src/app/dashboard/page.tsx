'use client';

import { CreatePostForm } from '@/features/dashboard/CreatePostForm';
import { CreateNewsForm } from '@/features/dashboard/CreateNewsForm';
import { ManageBlogs } from '@/features/dashboard/ManageBlogs';
import { ManageNews } from '@/features/dashboard/ManageNews';
import { useState } from 'react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('manage-blogs');

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white h-screen p-4">
        <nav className="flex flex-col space-y-2">
          <button 
            className={`p-2 rounded hover:bg-gray-700 ${activeTab === 'manage-blogs' ? 'bg-gray-700' : ''}`}
            onClick={() => setActiveTab('manage-blogs')}
          >
            Manage Blogs
          </button>
          <button 
            className={`p-2 rounded hover:bg-gray-700 ${activeTab === 'create-blog' ? 'bg-gray-700' : ''}`}
            onClick={() => setActiveTab('create-blog')}
          >
            Create Blog
          </button>
          <button 
            className={`p-2 rounded hover:bg-gray-700 ${activeTab === 'manage-news' ? 'bg-gray-700' : ''}`}
            onClick={() => setActiveTab('manage-news')}
          >
            Manage News
          </button>
          <button 
            className={`p-2 rounded hover:bg-gray-700 ${activeTab === 'create-news' ? 'bg-gray-700' : ''}`}
            onClick={() => setActiveTab('create-news')}
          >
            Create News
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {activeTab === 'manage-blogs' && <ManageBlogs />}
        {activeTab === 'create-blog' && <CreatePostForm />}
        {activeTab === 'manage-news' && <ManageNews />}
        {activeTab === 'create-news' && <CreateNewsForm />}
      </main>
    </div>
  );
}
