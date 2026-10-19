<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Services\Vendor\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(): Response
    {
        $posts = Post::query()->latest()->paginate(20)->through(fn (Post $post) => [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'published_at' => $post->published_at?->format('d M Y'),
        ]);

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Posts/Form', [
            'post' => $this->blank(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $post = Post::query()->create([
            ...$this->validated($request),
            'user_id' => $request->user()->id,
        ]);
        AuditLogger::record('post.created', $post, ['slug' => $post->slug]);

        return redirect()->route('admin.posts.index')->with('status', 'Post saved.');
    }

    public function edit(Post $post): Response
    {
        return Inertia::render('Admin/Posts/Form', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'body' => $post->body,
                'seo_title' => $post->seo_title,
                'seo_description' => $post->seo_description,
                'is_published' => $post->published_at !== null,
            ],
        ]);
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        $post->update($this->validated($request, $post));
        AuditLogger::record('post.updated', $post, ['slug' => $post->slug]);

        return redirect()->route('admin.posts.index')->with('status', 'Post updated.');
    }

    public function destroy(Post $post): RedirectResponse
    {
        AuditLogger::record('post.deleted', $post, ['slug' => $post->slug]);
        $post->delete();

        return redirect()->route('admin.posts.index')->with('status', 'Post deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function blank(): array
    {
        return [
            'id' => null,
            'title' => '',
            'slug' => '',
            'excerpt' => '',
            'body' => '',
            'seo_title' => '',
            'seo_description' => '',
            'is_published' => false,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Post $post = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('posts', 'slug')->ignore($post?->id)],
            'excerpt' => ['nullable', 'string', 'max:300'],
            'body' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:300'],
        ]);

        $data['slug'] = Str::slug(($data['slug'] ?? null) ?: $data['title']) ?: 'post';
        $data['published_at'] = $request->boolean('is_published')
            ? ($post?->published_at ?? now())
            : null;
        unset($data['is_published']);

        return $data;
    }
}
