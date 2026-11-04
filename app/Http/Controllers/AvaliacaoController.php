<?php

namespace App\Http\Controllers;

use App\Models\Avaliacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AvaliacaoController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nota' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:1000',
            'protocolo' => 'nullable|string'
        ]);

        Avaliacao::create([
            'user_id' => Auth::id(),
            'protocolo' => $request->protocolo,
            'nota' => $request->nota,
            'comentario' => $request->comentario,
        ]);

        return redirect()->back()->with('success', 'Muito obrigado pela sua avaliação! Ela nos ajuda a melhorar.');
    }
}