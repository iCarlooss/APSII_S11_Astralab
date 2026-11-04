<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LaudoLiberadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $laudo;
    public $nomePaciente;
    public $nomeExame;
    public $protocolo; // Adicionamos a variável do protocolo aqui!

    /**
     * Create a new message instance.
     */
    public function __construct($laudo, $nomePaciente, $nomeExame, $protocolo)
    {
        $this->laudo = $laudo;
        $this->nomePaciente = $nomePaciente;
        $this->nomeExame = $nomeExame;
        $this->protocolo = $protocolo; // Salvamos o protocolo que veio do Controller
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'BioLab: Seu resultado de exame está pronto!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'laudo_liberado', // Este é o arquivo visual do e-mail
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}