import React from 'react';

interface ContentBlock {
  id: number;
  type: string;
  content: string;
  link?: string;
  src?: string;
  items?: string[];        // For list items (bullet points)
  images?: string[];       // For image grid (multiple images)
  linkText?: string;       // For link widget display text
}

interface PostRendererProps {
  title: string;
  content: ContentBlock[];
}

export const PostRenderer: React.FC<PostRendererProps> = ({ title, content }) => {
  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'h1':
        return <h1 className="text-3xl font-bold my-4">{block.content || 'Heading 1'}</h1>;
      case 'h2':
        return <h2 className="text-2xl font-bold my-3">{block.content || 'Heading 2'}</h2>;
      case 'h3':
        return <h3 className="text-xl font-bold my-2">{block.content || 'Heading 3'}</h3>;
      case 'p':
        return <p className="my-2">{block.content || 'Paragraph text...'}</p>;
      case 'textarea':
        return <p className="my-2 whitespace-pre-wrap">{block.content || 'Text area content...'}</p>;
      case 'image':
        return block.src ? (
          <img src={block.src} alt={block.content || 'Image'} className="my-4 max-w-full h-auto" />
        ) : (
          <div className="my-4 bg-gray-200 h-48 flex items-center justify-center text-gray-500">
            No image selected
          </div>
        );
      case 'button':
        return (
          <a
            href={block.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4 inline-block"
          >
            {block.content || 'Button'}
          </a>
        );
      case 'list':
        return (
          <ul className="list-disc list-inside my-4 space-y-2">
            {block.items && block.items.length > 0 ? (
              block.items.map((item, idx) => (
                <li key={idx} className="text-base">
                  {item}
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">Add bullet points...</li>
            )}
          </ul>
        );
      case 'link':
        return (
          <a
            href={block.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline my-2 inline-block"
          >
            {block.linkText || 'Click here'} →
          </a>
        );
      case 'image-grid':
        return (
          <div className="my-6">
            {block.images && block.images.length > 0 ? (
              <div className={`grid gap-4 ${
                block.images.length === 1 
                  ? 'grid-cols-1' 
                  : block.images.length === 2 
                  ? 'grid-cols-1 md:grid-cols-2' 
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {block.images.map((imgSrc, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-500 rounded">
                No images in grid
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="prose max-w-none text-foreground">
      <h1 className="text-4xl font-bold mb-4 text-white">{title || 'Untitled Post'}</h1>
      <div>
        {content.length === 0 ? (
          <p className="text-gray-400 italic">Start adding content blocks to see preview...</p>
        ) : (
          content.map((block) => (
            <div key={block.id}>{renderBlock(block)}</div>
          ))
        )}
      </div>
    </div>
  );
};
