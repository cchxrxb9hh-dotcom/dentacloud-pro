
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Save, Printer, User, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3, Search } from 'lucide-react';
import { Patient } from '../types';
import { useUser } from '../App';

// Use real patients from context instead of mock data

const ToolbarButton = ({ icon: Icon, onClick, command, value, title }: any) => (
    <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClick(command, value); }}
        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-blue-600 transition-colors"
        title={title}
    >
        <Icon size={16} />
    </button>
);

const DocumentEditor: React.FC = () => {
    const { addAuditEntry, patients } = useUser();
    const { docId } = useParams<{ docId?: string }>();
    const navigate = useNavigate();
    const editorRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState('New Clinical Document');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [initialContent, setInitialContent] = useState('<p>Start writing your document here...</p>');

    useEffect(() => {
        if (docId) {
            setIsEditing(true);
            const allDocs = JSON.parse(localStorage.getItem('denta_documents') || '[]');
            const docToEdit = allDocs.find((doc: any) => doc.id === docId);

            if (docToEdit) {
                setTitle(docToEdit.name);
                setInitialContent(docToEdit.content);
                const patient = patients.find(p => p.id === docToEdit.patientId);
                setSelectedPatient(patient || null);
            } else {
                alert('Document not found.');
                navigate('/documents');
            }
        } else {
            setIsEditing(false);
            setTitle('New Clinical Document');
            setInitialContent('<p>Start writing your document here...</p>');
            setSelectedPatient(null);
        }
    }, [docId, navigate]);


    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleSave = () => {
        if (!selectedPatient || !title || !editorRef.current) {
            alert('Please select a patient and provide a title.');
            return;
        }

        const content = editorRef.current.innerHTML;
        const existingDocs = JSON.parse(localStorage.getItem('denta_documents') || '[]');

        if (isEditing && docId) {
            const updatedDocs = existingDocs.map((doc: any) => 
                doc.id === docId 
                    ? { ...doc, name: title, content, patientId: selectedPatient.id, date: new Date().toISOString().split('T')[0] } 
                    : doc
            );
            localStorage.setItem('denta_documents', JSON.stringify(updatedDocs));
            addAuditEntry('Updated Patient Document', 'Clinical', `Title: ${title} for patient ${selectedPatient.firstName} ${selectedPatient.lastName}`);
        } else {
            const newDocument = {
                id: `doc-${Date.now()}`,
                name: title,
                url: '#',
                category: 'Document' as const,
                date: new Date().toISOString().split('T')[0],
                content: content,
                patientId: selectedPatient.id
            };
            localStorage.setItem('denta_documents', JSON.stringify([...existingDocs, newDocument]));
            addAuditEntry('Created Patient Document', 'Clinical', `Title: ${title} for patient ${selectedPatient.firstName} ${selectedPatient.lastName}`);
        }
        
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);

        if (isEditing) {
            navigate(`/patients/${selectedPatient.id}`);
        }
    };
    
    const handlePrint = () => {
        const content = editorRef.current?.innerHTML;
        if (!content) return;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${title}</title>
                        <style>
                            body { font-family: sans-serif; padding: 2rem; }
                            h1, h2, h3 { margin-bottom: 0.5em; margin-top: 1.5em; }
                            ul, ol { padding-left: 2em; }
                        </style>
                    </head>
                    <body>
                        <h1>${title}</h1>
                        <hr />
                        ${content}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const filteredPatients = patientSearch
        ? patients.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()))
        : [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Document Editor</h1>
                    <p className="text-slate-600 font-medium text-sm">Create, format, and save official clinical documents.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                        <Printer size={16} /> Print
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                        <Save size={16} /> {isSaved ? 'Saved!' : 'Save Document'}
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Associate with Patient</label>
                        {selectedPatient ? (
                             <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                <div>
                                    <p className="text-base font-bold text-slate-800">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                                </div>
                                {!isEditing && <button type="button" onClick={() => { setSelectedPatient(null); setPatientSearch(''); }} className="text-xs font-bold text-blue-600 hover:underline">Change</button>}
                            </div>
                        ) : (
                            <div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={patientSearch}
                                        onChange={e => setPatientSearch(e.target.value)}
                                        placeholder="Search patients..."
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm text-slate-800"
                                    />
                                </div>
                                {filteredPatients.length > 0 && (
                                    <div className="absolute z-10 top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                                        {filteredPatients.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => { setSelectedPatient(p); setPatientSearch(''); }}
                                                className="w-full text-left p-4 hover:bg-blue-50"
                                            >
                                                <p className="font-bold text-slate-800">{p.firstName} {p.lastName}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Document Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter document title..."
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-lg text-slate-800"
                        />
                    </div>
                 </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2">
                    <ToolbarButton icon={Heading1} onClick={handleFormat} command="formatBlock" value="h1" title="Heading 1" />
                    <ToolbarButton icon={Heading2} onClick={handleFormat} command="formatBlock" value="h2" title="Heading 2" />
                    <ToolbarButton icon={Heading3} onClick={handleFormat} command="formatBlock" value="h3" title="Heading 3" />
                    <div className="w-px h-6 bg-slate-200 mx-2" />
                    <ToolbarButton icon={Bold} onClick={handleFormat} command="bold" title="Bold" />
                    <ToolbarButton icon={Italic} onClick={handleFormat} command="italic" title="Italic" />
                    <ToolbarButton icon={Underline} onClick={handleFormat} command="underline" title="Underline" />
                    <div className="w-px h-6 bg-slate-200 mx-2" />
                    <ToolbarButton icon={ListOrdered} onClick={handleFormat} command="insertOrderedList" title="Numbered List" />
                    <ToolbarButton icon={List} onClick={handleFormat} command="insertUnorderedList" title="Bulleted List" />
                </div>
                <div
                    key={initialContent}
                    ref={editorRef}
                    contentEditable="true"
                    className="p-10 min-h-[500px] focus:outline-none prose max-w-none"
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={{ __html: initialContent }}
                />
            </div>
        </div>
    );
};

export default DocumentEditor;
