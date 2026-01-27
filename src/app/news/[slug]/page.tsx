'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useParams } from 'next/navigation';

interface Post {
  title: string;
  content: any[]; // Adjust this type based on your content block structure
}

const NewsPage = () => {
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
            where('category', '==', 'news')
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

  const renderBlock = (block: any) => {
    switch (block.type) {
      case 'h1':
        return <h1 className="text-3xl font-bold my-4">{block.content}</h1>;
      case 'h2':
        return <h2 className="text-2xl font-bold my-3">{block.content}</h2>;
      case 'h3':
        return <h3 className="text-xl font-bold my-2">{block.content}</h3>;
      case 'p':
        return <p className="my-2">{block.content}</p>;
      case 'textarea':
        return <p className="my-2 whitespace-pre-wrap">{block.content}</p>;
      case 'image':
        return <img src={block.src} alt={block.content || 'Image'} className="my-4" />;
      case 'button':
        return <a href={block.link} target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4 inline-block">{block.content}</a>;
      default:
        return null;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div>
        {post.content.map(block => (
          <div key={block.id}>
            {renderBlock(block)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
