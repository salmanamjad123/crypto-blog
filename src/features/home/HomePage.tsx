'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import Link from 'next/link';

// Defining a simplified content block type for our post
interface ContentBlock {
  type: string;
  content: string;
}

interface Post {
  id: string;
  title: string;
  content: ContentBlock[] | string; // Can be an array of blocks or a simple string for older posts
  category: string;
  slug?: string;
}

// Function to get a preview of the post content
const getPostSnippet = (content: ContentBlock[] | string) => {
  if (typeof content === 'string') {
    return content.substring(0, 150) + '...';
  }

  if (Array.isArray(content)) {
    const firstParagraph = content.find(block => block.type === 'p' || block.type === 'textarea');
    if (firstParagraph) {
      return firstParagraph.content.substring(0, 150) + '...';
    }
  }

  return 'No preview available.';
};

const PostCard = ({ post }: { post: Post }) => (
  <div className="bg-gray-800 text-white rounded-lg shadow-md p-6">
    <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
    <p className="text-gray-300 mb-4">{getPostSnippet(post.content)}</p>
    <p className="text-gray-400 text-sm mb-4">Category: {post.category}</p>
    <Link href={`/${post.category}/${post.slug || post.id}`} className="text-blue-500 hover:underline">
      Read More
    </Link>
  </div>
);

const HeroSection = () => (
    <div className="bg-gray-900 text-white text-center py-20 mb-8">
        <h1 className="text-5xl font-bold">Welcome to Our News and Blog</h1>
        <p className="text-xl mt-4">Your one-stop destination for the latest updates.</p>
    </div>
)

export const HomePage = () => {
  const [newsPosts, setNewsPosts] = useState<Post[]>([]);
  const [blogPosts, setBlogPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      // Fetch News
      const newsQuery = query(collection(db, 'posts'), where('category', '==', 'news'));
      const newsSnapshot = await getDocs(newsQuery);
      const newsData = newsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setNewsPosts(newsData);

      // Fetch Blogs
      const blogsQuery = query(collection(db, 'posts'), where('category', '==', 'blogs'));
      const blogsSnapshot = await getDocs(blogsQuery);
      const blogsData = blogsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setBlogPosts(blogsData);
    };

    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
        <HeroSection />
      <h1 className="text-3xl font-bold mb-4">Latest News</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

        <h1 className="text-3xl font-bold mb-4 mt-8">Latest Blogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};