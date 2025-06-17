import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Papa from 'papaparse';
import { pdf } from '@react-pdf/renderer';
import PassersPDF from '@/components/PassersPDF';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const tabs = ['Regular', 'Athletes', 'ALS', 'ALL'];

const Index = ({ regularPassers, athletesPassers, alsPassers }: Props) => {
    const [activeTab, setActiveTab] = useState('Regular');
    const [searchName, setSearchName] = useState('');
    const [searchLrn, setSearchLrn] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);

    const [expandedRows, setExpandedRows] = useState<number[]>([]);

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
        let passers;

        switch (activeTab) {
            case 'Regular': passers = regularPassers; break;
            case 'Athletes': passers = athletesPassers; break;
            case 'ALS': passers = alsPassers; break;
            case 'ALL': passers = [
                ...regularPassers,
                ...athletesPassers,
                ...alsPassers
            ].sort((a, b) => {
                const nameA = `${a?.last_name || ''}, ${a?.first_name || ''} ${a?.middle_name || ''}`.toLowerCase();
                const nameB = `${b?.last_name || ''}, ${b?.first_name || ''} ${b?.middle_name || ''}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });
                break;
            default: passers = [];
        }

        return passers;
    };

    const currentPassers = getPassers();

    const filteredPassers = currentPassers.filter(passer => {
        const fullName = `${passer.last_name}, ${passer.first_name} ${passer.middle_name}`.toLowerCase();
        const lrn = (passer.lrn || '').toLowerCase();

        const nameMatch = !searchName || fullName.includes(searchName.toLowerCase());
        const lrnMatch = !searchLrn || lrn.includes(searchLrn.toLowerCase());

        return nameMatch && lrnMatch;
    });


    // const exportCSV = () => {

    //     const fields = [
    //         { label: 'First Name', value: 'first_name' },
    //         { label: 'Middle Name', value: 'middle_name' },
    //         { label: 'Last Name', value: 'last_name' },

    //         { label: 'Email', value: 'email' },
    //         { label: 'Gender', value: 'sex' },
    //         { label: 'Age', value: 'age' },
    //         { label: 'Birthday', value: 'dob' },

    //         { label: 'Address', value: 'address' },
    //         { label: 'Barangay', value: 'barangay' },
    //         { label: 'Zip Code', value: 'zip_code' },
    //         { label: 'Contact No.', value: 'contact_no' },

    //         { label: 'JHS', value: 'junior_high_school' },
    //         { label: 'SHS', value: 'senior_high_school' },
    //         { label: 'Graduated', value: 'senior_high_school_year_graduated' },
    //         { label: 'LRN', value: 'lrn' },
    //         { label: 'Strand', value: 'strand' },
    //         { label: 'G11 GWA1', value: 'g11_gwa1' },
    //         { label: 'G11 GWA2', value: 'g11_gwa2' },
    //         { label: 'G12 GWA1', value: 'g12_gwa1' },
    //         { label: 'G12 GWA2', value: 'g12_gwa2' },

    //         { label: '1ST Choose', value: 'first_course' },
    //         { label: '2ND Choose', value: 'second_course' },
    //         { label: '3RD Choose', value: 'third_course' },

    //         { label: 'Parents Name', value: 'name_of_parent' },
    //         { label: 'Comelec No.', value: 'parent_comelec_no' },
    //         { label: 'Contact No.', value: 'parent_contact_no' },
    //         { label: 'Student Comelec No.', value: 'student_comelec_no' },

    //         { label: 'Exam Date', value: 'exam_date' },
    //         { label: 'Exam Time', value: 'exam_time' },
    //         { label: 'Exam Room', value: 'exam_room_no' },
    //         { label: 'Exam Seat', value: 'exam_seat_no' },


    //         { label: 'Type', value: 'applicantType' },
    //         { label: 'Athlete', value: 'athlete' },

    //     ];

    //     const csv = Papa.unparse({
    //         fields: fields.map(f => f.label),
    //         data: filteredPassers.map(p => fields.map(f => p[f.value]))
    //     });

    //     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    //     const url = URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = `${activeTab.toLowerCase()}-passers.csv`;
    //     link.click();
    // };



    const exportXLSX = () => {
        const fields = [
            { label: 'Last Name', value: 'last_name' },
            { label: 'First Name', value: 'first_name' },
            { label: 'Middle Name', value: 'middle_name' },
            // {
            //     label: 'Name',
            //     value: (row) => `${row.last_name}, ${row.first_name} ${row.middle_name}`
            // },
            
            { label: 'Email', value: 'email' },
            { label: 'Gender', value: 'sex' },
            { label: 'Age', value: 'age' },
            { label: 'Birthday', value: 'dob' },
            { label: 'Address', value: 'address' },
            { label: 'Barangay', value: 'barangay' },
            { label: 'Zip Code', value: 'zip_code' },
            { label: 'Contact No.', value: 'contact_no' },
            { label: 'JHS', value: 'junior_high_school' },
            { label: 'SHS', value: 'senior_high_school' },
            { label: 'Graduated', value: 'senior_high_school_year_graduated' },
            { label: 'LRN', value: 'lrn' },
            { label: 'Strand', value: 'strand' },
            { label: 'G11 GWA1', value: 'g11_gwa1' },
            { label: 'G11 GWA2', value: 'g11_gwa2' },
            { label: 'G12 GWA1', value: 'g12_gwa1' },
            { label: 'G12 GWA2', value: 'g12_gwa2' },
            { label: '1ST Choose', value: 'first_course' },
            { label: '2ND Choose', value: 'second_course' },
            { label: '3RD Choose', value: 'third_course' },
            { label: 'Parents Name', value: 'name_of_parent' },
            { label: 'Comelec No.', value: 'parent_comelec_no' },
            { label: 'Contact No.', value: 'parent_contact_no' },
            { label: 'Student Comelec No.', value: 'student_comelec_no' },
            { label: 'Exam Date', value: 'exam_date' },
            { label: 'Exam Time', value: 'exam_time' },
            { label: 'Exam Room', value: 'exam_room_no' },
            { label: 'Exam Seat', value: 'exam_seat_no' },
            { label: 'Type', value: 'applicantType' },
            { label: 'Athlete', value: 'athlete' },
        ];

        // Prepare data rows with headers
        const data = filteredPassers.map(p =>
            Object.fromEntries(fields.map(f => [
                f.label,
                typeof f.value === 'function' ? f.value(p) : (p[f.value] ?? '')
            ]))
        );

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Passers');

        const fileName = `${activeTab.toLowerCase()}-passers.xlsx`;
        XLSX.writeFile(workbook, fileName);
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
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />

                    <input
                        type="text"
                        className="border rounded px-3 py-2 w-full sm:w-1/3"
                        placeholder="Search by LRN..."
                        value={searchLrn}
                        onChange={(e) => setSearchLrn(e.target.value)}
                    />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportXLSX}
                            className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:opacity-90"
                        >
                            Export Excel
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
                <table className="w-full text-left border font-bold">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Personal Info</th>
                            <th className="p-2 border">Address/Cont.</th>
                            <th className="p-2 border">LRN</th>
                            <th className="p-2 border">Education Info</th>
                            <th className="p-2 border">Course Choose</th>
                            <th className="p-2 border">Parent Info</th>
                            <th className="p-2 border">Exam Sched</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPassers.map((passer, i) => {
                            const isExpanded = expandedRows.includes(i);

                            return (
                                <tr
                                    key={i}
                                    className={`text-[11px] cursor-pointer hover:bg-gray-100 ${Math.floor(i / 2) % 2 === 0 ? 'bg-yellow-50' : ''
                                        }`}
                                    onClick={() => {
                                        if (isExpanded) {
                                            setExpandedRows(expandedRows.filter(row => row !== i));
                                        } else {
                                            setExpandedRows([...expandedRows, i]);
                                        }
                                    }}
                                >
                                    {/* Name */}
                                    <td className="p-2 border  w-[200px]">
                                        {passer.last_name}, {passer.first_name} {passer.middle_name}
                                    </td>

                                    {/* Personal Info */}
                                    <td className="p-2 border w-[200px]">
                                        {isExpanded && (
                                            <ul className="list-disc pl-4">
                                                <li><b>Email:</b> <span className='text-gray-500 font-semibold'>{passer.email}</span></li>
                                                <li><b>Gender:</b> <span className='text-gray-500 font-semibold'>{passer.sex}</span></li>
                                                <li><b>Birth:</b> <span className='text-gray-500 font-semibold'>{passer.dob}</span></li>
                                                <li><b>Age:</b> <span className='text-gray-500 font-semibold'>{passer.age}</span></li>
                                                <li><b>Nationality:</b> <span className='text-gray-500 font-semibold'>{passer.nationality}</span></li>
                                                <li><b>Comelec No:</b> <span className='text-gray-500 font-semibold'>{passer.student_comelec_no}</span></li>
                                            </ul>
                                        )}
                                    </td>

                                    {/* Address */}
                                    <td className="p-2 border w-[250px]">
                                        {isExpanded && (
                                            <ul className="list-disc pl-4">
                                                <li><b>Address:</b> <span className='text-gray-500 font-semibold'>{passer.address}</span></li>
                                                <li><b>Barangay:</b> <span className='text-gray-500 font-semibold'>{passer.barangay}</span></li>
                                                <li><b>Zip Code:</b> <span className='text-gray-500 font-semibold'>{passer.zip_code}</span></li>
                                                <li><b>Cont. No:</b> <span className='text-gray-500 font-semibold'>{passer.contact_no}</span></li>
                                            </ul>
                                        )}
                                    </td>

                                    {/* LRN (always shown) */}
                                    <td className="p-2 border w-[100px]">{passer.lrn}</td>

                                    {/* Education Info */}
                                    <td className="p-2 border w-[250px]">
                                        {isExpanded && (
                                            <ul className="list-disc pl-4">
                                                <li><b>JHS:</b> <span className='text-gray-500 font-semibold'>{passer.junior_high_school}</span></li>
                                                <li><b>SHS:</b> <span className='text-gray-500 font-semibold'>{passer.senior_high_school}</span></li>
                                                <li><b>Strand:</b> <span className='text-gray-500 font-semibold'>{passer.strand}</span></li>
                                                <li><b>GWA1 G11:</b> <span className='text-gray-500 font-semibold'>{passer.g11_gwa1}</span></li>
                                                <li><b>GWA2 G11:</b> <span className='text-gray-500 font-semibold'>{passer.g11_gwa2}</span></li>
                                                <li><b>GWA1 G12:</b> <span className='text-gray-500 font-semibold'>{passer.g12_gwa1}</span></li>
                                                <li><b>GWA2 G12:</b> <span className='text-gray-500 font-semibold'>{passer.g12_gwa2}</span></li>
                                                <li><b>SHS Graduated:</b> <span className='text-gray-500 font-semibold'>{passer.senior_high_school_year_graduated}</span></li>
                                            </ul>
                                        )}
                                    </td>

                                    {/* Course Choices */}
                                    <td className="p-2 border w-[200px]">
                                        {isExpanded && (
                                            <ul className="list-disc pl-4">
                                                <li><b>1st:</b> <span className='text-gray-500 font-semibold'>{passer.first_course}</span></li>
                                                <li><b>2nd:</b> <span className='text-gray-500 font-semibold'>{passer.second_course}</span></li>
                                                <li><b>3rd:</b> <span className='text-gray-500 font-semibold'>{passer.third_course}</span></li>
                                            </ul>
                                        )}
                                    </td>

                                    {/* Parent Info */}
                                    <td className="p-2 border w-[150px]">
                                        {isExpanded && (
                                            <ul className="list-disc pl-4">
                                                <li><b>Parent:</b> <span className='text-gray-500 font-semibold'>{passer.name_of_parent}</span></li>
                                                <li><b>Cont. no.:</b> <span className='text-gray-500 font-semibold'>{passer.parent_contact_no}</span></li>
                                                <li><b>Comelec No.:</b> <span className='text-gray-500 font-semibold'>{passer.parent_comelec_no}</span></li>
                                            </ul>
                                        )}
                                    </td>

                                    {/* Exam Schedule */}
                                    <td className="p-2 border w-[180px]">
                                        {isExpanded && (
                                            <ul className="list-disc pl-4">
                                                <li><b>Date:</b> <span className='text-gray-500 font-semibold'>{passer.exam_date}</span></li>
                                                <li><b>Shift:</b> <span className='text-gray-500 font-semibold'>{passer.exam_time}</span></li>
                                                <li><b>Rm.:</b> <span className='text-gray-500 font-semibold'>{passer.exam_room_no}</span></li>
                                                <li><b>Seat No.:</b> <span className='text-gray-500 font-semibold'>{passer.exam_seat_no}</span></li>
                                            </ul>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}


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
                                            <tr className="border-b ">
                                                <td className="border px-2 py-1">{dupPair.existing.category}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.lrn}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.first_name}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.middle_name}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.last_name}</td>
                                                <td className="border px-2 py-1">{dupPair.existing.senior_high_school}</td>
                                                <td className="border px-2 py-1">Original</td>
                                            </tr>
                                            {/* Incoming duplicate */}
                                            <tr className="border-b bg-yellow-300">
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
