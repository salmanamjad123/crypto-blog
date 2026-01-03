'use client';

import { useCounterStore } from '../store/counter';

export default function Home() {
  const { count, increment, decrement } = useCounterStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">{count}</h1>
      <div className="flex gap-4 mt-4">
        <button
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={increment}
        >
          Increment
        </button>
        <button
          className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
          onClick={decrement}
        >
          Decrement
        </button>
      </div>
    </div>
  );
}
