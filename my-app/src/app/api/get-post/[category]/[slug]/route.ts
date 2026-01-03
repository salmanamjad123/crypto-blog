
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(req: NextRequest, { params }: { params: { category: string, slug: string } }) {
  try {
    const { category, slug } = params;
    const docRef = doc(db, 'posts', category, 'articles', slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new NextResponse(JSON.stringify({ message: 'Post not found' }), { status: 404 });
    }

    return new NextResponse(JSON.stringify(docSnap.data()), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ message: 'Error fetching post' }), { status: 500 });
  }
}
