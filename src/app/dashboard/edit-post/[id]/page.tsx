'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useParams, useRouter } from 'next/navigation';

type ContentBlock = {
  id: number;
  type: "h1" | "h2" | "h3" | "p" | "textarea" | "button" | "image";
  content: string;
  link?: string;
  src?: string;
};

type Category = "analysis" | "guides" | "opinion";

let blockId = 0;

export default function EditPostPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("analysis");
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const postDoc = await getDoc(doc(db, 'posts', id as string));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          setTitle(postData.title);
          setCategory(postData.category);
          setBlocks(postData.content);
          // Set the blockId to the next available ID
          if (postData.content.length > 0) {
            blockId = Math.max(...postData.content.map((block: ContentBlock) => block.id)) + 1;
          }
        }
      };
      fetchPost();
    }
  }, [id]);

  const addBlock = () => {
    setBlocks([
      ...blocks,
      { id: blockId++, type: "p", content: "" },
    ]);
  };

  const updateBlock = (id: number, updatedBlock: Partial<ContentBlock>) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updatedBlock } : block
      )
    );
  };

  const removeBlock = (id: number) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBlock(id, { src: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePost = async () => {
    const blogPost = {
      title,
      category,
      content: blocks,
      updatedAt: new Date(),
    };

    try {
      await updateDoc(doc(db, 'posts', id as string), blogPost);
      alert('Post updated successfully!');
      router.push('/dashboard/manage-posts');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Blog Post Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-white p-2"
        >
          <option value="analysis">Analysis</option>
          <option value="guides">Guides</option>
          <option value="opinion">Opinion</option>
        </select>
      </div>
      {blocks.map((block, index) => (
        <div key={block.id} className="mb-4 p-4 border rounded-md">
           <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Content Block {index + 1}
            </label>
            <button onClick={() => removeBlock(block.id)} className="text-red-500 hover:text-red-700">Remove</button>
          </div>
          <select
            value={block.type}
            onChange={(e) =>
              updateBlock(block.id, {
                type: e.target.value as ContentBlock["type"],
              })
            }
            className="mb-2 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-white p-2"
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="p">Paragraph</option>
            <option value="textarea">Textarea</option>
            <option value="button">Button</option>
            <option value="image">Image</option>
          </select>
          {block.type === "textarea" ? (
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
          ) : block.type === "image" ? (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, block.id)}
                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              {block.src && <img src={block.src} alt="Preview" className="mt-2 h-20" />}
            </div>
          ) : (
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
          )}
          {block.type === "button" && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Button Link
              </label>
              <input
                type="text"
                value={block.link || ""}
                onChange={(e) => updateBlock(block.id, { link: e.target.value })}
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>
          )}
        </div>
      ))}
      <button
        onClick={addBlock}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Block
      </button>
      <button
        onClick={updatePost}
        className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Update Post
      </button>
    </div>
  );
}
