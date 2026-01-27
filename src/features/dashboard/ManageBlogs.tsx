'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import Link from 'next/link';

interface ContentBlock {
  type: string;
  content: string;
}

interface Post {
  id: string;
  title: string;
  content: ContentBlock[] | string;
  category: string;
  slug?: string;
  createdAt: any;
}

const getPostSnippet = (content: ContentBlock[] | string) => {
  if (typeof content === 'string') {
    return content.substring(0, 50) + '...';
  }

  if (Array.isArray(content)) {
    const firstParagraph = content.find(block => block.type === 'p' || block.type === 'textarea');
    if (firstParagraph) {
      return firstParagraph.content.substring(0, 50) + '...';
    }
  }

  return 'No preview available.';
};

export const ManageBlogs = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPosts = async () => {
    const q = query(collection(db, 'posts'), where('category', '==', 'blogs'));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
    setPosts(postsData);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteDoc(doc(db, 'posts', id));
        alert('Blog deleted successfully!');
        fetchPosts();
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Error deleting blog');
      }
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Manage Blogs</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 text-gray-300">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Content Snippet</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map(post => (
              <tr key={post.id} className="border-b border-gray-700">
                <td className="py-2 px-4">{post.title}</td>
                <td className="py-2 px-4">{getPostSnippet(post.content)}</td>
                <td className="py-2 px-4">{new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</td>
                <td className="py-2 px-4 whitespace-nowrap">
                  <Link href={`/blogs/${post.slug || post.id}`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2">
                    View
                  </Link>
                  <Link href={`/dashboard/edit-blog/${post.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2">
                    Edit
                  </Link>
                  <button 
                    onClick={() => deletePost(post.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
