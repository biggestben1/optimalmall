import { router } from '@inertiajs/react';

export default function DeleteButton({ href, label = 'Delete', confirmMessage = 'Delete this record?' }) {
    return (
        <button
            type="button"
            className="font-bold text-red-600"
            onClick={() => {
                if (window.confirm(confirmMessage)) {
                    router.delete(href);
                }
            }}
        >
            {label}
        </button>
    );
}
