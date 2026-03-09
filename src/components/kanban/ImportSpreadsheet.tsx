"use client";

import { useKanbanStore } from "@/store/kanbanStore";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { generateScripts } from "@/lib/generateScripts";

export function ImportSpreadsheet() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addCard, columns } = useKanbanStore();
    const [isImporting, setIsImporting] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to JSON array
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

            if (rows.length === 0) {
                alert("A planilha está vazia.");
                return;
            }

            // Find the ID of the first column
            const firstColumn = [...columns].sort((a, b) => a.order_index - b.order_index)[0];

            if (!firstColumn) {
                alert("Você precisa criar pelo menos uma coluna no Kanban antes de importar.");
                return;
            }

            const getField = (row: Record<string, unknown>, keys: string[]) => {
                for (const key of keys) {
                    const normalizedSearchKey = key.trim().toLowerCase();
                    const actualKey = Object.keys(row).find(
                        (k) => k.trim().toLowerCase() === normalizedSearchKey
                    );

                    if (actualKey && row[actualKey] !== undefined && row[actualKey] !== null) {
                        return String(row[actualKey]);
                    }
                }
                return "";
            };

            let importCount = 0;

            for (const row of rows) {
                const companyName = getField(row, ["Nome do Escritório", "Empresa", "Escritório", "Nome do Escritorio"]);
                const contactName = getField(row, ["Nome do Decisor", "Decisor", "Contato", "Nome do Contato"]);

                // Only import if it has at least a company name or contact name
                if (!companyName && !contactName) continue;

                const phone = getField(row, ["WhatsApp", "Telefone", "Celular"]);
                const nicho = getField(row, ["Nicho", "Área de Atuação", "Area"]);
                const leadOrigin = getField(row, ["Origem do Lead", "Origem"]);
                const proofLink = getField(row, ["Link da Prova", "Link Anúncio"]);
                const website = getField(row, ["Site", "Website"]);
                const testResult = getField(row, ['Resultado do "Teste Oculto"', "Teste Oculto"]);

                const generatedMessages = generateScripts(contactName);

                addCard(firstColumn.id, {
                    company_name: companyName || "Escritório Sem Nome",
                    contact_name: contactName,
                    phone,
                    message: "",
                    company_info: "Importado da planilha.",
                    nicho,
                    lead_origin: leadOrigin,
                    proof_link: proofLink,
                    website,
                    test_result: testResult,
                    generated_messages: generatedMessages
                });

                importCount++;
            }

            alert(`${importCount} contatos foram importados com sucesso!`);
        } catch (error) {
            console.error("Failed to parse file", error);
            alert("Ocorreu um erro ao importar a planilha. Verifique o arquivo e tente novamente.");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div>
            <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Upload size={16} />
                {isImporting ? "Importando..." : "Importar Planilha"}
            </button>
        </div>
    );
}
