import React, { useState } from 'react';
import { FileText, Printer, Download } from 'lucide-react';
import { useBrain } from '../context/BrainContext';

interface DynamicDocsProps {
    patientId: string;
}

const TEMPLATES = [
    {
        id: 'contract',
        title: 'Contrato de Acolhimento',
        content: `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ACOLHIMENTO

Pelo presente instrumento particular, a COMUNIDADE TERAPÊUTICA VIVA PLENA, doravante denominada CONTRATADA, e o Sr(a). {name}, inscrito no CPF sob o nº {cpf}, doravante denominado(a) CONTRATANTE/ACOLHIDO(A).

CLÁUSULA PRIMEIRA - DO OBJETO
O presente contrato tem por objeto a prestação de serviços de acolhimento voluntário, visando a recuperação e reinserção social do acolhido.

CLÁUSULA SEGUNDA - DAS OBRIGAÇÕES
O ACOLHIDO compromete-se a respeitar as normas internas da instituição, participar das atividades propostas e manter o convívio harmonioso.

Data de Início: {entry_date}
Cidade de Origem: {origin}

__________________________________________
Assinatura do Responsável
    `
    },
    {
        id: 'declaration',
        title: 'Declaração de Permanência',
        content: `
DECLARAÇÃO

Declaramos para os devidos fins que o Sr(a). {name}, portador(a) do RG n° {rg} e CPF n° {cpf}, encontra-se em regime de acolhimento nesta instituição desde {entry_date}, para tratamento de dependência química/alcoolismo.

O tratamento tem duração prevista de 06 a 09 meses, seguindo as diretrizes do nosso Plano Terapêutico Singular.

Por ser verdade, firmamos a presente.

{today}
__________________________________________
Diretoria Administrativa
Viva Plena
    `
    }
];

const DynamicDocs: React.FC<DynamicDocsProps> = ({ patientId }) => {
    const { brain } = useBrain();
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);

    const patient = brain.patients.find(p => p.id === patientId);

    if (!patient) return null;

    const generateContent = (template: string) => {
        return template
            .replace(/{name}/g, patient.name)
            .replace(/{cpf}/g, patient.cpf || '_________________')
            .replace(/{rg}/g, patient.rg || '_________________')
            .replace(/{origin}/g, patient.origin_city || '_________________')
            .replace(/{entry_date}/g, patient.entry_date ? new Date(patient.entry_date).toLocaleDateString() : '__/__/____')
            .replace(/{today}/g, new Date().toLocaleDateString());
    };

    const currentContent = generateContent(selectedTemplate.content);

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>${selectedTemplate.title} - ${patient.name}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
              h1 { text-align: center; font-size: 18px; text-transform: uppercase; margin-bottom: 40px; }
              pre { white-space: pre-wrap; font-family: inherit; }
            </style>
          </head>
          <body>
            <pre>${currentContent}</pre>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
            printWindow.document.close();
        }
    };

    return (
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar de Templates */}
                <div className="w-full md:w-1/3 space-y-4">
                    <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest pl-2">Modelos Disponíveis</h3>
                    <div className="space-y-2">
                        {TEMPLATES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTemplate(t)}
                                className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all border ${selectedTemplate.id === t.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                    }`}
                            >
                                {t.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div className="w-full md:w-2/3">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest">Pré-visualização</h3>
                        <button onClick={handlePrint} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-slate-800">
                            <Printer size={16} /> Imprimir
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-words font-serif text-slate-800 text-sm leading-relaxed">
                            {currentContent}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicDocs;
