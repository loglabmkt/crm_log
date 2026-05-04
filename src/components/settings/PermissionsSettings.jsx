import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { CheckCircle2, Minus } from "lucide-react";

const ROLES = [
  { key: "admin", label: "Admin", bg: "rgba(239,68,68,0.10)", color: "#EF4444" },
  { key: "manager", label: "Gerente", bg: "rgba(139,92,246,0.10)", color: "#8B5CF6" },
  { key: "sales", label: "Vendas", bg: "rgba(240,192,0,0.10)", color: "#C49A00" },
  { key: "support", label: "Suporte", bg: "rgba(59,130,246,0.10)", color: "#3B82F6" },
  { key: "marketing", label: "Marketing", bg: "rgba(34,197,94,0.10)", color: "#22C55E" },
];

// true = permitido, false = não permitido
const MATRIX = [
  { group: "Dashboard", action: "Visualizar", admin: true, manager: true, sales: true, support: true, marketing: true },
  { group: "Organizações", action: "Visualizar", admin: true, manager: true, sales: true, support: true, marketing: true },
  { group: "Organizações", action: "Criar / Editar", admin: true, manager: true, sales: true, support: false, marketing: false },
  { group: "Organizações", action: "Excluir", admin: true, manager: true, sales: false, support: false, marketing: false },
  { group: "Contatos", action: "Visualizar", admin: true, manager: true, sales: true, support: true, marketing: true },
  { group: "Contatos", action: "Criar / Editar", admin: true, manager: true, sales: true, support: false, marketing: false },
  { group: "Contatos", action: "Excluir", admin: true, manager: true, sales: false, support: false, marketing: false },
  { group: "Oportunidades", action: "Visualizar", admin: true, manager: true, sales: true, support: false, marketing: true },
  { group: "Oportunidades", action: "Criar / Editar", admin: true, manager: true, sales: true, support: false, marketing: false },
  { group: "Oportunidades", action: "Excluir", admin: true, manager: false, sales: false, support: false, marketing: false },
  { group: "Atividades", action: "Visualizar", admin: true, manager: true, sales: true, support: false, marketing: true },
  { group: "Atividades", action: "Registrar", admin: true, manager: true, sales: true, support: false, marketing: false },
  { group: "Marketing – Segmentos", action: "Visualizar / Criar / Editar / Excluir", admin: true, manager: true, sales: false, support: false, marketing: true },
  { group: "Marketing – Campanhas", action: "Visualizar / Criar / Editar / Arquivar", admin: true, manager: true, sales: false, support: false, marketing: true },
  { group: "Tickets", action: "Visualizar", admin: true, manager: true, sales: false, support: true, marketing: false },
  { group: "Tickets", action: "Criar / Responder / Alterar status", admin: true, manager: true, sales: false, support: true, marketing: false },
  { group: "Tickets", action: "Excluir", admin: true, manager: false, sales: false, support: false, marketing: false },
  { group: "Relatórios", action: "Visualizar", admin: true, manager: true, sales: true, support: true, marketing: true },
  { group: "Config. – Perfil", action: "Editar próprio", admin: true, manager: true, sales: true, support: true, marketing: true },
  { group: "Config. – Usuários", action: "Visualizar / Convidar / Editar / Desativar", admin: true, manager: false, sales: false, support: false, marketing: false },
  { group: "Config. – Permissões", action: "Visualizar", admin: true, manager: false, sales: false, support: false, marketing: false },
];

function Check({ allowed }) {
  return allowed
    ? <CheckCircle2 className="w-4 h-4 mx-auto" style={{ color: "#22C55E" }} />
    : <Minus className="w-4 h-4 mx-auto" style={{ color: "#D1D5DB" }} />;
}

// Group rows
function buildGroups() {
  const groups = [];
  let currentGroup = null;
  MATRIX.forEach(row => {
    if (row.group !== currentGroup) {
      currentGroup = row.group;
      groups.push({ type: "group", label: row.group });
    }
    groups.push({ type: "row", ...row });
  });
  return groups;
}

export default function PermissionsSettings() {
  const rows = buildGroups();
  return (
    <GlassCard className="overflow-x-auto p-0">
      <div className="p-5 pb-3">
        <h3 className="font-semibold" style={{ color: "#1A1A1A", fontSize: 16 }}>Matriz de permissões</h3>
        <p className="text-sm mt-1" style={{ color: "#999" }}>Visão informativa — não editável nesta fase.</p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="w-full text-sm" style={{ minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "#999", minWidth: 200 }}>Módulo / Ação</th>
              {ROLES.map(r => (
                <th key={r.key} className="py-3 px-4 text-center" style={{ minWidth: 96 }}>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: r.bg, color: r.color }}>{r.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              if (row.type === "group") return (
                <tr key={`g-${i}`} style={{ background: "rgba(0,0,0,0.03)" }}>
                  <td colSpan={6} className="py-2 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "#888" }}>{row.label}</td>
                </tr>
              );
              return (
                <tr key={i}
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(240,192,0,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="py-2.5 px-5 pl-8" style={{ color: "#555" }}>{row.action}</td>
                  {ROLES.map(r => (
                    <td key={r.key} className="py-2.5 px-4 text-center">
                      <Check allowed={row[r.key]} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}