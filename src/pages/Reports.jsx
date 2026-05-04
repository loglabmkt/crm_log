import React, { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Megaphone, Headphones } from "lucide-react";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border p-1 rounded-xl" style={{ borderColor: "rgba(240,192,0,0.15)" }}>
          <TabsTrigger value="sales" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2 text-sm">
            <TrendingUp className="w-4 h-4" /> Vendas
          </TabsTrigger>
          <TabsTrigger value="marketing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2 text-sm">
            <Megaphone className="w-4 h-4" /> Marketing
          </TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2 text-sm">
            <Headphones className="w-4 h-4" /> Atendimento
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard className="min-h-[300px] flex flex-col">
            <h2 className="text-base font-semibold text-foreground mb-4">Oportunidades por Estágio</h2>
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Dados disponíveis na próxima fase
            </div>
          </GlassCard>
          <GlassCard className="min-h-[300px] flex flex-col">
            <h2 className="text-base font-semibold text-foreground mb-4">Receita por Período</h2>
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Dados disponíveis na próxima fase
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "marketing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard className="min-h-[300px] flex flex-col">
            <h2 className="text-base font-semibold text-foreground mb-4">Performance de Campanhas</h2>
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Dados disponíveis na próxima fase
            </div>
          </GlassCard>
          <GlassCard className="min-h-[300px] flex flex-col">
            <h2 className="text-base font-semibold text-foreground mb-4">Segmentos Ativos</h2>
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Dados disponíveis na próxima fase
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "support" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard className="min-h-[300px] flex flex-col">
            <h2 className="text-base font-semibold text-foreground mb-4">Tickets por Status</h2>
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Dados disponíveis na próxima fase
            </div>
          </GlassCard>
          <GlassCard className="min-h-[300px] flex flex-col">
            <h2 className="text-base font-semibold text-foreground mb-4">Tempo Médio de Resolução</h2>
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Dados disponíveis na próxima fase
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}