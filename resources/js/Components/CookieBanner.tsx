import { useState, useEffect } from 'react';

export default function CookieBanner() {
    const [visivel, setVisivel] = useState(false);

    useEffect(() => {
        // Checa se o usuário já aceitou antes
        const consentimento = localStorage.getItem('AstraLab_lgpd_consent');
        if (!consentimento) {
            setVisivel(true);
        }
    }, []);

    const aceitarCookies = () => {
        localStorage.setItem('AstraLab_lgpd_consent', 'true');
        setVisivel(false);
    };

    if (!visivel) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-xl w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner border border-teal-100">
                    🍪
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Privacidade e LGPD</h2>
                
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                    Para garantir a segurança dos dados de saúde e melhorar a sua experiência no <strong>AstraLab</strong>, utilizamos cookies e armazenamento local de sessão. <br/><br/>
                    Ao prosseguir para o sistema, você concorda com nossos termos de privacidade e com o uso destas tecnologias em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
                
                <button 
                    onClick={aceitarCookies}
                    className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:-translate-y-1 transition-all text-xs tracking-widest uppercase"
                >
                    Compreendo e Aceito
                </button>
            </div>
        </div>
    );
}