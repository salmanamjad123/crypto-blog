import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firebase';
// Import the Query and DocumentData types for explicit typing
import { collection, getDocs, query, where, Query, DocumentData } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    // Explicitly type the query variable to be a Firestore Query
    let q: Query<DocumentData> = collection(db, 'posts');

    if (category) {
      q = query(q, where('category', '==', category));
    }

    const querySnapshot = await getDocs(q);

    const posts = querySnapshot.docs.map(doc => ({
      slug: doc.id,
      ...doc.data(),
    }));

    // Use the modern NextResponse.json() for cleaner code
    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    // Use NextResponse.json for error responses as well
    return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 });
  }
}
