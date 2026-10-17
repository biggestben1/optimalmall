import { Link } from '@inertiajs/react';

export default function ApplicationLogo({
    href = null,
    showTagline = true,
    size = 'md',
    className = '',
    inverted = false,
}) {
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
    };

    const content = (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            <img
                src="/images/logo.png"
                alt="OptimalMall"
                className={`${sizes[size] || sizes.md} rounded-xl object-cover shadow-sm`}
            />
            <span className="leading-tight">
                <span className={`block font-display font-bold tracking-tight ${inverted ? 'text-on-primary' : 'text-primary'} ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
                    OptimalMall
                </span>
                {showTagline && (
                    <span className={`block text-[10px] font-bold uppercase tracking-wide ${inverted ? 'text-primary-fixed' : 'text-secondary'}`}>
                        Shop Smart. Live Better.
                    </span>
                )}
            </span>
        </span>
    );

    if (href === false) {
        return content;
    }

    return (
        <Link href={href || route('home')} className="inline-flex shrink-0 items-center">
            {content}
        </Link>
    );
}
