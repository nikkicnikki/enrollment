<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdmissionPasser extends Model
{
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'sex',
        'age',
        'dob',
        'address',
        'barangay',
        'zip_code',
        'contact_no',
        'nationality',
        'junior_high_school',
        'senior_high_school',
        'senior_high_school_year_graduated',
        'lrn',
        'strand',
        'g11_gwa1',
        'g11_gwa2',
        'g12_gwa1',
        'g12_gwa2',
        'first_course',
        'second_course',
        'third_course',
        'name_of_parent',
        'parent_comelec_no',
        'student_comelec_no',
        'exam_date',
        'exam_time',
        'exam_room_no',
        'exam_seat_no',
        'applicantType',
        'athlete',
        'admission_grade',
        'category', // This should be added manually during import
    ];
}
