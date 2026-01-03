
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let q = collection(db, 'posts');

    if (category) {
      q = query(q, where('category', '==', category));
    }

    const querySnapshot = await getDocs(q);

    const posts = querySnapshot.docs.map(doc => ({
      slug: doc.id,
      ...doc.data(),
    }));

    return new NextResponse(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ message: 'Error fetching posts' }), { status: 500 });
  }
}
