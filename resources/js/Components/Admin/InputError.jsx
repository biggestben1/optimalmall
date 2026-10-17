export default function InputError({ message, className = '' }) {
    if (!message) {
        return null;
    }

    return <div className={`mt-1 text-sm text-red-600 ${className}`}>{message}</div>;
}
