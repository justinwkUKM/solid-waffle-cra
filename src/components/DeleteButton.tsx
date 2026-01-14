'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteButton({ id }: { id: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this draft assessment? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/assessments?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }

            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to delete assessment');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
            title="Delete Draft"
        >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? '...' : 'Delete'}
        </button>
    );
}
