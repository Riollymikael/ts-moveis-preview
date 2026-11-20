export const company = {
  phone: '(48) 99953-0821',
  email: 'tiagosantosmoveisplanejados@gmail.com',
  address: 'Servidão Jovino da Silva, Garopaba – SC',
  whatsapp: 'https://wa.me/5548999530821',
}

export const greeting = company.whatsapp + '?text=' + encodeURIComponent('Olá! Conheci a TS Móveis Planejados pelo site e gostaria de conversar sobre um projeto sob medida.')
export const rooms = [
  { name: 'Cozinha integrada', category: 'Cozinhas', image: 'cozinha-integrada', detail: 'A ilha aproxima a bancada de preparo de quem se senta para conversar. A madeira acompanha o ambiente até a passagem lateral.' },
  { name: 'Closet com portas de vidro', category: 'Closets', image: 'closet-vidro', detail: 'Os perfis finos emolduram as roupas. A luz das prateleiras permite enxergar o interior mesmo com as portas fechadas.' },
  { name: 'Sala com painel contínuo', category: 'Salas', image: 'sala-painel', detail: 'O painel acompanha toda a parede. O móvel suspenso deixa o piso livre e destaca o desenho dos veios.' },
  { name: 'Cozinha com ilha', category: 'Cozinhas', image: 'cozinha-ilha', detail: 'As frentes alinhadas dão continuidade à parede. A bancada central deixa passagem para a área de estar.' },
  { name: 'Sala em madeira', category: 'Salas', image: 'sala-madeira', detail: 'Faixas ripadas enquadram a televisão e o aparador. A iluminação indireta desenha o contorno do painel.' },
  { name: 'Closet com ilha', category: 'Closets', image: 'closet-ilha', detail: 'A ilha central reúne pequenos objetos. Espelhos, portas de vidro e nichos iluminados ampliam a percepção do espaço.' },
  { name: 'Sala com painel ripado', category: 'Salas', image: 'sala-ripada', detail: 'O ritmo vertical do ripado encontra a linha horizontal do rack. O nicho iluminado abre espaço para livros e objetos.' },
  { name: 'Closet iluminado', category: 'Closets', image: 'closet-boutique', detail: 'Prateleiras iluminadas e cabideiros organizam as duas laterais, com uma passagem livre no centro.' },
  { name: 'Cozinha de linhas curvas', category: 'Cozinhas', image: 'cozinha-curvas', detail: 'Cantos arredondados conduzem o olhar pela ilha. Nichos com luz quente se alternam com portas fechadas.' },
  { name: 'Cozinha gourmet', category: 'Cozinhas', image: 'cozinha-gourmet', detail: 'A mesa se prolonga a partir da ilha e convida a sentar. Ao fundo, o vidro canelado filtra a vista dos armários.' },
]
export const photo = (stem: string) => './images/' + stem + '.jpg'
export const processSteps = [
  ['Atendimento', 'Conversamos sobre o seu espaço, a rotina da casa e o que você gostaria de mudar.'],
  ['Projeto', 'O desenho em 3D permite avaliar a distribuição dos móveis, os acabamentos e a circulação.'],
  ['Produção', 'Com o projeto aprovado e as medidas conferidas, as peças seguem para a nossa fábrica.'],
  ['Instalação', 'A equipe monta os módulos no local e ajusta portas, gavetas e ferragens.'],
  ['Entrega', 'Conferimos os acabamentos e o funcionamento dos móveis com você.'],
]
export const faq = [
  ['Como funciona o orçamento?', 'Após o primeiro contato, agendamos uma conversa para entender suas necessidades. Em seguida, elaboramos um pré-projeto e um orçamento detalhado, sem compromisso.'],
  ['Qual é o prazo médio de entrega?', 'O prazo padrão é de 45 a 60 dias úteis após a aprovação final e a medição no local. A complexidade do projeto e os materiais escolhidos podem alterar esse prazo.'],
  ['Vocês atendem fora de Garopaba?', 'Sim. Atendemos em Santa Catarina e avaliamos projetos em outros estados sob consulta.'],
  ['Trabalham em parceria com arquitetos?', 'Sim. A TS tem um canal de atendimento dedicado a escritórios de arquitetura. Entre em contato para conversar sobre seu projeto.'],
  ['Posso personalizar os acabamentos?', 'Sim. A escolha de acabamentos, cores e divisões faz parte do desenvolvimento do seu projeto sob medida.'],
  ['Quais são as etapas de fabricação?', 'A fabricação começa após a aprovação do desenho e a conferência das medidas. As peças passam por corte, acabamento e inspeção antes da instalação.'],
  ['Como solicitar um projeto?', 'Use o formulário de orçamento para escolher o ambiente e contar a sua ideia. Você poderá revisar a mensagem no WhatsApp antes de enviá-la.'],
]
