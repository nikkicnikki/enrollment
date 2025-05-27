<?php

namespace App\Http\Controllers;

use App\Models\AdmissionPasser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AdmissionDataController extends Controller
{

    public function index()
    {
        $response = Http::get('http://172.16.0.13:203/api/admissionPassers');

        if ($response->successful()) {
            $data = $response->json();

            // You can customize this to handle "regular" or "als" separately
            return Inertia('Passers/Index', [
                'regularPassers' => $data['regular']['data'],
                'athletesPassers' => $data['athletes']['data'],
                'alsPassers' => $data['als']['data'],
            ]);
        }

        abort(500, 'Unable to fetch admission passers.');
    }

    public function import()
    {
        set_time_limit(300);
        
        $response = Http::get('http://172.16.0.13:203/api/admissionPassers');

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to fetch data'], 500);
        }

        $data = $response->json();

        $total = count($data['regular']['data']) + count($data['athletes']['data']) + count($data['als']['data']);
        logger("Expected to import $total passers");

        $this->insertPassers($data['regular']['data'], 'regular');
        $this->insertPassers($data['athletes']['data'], 'athletes');
        $this->insertPassers($data['als']['data'], 'als');

        return redirect()->back()->with('success', "Imported $total passers from API");
    }

    private function insertPassers(array $passers, string $category)
    {
        $total = count($passers);
        $skipped = 0;
        $imported = 0;

        logger("Expected to import {$total} passers for category: {$category}");

        foreach ($passers as $passer) {
            if (empty($passer['lrn'])) {
                logger("Skipped: Missing LRN in " . json_encode($passer));
                $skipped++;
                continue;
            }

            try {
                AdmissionPasser::updateOrCreate(
                    ['lrn' => $passer['lrn']],
                    array_merge($passer, ['category' => $category])
                );
                $imported++;
            } catch (\Throwable $e) {
                logger("Failed to import LRN {$passer['lrn']}: " . $e->getMessage());
                $skipped++;
            }
        }

        logger("Import Summary [{$category}]: Imported: {$imported}, Skipped: {$skipped}");
    }

}
