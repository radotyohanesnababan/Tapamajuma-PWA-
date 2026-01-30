<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassName;
use Illuminate\Http\Request;

class ClassMgmtController extends Controller
{
    // GET /api/admin/classes
    public function index()
{
    // Mengambil kelas beserta jumlah siswanya
    $classes = ClassName::withCount('students')->get(); 
    return response()->json($classes);
}

    // POST /api/admin/classes
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|unique:class_names,name']);
        
        $class = ClassName::create(['name' => $request->name]);
        return response()->json($class, 201);
    }

    // DELETE /api/admin/classes/{id}
    public function destroy($id)
    {
        ClassName::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
