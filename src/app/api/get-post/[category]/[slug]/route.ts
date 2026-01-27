import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Force this route to be treated as fully dynamic
export const dynamic = 'force-dynamic';

// Adapt the function signature to handle params as a Promise
// This is a workaround for an unusual build environment behavior
export async function GET(
  req: NextRequest,
  // The context.params object is expected as a Promise here
  context: { params: Promise<{ category: string, slug: string }> }
) {
  try {
    // Await the params promise to resolve the values
    const params = await context.params;
    const { category, slug } = params;

    if (!category || !slug) {
      return NextResponse.json({ message: 'Missing category or slug' }, { status: 400 });
    }

    // Use flat structure: posts/[slug]
    const docRef = doc(db, 'posts', slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Verify the category matches (optional security check)
    const data = docSnap.data();
    if (data.category !== category) {
      return NextResponse.json({ message: 'Post not found in this category' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ message: 'Error fetching post' }, { status: 500 });
  }
}
