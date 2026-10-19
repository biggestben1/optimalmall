<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdvertisementController extends Controller
{
    public function index(): Response
    {
        $advertisements = Advertisement::query()
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Advertisement $ad) => [
                'id' => $ad->id,
                'title' => $ad->title,
                'placement' => ucfirst($ad->placement),
                'budget' => Money::format($ad->budget),
                'is_active' => $ad->is_active,
            ]);

        return Inertia::render('Admin/Advertising/Index', [
            'advertisements' => $advertisements,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Advertising/Form', [
            'advertisement' => $this->blank(),
            'placements' => $this->placements(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Advertisement::query()->create($this->validated($request));

        return redirect()->route('admin.advertisements.index')->with('status', 'Advertisement created.');
    }

    public function edit(Advertisement $advertisement): Response
    {
        return Inertia::render('Admin/Advertising/Form', [
            'advertisement' => [
                'id' => $advertisement->id,
                'title' => $advertisement->title,
                'placement' => $advertisement->placement,
                'image_path' => $advertisement->image_path,
                'link_url' => $advertisement->link_url,
                'budget' => $advertisement->budget,
                'starts_at' => $advertisement->starts_at?->format('Y-m-d'),
                'ends_at' => $advertisement->ends_at?->format('Y-m-d'),
                'is_active' => $advertisement->is_active,
            ],
            'placements' => $this->placements(),
        ]);
    }

    public function update(Request $request, Advertisement $advertisement): RedirectResponse
    {
        $advertisement->update($this->validated($request));

        return redirect()->route('admin.advertisements.index')->with('status', 'Advertisement updated.');
    }

    public function destroy(Advertisement $advertisement): RedirectResponse
    {
        $advertisement->delete();

        return redirect()->route('admin.advertisements.index')->with('status', 'Advertisement deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'placement' => ['required', Rule::in(['homepage', 'category', 'search'])],
            'image_path' => ['nullable', 'string', 'max:500'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'budget' => ['required', 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $data['is_active'] = $request->boolean('is_active');

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function blank(): array
    {
        return [
            'id' => null,
            'title' => '',
            'placement' => 'homepage',
            'image_path' => '',
            'link_url' => '',
            'budget' => 0,
            'starts_at' => null,
            'ends_at' => null,
            'is_active' => true,
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function placements(): array
    {
        return [
            ['value' => 'homepage', 'label' => 'Homepage'],
            ['value' => 'category', 'label' => 'Category'],
            ['value' => 'search', 'label' => 'Search'],
        ];
    }
}
