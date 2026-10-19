import { Head } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function Page({ page }) {
    return (
        <StorefrontLayout>
            <Head title={page.seo_title}>
                {page.seo_description ? <meta name="description" content={page.seo_description} head-key="description" /> : null}
            </Head>
            <article className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="font-display text-3xl font-bold">{page.title}</h1>
                <div className="mt-6 whitespace-pre-wrap text-sm leading-7">{page.body}</div>
            </article>
        </StorefrontLayout>
    );
}
