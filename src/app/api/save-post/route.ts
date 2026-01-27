
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { title, category, content } = await req.json();

    if (!title || !category || !content) {
      return new NextResponse(JSON.stringify({ message: 'Missing title, category, or content' }), { status: 400 });
    }

    const post = {
      title,
      category, // Include category in the document
      content,
      createdAt: new Date().toISOString(), // Add timestamp for sorting
    };

    // Save to flat structure: posts/[docId]
    const docRef = await addDoc(collection(db, 'posts'), post);

    return new NextResponse(JSON.stringify({ message: 'Post saved successfully', id: docRef.id }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ message: 'Error saving post' }), { status: 500 });
  }
}
