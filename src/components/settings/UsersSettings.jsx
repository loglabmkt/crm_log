import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import InviteUserModal from "./InviteUserModal";
import UserEditModal from "./UserEditModal";
import { Plus, Users, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const ROLE_MAP = {
  admin: { label: "Admin", bg: "rgba(239,68,68,0.10)", color: "#EF4444" },
  manager: { label: "Gerente", bg: "rgba(139,92,246,0.10)", color: "#8B5CF6" },
  sales: { label: "Vendas", bg: "rgba(240,192,0,0.10)", color: "#C49A00" },
  support: { label: "Suporte", bg: "rgba(59,130,246,0.10)", color: "#3B82F6" },
  marketing: { label: "Marketing", bg: "rgba(34,197,94,0.10)", color: "#22C55E" },
  user: { label: "Usuário", bg: "rgba(0,0,0,0.06)", color: "#555" },
};

export default function UsersSettings({ currentUser }) {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.User.list();
    setUsers(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const adminCount = users.filter(u => u.role === "admin").length;
  const isOnlyAdmin = (u) => u.role === "admin" && adminCount === 1;

  const handleDeactivate = async () => {
    if (!confirmDeactivate) return;
    setDeactivating(true);
    await base44.entities.User.update(confirmDeactivate.id, { is_active: false });
    setConfirmDeactivate(null);
    setDeactivating(false);
    toast({ title: `${confirmDeactivate.full_name} desativado.` });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold" style={{ color: "#1A1A1A", fontSize: 16 }}>Usuários do sistema</h3>
        <button onClick={() => setInviteModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>
          <Plus className="w-4 h-4" /> Convidar usuário
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(240,192,0,0.06)" }} />)}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Users className="w-10 h-10" style={{ color: "#CCC" }} />
          <p style={{ color: "#999", fontSize: 14 }}>Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(u => {
            const role = ROLE_MAP[u.role] || ROLE_MAP.user;
            const isSelf = currentUser?.id === u.id;
            const initials = (u.full_name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            const isActive = u.is_active !== false;
            return (
              <GlassCard key={u.id} className="flex items-center gap-4 flex-wrap">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#F0C000,#C49A00)", color: "#1A1A1A" }}>
                  {initials}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{u.full_name}</p>
                    {isSelf && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(240,192,0,0.15)", color: "#8A6E00" }}>Você</span>}
                  </div>
                  <p className="text-xs" style={{ color: "#999" }}>{u.email}</p>
                  {u.created_date && <p className="text-xs mt-0.5" style={{ color: "#bbb" }}>Desde {format(new Date(u.created_date), "dd/MM/yyyy")}</p>}
                </div>
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: role.bg, color: role.color }}>{role.label}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: isActive ? "rgba(34,197,94,0.10)" : "rgba(153,153,153,0.10)", color: isActive ? "#22C55E" : "#999" }}>
                    {isActive ? "Ativo" : "Inativo"}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditUser(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                    style={{ background: "rgba(0,0,0,0.05)", color: "#555", border: "1px solid rgba(0,0,0,0.08)" }}>
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                  {!isSelf && isActive && (
                    <button onClick={() => setConfirmDeactivate(u)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.20)" }}>
                      Desativar
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {inviteModal && <InviteUserModal onClose={() => setInviteModal(false)} onSaved={() => { load(); toast({ title: "Convite enviado com sucesso!" }); }} />}
      {editUser && <UserEditModal user={editUser} isOnlyAdmin={isOnlyAdmin(editUser)} onClose={() => setEditUser(null)} onSaved={() => { setEditUser(null); load(); toast({ title: "Usuário atualizado." }); }} />}

      {/* Confirm deactivate */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl p-6 w-96 space-y-4" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
            <p className="font-semibold" style={{ color: "#1A1A1A" }}>Desativar "{confirmDeactivate.full_name}"?</p>
            <p className="text-sm" style={{ color: "#555" }}>O usuário perderá acesso ao sistema.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeactivate(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Cancelar</button>
              <button onClick={handleDeactivate} disabled={deactivating} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#EF4444", color: "#fff", opacity: deactivating ? 0.7 : 1 }}>
                {deactivating ? "Desativando..." : "Desativar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}