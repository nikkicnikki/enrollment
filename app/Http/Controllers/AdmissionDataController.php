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

        $regularResult = $this->insertPassers($data['regular']['data'], 'regular');
        $athletesResult = $this->insertPassers($data['athletes']['data'], 'athletes');
        $alsResult = $this->insertPassers($data['als']['data'], 'als');

        $totalImported = $regularResult['imported'] + $athletesResult['imported'] + $alsResult['imported'];
        $totalDuplicates = $regularResult['duplicates'] + $athletesResult['duplicates'] + $alsResult['duplicates'];

        // Combine all duplicates arrays
        $allDuplicatesArray = array_merge(
            $regularResult['duplicatesArray'],
            $athletesResult['duplicatesArray'],
            $alsResult['duplicatesArray']
        );

        logger("Import Complete: Total Imported = {$totalImported}, Duplicates Detected = {$totalDuplicates}");

        // Flash both success message and duplicates array together
        return redirect()->back()->with([
            'success' => "Imported {$totalImported} passers. Duplicates detected: {$totalDuplicates}.",
            'duplicates' => $allDuplicatesArray,
        ]);
    }


   private function insertPassers(array $passers, string $category): array
    {
        $total = count($passers);
        $imported = 0;
        $duplicates = 0;

        logger("Expected to import {$total} passers for category: {$category}");

        $lrnCounts = [];
        $fallbackCounts = [];

        $duplicatesArray = []; // <-- Add this to track duplicates info

        foreach ($passers as $passer) {
            $rawLrn = isset($passer['lrn']) ? preg_replace('/\s+/', '', trim($passer['lrn'])) : null;
            $hasValidLRN = $rawLrn && !in_array(strtolower($rawLrn), ['n/a', 'na', 'none', 'null']);

            try {
                if ($hasValidLRN) {
                    if (!isset($lrnCounts[$rawLrn])) {
                        $lrnCounts[$rawLrn] = 0;
                    }
                    $lrnCounts[$rawLrn]++;
                    $count = $lrnCounts[$rawLrn];

                    $taggedLrn = $rawLrn . ($count === 1 ? '-O' : '-D' . ($count - 1));
                    $passer['lrn'] = $taggedLrn;
                    $passer['category'] = $category;

                    // 🔐 Check if already exists (exact same LRN + name + dob)
                    $alreadyExists = AdmissionPasser::where('lrn', $passer['lrn'])
                        ->where('first_name', $passer['first_name'])
                        ->where('middle_name', $passer['middle_name'])
                        ->where('last_name', $passer['last_name'])
                        ->where('dob', $passer['dob'])
                        ->exists();

                    if ($alreadyExists) {
                        logger("Skipping already existing LRN record: {$passer['first_name']} {$passer['middle_name']} {$passer['last_name']} lrn- {$passer['lrn']}");
                        continue; // Skip to next loop
                    }

                    // If duplicate (count > 1), find the existing original record for the existing data
                    if ($count > 1) {
                        $duplicates++;

                        $existing = AdmissionPasser::where('lrn', $rawLrn . '-O')->first();

                        $duplicatesArray[] = [
                            'existing' => [
                                'lrn' => $existing->lrn ?? ($rawLrn . '-O'),
                                'first_name' => $existing->first_name ?? '',
                                'middle_name' => $existing->middle_name ?? '',
                                'last_name' => $existing->last_name ?? '',
                                'dob' => $existing->dob ?? '',
                                'senior_high_school' => $existing->senior_high_school ?? '',
                                'category' => $category,
                            ],
                            'incoming' => [
                                'lrn' => $taggedLrn,
                                'first_name' => $passer['first_name'] ?? '',
                                'middle_name' => $passer['middle_name'] ?? '',
                                'last_name' => $passer['last_name'] ?? '',
                                'dob' => $passer['dob'] ?? '',
                                'senior_high_school' => $passer['senior_high_school'] ?? '',
                                'category' => $category,
                            ],
                        ];

                        logger("Inserted duplicate with tagged LRN: {$taggedLrn} (original: {$rawLrn})");
                    }

                    AdmissionPasser::create($passer);
                } else {
                    $fallbackKeyData = [
                        $passer['first_name'] ?? '',
                        $passer['middle_name'] ?? '',
                        $passer['last_name'] ?? '',
                        $passer['dob'] ?? '',
                    ];
                    $fallbackKey = implode('|', $fallbackKeyData);

                    if (!isset($fallbackCounts[$fallbackKey])) {
                        $fallbackCounts[$fallbackKey] = 0;
                    }
                    $fallbackCounts[$fallbackKey]++;
                    $count = $fallbackCounts[$fallbackKey];

                    $taggedLrn = 'ALS-' . ($count === 1 ? 'O' : 'D' . ($count - 1));
                    $passer['lrn'] = $taggedLrn;
                    $passer['category'] = $category;

                    // 🔐 Check if already exists (same ALS-tagged LRN + name + dob)
                    $alreadyExists = AdmissionPasser::where('lrn', $passer['lrn'])
                        ->where('first_name', $passer['first_name'])
                        ->where('middle_name', $passer['middle_name'])
                        ->where('last_name', $passer['last_name'])
                        ->where('dob', $passer['dob'])
                        ->exists();

                    if ($alreadyExists) {
                        logger("Skipping already existing ALS record: {$passer['first_name']} {$passer['middle_name']} {$passer['last_name']} lrn- {$passer['lrn']}");
                        continue; // Skip to next
                    }

                    if ($count > 1) {
                        $duplicates++;

                        // Find existing original fallback record, if any
                        $existing = AdmissionPasser::where('lrn', 'ALS-O')
                            ->where('first_name', $passer['first_name'] ?? '')
                            ->where('middle_name', $passer['middle_name'] ?? '')
                            ->where('last_name', $passer['last_name'] ?? '')
                            ->where('dob', $passer['dob'] ?? '')
                            ->first();

                        $duplicatesArray[] = [
                            'existing' => [
                                'lrn' => $existing->lrn ?? 'ALS-O',
                                'first_name' => $existing->first_name ?? '',
                                'middle_name' => $existing->middle_name ?? '',
                                'last_name' => $existing->last_name ?? '',
                                'dob' => $existing->dob ?? '',
                                'senior_high_school' => $existing->senior_high_school ?? '',
                                'category' => $category,
                            ],
                            'incoming' => [
                                'lrn' => $taggedLrn,
                                'first_name' => $passer['first_name'] ?? '',
                                'middle_name' => $passer['middle_name'] ?? '',
                                'last_name' => $passer['last_name'] ?? '',
                                'dob' => $passer['dob'] ?? '',
                                'senior_high_school' => $passer['senior_high_school'] ?? '',
                                'category' => $category,
                            ],
                        ];

                        logger("Inserted duplicate ALS record with tagged LRN: {$taggedLrn} for fallback key: {$fallbackKey}");
                    }

                    AdmissionPasser::create($passer);
                }

                $imported++;
            } catch (\Throwable $e) {
                logger("Failed to import record: " . $e->getMessage());
            }
        }

        logger("Import Summary [{$category}]: Imported: {$imported}, Duplicates Tagged: {$duplicates}");

        // Return duplicatesArray for later use (e.g. in flash/session)
        return [
            'imported' => $imported,
            'duplicates' => $duplicates,
            'duplicatesArray' => $duplicatesArray,
        ];
    }



}
