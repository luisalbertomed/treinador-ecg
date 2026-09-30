/* Casos fictícios v3.13. Fonte editorial: scripts/conteudo/novos-casos-v3.13.py. */
Object.assign(CASE_SOURCES,{
  "ukka": {
    "name": "Hipercalemia em adultos · UK Kidney Association 2023",
    "url": "https://guidelines.ukkidney.org/hyperkalaemia/"
  },
  "chestpain": {
    "name": "Dor torácica na emergência · consenso ACC 2022, tabela 1",
    "url": "https://www.jacc.org/doi/10.1016/j.jacc.2022.08.750"
  },
  "wellens": {
    "name": "Wellens · síntese educacional ACC 2023",
    "url": "https://www.acc.org/latest-in-cardiology/ten-points-to-remember/2023/01/20/17/59/wellens-syndrome"
  },
  "pericardio": {
    "name": "Miocardite e pericardite · ESC 2025",
    "url": "https://academic.oup.com/eurheartj/article/46/40/3952/8234483"
  },
  "brugada2022": {
    "name": "Arritmias ventriculares e morte súbita · ESC 2022, seção Brugada",
    "url": "https://academic.oup.com/eurheartj/article/43/40/3997/6675633"
  },
  "tep2026": {
    "name": "Embolia pulmonar aguda · AHA/ACC multissociedades 2026",
    "url": "https://www.jacc.org/doi/10.1016/j.jacc.2025.11.005"
  }
});
CLINICAL_CASES.push(...[
  {
    "id": "iam_bav_313",
    "track": "bradi",
    "title": "Dor no peito e pulso que desacelera",
    "level": "Intermediário",
    "pattern": "iam_inferior",
    "patient": "Homem, 64 anos, com dor torácica opressiva há 40 minutos e sudorese. Está em hospital com hemodinâmica disponível. Não usa betabloqueador; sem sangramento ativo. Caso fictício: acompanhe a mudança do ritmo durante um infarto inferior.",
    "sources": [
      "acs",
      "als"
    ],
    "steps": [
      {
        "kind": "Chegada",
        "points": 20,
        "prompt": "Qual é a prioridade na chegada?",
        "options": [
          {
            "text": "Monitorizar, obter acesso venoso e ECG imediato; avaliar perfusão",
            "why": "A dor típica exige avaliação rápida e vigilância do ritmo.",
            "ok": true
          },
          {
            "text": "Aguardar a primeira troponina para registrar o ECG",
            "why": "O resultado laboratorial não deve atrasar o traçado."
          },
          {
            "text": "Liberar após analgésico se a dor diminuir",
            "why": "A resposta à analgesia não exclui isquemia."
          },
          {
            "text": "Administrar betabloqueador antes de medir a frequência",
            "why": "A frequência já está baixa e pode cair ainda mais."
          }
        ],
        "noECG": true,
        "vitals": "PA 112/70 mmHg · FC 58 bpm · SpO₂ 96%"
      },
      {
        "kind": "ECG inicial",
        "points": 20,
        "prompt": "Qual interpretação combina com este primeiro traçado?",
        "options": [
          {
            "text": "IAM com supra inferior e alterações recíprocas em DI/aVL",
            "why": "O supra é regional e acompanha dor típica.",
            "ok": true
          },
          {
            "text": "Pericardite como diagnóstico definitivo apenas pela presença de supra",
            "why": "A distribuição regional e o contexto exigem considerar infarto."
          },
          {
            "text": "BAV total já demonstrado no primeiro ECG",
            "why": "Neste traçado inicial ainda há condução atrioventricular."
          },
          {
            "text": "ECG normal porque a frequência está abaixo de 60",
            "why": "A frequência não explica os desvios do segmento ST."
          }
        ],
        "minutes": 5
      },
      {
        "kind": "Mudança do ritmo",
        "points": 20,
        "prompt": "Agora observe a tira de ritmo. O que aconteceu?",
        "options": [
          {
            "text": "BAV total, com ondas P e QRS dissociados",
            "why": "As atividades atrial e ventricular seguem ritmos independentes.",
            "ok": true
          },
          {
            "text": "Bradicardia sinusal com condução 1:1",
            "why": "Não há uma onda P conduzida antes de cada QRS."
          },
          {
            "text": "Fibrilação atrial com resposta lenta",
            "why": "Há atividade atrial organizada; o escape é regular."
          },
          {
            "text": "Taquicardia ventricular sustentada",
            "why": "O ritmo ventricular é lento, não taquicárdico."
          }
        ],
        "pattern": "bavt",
        "minutes": 3,
        "context": "O paciente torna-se confuso e hipotenso. Esta tira destaca o bloqueio que surgiu; o IAM foi identificado no ECG anterior.",
        "vitals": "PA 76/44 mmHg · FC ventricular ≈ 37 bpm · SpO₂ 95%"
      },
      {
        "kind": "Estabilização",
        "points": 20,
        "prompt": "Quais ações pertencem ao atendimento imediato?",
        "options": [
          {
            "text": "Tratar a bradicardia sintomática e preparar estimulação temporária",
            "why": "Atropina pode ser tentada; se ineficaz, estimulação e/ou infusão cronotrópica, sem atrasar suporte no bloqueio instável.",
            "ok": true
          },
          {
            "text": "Acionar reperfusão e investigar causas reversíveis em paralelo",
            "why": "Estabilizar o ritmo não trata a artéria ocluída.",
            "ok": true
          },
          {
            "text": "Dar metoprolol para reduzir a demanda cardíaca",
            "why": "No bloqueio com choque, pode agravar a perfusão.",
            "bad": true
          },
          {
            "text": "Aplicar cardioversão sincronizada no escape lento",
            "why": "Não é uma taquiarritmia para cardioversão.",
            "bad": true
          }
        ],
        "multi": true,
        "pattern": "bavt"
      },
      {
        "kind": "Evolução",
        "points": 20,
        "prompt": "Após reperfusão e suporte, há recuperação da condução. Como prosseguir?",
        "options": [
          {
            "text": "Manter monitorização e reavaliar o bloqueio antes de decidir por dispositivo definitivo",
            "why": "Um componente reversível pode melhorar após tratar a isquemia; a decisão é especializada.",
            "ok": true
          },
          {
            "text": "Dar alta imediata porque o ritmo normalizou",
            "why": "O infarto recente e o bloqueio exigem observação hospitalar."
          },
          {
            "text": "Indicar dispositivo definitivo automaticamente, sem reavaliar",
            "why": "É preciso considerar reversibilidade e persistência do bloqueio."
          },
          {
            "text": "Encerrar o tratamento do infarto ao melhorar a frequência",
            "why": "A recuperação do ritmo não encerra o cuidado coronariano."
          }
        ],
        "pattern": "sinusal",
        "vitals": "PA 112/68 mmHg · FC ≈ 72 bpm · paciente desperto",
        "context": "Evolução didática: a equipe realizou reperfusão e o bloqueio regrediu. O novo traçado ilustra a condução sinusal recuperada, não todos os achados residuais do infarto."
      }
    ],
    "sourceNote": "Conteúdo de ensino conferido em fontes indicadas; revisão independente por especialista pendente. Consulte o LEIA-ME-v3.13 para os limites da conferência."
  },
  {
    "id": "hiperk_313",
    "track": "outros",
    "title": "Fraqueza após faltar à hemodiálise",
    "level": "Intermediário",
    "pattern": "hipercalemia",
    "patient": "Mulher, 59 anos, em hemodiálise, perdeu duas sessões. Chega com fraqueza e náuseas. Sem sangramento ou intoxicação digitálica conhecida. O caso distingue proteção cardíaca, deslocamento do potássio e sua remoção.",
    "sources": [
      "ukka"
    ],
    "steps": [
      {
        "kind": "Chegada",
        "points": 20,
        "prompt": "Qual avaliação inicial é mais apropriada?",
        "options": [
          {
            "text": "Monitorizar, obter ECG e dosar potássio e glicemia com urgência",
            "why": "O contexto torna a alteração eletrolítica uma prioridade.",
            "ok": true
          },
          {
            "text": "Tratar como cansaço e agendar exames ambulatoriais",
            "why": "Duas sessões perdidas e sintomas exigem avaliação imediata."
          },
          {
            "text": "Repor potássio empiricamente pela fraqueza",
            "why": "Fraqueza não distingue falta de excesso de potássio."
          },
          {
            "text": "Aguardar a próxima sessão programada sem ECG",
            "why": "Há risco de deterioração antes da sessão."
          }
        ],
        "noECG": true,
        "vitals": "PA 108/66 mmHg · FC ≈ 66 bpm · SpO₂ 96%"
      },
      {
        "kind": "ECG e laboratório",
        "points": 20,
        "prompt": "Qual é a interpretação integrada?",
        "options": [
          {
            "text": "Hipercalemia grave com repercussão eletrocardiográfica",
            "why": "Potássio elevado acompanha T apiculada, P pequena e QRS largo.",
            "ok": true
          },
          {
            "text": "Hipocalemia com ondas U predominantes",
            "why": "O potássio medido está alto e a morfologia não é de onda U."
          },
          {
            "text": "IAM anterior confirmado exclusivamente pelas ondas T",
            "why": "Há alteração difusa e distúrbio eletrolítico importante."
          },
          {
            "text": "Bloqueio de ramo isolado sem relação com o potássio",
            "why": "O contexto não permite ignorar a hipercalemia."
          }
        ],
        "context": "Potássio em amostra não hemolisada: 7,2 mmol/L. Glicemia: 164 mg/dL."
      },
      {
        "kind": "Proteção cardíaca",
        "points": 20,
        "prompt": "Qual intervenção protege o coração enquanto se reduz o potássio?",
        "options": [
          {
            "text": "Cálcio intravenoso com monitorização eletrocardiográfica",
            "why": "Protege a membrana; não remove potássio do organismo.",
            "ok": true
          },
          {
            "text": "Apenas restrição alimentar e retorno em uma semana",
            "why": "A mudança alimentar não trata esta emergência."
          },
          {
            "text": "Apenas glicose, sem outras medidas",
            "why": "Glicose isolada não substitui a proteção cardíaca."
          },
          {
            "text": "Cardioversão sincronizada pelo QRS largo, apesar do ritmo lento",
            "why": "O alargamento aqui decorre do distúrbio metabólico."
          }
        ]
      },
      {
        "kind": "Redução do potássio",
        "points": 20,
        "prompt": "Selecione as medidas indicadas para esta paciente.",
        "options": [
          {
            "text": "Insulina regular com glicose e controle seriado da glicemia",
            "why": "Desloca potássio para as células; vigiar hipoglicemia.",
            "ok": true
          },
          {
            "text": "Acionar hemodiálise urgente",
            "why": "A paciente dialítica precisa de remoção efetiva do potássio.",
            "ok": true
          },
          {
            "text": "Suspender monitorização após administrar cálcio",
            "why": "O efeito protetor não garante correção do potássio.",
            "bad": true
          },
          {
            "text": "Administrar suplemento de potássio",
            "why": "Agrava o distúrbio documentado.",
            "bad": true
          }
        ],
        "multi": true
      },
      {
        "kind": "Reavaliação",
        "points": 20,
        "prompt": "O QRS estreitou após cálcio. Qual conclusão é correta?",
        "options": [
          {
            "text": "Continuar controle de potássio e glicemia e providenciar remoção do potássio",
            "why": "Melhora do ECG não prova normalização laboratorial.",
            "ok": true
          },
          {
            "text": "Cancelar a diálise porque o ECG melhorou",
            "why": "O potássio pode continuar perigosamente alto."
          },
          {
            "text": "Dar alta sem repetir exames",
            "why": "Há risco de persistência ou recorrência do distúrbio."
          },
          {
            "text": "Repor potássio preventivamente sem nova dosagem",
            "why": "Não se presume hipocalemia após tratamento inicial."
          }
        ],
        "noECG": true,
        "context": "O monitor mostra estreitamento do QRS após a proteção cardíaca. A diálise ainda está sendo preparada; não há nova dosagem de potássio disponível."
      }
    ],
    "sourceNote": "Conteúdo de ensino conferido em fontes indicadas; revisão independente por especialista pendente. Consulte o LEIA-ME-v3.13 para os limites da conferência."
  },
  {
    "id": "fa_instavel_313",
    "track": "taqui",
    "title": "Palpitações com queda da pressão",
    "level": "Intermediário",
    "pattern": "fa",
    "patient": "Mulher, 72 anos, com palpitações de início abrupto e dispneia. A deterioração acompanha o início do ritmo rápido; não há febre, sangramento ou outro sinal evidente de choque não arrítmico. Duração total da FA e anticoagulação prévia são desconhecidas.",
    "sources": [
      "als"
    ],
    "steps": [
      {
        "kind": "Chegada",
        "points": 20,
        "prompt": "A paciente está confusa, fria e com pulso. Qual é a prioridade?",
        "options": [
          {
            "text": "Monitorizar e preparar tratamento imediato da arritmia, avaliando perfusão",
            "why": "O comprometimento circulatório exige resposta rápida.",
            "ok": true
          },
          {
            "text": "Aguardar ecocardiograma eletivo antes da monitorização",
            "why": "A paciente já tem sinais de instabilidade."
          },
          {
            "text": "Iniciar compressões apesar de pulso presente",
            "why": "Neste cenário ainda há circulação espontânea."
          },
          {
            "text": "Dar alta com medicação oral para palpitações",
            "why": "Confusão e hipotensão impedem manejo ambulatorial."
          }
        ],
        "noECG": true,
        "vitals": "PA 74/46 mmHg · FC irregular ≈ 165 bpm · SpO₂ 92%"
      },
      {
        "kind": "ECG",
        "points": 20,
        "prompt": "Qual ritmo aparece no traçado?",
        "options": [
          {
            "text": "Fibrilação atrial com resposta ventricular rápida",
            "why": "RR irregular e ausência de P organizada sustentam o diagnóstico.",
            "ok": true
          },
          {
            "text": "Taquicardia sinusal regular",
            "why": "Os intervalos RR não são regulares e não há P sinusal definida."
          },
          {
            "text": "Flutter com condução fixa 2:1",
            "why": "Não há resposta ventricular regular com essa relação fixa."
          },
          {
            "text": "Taquicardia ventricular monomórfica regular",
            "why": "O QRS é estreito e os intervalos são irregulares."
          }
        ]
      },
      {
        "kind": "Decisão urgente",
        "points": 20,
        "prompt": "A instabilidade é atribuída à FA. Qual tratamento é prioritário?",
        "options": [
          {
            "text": "Cardioversão elétrica sincronizada imediata",
            "why": "Não adiar o choque necessário para aguardar anticoagulação prévia ou ecocardiograma.",
            "ok": true
          },
          {
            "text": "Aguardar três semanas de anticoagulação antes de intervir",
            "why": "Essa espera é incompatível com a instabilidade atual."
          },
          {
            "text": "Usar apenas diltiazem intravenoso e aguardar a pressão subir",
            "why": "Pode agravar a hipotensão e adia a terapia prioritária."
          },
          {
            "text": "Usar adenosina como tratamento definitivo da FA",
            "why": "Não é a estratégia de reversão da FA instável."
          }
        ]
      },
      {
        "kind": "Preparação do choque",
        "points": 20,
        "prompt": "Quais cuidados pertencem ao procedimento?",
        "options": [
          {
            "text": "Confirmar sincronização sobre os QRS e preparar choque bifásico inicial de pelo menos 200 J",
            "why": "AHA 2025 recomenda energia inicial de pelo menos 200 J para FA, ajustada ao aparelho.",
            "ok": true
          },
          {
            "text": "Preparar sedação se viável, sem atrasar a cardioversão urgente",
            "why": "Considerar consciência, via aérea e estado circulatório.",
            "ok": true
          },
          {
            "text": "Desligar a sincronização para o primeiro choque, embora o aparelho sincronize adequadamente",
            "why": "Com pulso e sincronização disponível, usar cardioversão sincronizada.",
            "bad": true
          },
          {
            "text": "Retardar o procedimento para completar investigação ambulatorial",
            "why": "A estabilização tem prioridade.",
            "bad": true
          }
        ],
        "multi": true
      },
      {
        "kind": "Após cardioversão",
        "points": 20,
        "prompt": "Nesta evolução, o ritmo sinusal e a pressão se recuperaram. E agora?",
        "options": [
          {
            "text": "Monitorizar, investigar causas e avaliar anticoagulação e risco tromboembólico",
            "why": "Reversão do ritmo não elimina a necessidade de avaliação posterior.",
            "ok": true
          },
          {
            "text": "Considerar que a reversão elimina qualquer risco de embolia",
            "why": "O risco não desaparece com o ECG sinusal."
          },
          {
            "text": "Repetir choques no ritmo sinusal estável para evitar recorrência",
            "why": "Não há indicação de choques preventivos."
          },
          {
            "text": "Dar alta sem avaliar duração da FA ou comorbidades",
            "why": "A instabilidade recente exige investigação e planejamento."
          }
        ],
        "pattern": "sinusal",
        "vitals": "PA 116/72 mmHg · FC ≈ 72 bpm · paciente desperta",
        "context": "Evolução simulada após cardioversão bem-sucedida."
      }
    ],
    "sourceNote": "Conteúdo de ensino conferido em fontes indicadas; revisão independente por especialista pendente. Consulte o LEIA-ME-v3.13 para os limites da conferência.",
    "ventricularRate": 165
  },
  {
    "id": "wellens_313",
    "track": "isquemia",
    "title": "A dor passou, mas o ECG preocupa",
    "level": "Intermediário",
    "pattern": "wellens_a",
    "patient": "Homem, 56 anos, tabagista, relata dor opressiva em repouso há uma hora. A dor cessou antes da chegada. Sem uso de cocaína. O objetivo é reconhecer um padrão de risco mesmo sem dor atual.",
    "sources": [
      "chestpain",
      "wellens"
    ],
    "steps": [
      {
        "kind": "Chegada",
        "points": 20,
        "prompt": "Como avaliar a dor que já cessou?",
        "options": [
          {
            "text": "Registrar ECG e iniciar avaliação de síndrome coronariana aguda",
            "why": "A ausência atual de dor não descarta isquemia.",
            "ok": true
          },
          {
            "text": "Dispensar o ECG porque está assintomático",
            "why": "O padrão pode estar mais evidente fora da dor."
          },
          {
            "text": "Encaminhar diretamente para teste ergométrico",
            "why": "Antes é necessário excluir uma síndrome coronariana de risco."
          },
          {
            "text": "Confirmar refluxo apenas porque a dor cessou",
            "why": "Melhora espontânea não define a origem da dor."
          }
        ],
        "noECG": true,
        "vitals": "PA 128/78 mmHg · FC ≈ 68 bpm · SpO₂ 97%"
      },
      {
        "kind": "ECG",
        "points": 20,
        "prompt": "Como interpretar as ondas T nas precordiais?",
        "options": [
          {
            "text": "Padrão de Wellens tipo A no contexto de dor anginosa recente",
            "why": "T bifásica em V2–V3, fora da dor, é um sinal de alerta.",
            "ok": true
          },
          {
            "text": "ECG normal por não haver supra clássico",
            "why": "Há alteração relevante da onda T."
          },
          {
            "text": "Hipercalemia confirmada por T estreita e apiculada difusa",
            "why": "O traçado mostra T bifásica anterior, não esse padrão difuso."
          },
          {
            "text": "Pericardite comprovada por infra difuso de PR",
            "why": "Não é o achado que predomina aqui."
          }
        ]
      },
      {
        "kind": "Estratificação",
        "points": 20,
        "prompt": "A primeira troponina é normal. Qual estratégia é adequada?",
        "options": [
          {
            "text": "Internação e avaliação cardiológica urgente para investigação coronária invasiva",
            "why": "Uma troponina inicial normal não neutraliza o padrão de risco.",
            "ok": true
          },
          {
            "text": "Alta por troponina normal com ECG de risco ignorado",
            "why": "Um único resultado não exclui o problema."
          },
          {
            "text": "Teste de esforço para reproduzir a dor",
            "why": "A provocação pode precipitar complicações nesse cenário."
          },
          {
            "text": "Fibrinólise automática sem avaliar o contexto e a anatomia",
            "why": "Esse padrão fora da dor não é indicação automática de fibrinolítico."
          }
        ]
      },
      {
        "kind": "Cuidados enquanto aguarda",
        "points": 20,
        "prompt": "Selecione as medidas apropriadas.",
        "options": [
          {
            "text": "Manter monitorização e repetir ECG se os sintomas mudarem",
            "why": "É importante reconhecer evolução dinâmica.",
            "ok": true
          },
          {
            "text": "Evitar teste de estresse nesta fase",
            "why": "A investigação deve seguir a via de síndrome coronariana de risco.",
            "ok": true
          },
          {
            "text": "Liberar para exercício intenso para testar tolerância",
            "why": "O esforço pode provocar isquemia.",
            "bad": true
          },
          {
            "text": "Encerrar a investigação com base na primeira troponina",
            "why": "Não afasta o diagnóstico.",
            "bad": true
          }
        ],
        "multi": true
      },
      {
        "kind": "Evolução",
        "points": 20,
        "prompt": "Surge dor recorrente com novo supra anterior. Qual decisão?",
        "options": [
          {
            "text": "Acionar a equipe de reperfusão imediatamente",
            "why": "A evolução agora indica oclusão coronária em curso.",
            "ok": true
          },
          {
            "text": "Manter apenas a programação ambulatorial",
            "why": "O quadro mudou e exige resposta urgente."
          },
          {
            "text": "Esperar a terceira troponina antes de chamar a equipe",
            "why": "A evolução clínica e eletrocardiográfica já é decisiva."
          },
          {
            "text": "Realizar teste ergométrico para confirmar o novo supra",
            "why": "Não se provoca esforço em provável infarto agudo."
          }
        ],
        "pattern": "iam_anterior",
        "vitals": "PA 112/70 mmHg · FC ≈ 96 bpm · SpO₂ 96%",
        "context": "Evolução fictícia: enquanto aguarda avaliação, a dor retorna e um novo ECG mostra supra anterior. O traçado anterior era o padrão de Wellens."
      }
    ],
    "sourceNote": "Conteúdo de ensino conferido em fontes indicadas; revisão independente por especialista pendente. Consulte o LEIA-ME-v3.13 para os limites da conferência."
  },
  {
    "id": "dewinter_313",
    "track": "isquemia",
    "title": "Dor persistente sem supra clássico",
    "level": "Intermediário",
    "pattern": "dewinter",
    "patient": "Homem, 51 anos, com dor opressiva e sudorese há 35 minutos. Potássio 4,3 mmol/L. Hospital com hemodinâmica disponível. O objetivo é identificar uma apresentação de oclusão coronária sem o supra precordial clássico.",
    "sources": [
      "chestpain",
      "acs"
    ],
    "steps": [
      {
        "kind": "Chegada",
        "points": 20,
        "prompt": "Qual é a primeira abordagem?",
        "options": [
          {
            "text": "Monitorizar e registrar ECG em até 10 minutos",
            "why": "O ECG precoce orienta a estratégia na dor suspeita.",
            "ok": true
          },
          {
            "text": "Esperar resolução espontânea por uma hora",
            "why": "Há sintomas sugestivos de isquemia em curso."
          },
          {
            "text": "Dar alta por idade inferior a 60 anos",
            "why": "A idade não exclui uma emergência coronariana."
          },
          {
            "text": "Solicitar apenas radiografia e dispensar o ECG",
            "why": "A radiografia não identifica este padrão elétrico."
          }
        ],
        "noECG": true,
        "vitals": "PA 132/80 mmHg · FC ≈ 82 bpm · SpO₂ 97%"
      },
      {
        "kind": "ECG",
        "points": 20,
        "prompt": "Que padrão deve ser reconhecido?",
        "options": [
          {
            "text": "Padrão de De Winter: infra ascendente de ST precordial com T altas e simétricas",
            "why": "Esse conjunto em dor persistente sugere oclusão coronária.",
            "ok": true
          },
          {
            "text": "ECG benigno porque não há supra precordial clássico",
            "why": "Há padrões de oclusão sem o supra habitual."
          },
          {
            "text": "Hipercalemia grave confirmada pelo laboratório",
            "why": "O potássio informado é normal."
          },
          {
            "text": "Wellens fora da dor com T bifásicas anteriores",
            "why": "Há dor persistente e outra morfologia de ST–T."
          }
        ]
      },
      {
        "kind": "Estratégia",
        "points": 20,
        "prompt": "Qual é a decisão neste hospital?",
        "options": [
          {
            "text": "Acionar hemodinâmica para angiografia emergente e reperfusão conforme o achado",
            "why": "De Winter é um padrão de oclusão que exige avaliação imediata.",
            "ok": true
          },
          {
            "text": "Aguardar supra clássico para acionar a equipe",
            "why": "A espera pode atrasar reperfusão."
          },
          {
            "text": "Marcar teste de esforço após analgesia",
            "why": "O quadro é agudo e de alto risco."
          },
          {
            "text": "Aguardar troponinas seriadas antes de decidir qualquer conduta",
            "why": "O padrão com dor persistente já exige ação."
          }
        ]
      },
      {
        "kind": "Preparação",
        "points": 20,
        "prompt": "Selecione os cuidados que acompanham o acionamento da hemodinâmica.",
        "options": [
          {
            "text": "Manter monitorização e acesso venoso",
            "why": "Permite vigilância e tratamento de complicações.",
            "ok": true
          },
          {
            "text": "Iniciar protocolo de SCA com avaliação de alergias e risco hemorrágico",
            "why": "A terapia antitrombótica deve considerar o contexto individual.",
            "ok": true
          },
          {
            "text": "Prescrever reposição de potássio apesar de valor normal",
            "why": "Não há indicação de reposição neste caso.",
            "bad": true
          },
          {
            "text": "Aguardar a dor passar antes de transferir à sala",
            "why": "A reperfusão não depende da melhora com analgesia.",
            "bad": true
          }
        ],
        "multi": true
      },
      {
        "kind": "Evolução",
        "points": 20,
        "prompt": "A angiografia mostra oclusão coronária e a equipe realiza angioplastia. O que o caso ensina?",
        "options": [
          {
            "text": "Ausência de supra clássico não exclui oclusão que necessita tratamento urgente",
            "why": "Interpretação do ECG deve considerar padrões equivalentes e sintomas.",
            "ok": true
          },
          {
            "text": "Todo infra de ST é um quadro ambulatorial",
            "why": "A morfologia e o contexto mudam a prioridade."
          },
          {
            "text": "Troponina é o único critério para acionar hemodinâmica",
            "why": "O ECG e a apresentação clínica podem ser decisivos."
          },
          {
            "text": "Ondas T altas significam sempre hipercalemia",
            "why": "O diagnóstico depende do conjunto de achados."
          }
        ],
        "noECG": true,
        "context": "Após a intervenção, a dor diminui. Não se apresenta ECG pós-procedimento neste exercício."
      }
    ],
    "sourceNote": "Conteúdo de ensino conferido em fontes indicadas; revisão independente por especialista pendente. Consulte o LEIA-ME-v3.13 para os limites da conferência."
  },
  {
    "id": "pericardite_313",
    "track": "outros",
    "title": "Dor que muda com a posição",
    "level": "Intermediário",
    "pattern": "pericardite",
    "patient": "Mulher, 32 anos, relata dor torácica que piora ao inspirar e deitar e melhora ao sentar inclinada para a frente, após síndrome viral. Não está grávida, não usa anticoagulante e não tem doença renal conhecida.",
    "sources": [
      "pericardio"
    ],
    "steps": [
      {
        "kind": "Chegada",
        "points": 20,
        "prompt": "Como iniciar a avaliação?",
        "options": [
          {
            "text": "Avaliar sinais vitais, obter ECG e investigar causas de dor torácica",
            "why": "Dor posicional sugere uma hipótese, mas não dispensa avaliação.",
            "ok": true
          },
          {
            "text": "Concluir ansiedade sem exame físico",
            "why": "Há dor torácica que precisa ser investigada."
          },
          {
            "text": "Indicar fibrinólise antes de registrar o ECG",
            "why": "Falta estabelecer o diagnóstico e a indicação."
          },
          {
            "text": "Liberar exclusivamente pela idade jovem",
            "why": "Idade não exclui doença cardíaca."
          }
        ],
        "noECG": true,
        "vitals": "PA 118/72 mmHg · FC ≈ 98 bpm · SpO₂ 98% · temperatura 37,4 °C"
      },
      {
        "kind": "ECG",
        "points": 20,
        "prompt": "Qual hipótese é favorecida pelo conjunto?",
        "options": [
          {
            "text": "Pericardite, com supra difuso e depressão do PR",
            "why": "A distribuição e a dor posicional sustentam essa hipótese.",
            "ok": true
          },
          {
            "text": "IAM inferior definido por supra restrito a DII, DIII e aVF",
            "why": "O supra neste traçado é mais disseminado."
          },
          {
            "text": "ECG normal sem alterações de repolarização",
            "why": "Há alterações de ST e PR."
          },
          {
            "text": "Brugada tipo 1 por alteração isolada de V1–V2",
            "why": "O padrão aqui é difuso."
          }
        ]
      },
      {
        "kind": "Avaliação complementar",
        "points": 20,
        "prompt": "Que avaliação ajuda a definir extensão e risco?",
        "options": [
          {
            "text": "Ecocardiograma, marcadores inflamatórios e troponina, com avaliação clínica",
            "why": "Investiga derrame e possível envolvimento miocárdico.",
            "ok": true
          },
          {
            "text": "Excluir infarto apenas pela concavidade do ST",
            "why": "A morfologia isolada não exclui isquemia."
          },
          {
            "text": "Dispensar exames porque não há hipotensão",
            "why": "Estabilidade não dispensa avaliação de extensão."
          },
          {
            "text": "Fazer teste de esforço na fase dolorosa",
            "why": "Não é a investigação inicial apropriada."
          }
        ]
      },
      {
        "kind": "Tratamento inicial",
        "points": 20,
        "prompt": "Após avaliação, há pericardite sem derrame importante ou lesão miocárdica, função renal normal e sem contraindicações. Selecione o plano.",
        "options": [
          {
            "text": "AAS ou anti-inflamatório associado a colchicina, ajustados ao paciente",
            "why": "É a base do tratamento da pericardite não complicada.",
            "ok": true
          },
          {
            "text": "Restringir exercício durante a atividade da doença e programar reavaliação",
            "why": "O retorno depende da recuperação clínica.",
            "ok": true
          },
          {
            "text": "Fibrinólise apenas pelo supra difuso",
            "why": "Pericardite não é indicação de fibrinolítico.",
            "bad": true
          },
          {
            "text": "Autorizar atividade intensa enquanto persiste dor",
            "why": "A fase ativa requer restrição de esforço.",
            "bad": true
          }
        ],
        "multi": true
      },
      {
        "kind": "Sinal de alerta",
        "points": 20,
        "prompt": "Na reavaliação, apresenta febre de 38,8 °C. Qual é a conduta?",
        "options": [
          {
            "text": "Reavaliar no hospital e investigar a causa e complicações",
            "why": "Febre acima de 38 °C é um sinal de risco na pericardite.",
            "ok": true
          },
          {
            "text": "Manter seguimento distante sem reavaliar",
            "why": "O novo sinal altera a estratificação."
          },
          {
            "text": "Suspender toda investigação porque o primeiro eco era normal",
            "why": "O quadro pode evoluir após o exame inicial."
          },
          {
            "text": "Tratar como IAM e fibrinolisar apenas pela febre",
            "why": "Febre não constitui indicação de reperfusão coronária."
          }
        ],
        "noECG": true,
        "vitals": "PA 110/68 mmHg · FC 108 bpm · temperatura 38,8 °C",
        "context": "Dias depois, apesar do plano inicial, surge febre alta. É necessário revisar o risco e a etiologia."
      }
    ],
    "sourceNote": "Conteúdo de ensino conferido em fontes indicadas; revisão independente por especialista pendente. Consulte o LEIA-ME-v3.13 para os limites da conferência."
  },
  {
    "id": "brugada_313",
    "track": "outros",
    "title": "Desmaio noturno durante febre",
    "level": "Intermediário",
    "pattern": "brugada",
    "patient": "Homem, 34 anos, teve perda súbita de consciência em repouso, sem pródromos, durante quadro febril. Recuperou-se em segundos. Irmão faleceu subitamente aos 39 anos. O caso diferencia padrão eletrocardiográfico de diagnóstico e decisão definitiva.",
    "sources": [
      "brugada2022"
    ],
    "steps": [
      {
        "kind": "Chegada",
        "points": 20,
        "prompt": "Como priorizar esse episódio?",
        "options": [
          {
            "text": "Monitorizar e investigar síncope possivelmente arrítmica com ECG",
            "why": "A ausência de pródromos e a história familiar são sinais de alerta.",
            "ok": true
          },
          {
            "text": "Concluir síncope vasovagal e liberar sem ECG",
            "why": "O contexto não permite essa conclusão imediata."
          },
          {
            "text": "Prescrever antiarrítmico empiricamente sem avaliar o traçado",
            "why": "A escolha depende do mecanismo e pode agravar canalopatias."
          },
          {
            "text": "Ignorar a história familiar porque o paciente recuperou a consciência",
            "why": "Recuperação espontânea não elimina risco arrítmico."
          }
        ],
        "noECG": true,
        "vitals": "PA 122/76 mmHg · FC ≈ 70 bpm · SpO₂ 98% · temperatura 39 °C"
      },
      {
        "kind": "ECG",
        "points": 20,
        "prompt": "Qual descrição é mais adequada?",
        "options": [
          {
            "text": "Padrão de Brugada tipo 1 em V1–V2, a correlacionar com a clínica",
            "why": "Supra em abóbada seguido de T negativa nas precordiais direitas é suspeito.",
            "ok": true
          },
          {
            "text": "ECG normal por ser paciente jovem",
            "why": "Há alteração relevante nas precordiais direitas."
          },
          {
            "text": "IAM inferior com supra exclusivo em DII, DIII e aVF",
            "why": "A localização e morfologia são outras."
          },
          {
            "text": "Diagnóstico genético confirmado apenas pelo ECG",
            "why": "O traçado não identifica sozinho uma variante genética."
          }
        ]
      },
      {
        "kind": "Conduta imediata",
        "points": 20,
        "prompt": "Qual é a estratégia mais apropriada?",
        "options": [
          {
            "text": "Tratar a febre, manter monitorização e solicitar avaliação especializada",
            "why": "Febre pode desencadear alterações e arritmias; a síncope exige investigação.",
            "ok": true
          },
          {
            "text": "Deixar a febre subir para tornar o padrão mais visível",
            "why": "Não se provoca um possível gatilho arrítmico."
          },
          {
            "text": "Dar alta assim que a temperatura cair, sem avaliar a síncope",
            "why": "A história permanece relevante após a melhora da febre."
          },
          {
            "text": "Administrar bloqueador de canal de sódio empiricamente fora de ambiente especializado",
            "why": "O teste provocativo não é tratamento empírico."
          }
        ]
      },
      {
        "kind": "Investigação e prevenção",
        "points": 20,
        "prompt": "Quais ações são apropriadas?",
        "options": [
          {
            "text": "Revisar medicamentos e possíveis causas de padrão semelhante",
            "why": "É necessário avaliar diagnósticos diferenciais e gatilhos.",
            "ok": true
          },
          {
            "text": "Encaminhar para estratificação arrítmica e orientação familiar",
            "why": "O risco e a necessidade de dispositivo exigem avaliação especializada.",
            "ok": true
          },
          {
            "text": "Declarar que qualquer padrão exige implante automático de CDI",
            "why": "O padrão isolado não substitui estratificação individual.",
            "bad": true
          },
          {
            "text": "Recomendar que ignore futuros episódios de síncope",
            "why": "Novo episódio deve motivar avaliação.",
            "bad": true
          }
        ],
        "multi": true
      },
      {
        "kind": "Evolução",
        "points": 20,
        "prompt": "A febre cede e o ECG fica menos evidente. O que isso significa?",
        "options": [
          {
            "text": "A variação do traçado não elimina a necessidade de investigar a síncope",
            "why": "O padrão pode ser dinâmico; a avaliação clínica continua.",
            "ok": true
          },
          {
            "text": "A possibilidade de canalopatia foi definitivamente excluída",
            "why": "Normalização transitória não exclui a hipótese."
          },
          {
            "text": "A história familiar deixou de ter valor",
            "why": "Ela continua compondo a avaliação de risco."
          },
          {
            "text": "É seguro liberar sem qualquer seguimento especializado",
            "why": "A apresentação inicial ainda requer investigação."
          }
        ],
        "noECG": true,
        "context": "Após antitérmico, a temperatura caiu. O ECG repetido não é mostrado; o objetivo é decidir o seguimento."
      }
    ],
    "sourceNote": "Conteúdo de ensino conferido em fontes indicadas; revisão independente por especialista pendente. Consulte o LEIA-ME-v3.13 para os limites da conferência."
  },
  {
    "id": "tep_313",
    "track": "outros",
    "title": "Dispneia após imobilização",
    "level": "Intermediário",
    "pattern": "tep",
    "patient": "Mulher, 48 anos, com dispneia súbita e dor pleurítica após período de imobilização por fratura de perna. Panturrilha esquerda aumentada e dolorosa. Sem sangramento ativo, sem gravidez e com função renal normal.",
    "sources": [
      "tep2026"
    ],
    "steps": [
      {
        "kind": "Chegada",
        "points": 20,
        "prompt": "Qual avaliação inicial é adequada?",
        "options": [
          {
            "text": "Avaliar estabilidade, oxigenação e probabilidade clínica de TEP",
            "why": "Imobilização e sinais de trombose aumentam a suspeita.",
            "ok": true
          },
          {
            "text": "Concluir ansiedade apenas pela falta de dor opressiva",
            "why": "Dispneia e dor pleurítica podem ocorrer no TEP."
          },
          {
            "text": "Excluir TEP porque a pressão está preservada",
            "why": "TEP pode ocorrer sem hipotensão."
          },
          {
            "text": "Prescrever apenas broncodilatador e liberar",
            "why": "O contexto exige investigar tromboembolismo."
          }
        ],
        "noECG": true,
        "vitals": "PA 116/74 mmHg · FC ≈ 110 bpm · SpO₂ 89% em ar ambiente"
      },
      {
        "kind": "ECG",
        "points": 20,
        "prompt": "O traçado apresenta S1Q3T3. Qual interpretação é correta?",
        "options": [
          {
            "text": "Pode indicar sobrecarga direita, mas não confirma nem exclui TEP sozinho",
            "why": "A confirmação depende da investigação clínica e de imagem.",
            "ok": true
          },
          {
            "text": "Confirma TEP e dispensa qualquer imagem",
            "why": "O padrão é inespecífico."
          },
          {
            "text": "Indica obrigatoriamente IAM inferior com reperfusão coronária",
            "why": "Uma onda Q isolada não define esse diagnóstico."
          },
          {
            "text": "É obrigatório em todo TEP e sua ausência excluiria a doença",
            "why": "Muitos pacientes com TEP não têm esse padrão."
          }
        ]
      },
      {
        "kind": "Confirmação",
        "points": 20,
        "prompt": "Após avaliação, a probabilidade clínica é alta; a paciente está estável para transporte e sem contraindicação a contraste. Qual exame priorizar?",
        "options": [
          {
            "text": "Angiotomografia de artérias pulmonares",
            "why": "Com alta suspeita, a investigação de imagem é prioritária.",
            "ok": true
          },
          {
            "text": "Usar apenas D-dímero para encerrar a investigação",
            "why": "D-dímero é empregado em estratégias de exclusão com probabilidade não alta."
          },
          {
            "text": "Solicitar teste ergométrico para reproduzir os sintomas",
            "why": "Não é exame diagnóstico de TEP."
          },
          {
            "text": "Aguardar um ECG com S1Q3T3 mais acentuado",
            "why": "A evolução do ECG não substitui a imagem."
          }
        ]
      },
      {
        "kind": "Após confirmação",
        "points": 20,
        "prompt": "A angiotomografia confirma TEP. Há disfunção de VD e troponina elevada, mas sem choque. Selecione o plano.",
        "options": [
          {
            "text": "Iniciar anticoagulação terapêutica após avaliar contraindicações",
            "why": "A anticoagulação faz parte do tratamento do TEP confirmado.",
            "ok": true
          },
          {
            "text": "Internar e monitorizar pela disfunção de VD e biomarcador elevado",
            "why": "É necessário vigiar deterioração.",
            "ok": true
          },
          {
            "text": "Fibrinolisar automaticamente todo TEP com S1Q3T3",
            "why": "O ECG isolado não define indicação de reperfusão.",
            "bad": true
          },
          {
            "text": "Dar alta apenas porque não há hipotensão",
            "why": "Há outros sinais de maior risco.",
            "bad": true
          }
        ],
        "multi": true,
        "context": "Com oxigênio, SpO₂ 95%. PA 114/72 mmHg, sem sinais de hipoperfusão."
      },
      {
        "kind": "Deterioração",
        "points": 20,
        "prompt": "Agora há hipotensão persistente e hipoperfusão. Qual é a prioridade?",
        "options": [
          {
            "text": "Acionar equipe de emergência para suporte e avaliar reperfusão, considerando sangramento",
            "why": "A deterioração exige reavaliar rapidamente a estratégia.",
            "ok": true
          },
          {
            "text": "Manter o mesmo plano sem reavaliar a gravidade",
            "why": "Choque muda a prioridade e as opções terapêuticas."
          },
          {
            "text": "Aguardar o D-dímero para confirmar novamente o TEP",
            "why": "O diagnóstico já foi confirmado."
          },
          {
            "text": "Tratar apenas o traçado e ignorar a perfusão",
            "why": "A gravidade é definida pelo conjunto clínico."
          }
        ],
        "noECG": true,
        "vitals": "PA 78/46 mmHg persistente · confusão e extremidades frias",
        "context": "Evolução fictícia apesar do tratamento: desenvolve instabilidade. A escolha da reperfusão cabe à equipe, conforme contraindicações e recursos."
      }
    ],
    "sourceNote": "Conteúdo de ensino conferido em fontes indicadas; revisão independente por especialista pendente. Consulte o LEIA-ME-v3.13 para os limites da conferência."
  }
]);
