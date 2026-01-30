<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectMgmtController extends Controller
{
    public function index()
    {
        // Ambil subject + hitung jumlah soal yang terkait
        return response()->json(Subject::withCount('questions')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|unique:subjects,name']);
        Subject::create(['name' => $request->name]);
        return response()->json(['message' => 'Mapel ditambahkan']);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|unique:subjects,name,'.$id]);
        Subject::where('id', $id)->update(['name' => $request->name]);
        return response()->json(['message' => 'Mapel diupdate']);
    }

    public function destroy($id)
    {
        $subject = Subject::withCount('questions')->findOrFail($id);
        if ($subject->questions_count > 0) {
            return response()->json(['message' => 'Gagal: Masih ada soal menggunakan mapel ini'], 400);
        }
        $subject->delete();
        return response()->json(['message' => 'Mapel dihapus']);
    }
}