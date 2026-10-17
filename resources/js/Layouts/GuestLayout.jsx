import ApplicationLogo from '../Components/ApplicationLogo';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-surface-container-low pt-10 sm:justify-center sm:pt-0">
            <ApplicationLogo size="lg" />
            <div className="mt-8 w-full overflow-hidden bg-surface-container-lowest px-6 py-6 shadow-sm sm:max-w-md sm:rounded-xl">
                {children}
            </div>
        </div>
    );
}
