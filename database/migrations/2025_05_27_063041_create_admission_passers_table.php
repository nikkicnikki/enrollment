<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('admission_passers', function (Blueprint $table) {
            $table->id();
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('sex')->nullable();
            $table->string('age')->nullable();
            $table->string('dob')->nullable();
            $table->string('address')->nullable();
            $table->string('barangay')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('contact_no')->nullable();
            $table->string('nationality')->nullable();
            $table->string('junior_high_school')->nullable();
            $table->string('senior_high_school')->nullable();
            $table->string('senior_high_school_year_graduated')->nullable();
            $table->string('lrn')->nullable()->unique();
            $table->string('strand')->nullable();
            $table->string('g11_gwa1')->nullable();
            $table->string('g11_gwa2')->nullable();
            $table->string('g12_gwa1')->nullable();
            $table->string('g12_gwa2')->nullable();
            $table->string('first_course')->nullable();
            $table->string('second_course')->nullable();
            $table->string('third_course')->nullable();
            $table->string('name_of_parent')->nullable();
            $table->string('parent_comelec_no')->nullable();
            $table->string('student_comelec_no')->nullable();
            $table->string('exam_date')->nullable();
            $table->string('exam_time')->nullable();
            $table->string('exam_room_no')->nullable();
            $table->string('exam_seat_no')->nullable();
            $table->string('applicantType')->nullable();
            $table->string('athlete')->nullable();
            $table->string('admission_grade')->nullable();
            $table->string('category')->nullable(); // To tag as 'regular', 'athletes', or 'als'
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admission_passers');
    }
};
