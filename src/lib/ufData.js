export const UF_LIST = [
  { uf: "AC", label: "AC — Acre" },
  { uf: "AL", label: "AL — Alagoas" },
  { uf: "AP", label: "AP — Amapá" },
  { uf: "AM", label: "AM — Amazonas" },
  { uf: "BA", label: "BA — Bahia" },
  { uf: "CE", label: "CE — Ceará" },
  { uf: "DF", label: "DF — Distrito Federal" },
  { uf: "ES", label: "ES — Espírito Santo" },
  { uf: "GO", label: "GO — Goiás" },
  { uf: "MA", label: "MA — Maranhão" },
  { uf: "MT", label: "MT — Mato Grosso" },
  { uf: "MS", label: "MS — Mato Grosso do Sul" },
  { uf: "MG", label: "MG — Minas Gerais" },
  { uf: "PA", label: "PA — Pará" },
  { uf: "PB", label: "PB — Paraíba" },
  { uf: "PR", label: "PR — Paraná" },
  { uf: "PE", label: "PE — Pernambuco" },
  { uf: "PI", label: "PI — Piauí" },
  { uf: "RJ", label: "RJ — Rio de Janeiro" },
  { uf: "RN", label: "RN — Rio Grande do Norte" },
  { uf: "RS", label: "RS — Rio Grande do Sul" },
  { uf: "RO", label: "RO — Rondônia" },
  { uf: "RR", label: "RR — Roraima" },
  { uf: "SC", label: "SC — Santa Catarina" },
  { uf: "SP", label: "SP — São Paulo" },
  { uf: "SE", label: "SE — Sergipe" },
  { uf: "TO", label: "TO — Tocantins" },
];

export const UF_TO_REGION = {
  AC: "norte", AM: "norte", AP: "norte", PA: "norte", RO: "norte", RR: "norte", TO: "norte",
  AL: "nordeste", BA: "nordeste", CE: "nordeste", MA: "nordeste", PB: "nordeste",
  PE: "nordeste", PI: "nordeste", RN: "nordeste", SE: "nordeste",
  DF: "centro_oeste", GO: "centro_oeste", MS: "centro_oeste", MT: "centro_oeste",
  ES: "sudeste", MG: "sudeste", RJ: "sudeste", SP: "sudeste",
  PR: "sul", RS: "sul", SC: "sul",
};

export const REGIAO_LABELS = {
  norte: "Norte",
  nordeste: "Nordeste",
  centro_oeste: "Centro-Oeste",
  sudeste: "Sudeste",
  sul: "Sul",
};

export const STATUS_CONFIG = {
  lead_email:        { label: "Lead Email",        bg: "#EFF6FF", color: "#3B82F6" },
  lead_telefone:     { label: "Lead Telefone",     bg: "#F0FDF4", color: "#22C55E" },
  em_contato:        { label: "Em Contato",        bg: "rgba(240,192,0,0.10)", color: "#C49A00" },
  reuniao_agendada:  { label: "Reunião Agendada",  bg: "#F3E8FF", color: "#9333EA" },
  proposta_enviada:  { label: "Proposta Enviada",  bg: "#FEF3C7", color: "#D97706" },
  cliente_ativo:     { label: "Cliente Ativo",     bg: "#F0FDF4", color: "#22C55E" },
  inativo:           { label: "Inativo",           bg: "#F3F4F6", color: "#6B7280" },
};

export const STATUS_LIST = Object.entries(STATUS_CONFIG).map(([key, val]) => ({ key, ...val }));