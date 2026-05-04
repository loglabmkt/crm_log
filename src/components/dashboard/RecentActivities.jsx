import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { Phone, Mail, Users, FileText, MessageCircle, MapPin, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_MAP = {
  ligacao: { icon: Phone, color: "#3B82F6" },
  email: { icon: Mail, color: "#22C55E" },
  reuniao: { icon: Users, color: "#8B5CF6" },
  anotacao: { icon: FileText, color: "#F59E0B" },
  whatsapp: { icon: MessageCircle, color: "#22C55E" },
  visita: { icon: MapPin, color: "#EF4444" },
  outro: { icon: Activity, color: "#999999" },
};

export default function RecentActivities() {
  const [activities, setActivities] = useState([]);
  const [orgsMap, setOrgsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [acts, orgs] = await Promise.all([
        base44.entities.Activity.list("-occurred_at", 8),
        base44.entities.Organization.list(),
      ]);
      const map = {};
      orgs.forEach(o => { map[o.id] = o; });
      setOrgsMap(map);
      setActivities(acts);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <GlassCard className="flex flex-col">
      <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 18 }}>Atividades Recentes</h2>
      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "rgba(240,192,0,0.06)" }} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
          <Activity className="w-10 h-10" style={{ color: "#CCCCCC" }} />
          <p style={{ color: "#999999", fontSize: 14 }}>Nenhuma atividade registrada ainda</p>
        </div>
      ) : (
        <div className="space-y-0">
          {activities.map((act, i) => {
            const t = TYPE_MAP[act.type] || TYPE_MAP.outro;
            const Icon = t.icon;
            const org = orgsMap[act.organization_id];
            return (
              <div key={act.id}>
                <div className="flex items-start gap-3 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${t.color}18` }}>
                    <Icon className="w-4 h-4" style={{ color: t.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {org && <p className="text-sm font-semibold truncate" style={{ color: "#1A1A1A" }}>{org.name}</p>}
                    <p className="text-sm truncate" style={{ color: "#555555" }}>{act.title}</p>
                  </div>
                  {act.occurred_at && (
                    <p className="text-xs flex-shrink-0" style={{ color: "#999999" }}>
                      {format(new Date(act.occurred_at), "dd MMM", { locale: ptBR })}
                    </p>
                  )}
                </div>
                {i < activities.length - 1 && <div className="h-px" style={{ background: "rgba(0,0,0,0.06)" }} />}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <Link to="/sales" className="text-sm font-medium transition-colors" style={{ color: "#C49A00" }}>Ver todas →</Link>
      </div>
    </GlassCard>
  );
}