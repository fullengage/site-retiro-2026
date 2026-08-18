const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8');
let url = '', key = '';
env.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function exportToCsv() {
  const { data: legacyRegs, error } = await supabase
    .from('event_registrations')
    .select('*')
    .order('assigned_angel', { ascending: true });

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  const headers = [
    'Anjo Responsável',
    'Nome Completo',
    'WhatsApp / Telefone',
    'Email',
    'Data de Nascimento',
    'Idade',
    'Gênero',
    'Cidade',
    'Paróquia',
    'Contato Emergência',
    'Pernoite (Camping)',
    'Kit / Inscrição',
    'Tamanho Camiseta 1',
    'Tamanho Camiseta 2',
    'Status Pagamento',
    'Valor (R$)',
    'Data de Inscrição'
  ];

  function escapeCsv(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return '"' + str + '"';
  }

  function calculateAge(birthDate) {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return isNaN(age) ? '' : String(age);
  }

  const rows = [headers.map(escapeCsv).join(';')];

  legacyRegs.forEach(r => {
    const age = calculateAge(r.birth_date);
    const createdAtFormatted = r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : '';
    const row = [
      (r.assigned_angel || '').trim() || 'Sem Anjo',
      r.full_name || '',
      r.phone || '',
      r.email || '',
      r.birth_date || '',
      age,
      r.gender || '',
      r.city || '',
      r.parish || '',
      r.emergency_phone || '',
      r.staying_on_site ? 'Sim' : 'Não',
      r.kit_option || '',
      r.tshirt_size || '',
      r.tshirt_size_2 || '',
      r.payment_status || 'Pendente',
      r.payment_amount || '0',
      createdAtFormatted
    ];
    rows.push(row.map(escapeCsv).join(';'));
  });

  // Salvar com BOM UTF-8 para abrir perfeitamente com acentos no Excel
  const bom = '\uFEFF';
  const csvContent = bom + rows.join('\r\n');
  fs.writeFileSync('relatorio_carteira_de_anjos.csv', csvContent, 'utf8');
  console.log('✅ Arquivo relatorio_carteira_de_anjos.csv gerado com sucesso!');
  console.log(`Total de inscritos exportados: ${legacyRegs.length}`);
}

exportToCsv();
