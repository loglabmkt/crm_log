import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { User, Shield, Bell, Database } from "lucide-react";

const sections = [
  { icon: User, label: "Perfil", desc: "Atualize suas informações pessoais" },
  { icon: Shield, label: "Permissões", desc: "Gerencie roles e acessos" },
  { icon: Bell, label: "Notificações", desc: "Configure preferências de notificação" },
  { icon: Database, label: "Dados", desc: "Exportação e backup de dados" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((section) => (
          <GlassCard key={section.label} className="cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(240, 192, 0, 0.12)" }}>
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{section.desc}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}