'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useParams } from 'next/navigation';
import { PostRenderer } from '@/components/common/PostRenderer';

interface Post {
  title: string;
  content: any[]; // Adjust this type based on your content block structure
}

const PostPage = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        try {
          // Query by slug field
          const q = query(
            collection(db, 'posts'),
            where('slug', '==', slug as string),
            where('category', '==', 'blogs')
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            setPost(querySnapshot.docs[0].data() as Post);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching post:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!post) {
    return <div className="container mx-auto px-4 py-8">Post not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#0a0a0a] text-[#ededed] min-h-screen">
      <PostRenderer title={post.title} content={post.content} />
    </div>
  );
};

export default PostPage;
