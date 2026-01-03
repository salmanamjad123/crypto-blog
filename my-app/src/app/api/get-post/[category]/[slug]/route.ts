import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Let TypeScript infer the types for the request and context
export async function GET(req: NextRequest, { params }: { params: { category: string, slug: string } }) {
  try {
    const { category, slug } = params;

    // Add a guard clause to ensure params are present
    if (!category || !slug) {
      return new NextResponse(JSON.stringify({ message: 'Missing category or slug' }), { status: 400 });
    }

    const docRef = doc(db, 'posts', category, 'articles', slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new NextResponse(JSON.stringify({ message: 'Post not found' }), { status: 404 });
    }

    return new NextResponse(JSON.stringify(docSnap.data()), { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return new NextResponse(JSON.stringify({ message: 'Error fetching post' }), { status: 500 });
  }
}
