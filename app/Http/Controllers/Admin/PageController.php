<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\Vendor\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        $pages = Page::query()->orderBy('title')->paginate(20)->through(fn (Page $page) => [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'is_published' => $page->is_published,
        ]);

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => $this->blank(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $page = Page::query()->create($this->validated($request));
        AuditLogger::record('page.created', $page, ['slug' => $page->slug]);

        return redirect()->route('admin.pages.index')->with('status', 'Page saved.');
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'body' => $page->body,
                'seo_title' => $page->seo_title,
                'seo_description' => $page->seo_description,
                'is_published' => $page->is_published,
            ],
        ]);
    }

    public function update(Request $request, Page $page): RedirectResponse
    {
        $page->update($this->validated($request, $page));
        AuditLogger::record('page.updated', $page, ['slug' => $page->slug]);

        return redirect()->route('admin.pages.index')->with('status', 'Page updated.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        AuditLogger::record('page.deleted', $page, ['slug' => $page->slug]);
        $page->delete();

        return redirect()->route('admin.pages.index')->with('status', 'Page deleted.');
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
            'body' => '',
            'seo_title' => '',
            'seo_description' => '',
            'is_published' => false,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Page $page = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('pages', 'slug')->ignore($page?->id)],
            'body' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:300'],
        ]);

        $data['slug'] = Str::slug(($data['slug'] ?? null) ?: $data['title']) ?: 'page';
        $data['is_published'] = $request->boolean('is_published');

        return $data;
    }
}
