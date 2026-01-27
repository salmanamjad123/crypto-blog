'use client';

import React, { useState } from 'react';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import { PostRenderer } from '@/components/common/PostRenderer';

type ContentBlock = {
  id: number;
  type: "h1" | "h2" | "h3" | "p" | "textarea" | "button" | "image" | "list" | "link" | "image-grid";
  content: string;
  link?: string;
  src?: string;
  items?: string[];        // For list items (bullet points)
  images?: string[];       // For image grid (multiple images)
  linkText?: string;       // For link widget display text
};

let blockId = 0;

export const CreatePostForm = () => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false); // Track if we're saving
  const router = useRouter();

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

  const savePost = async () => {
    setSaving(true);
    
    // Generate clean slug from title
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen
    
    try {
      // Check for existing posts with same base slug
      const existingQuery = query(
        collection(db, 'posts'),
        where('category', '==', 'blogs')
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      // Count how many posts have slugs starting with baseSlug
      const duplicates = existingSnapshot.docs.filter(doc => {
        const existingSlug = doc.data().slug;
        return existingSlug === baseSlug || existingSlug?.startsWith(`${baseSlug}-`);
      });
      
      let finalSlug = baseSlug;
      
      // If duplicates exist, ask for confirmation
      if (duplicates.length > 0) {
        finalSlug = `${baseSlug}-${duplicates.length + 1}`;
        
        const confirmed = window.confirm(
          `⚠️ A blog with the title "${title}" already exists.\n\n` +
          `Your URL will be: /blogs/${finalSlug}\n\n` +
          `Do you want to continue?`
        );
        
        if (!confirmed) {
          setSaving(false);
          return; // User cancelled, stay on form
        }
      }
      
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
          } else if (block.type === 'image-grid' && block.images) {
            // Upload multiple images for image grid
            const uploadedImages = await Promise.all(
              block.images.map(async (imgSrc) => {
                if (imgSrc.startsWith('data:')) {
                  // This is base64, upload it
                  const blob = await fetch(imgSrc).then(r => r.blob());
                  const formData = new FormData();
                  formData.append('file', blob);
                  const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
                  const data = await response.json();
                  return data.success ? data.url : imgSrc;
                }
                return imgSrc; // Already uploaded
              })
            );
            return { ...block, images: uploadedImages };
          }
          return block; // Return unchanged if not a base64 image
        })
      );
      
      const blogPost = {
        title,
        slug: finalSlug,
        category: "blogs",
        content: blocksWithCloudinaryUrls,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'posts'), blogPost);
      alert('Blog saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Error saving blog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] overflow-hidden">
      {/* Left Side - Editor */}
      <div className="w-1/2 overflow-y-auto pr-4">
        <h1 className="text-2xl font-bold mb-4">Create a New Blog</h1>
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
            <option value="list">📝 Bullet List</option>
            <option value="link">🔗 Link</option>
            <option value="image-grid">🖼️ Image Grid</option>
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
                    <p className="text-xs text-yellow-600 mt-1">📷 Will upload to Cloudinary when you save</p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1 break-all">✅ {block.src}</p>
                  )}
                </div>
              )}
            </div>
          ) : block.type === "list" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bullet Points (one per line)
              </label>
              <textarea
                value={block.items?.join('\n') || ''}
                onChange={(e) => {
                  const items = e.target.value.split('\n').filter(item => item.trim());
                  updateBlock(block.id, { items });
                }}
                placeholder="First point&#10;Second point&#10;Third point"
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 h-32"
              />
              <p className="text-xs text-gray-500 mt-1">Each line becomes a bullet point</p>
            </div>
          ) : block.type === "link" ? (
            <div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Link Text (what users see)
                </label>
                <input
                  type="text"
                  value={block.linkText || ''}
                  onChange={(e) => updateBlock(block.id, { linkText: e.target.value })}
                  placeholder="Click here for more info"
                  className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Link URL
                </label>
                <input
                  type="url"
                  value={block.link || ''}
                  onChange={(e) => updateBlock(block.id, { link: e.target.value })}
                  placeholder="https://example.com"
                  className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              </div>
              {block.link && block.linkText && (
                <a 
                  href={block.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mt-2 inline-block text-sm"
                >
                  Preview: {block.linkText} →
                </a>
              )}
            </div>
          ) : block.type === "image-grid" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Multiple Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;

                  const promises = files.map(file => {
                    return new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.readAsDataURL(file);
                    });
                  });

                  Promise.all(promises).then(base64Images => {
                    const existingImages = block.images || [];
                    updateBlock(block.id, { 
                      images: [...existingImages, ...base64Images] 
                    });
                  });
                }}
                disabled={saving}
                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 disabled:opacity-50"
              />
              {block.images && block.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {block.images.length} image(s) selected
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {block.images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img 
                          src={img} 
                          alt={`Grid ${idx + 1}`} 
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = block.images?.filter((_, i) => i !== idx);
                            updateBlock(block.id, { images: newImages });
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-700"
                        >
                          ×
                        </button>
                        <div className="text-xs mt-1">
                          {img.startsWith('data:') ? (
                            <span className="text-yellow-600">📷 Not uploaded</span>
                          ) : (
                            <span className="text-green-600">✅ Uploaded</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
        onClick={savePost}
        disabled={saving}
        className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {saving ? '💾 Saving & Uploading Images...' : 'Save Blog'}
      </button>
      </div>

      {/* Right Side - Live Preview */}
      <div className="w-1/2 overflow-y-auto border-l-2 border-gray-300 pl-6">
        <div className="sticky top-0 bg-gray-900 z-10 pb-4 mb-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-cyan-400">👁️ Live Preview</h2>
          <p className="text-sm text-gray-400">See how your blog will appear to readers</p>
        </div>
        <div className="bg-[#0a0a0a] text-[#ededed] rounded-lg shadow-2xl p-8 min-h-[500px]">
          <PostRenderer title={title} content={blocks} />
        </div>
      </div>
    </div>
  );
};
