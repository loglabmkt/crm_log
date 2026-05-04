import React, { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Send } from "lucide-react";

export default function Marketing() {
  const [activeTab, setActiveTab] = useState("segments");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border p-1 rounded-xl" style={{ borderColor: "rgba(240,192,0,0.15)" }}>
          <TabsTrigger value="segments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2 text-sm">
            <Users className="w-4 h-4" /> Segmentos
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2 text-sm">
            <Send className="w-4 h-4" /> Campanhas
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "segments" && (
        <GlassCard className="min-h-[400px] flex flex-col items-center justify-center">
          <Users className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum segmento criado</p>
          <p className="text-xs text-muted-foreground mt-1">Crie segmentos para organizar suas campanhas</p>
        </GlassCard>
      )}

      {activeTab === "campaigns" && (
        <GlassCard className="min-h-[400px] flex flex-col items-center justify-center">
          <Send className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma campanha criada</p>
          <p className="text-xs text-muted-foreground mt-1">Campanhas de e-mail, WhatsApp e SMS</p>
        </GlassCard>
      )}
    </div>
  );
}