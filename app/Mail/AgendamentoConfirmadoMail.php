<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AgendamentoConfirmadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $nomePaciente;
    public $data;
    public $horario;
    public $exames;
    public $instrucoes;

    public function __construct($nomePaciente, $data, $horario, $exames, $instrucoes)
    {
        $this->nomePaciente = $nomePaciente;
        // Formata a data de YYYY-MM-DD para DD/MM/YYYY
        $this->data = \Carbon\Carbon::parse($data)->format('d/m/Y');
        $this->horario = $horario;
        $this->exames = $exames;
        $this->instrucoes = $instrucoes;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirmação de Agendamento e Guia de Preparo - BioLab',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.agendamento_confirmado',
        );
    }
}