import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Papa from 'papaparse';
import { pdf } from '@react-pdf/renderer';
import PassersPDF from '@/components/PassersPDF';
import toast from 'react-hot-toast';

const tabs = ['Regular', 'Athletes', 'ALS'];

const Index = ({ regularPassers, athletesPassers, alsPassers }: Props) => {
    const [activeTab, setActiveTab] = useState('Regular');
    const [search, setSearch] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);

    const { flash } = usePage().props as any;

    // Show success/error toast
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.duplicates && flash.duplicates.length > 0) {
            setShowDuplicatesModal(true);
        }
    }, [flash]);

    const getPassers = () => {
        switch (activeTab) {
            case 'Regular': return regularPassers;
            case 'Athletes': return athletesPassers;
            case 'ALS': return alsPassers;
            default: return [];
        }
    };

    const currentPassers = getPassers();

    const filteredPassers = currentPassers.filter(passer =>
        `${passer.last_name}, ${passer.first_name} ${passer.middle_name}`.toLowerCase().includes(search.toLowerCase())
    );

    const exportCSV = () => {
        const csv = Papa.unparse(filteredPassers);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeTab.toLowerCase()}-passers.csv`;
        link.click();
    };

    const downloadPDF = async () => {
        const blob = await pdf(
            <PassersPDF passers={filteredPassers} tab={activeTab} />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeTab.toLowerCase()}-passers.pdf`;
        link.click();
    };

    const handleImport = () => {
        if (!confirm('Are you sure you want to import data from the API?')) return;

        setIsImporting(true);

        router.get('/import-passers', {}, {
            preserveScroll: true,
            onSuccess: () => setIsImporting(false),
            onError: () => setIsImporting(false),
        });
    };

    console.log('Flash from Inertia:', flash);

    return (
        <>
            <Head title="Admission Passers" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Admission Passers</h1>

                {/* Tabs */}
                <div className="mb-4 flex space-x-2">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`px-4 py-2 rounded cursor-pointer transition ${activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <input
                        type="text"
                        className="border rounded px-3 py-2 w-full sm:w-1/3"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportCSV}
                            className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:opacity-90"
                        >
                            Export CSV
                        </button>
                        <button
                            onClick={downloadPDF}
                            className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer hover:opacity-90"
                        >
                            Download PDF
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={isImporting}
                            className={`px-4 py-2 rounded text-white cursor-pointer ${isImporting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-700 hover:opacity-90'
                                }`}
                        >
                            {isImporting ? 'Importing...' : 'Import from API'}
                        </button>
                    </div>
                </div>

                <p className="mb-2 text-sm text-gray-600">
                    Showing {filteredPassers.length} of {currentPassers.length} passers
                </p>

                {/* Table */}
                <table className="w-full text-left border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Strand</th>
                            <th className="p-2 border">Exam Sched</th>
                            <th className="p-2 border">Seat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPassers.map((passer, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="p-2 border">
                                    {passer.last_name}, {passer.first_name} {passer.middle_name}
                                </td>
                                <td className="p-2 border">{passer.strand}</td>
                                <td className="p-2 border">
                                    {passer.exam_date} | {passer.exam_time} | Rm.{passer.exam_room_no}
                                </td>
                                <td className="p-2 border">{passer.exam_seat_no}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Duplicate Modal */}
                {showDuplicatesModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded shadow-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto p-6">
                            <h2 className="text-xl font-semibold mb-4">Duplicate Records Found</h2>
                            <table className="table-auto w-full border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-2 py-1">Category</th>
                                        <th className="border px-2 py-1">LRN</th>
                                        <th className="border px-2 py-1">First Name</th>
                                        <th className="border px-2 py-1">Middle Name</th>
                                        <th className="border px-2 py-1">Last Name</th>
                                        <th className="border px-2 py-1">Senior High School</th>
                                        <th className="border px-2 py-1">Tag</th>
                                    </tr>
                                </thead>
                                <tbody className='text-[14px]'>
                                    {flash.duplicates.map((dupPair: any, idx: number) => (
                                        <React.Fragment key={idx}>
                                            {/* Original */}
                                            <tr className="border-b bg-gray-100">
                                                <td className="border px-2 py-1">{dupPair.existing.category}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.lrn}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.first_name}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.middle_name}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.last_name}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.senior_high_school}</td>
                                                <td className="border px-2 py-1">Original</td>
                                            </tr>
                                            {/* Incoming duplicate */}
                                            <tr className="border-b">
                                                <td className="border px-2 py-1">{dupPair.incoming.category}</td>
                                                <td className="border px-2 py-1">{dupPair.incoming.lrn}</td>
                                                <td className="border px-2 py-1">{dupPair.incoming.first_name}</td>
                                                <td className="border px-2 py-1">{dupPair.incoming.middle_name}</td>
                                                <td className="border px-2 py-1">{dupPair.incoming.last_name}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.senior_high_school}</td>
                                                <td className="border px-2 py-1">Duplicate</td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            <button
                                onClick={() => setShowDuplicatesModal(false)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default Index;
