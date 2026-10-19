import ApplicationLogo from '../Components/ApplicationLogo';

export default function GuestLayout({ title, children }) {
    return (
        <div className="min-h-screen bg-surface-container-low">
            <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-6 px-4 py-8 lg:grid-cols-2 lg:px-8">
                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-8 text-on-primary">
                    <ApplicationLogo href={route('home')} showTagline={false} size="lg" inverted />
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">Your account</p>
                    <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight lg:text-4xl">{title}</h1>
                    <p className="mt-3 max-w-md text-sm text-primary-fixed">Shop the mall, follow deliveries, and keep your wallet in one place.</p>
                </section>
                <div className="card-surface p-6 lg:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
