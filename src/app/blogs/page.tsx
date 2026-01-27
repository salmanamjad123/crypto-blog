'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  bannerImage?: string; // Banner image URL
}

const getPostSnippet = (content: ContentBlock[] | string) => {
  if (typeof content === 'string') {
    return content.substring(0, 100) + '...';
  }

  if (Array.isArray(content)) {
    const firstParagraph = content.find(block => block.type === 'p' || block.type === 'textarea');
    if (firstParagraph) {
      return firstParagraph.content.substring(0, 100) + '...';
    }
  }

  return 'No preview available.';
};

export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, 'posts'), where('category', '==', 'blogs'));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
    };

    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <div key={post.id} className="bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
            {post.bannerImage && (
              <div className="w-full h-48 bg-gray-900 flex items-center justify-center">
                <img 
                  src={post.bannerImage} 
                  alt={post.title} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-400 mb-4">{getPostSnippet(post.content)}</p>
              <Link href={`/blogs/${post.slug || post.id}`} className="text-blue-400 hover:underline">
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
