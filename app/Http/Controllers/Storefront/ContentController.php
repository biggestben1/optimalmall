<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Post;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    public function page(Page $page): Response
    {
        abort_unless($page->is_published, 404);

        return Inertia::render('Storefront/Page', [
            'page' => [
                'title' => $page->title,
                'body' => $page->body,
                'seo_title' => $page->seo_title ?: $page->title,
                'seo_description' => $page->seo_description,
            ],
        ]);
    }

    public function blog(): Response
    {
        $posts = Post::query()->published()->latest('published_at')->paginate(12)->through(fn (Post $post) => [
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'published_at' => $post->published_at?->format('d M Y'),
        ]);

        return Inertia::render('Storefront/Blog', [
            'posts' => $posts,
        ]);
    }

    public function post(Post $post): Response
    {
        abort_unless($post->published_at !== null && $post->published_at->lte(now()), 404);

        return Inertia::render('Storefront/Post', [
            'post' => [
                'title' => $post->title,
                'body' => $post->body,
                'excerpt' => $post->excerpt,
                'published_at' => $post->published_at?->format('d M Y'),
                'seo_title' => $post->seo_title ?: $post->title,
                'seo_description' => $post->seo_description ?: $post->excerpt,
            ],
        ]);
    }
}
