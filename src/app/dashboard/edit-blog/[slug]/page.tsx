'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useParams, useRouter } from 'next/navigation';
import { PostRenderer } from '@/components/common/PostRenderer';

type ContentBlock = {
  id: number;
  type: "h1" | "h2" | "h3" | "p" | "textarea" | "button" | "image";
  content: string;
  link?: string;
  src?: string;
};

let blockId = 0;

export default function EditBlogPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false); // Track if we're saving
  const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]); // Track original images for cleanup
  const router = useRouter();
  const { slug } = useParams();

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        const docRef = doc(db, 'posts', slug as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const post = docSnap.data();
          setTitle(post.title);
          // Ensure each block has a unique ID
          const contentWithUniqueIds = post.content.map((block: ContentBlock) => ({
            ...block,
            id: blockId++
          }));
          setBlocks(contentWithUniqueIds);
          
          // Track original Cloudinary image URLs for cleanup
          const cloudinaryUrls = post.content
            .filter((block: ContentBlock) => block.type === 'image' && block.src?.includes('cloudinary.com'))
            .map((block: ContentBlock) => block.src as string);
          setOriginalImageUrls(cloudinaryUrls);
        }
      };
      fetchPost();
    }
  }, [slug]);

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
        updateBlock(id, { src: reader.result as string }); // Store base64 for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePost = async () => {
    if (!slug) return;
    setSaving(true);

    try {
      // Upload all images to Cloudinary before saving
      const blocksWithCloudinaryUrls = await Promise.all(
        blocks.map(async (block) => {
          if (block.type === 'image' && block.src?.startsWith('data:')) {
            // This is a base64 image, upload to Cloudinary
            const blob = await fetch(block.src).then(r => r.blob());
            const formData = new FormData();
            formData.append('file', blob);

            const response = await fetch('/api/upload-image', {
              method: 'POST',
              body: formData,
            });

            const data = await response.json();
            if (data.success) {
              return { ...block, src: data.url }; // Replace with Cloudinary URL
            }
          }
          return block; // Return unchanged if not a base64 image
        })
      );

      // Find images that were removed (in original but not in current)
      const currentImageUrls = blocksWithCloudinaryUrls
        .filter(block => block.type === 'image' && block.src?.includes('cloudinary.com'))
        .map(block => block.src as string);

      const removedImageUrls = originalImageUrls.filter(
        url => !currentImageUrls.includes(url)
      );

      // Delete removed images from Cloudinary
      if (removedImageUrls.length > 0) {
        await Promise.all(
          removedImageUrls.map(async (imageUrl) => {
            try {
              await fetch('/api/delete-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
              });
            } catch (error) {
              console.error('Error deleting image:', imageUrl, error);
              // Continue even if deletion fails
            }
          })
        );
      }

      const blogPost = {
        title,
        content: blocksWithCloudinaryUrls,
        updatedAt: new Date(),
      };

      const docRef = doc(db, 'posts', slug as string);
      await updateDoc(docRef, blogPost);
      alert('Blog updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Error updating blog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] overflow-hidden px-4 py-8">
      {/* Left Side - Editor */}
      <div className="w-1/2 overflow-y-auto pr-4">
        <h1 className="text-2xl font-bold mb-4">Edit Blog Post</h1>
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
                disabled={saving}
                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 disabled:opacity-50"
              />
              {block.src && (
                <div className="mt-2">
                  <img src={block.src} alt="Preview" className="h-20 rounded" />
                  {block.src.startsWith('data:') ? (
                    <p className="text-xs text-yellow-600 mt-1">📷 Will upload to Cloudinary when you update</p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1 break-all">✅ {block.src}</p>
                  )}
                </div>
              )}
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
                className="mt-1 block w-full rounded-md border-2 border--gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
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
        disabled={saving}
        className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {saving ? '💾 Updating & Uploading Images...' : 'Update Blog Post'}
      </button>
      </div>

      {/* Right Side - Live Preview */}
      <div className="w-1/2 overflow-y-auto border-l-2 border-gray-300 pl-6">
        <div className="sticky top-0 bg-gray-900 z-10 pb-4 mb-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-cyan-400">👁️ Live Preview</h2>
          <p className="text-sm text-gray-400">See how your changes will appear</p>
        </div>
        <div className="bg-[#0a0a0a] text-[#ededed] rounded-lg shadow-2xl p-8 min-h-[500px]">
          <PostRenderer title={title} content={blocks} />
        </div>
      </div>
    </div>
  );
}
