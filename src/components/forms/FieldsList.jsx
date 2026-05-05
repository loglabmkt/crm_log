import React, { useState } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Trash2, Settings2, Type, Mail, Phone,
  Hash, AlignLeft, ChevronDown, CheckSquare, X, Plus,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const FIELD_TYPES = [
  { type: "text", label: "Texto curto", icon: Type },
  { type: "email", label: "Email", icon: Mail },
  { type: "phone", label: "Telefone", icon: Phone },
  { type: "number", label: "Número", icon: Hash },
  { type: "textarea", label: "Texto longo", icon: AlignLeft },
  { type: "select", label: "Seleção", icon: ChevronDown },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
];

const MAPPING_OPTIONS = [
  { value: "", label: "Nenhum" },
  { value: "nome", label: "Nome do Contato" },
  { value: "email", label: "Email" },
  { value: "telefone", label: "Telefone" },
  { value: "municipio", label: "Município" },
  { value: "uf", label: "UF" },
  { value: "orgao", label: "Órgão/Secretaria" },
];

const inputStyle = {
  background: "rgba(255,255,255,0.70)",
  border: "1px solid rgba(0,0,0,0.10)",
  color: "#1A1A1A",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 13,
  outline: "none",
  width: "100%",
  fontFamily: "Inter, sans-serif",
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function TypeIcon({ type, size = 14 }) {
  const cfg = FIELD_TYPES.find(f => f.type === type);
  if (!cfg) return null;
  const Icon = cfg.icon;
  return <Icon style={{ width: size, height: size }} />;
}

function SortableField({ field, index, total, onChange, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [expanded, setExpanded] = useState(false);

  const set = (key, val) => onChange({ ...field, [key]: val });

  const addOption = () => {
    const opts = [...(field.options || []), "Nova opção"];
    set("options", opts);
  };

  const removeOption = (i) => {
    const opts = (field.options || []).filter((_, idx) => idx !== i);
    set("options", opts);
  };

  const updateOption = (i, val) => {
    const opts = [...(field.options || [])];
    opts[i] = val;
    set("options", opts);
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl overflow-hidden mb-2"
      style2={{ ...style }}>
      <GlassCard hover={false} className="!p-3">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0"
            style={{ color: "#bbb", touchAction: "none" }}>
            <GripVertical style={{ width: 16, height: 16 }} />
          </div>

          {/* Icon + Type */}
          <div className="w-6 flex-shrink-0" style={{ color: "#F0C000" }}>
            <TypeIcon type={field.type} />
          </div>

          {/* Inline label edit */}
          <input
            value={field.label}
            onChange={e => set("label", e.target.value)}
            className="flex-1 font-medium text-sm outline-none bg-transparent border-b"
            style={{ color: "#1A1A1A", borderColor: "transparent", minWidth: 0 }}
            onFocus={e => e.target.style.borderColor = "#F0C000"}
            onBlur={e => e.target.style.borderColor = "transparent"}
          />

          {/* Required badge */}
          {field.required && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.10)", color: "#EF4444" }}>
              Obrigatório
            </span>
          )}

          {/* Toggle required */}
          <button
            onClick={() => set("required", !field.required)}
            className="w-7 h-4 rounded-full transition-colors flex-shrink-0 relative"
            style={{ background: field.required ? "#F0C000" : "rgba(0,0,0,0.15)" }}
            title="Obrigatório">
            <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all"
              style={{ left: field.required ? "14px" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.20)" }} />
          </button>

          {/* Settings */}
          <button onClick={() => setExpanded(v => !v)}
            className="flex-shrink-0" style={{ color: expanded ? "#F0C000" : "#999" }}>
            <Settings2 style={{ width: 15, height: 15 }} />
          </button>

          {/* Remove */}
          <button onClick={() => onRemove(field.id)}
            className="flex-shrink-0" style={{ color: "#999" }}
            onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
            onMouseLeave={e => e.currentTarget.style.color = "#999"}>
            <Trash2 style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Expanded settings */}
        {expanded && (
          <div className="mt-3 pt-3 space-y-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Placeholder</label>
              <input value={field.placeholder || ""} onChange={e => set("placeholder", e.target.value)}
                placeholder="Texto de exemplo..." style={inputStyle} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Mapeamento</label>
              <select value={field.mapping || ""} onChange={e => set("mapping", e.target.value)} style={inputStyle}>
                {MAPPING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {field.type === "select" && (
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "#555" }}>Opções</label>
                <div className="space-y-1.5">
                  {(field.options || []).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={opt} onChange={e => updateOption(i, e.target.value)}
                        placeholder={`Opção ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
                      <button onClick={() => removeOption(i)} style={{ color: "#999" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                        onMouseLeave={e => e.currentTarget.style.color = "#999"}>
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addOption}
                    className="flex items-center gap-1 text-xs font-medium mt-1"
                    style={{ color: "#C49A00" }}>
                    <Plus style={{ width: 12, height: 12 }} /> Adicionar opção
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default function FieldsList({ fields, onChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addField = (type) => {
    const newField = {
      id: generateId(),
      type,
      label: FIELD_TYPES.find(f => f.type === type)?.label || "Campo",
      placeholder: "",
      required: false,
      options: type === "select" ? ["Opção 1", "Opção 2"] : [],
      order: fields.length,
      mapping: "",
    };
    onChange([...fields, newField]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = fields.findIndex(f => f.id === active.id);
    const newIdx = fields.findIndex(f => f.id === over.id);
    const reordered = arrayMove(fields, oldIdx, newIdx).map((f, i) => ({ ...f, order: i }));
    onChange(reordered);
  };

  const updateField = (updated) => {
    onChange(fields.map(f => f.id === updated.id ? updated : f));
  };

  const removeField = (fieldId) => {
    onChange(fields.filter(f => f.id !== fieldId));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Left panel - types */}
      <div className="lg:col-span-2">
        <GlassCard>
          <h3 className="font-semibold mb-4 text-sm" style={{ color: "#1A1A1A" }}>Adicionar Campo</h3>
          <div className="grid grid-cols-2 gap-2">
            {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
              <button key={type} onClick={() => addField(type)}
                className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.90)", color: "#333" }}
                onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(240,192,0,0.50)"; e.currentTarget.style.background = "rgba(240,192,0,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.90)"; e.currentTarget.style.background = "rgba(255,255,255,0.60)"; }}>
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#F0C000" }} />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Right panel - fields list */}
      <div className="lg:col-span-3">
        <GlassCard>
          <h3 className="font-semibold mb-4 text-sm flex items-center gap-2" style={{ color: "#1A1A1A" }}>
            Campos do formulário
            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(240,192,0,0.12)", color: "#C49A00" }}>
              {fields.length} {fields.length === 1 ? "campo" : "campos"}
            </span>
          </h3>

          {fields.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "#bbb" }}>
              <Type className="w-10 h-10 mx-auto mb-3" style={{ opacity: 0.4 }} />
              <p className="text-sm">Nenhum campo adicionado.<br />Clique em um tipo ao lado para começar.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                {fields.map((field, index) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    index={index}
                    total={fields.length}
                    onChange={updateField}
                    onRemove={removeField}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </GlassCard>
      </div>
    </div>
  );
}