/* PCR reformulada · Fase A do simulador. Casos fictícios; conferência e limites em LEIA-ME-v3.21.md.
   atendimento:true usa apresentação neutra; rev:2 descarta somente tentativas anteriores incompatíveis.
   Os exemplos de alça fechada e distribuição de funções são orientação didática. */
CLINICAL_CASES.push(...[
  {
    "id": "pcr_fv",
    "track": "pcr",
    "title": "Perda de resposta na enfermaria",
    "level": "Atendimento simulado",
    "pattern": "fv",
    "patient": "Homem, 64 anos, internado por dor torácica. A enfermagem o encontra caído no leito, sem responder. Há desfibrilador manual bifásico no carro de emergência.",
    "sources": [
      "bls",
      "als",
      "education"
    ],
    "sourceNote": "Conferência em 07/10/2026 nas fontes públicas da AHA 2025: Parte 7 (avaliação inicial), Parte 9 (algoritmo, medicações e ritmos) e Parte 12, seção 6.4 (treinamento em equipe). A distribuição específica de funções e as frases de comunicação em alça fechada são exemplos didáticos, não prescrições da Parte 12. Revisão por especialista pendente.",
    "steps": [
      {
        "kind": "Avaliação da cena",
        "points": 5,
        "noECG": true,
        "vitals": "Você chega ao leito. A pessoa não responde ao chamado. Respiração e pulso ainda não foram avaliados.",
        "context": "Há um colega disponível e o carro de emergência está próximo. Você assume a liderança do atendimento.",
        "prompt": "Qual é sua primeira avaliação?",
        "options": [
          {
            "text": "Confirmar a segurança da cena, avaliar responsividade, chamar ajuda e pedir o desfibrilador; verificar respiração e pulso simultaneamente, sem prolongar a checagem do pulso além de 10 segundos",
            "ok": true,
            "why": "A avaliação inicial identifica a parada e permite começar o cuidado sem demora. Para profissionais, a Parte 7 orienta checagem breve do pulso quando a pessoa não responde e não respira normalmente. Segurança da cena e acionamento da equipe aparecem no algoritmo de suporte básico."
          },
          {
            "text": "Presumir o ritmo pelo motivo da internação e escolher a energia do choque antes de avaliar",
            "why": "A história ajuda no raciocínio, mas não define o ritmo. Primeiro avalie a pessoa; o choque depende do traçado e da situação clínica."
          },
          {
            "text": "Solicitar ECG de 12 derivações e aguardar a impressão antes de avaliar respiração e pulso",
            "why": "Exames não podem atrasar a identificação da parada e o início da RCP."
          },
          {
            "text": "Observar por alguns minutos, pois a falta de resposta pode ser sono",
            "why": "A perda de resposta exige avaliação imediata da respiração e da circulação, sem espera passiva."
          }
        ]
      },
      {
        "kind": "Reconhecimento",
        "points": 10,
        "noECG": true,
        "vitals": "Não responde · sem respiração normal · nenhum pulso definido na checagem breve",
        "prompt": "Com esses achados, qual ordem você dá à equipe?",
        "options": [
          {
            "text": "Reconhecer a parada e iniciar RCP imediatamente; delegar compressões, ventilação com bolsa-máscara e oxigênio e conexão do monitor/desfibrilador, sem esperar exames",
            "ok": true,
            "why": "Ausência de resposta, respiração normal e pulso definido exige RCP. A equipe faz as tarefas em paralelo: compressões, ventilação e monitor para a primeira análise do ritmo."
          },
          {
            "text": "Aguardar o monitor antes de começar as compressões",
            "why": "O monitor é conectado enquanto a RCP já está em andamento."
          },
          {
            "text": "Ventilar primeiro por 2 minutos e depois iniciar as compressões",
            "why": "Compressões não podem esperar pela ventilação. Sem via aérea avançada, a equipe combina compressões e ventilações em 30:2."
          },
          {
            "text": "Tratar como síncope e esperar retorno espontâneo da consciência",
            "why": "Sem pulso definido e sem respiração normal, a conduta é RCP imediata."
          }
        ]
      },
      {
        "kind": "Primeiro ritmo",
        "points": 15,
        "vitals": "Pás posicionadas · RCP em andamento",
        "context": "As compressões param só para a análise do ritmo.",
        "prompt": "Qual é o ritmo e o que fazer?",
        "options": [
          {
            "text": "Fibrilação ventricular: chocável. Desfibrilar já (bifásico na energia do fabricante, em geral 120–200 J; se desconhecida, a máxima) e retomar a RCP logo após o choque",
            "ok": true,
            "why": "FV é ritmo chocável. A Figura 1 indica a energia recomendada pelo fabricante do bifásico (120–200 J) ou a máxima disponível se ela for desconhecida; após o choque, a RCP é retomada por 2 minutos sem checar pulso."
          },
          {
            "text": "Assistolia: adrenalina e RCP, sem choque",
            "why": "O traçado tem ondulações caóticas, não linha reta. Isso é FV, que precisa de choque."
          },
          {
            "text": "TV com pulso: cardioversão sincronizada",
            "why": "Não há pulso nem complexos organizados. Cardioversão sincronizada é para taquicardia com pulso; na parada o choque é não sincronizado."
          },
          {
            "text": "Interromper a RCP por 1 minuto para confirmar o pulso antes de decidir",
            "why": "A pausa para análise deve ser curta. Pausas longas reduzem a chance de sucesso do choque e de sobrevivência."
          }
        ],
        "variants": {
          "tvsp": {
            "pattern": "tv",
            "options": [
              {
                "text": "TV monomórfica sem pulso: chocável. Desfibrilar já (bifásico na energia do fabricante, em geral 120–200 J; se desconhecida, a máxima) e retomar a RCP logo após o choque",
                "ok": true,
                "why": "O monitor mostra taquicardia de complexos largos regulares e a checagem não encontrou pulso. TV sem pulso segue o mesmo ramo de FV: choque não sincronizado e retomada imediata da RCP."
              },
              {
                "text": "Assistolia: adrenalina e RCP, sem choque",
                "why": "O monitor mostra complexos largos regulares, não ausência de atividade ventricular. Sem pulso, esse ritmo é chocável."
              },
              {
                "text": "TV com pulso: cardioversão sincronizada",
                "why": "O traçado é organizado, mas a checagem mostrou ausência de pulso. O choque é não sincronizado, seguindo o algoritmo da parada."
              },
              {
                "text": "Interromper a RCP por 1 minuto para confirmar o pulso antes de decidir",
                "why": "A pausa para análise deve ser curta. Pausas longas reduzem a chance de sucesso do choque e de sobrevivência."
              }
            ]
          }
        }
      },
      {
        "kind": "Organização da equipe",
        "points": 10,
        "noECG": true,
        "multi": true,
        "selectionHint": "Marque as ações que você delega à equipe enquanto o atendimento continua e confirme.",
        "context": "As ordens iniciais já estão sendo executadas. Organize as tarefas em paralelo, sem atrasar o choque indicado ou interromper a RCP para reunir a equipe.",
        "prompt": "Como você distribui as funções durante o atendimento?",
        "options": [
          {
            "text": "Designar compressões e preparar o revezamento do compressor a cada 2 minutos, ou antes se houver fadiga",
            "ok": true,
            "why": "Planejar a troca evita perda de qualidade e pausas desnecessárias. O intervalo de 2 minutos consta no algoritmo da Parte 9."
          },
          {
            "text": "Designar ventilação e via aérea, evitando ventilação excessiva",
            "ok": true,
            "why": "Ventilação ocorre em paralelo às outras tarefas. A via aérea avançada não deve atrasar compressões e desfibrilação."
          },
          {
            "text": "Designar monitor/desfibrilador e confirmar verbalmente que todos estão afastados antes de cada choque",
            "ok": true,
            "why": "Uma pessoa cuida do equipamento e da segurança do choque. A divisão de tarefas é um exemplo didático de trabalho em equipe, com apoio geral da Parte 12."
          },
          {
            "text": "Designar acesso e medicações, com confirmação da ordem recebida e da administração",
            "ok": true,
            "why": "Ordens dirigidas e confirmação ajudam a evitar omissões e duplicação. Este exemplo de comunicação em alça fechada é orientação didática; a Parte 12 recomenda treinar comunicação e liderança sem prescrever estas frases."
          },
          {
            "text": "Designar o registro dos ciclos, choques e horários das medicações; o líder acompanha as informações da equipe",
            "ok": true,
            "why": "Registrar eventos apoia a decisão do ciclo seguinte e evita repetir medicação antes do intervalo indicado. A distribuição específica é um modelo didático adaptável aos recursos."
          },
          {
            "text": "Parar as compressões para discutir as funções com todos",
            "bad": true,
            "why": "A organização ocorre enquanto a RCP continua. A discussão não justifica uma pausa das compressões."
          },
          {
            "text": "Deixar o mesmo compressor até o final, mesmo com fadiga",
            "why": "A fadiga compromete a qualidade das compressões; prepare o revezamento."
          }
        ]
      },
      {
        "kind": "Segundo ciclo",
        "points": 10,
        "vitals": "2 minutos de RCP após o 1º choque · acesso venoso obtido",
        "context": "Nova análise do ritmo após 2 minutos de RCP.",
        "prompt": "O ritmo persiste. O que fazer neste ciclo?",
        "options": [
          {
            "text": "Novo choque, RCP por 2 minutos e adrenalina 1 mg IV durante o ciclo, repetida a cada 3–5 minutos",
            "ok": true,
            "why": "No ritmo chocável, a adrenalina entra depois que os primeiros choques falham (Parte 9, recomendação de momento da adrenalina; Figura 2, caixa 6), na dose de 1 mg a cada 3–5 minutos."
          },
          {
            "text": "Amiodarona 300 mg agora, antes da adrenalina",
            "why": "No algoritmo, o antiarrítmico é para FV/TV sem pulso refratária e aparece no ciclo seguinte, após o 3º choque (Figura 2, caixa 8)."
          },
          {
            "text": "Três choques seguidos antes de retomar a RCP",
            "why": "A diretriz prefere a estratégia de choque único a choques empilhados, para retomar as compressões rapidamente."
          },
          {
            "text": "Bicarbonato de sódio de rotina pela acidose da parada",
            "why": "A Parte 9 não recomenda bicarbonato de rotina na parada (classe 3: sem benefício)."
          }
        ],
        "variants": {
          "tvsp": {
            "pattern": "tv"
          }
        }
      },
      {
        "kind": "Via aérea",
        "points": 10,
        "noECG": true,
        "vitals": "RCP em andamento · ventilação com bolsa-máscara eficaz",
        "context": "Um colega experiente se oferece para intubar.",
        "prompt": "Como conduzir a via aérea?",
        "options": [
          {
            "text": "Manter bolsa-máscara eficaz ou usar via aérea avançada por profissional experiente sem atrasar RCP e desfibrilação; com via aérea avançada, 1 ventilação a cada 6 segundos e compressões contínuas; com tubo, confirmar a posição por capnografia",
            "ok": true,
            "why": "A Parte 9 permite bolsa-máscara ou via aérea avançada conforme o contexto e a habilidade. Se a inserção interromper compressões, deve ser adiada. Com via aérea avançada, a ventilação é de 1 a cada 6 s; a capnografia confirma e monitora o tubo endotraqueal."
          },
          {
            "text": "Parar as compressões até a intubação ficar pronta, mesmo que demore",
            "why": "Minimizar interrupções das compressões é prioridade; a via aérea não justifica pausas longas."
          },
          {
            "text": "Depois de intubar, manter 30 compressões para 2 ventilações",
            "why": "O 30:2 vale sem via aérea avançada. Com ela, as compressões são contínuas e a ventilação é de 1 a cada 6 s."
          },
          {
            "text": "Ventilar 30 vezes por minuto para corrigir a acidose",
            "why": "Ventilação excessiva é desaconselhada: aumenta a pressão no tórax e reduz o retorno venoso."
          }
        ]
      },
      {
        "kind": "Terceira análise",
        "points": 15,
        "vitals": "2 choques e adrenalina já feitos · capnografia 16 mmHg",
        "context": "Nova análise após mais 2 minutos de RCP.",
        "prompt": "Observe a nova análise do monitor. Qual é sua próxima ordem?",
        "options": [
          {
            "text": "3º choque, RCP por 2 minutos e amiodarona 300 mg IV/IO (ou lidocaína 1–1,5 mg/kg); tratar causas reversíveis",
            "ok": true,
            "why": "Amiodarona ou lidocaína podem ser consideradas na FV/TV sem pulso que não responde ao choque. Doses da Figura 1: amiodarona 300 mg e, depois, 150 mg; lidocaína 1–1,5 mg/kg e, depois, 0,5–0,75 mg/kg."
          },
          {
            "text": "Amiodarona 150 mg como primeira dose",
            "why": "Na parada, a primeira dose de amiodarona é 300 mg em bolus; 150 mg é a segunda dose."
          },
          {
            "text": "Trocar a adrenalina por vasopressina",
            "why": "Vasopressina, sozinha ou com adrenalina, não traz vantagem sobre a adrenalina (classe 3: sem benefício)."
          },
          {
            "text": "Sulfato de magnésio de rotina",
            "why": "Magnésio de rotina não é recomendado na parada. Ele pode ser considerado na torsades de pointes com QT longo, que não é o caso."
          }
        ],
        "variants": {
          "tvsp": {
            "pattern": "tv"
          }
        }
      },
      {
        "kind": "Causas reversíveis",
        "points": 10,
        "multi": true,
        "noECG": true,
        "context": "A RCP continua. A equipe revisa as causas reversíveis da lista do algoritmo (5 Hs e 5 Ts).",
        "prompt": "Marque as causas reversíveis que fazem parte da lista do algoritmo.",
        "options": [
          {
            "text": "Hipovolemia",
            "ok": true,
            "why": "É um dos 5 Hs."
          },
          {
            "text": "Hipóxia",
            "ok": true,
            "why": "É um dos 5 Hs."
          },
          {
            "text": "Íon hidrogênio (acidose)",
            "ok": true,
            "why": "É um dos 5 Hs."
          },
          {
            "text": "Hipo/hipercalemia",
            "ok": true,
            "why": "É um dos 5 Hs."
          },
          {
            "text": "Hipotermia",
            "ok": true,
            "why": "É um dos 5 Hs."
          },
          {
            "text": "Pneumotórax hipertensivo",
            "ok": true,
            "why": "É um dos 5 Ts."
          },
          {
            "text": "Tamponamento cardíaco",
            "ok": true,
            "why": "É um dos 5 Ts."
          },
          {
            "text": "Tóxicos",
            "ok": true,
            "why": "É um dos 5 Ts."
          },
          {
            "text": "Trombose pulmonar",
            "ok": true,
            "why": "É um dos 5 Ts."
          },
          {
            "text": "Trombose coronária",
            "ok": true,
            "why": "É um dos 5 Ts. Neste paciente, internado por dor torácica, é a causa mais provável."
          },
          {
            "text": "Hipertensão arterial",
            "why": "Não faz parte da lista de causas reversíveis da parada."
          },
          {
            "text": "Hiperglicemia",
            "why": "Não faz parte da lista de causas reversíveis do algoritmo."
          }
        ],
        "selectionHint": "Marque todas as causas reversíveis que devem ser consideradas no algoritmo e confirme.",
        "vitals": "3 choques realizados · antiarrítmico administrado · RCP em andamento"
      },
      {
        "kind": "Comunicação da equipe",
        "points": 5,
        "noECG": true,
        "context": "Você pede a um colega que prepare a próxima medicação indicada. Ele repete a ordem, mas ninguém informou se ela foi administrada. A RCP continua.",
        "prompt": "Como você fecha essa comunicação?",
        "options": [
          {
            "text": "Dirigir a ordem a uma pessoa, ouvir a confirmação do que foi entendido, confirmar a execução e registrar o horário antes de repetir a dose",
            "ok": true,
            "why": "Na comunicação em alça fechada, a tarefa é dirigida, compreendida e confirmada quando executada. As frases deste exercício são um modelo didático de comunicação e liderança, competências recomendadas pela Parte 12."
          },
          {
            "text": "Presumir que repetir a ordem significa que a medicação já foi administrada",
            "why": "Confirmar entendimento e confirmar execução são momentos diferentes. Falta a confirmação da administração."
          },
          {
            "text": "Pedir a mesma dose a outro colega sem conferir a administração anterior",
            "why": "Pode provocar duplicação. Verifique a execução e o horário com quem recebeu a tarefa."
          },
          {
            "text": "Suspender a RCP até todos relatarem suas tarefas",
            "why": "O líder recebe as informações durante a RCP; a comunicação não justifica uma pausa."
          }
        ]
      },
      {
        "kind": "Reavaliação",
        "points": 10,
        "pattern": "sinusal",
        "vitals": "Capnografia sobe de 16 para 41 mmHg durante as compressões",
        "context": "Na análise seguinte, o monitor mostra um ritmo organizado.",
        "prompt": "O que fazer?",
        "options": [
          {
            "text": "Checar o pulso: presente, é retorno da circulação espontânea. Manter monitorização e capnografia e passar aos cuidados pós-PCR, tratando a causa",
            "ok": true,
            "why": "Uma elevação abrupta do CO₂ expirado pode indicar retorno da circulação (Parte 9, adjuntos da RCP). Com ritmo organizado e pulso, segue-se para os cuidados pós-PCR (Figura 2, caixa 12)."
          },
          {
            "text": "Dar mais um choque por causa do ritmo inicial",
            "why": "Ritmo organizado não se trata com choque; o choque é para FV ou TV sem pulso."
          },
          {
            "text": "Considerar AESP e dar adrenalina sem checar o pulso",
            "why": "Ritmo organizado exige checar o pulso. Com pulso, é retorno da circulação; só sem pulso seria AESP."
          },
          {
            "text": "Encerrar o atendimento, pois a capnografia já subiu",
            "why": "A subida da capnografia sugere retorno da circulação, que precisa ser confirmado e seguido dos cuidados pós-PCR."
          }
        ]
      }
    ],
    "atendimento": true,
    "rev": 2,
    "scenarios": {
      "fv": {
        "label": "Equipe de emergência disponível e desfibrilador manual bifásico."
      },
      "tvsp": {
        "label": "Equipe de emergência disponível e desfibrilador manual bifásico."
      }
    }
  },
  {
    "id": "pcr_aesp",
    "track": "pcr",
    "title": "Perda de consciência durante a passagem de plantão",
    "level": "Atendimento simulado",
    "pattern": "aesp",
    "patient": "Mulher, 71 anos, internada por hemorragia digestiva alta, com melena e PA em queda há uma hora. Perde a consciência durante a passagem de plantão.",
    "sources": [
      "bls",
      "als",
      "education"
    ],
    "sourceNote": "Conferência em 07/10/2026 nas fontes públicas da AHA 2025: Parte 7 (avaliação inicial), Parte 9 (algoritmo, medicações e ritmos) e Parte 12, seção 6.4 (treinamento em equipe). A distribuição específica de funções e as frases de comunicação em alça fechada são exemplos didáticos, não prescrições da Parte 12. Revisão por especialista pendente. O manejo específico da hemorragia é extrapolação didática da hipovolemia como causa reversível; protocolos transfusionais não foram validados nesta etapa.",
    "steps": [
      {
        "kind": "Avaliação da cena",
        "points": 5,
        "noECG": true,
        "vitals": "Você chega ao leito. A pessoa não responde ao chamado. Respiração e pulso ainda não foram avaliados.",
        "context": "Há um colega disponível e o carro de emergência está próximo. Você assume a liderança do atendimento.",
        "prompt": "Qual é sua primeira avaliação?",
        "options": [
          {
            "text": "Confirmar a segurança da cena, avaliar responsividade, chamar ajuda e pedir o desfibrilador; verificar respiração e pulso simultaneamente, sem prolongar a checagem do pulso além de 10 segundos",
            "ok": true,
            "why": "A avaliação inicial identifica a parada e permite começar o cuidado sem demora. Para profissionais, a Parte 7 orienta checagem breve do pulso quando a pessoa não responde e não respira normalmente. Segurança da cena e acionamento da equipe aparecem no algoritmo de suporte básico."
          },
          {
            "text": "Presumir o ritmo pelo motivo da internação e escolher a energia do choque antes de avaliar",
            "why": "A história ajuda no raciocínio, mas não define o ritmo. Primeiro avalie a pessoa; o choque depende do traçado e da situação clínica."
          },
          {
            "text": "Solicitar ECG de 12 derivações e aguardar a impressão antes de avaliar respiração e pulso",
            "why": "Exames não podem atrasar a identificação da parada e o início da RCP."
          },
          {
            "text": "Observar por alguns minutos, pois a falta de resposta pode ser sono",
            "why": "A perda de resposta exige avaliação imediata da respiração e da circulação, sem espera passiva."
          }
        ]
      },
      {
        "kind": "Reconhecimento",
        "points": 10,
        "noECG": true,
        "vitals": "Não responde · respiração agônica · nenhum pulso definido na checagem breve",
        "prompt": "Com esses achados, qual ordem você dá à equipe?",
        "options": [
          {
            "text": "Reconhecer a parada e iniciar RCP imediatamente; delegar compressões, ventilação com bolsa-máscara e oxigênio e conexão do monitor/desfibrilador, sem esperar exames",
            "ok": true,
            "why": "Ausência de resposta, respiração normal e pulso definido exige RCP. A equipe faz as tarefas em paralelo: compressões, ventilação e monitor para a primeira análise do ritmo."
          },
          {
            "text": "Aguardar o monitor antes de começar as compressões",
            "why": "O monitor é conectado enquanto a RCP já está em andamento."
          },
          {
            "text": "Ventilar primeiro por 2 minutos e depois iniciar as compressões",
            "why": "Compressões não podem esperar pela ventilação. Sem via aérea avançada, a equipe combina compressões e ventilações em 30:2."
          },
          {
            "text": "Tratar como síncope e esperar retorno espontâneo da consciência",
            "why": "Sem pulso definido e sem respiração normal, a conduta é RCP imediata."
          }
        ]
      },
      {
        "kind": "Primeiro ritmo",
        "points": 20,
        "vitals": "Monitor conectado · checagem de pulso: ausente",
        "prompt": "Qual é o ritmo e a conduta?",
        "options": [
          {
            "text": "AESP (ritmo organizado sem pulso): não chocável. RCP e adrenalina 1 mg IV/IO o quanto antes",
            "ok": true,
            "why": "No ritmo não chocável, a adrenalina deve ser dada assim que possível (Parte 9, momento da adrenalina; Figura 2, caixa 9)."
          },
          {
            "text": "Ritmo idioventricular com pulso: apenas observar",
            "why": "A checagem mostrou ausência de pulso. Ritmo organizado sem pulso é AESP, uma parada."
          },
          {
            "text": "FV fina: desfibrilar",
            "why": "Há complexos organizados, não ondulação caótica. AESP não é ritmo chocável."
          },
          {
            "text": "Atropina 1 mg pelo ritmo lento",
            "why": "Atropina nos ritmos não chocáveis não melhorou a sobrevida nos estudos citados pela Parte 9; ela não faz parte do algoritmo da parada."
          }
        ]
      },
      {
        "kind": "Organização da equipe",
        "points": 10,
        "noECG": true,
        "multi": true,
        "selectionHint": "Marque as ações que você delega à equipe enquanto o atendimento continua e confirme.",
        "context": "As ordens iniciais já estão sendo executadas. Organize as tarefas em paralelo, sem atrasar o choque indicado ou interromper a RCP para reunir a equipe.",
        "prompt": "Como você distribui as funções durante o atendimento?",
        "options": [
          {
            "text": "Designar compressões e preparar o revezamento do compressor a cada 2 minutos, ou antes se houver fadiga",
            "ok": true,
            "why": "Planejar a troca evita perda de qualidade e pausas desnecessárias. O intervalo de 2 minutos consta no algoritmo da Parte 9."
          },
          {
            "text": "Designar ventilação e via aérea, evitando ventilação excessiva",
            "ok": true,
            "why": "Ventilação ocorre em paralelo às outras tarefas. A via aérea avançada não deve atrasar compressões e desfibrilação."
          },
          {
            "text": "Designar monitor/desfibrilador e confirmar verbalmente que todos estão afastados antes de cada choque",
            "ok": true,
            "why": "Uma pessoa cuida do equipamento e da segurança do choque. A divisão de tarefas é um exemplo didático de trabalho em equipe, com apoio geral da Parte 12."
          },
          {
            "text": "Designar acesso e medicações, com confirmação da ordem recebida e da administração",
            "ok": true,
            "why": "Ordens dirigidas e confirmação ajudam a evitar omissões e duplicação. Este exemplo de comunicação em alça fechada é orientação didática; a Parte 12 recomenda treinar comunicação e liderança sem prescrever estas frases."
          },
          {
            "text": "Designar o registro dos ciclos, choques e horários das medicações; o líder acompanha as informações da equipe",
            "ok": true,
            "why": "Registrar eventos apoia a decisão do ciclo seguinte e evita repetir medicação antes do intervalo indicado. A distribuição específica é um modelo didático adaptável aos recursos."
          },
          {
            "text": "Parar as compressões para discutir as funções com todos",
            "bad": true,
            "why": "A organização ocorre enquanto a RCP continua. A discussão não justifica uma pausa das compressões."
          },
          {
            "text": "Deixar o mesmo compressor até o final, mesmo com fadiga",
            "why": "A fadiga compromete a qualidade das compressões; prepare o revezamento."
          }
        ]
      },
      {
        "kind": "Acesso",
        "points": 10,
        "noECG": true,
        "vitals": "RCP em andamento · duas tentativas de acesso venoso sem sucesso",
        "prompt": "Como administrar a adrenalina?",
        "options": [
          {
            "text": "Acesso intraósseo",
            "ok": true,
            "why": "A via venosa é a primeira escolha; se as tentativas falham ou não são possíveis, o intraósseo é razoável (Parte 9, acesso vascular)."
          },
          {
            "text": "Adrenalina pelo tubo endotraqueal",
            "why": "A via endotraqueal dá concentrações baixas e imprevisíveis e saiu das diretrizes."
          },
          {
            "text": "Injeção intracardíaca",
            "why": "A via intracardíaca é desaconselhada pelo risco e pela disponibilidade de alternativas."
          },
          {
            "text": "Esperar um acesso central antes de qualquer medicação",
            "why": "O acesso central é para quando venoso e intraósseo falham, e exige treinamento; esperar por ele atrasa a adrenalina."
          }
        ]
      },
      {
        "kind": "Causa reversível",
        "points": 15,
        "noECG": true,
        "vitals": "RCP em andamento · adrenalina feita · sonda nasogástrica com sangue vivo",
        "prompt": "Qual é a causa mais provável e o que fazer?",
        "options": [
          {
            "text": "Hipovolemia por hemorragia: reposição volêmica rápida (cristaloide e hemoderivados) pelo acesso disponível, mantendo RCP e adrenalina a cada 3–5 minutos, e acionar o controle do sangramento",
            "ok": true,
            "why": "A hipovolemia é um dos 5 Hs. Na AESP, tratar a causa reversível é o que pode trazer a circulação de volta; a RCP e a adrenalina continuam enquanto isso."
          },
          {
            "text": "Trombólise empírica por suspeita de TEP",
            "why": "Não há elementos de TEP, e há sangramento ativo: a trombólise seria muito perigosa."
          },
          {
            "text": "Cálcio IV de rotina",
            "why": "Cálcio de rotina não é recomendado na parada (classe 3: sem benefício); seu uso fica para circunstâncias especiais, como hipercalemia."
          },
          {
            "text": "Bicarbonato de sódio de rotina",
            "why": "Bicarbonato de rotina não é recomendado na parada (classe 3: sem benefício)."
          }
        ]
      },
      {
        "kind": "Nova análise",
        "points": 15,
        "vitals": "2 minutos de RCP · reposição em curso · pulso ausente",
        "prompt": "Observe o monitor e a checagem de pulso desta análise. Qual conduta você mantém?",
        "options": [
          {
            "text": "Continuar a RCP por 2 minutos, repetir a adrenalina a cada 3–5 minutos (na prática, a cada dois ciclos) e seguir tratando a causa",
            "ok": true,
            "why": "A Parte 9 indica adrenalina 1 mg a cada 3–5 minutos; dar a dose a cada segundo ciclo de RCP cumpre essa recomendação."
          },
          {
            "text": "Desfibrilar, já que o ritmo não mudou",
            "why": "AESP continua não chocável enquanto não houver FV ou TV sem pulso."
          },
          {
            "text": "Adrenalina em dose alta (5 mg)",
            "why": "Adrenalina em dose alta não é recomendada de rotina (classe 3: sem benefício)."
          },
          {
            "text": "Parar as compressões para um ultrassom demorado à beira do leito",
            "why": "O ultrassom pode ser considerado por profissional experiente só se não interromper a RCP."
          }
        ]
      },
      {
        "kind": "Comunicação da equipe",
        "points": 5,
        "noECG": true,
        "context": "Você pede a um colega que prepare a próxima medicação indicada. Ele repete a ordem, mas ninguém informou se ela foi administrada. A RCP continua.",
        "prompt": "Como você fecha essa comunicação?",
        "options": [
          {
            "text": "Dirigir a ordem a uma pessoa, ouvir a confirmação do que foi entendido, confirmar a execução e registrar o horário antes de repetir a dose",
            "ok": true,
            "why": "Na comunicação em alça fechada, a tarefa é dirigida, compreendida e confirmada quando executada. As frases deste exercício são um modelo didático de comunicação e liderança, competências recomendadas pela Parte 12."
          },
          {
            "text": "Presumir que repetir a ordem significa que a medicação já foi administrada",
            "why": "Confirmar entendimento e confirmar execução são momentos diferentes. Falta a confirmação da administração."
          },
          {
            "text": "Pedir a mesma dose a outro colega sem conferir a administração anterior",
            "why": "Pode provocar duplicação. Verifique a execução e o horário com quem recebeu a tarefa."
          },
          {
            "text": "Suspender a RCP até todos relatarem suas tarefas",
            "why": "O líder recebe as informações durante a RCP; a comunicação não justifica uma pausa."
          }
        ]
      },
      {
        "kind": "Reavaliação",
        "points": 10,
        "pattern": "taqui_sinusal",
        "vitals": "Capnografia sobe para 38 mmHg · pulso presente · PA 78/50 mmHg",
        "context": "Após as medidas dirigidas à causa, surge pulso palpável. O monitor está disponível para nova avaliação.",
        "prompt": "O que fazer?",
        "options": [
          {
            "text": "Retorno da circulação: manter monitorização e passar aos cuidados pós-PCR, mantendo a reposição e o controle do sangramento",
            "ok": true,
            "why": "Com pulso, é retorno da circulação espontânea (Figura 2, caixa 12). A causa, hemorragia, continua e precisa de tratamento."
          },
          {
            "text": "Retomar as compressões por 2 minutos mesmo com pulso",
            "why": "Com pulso palpável e ritmo organizado, a RCP é interrompida."
          },
          {
            "text": "Adrenalina 1 mg em bolus porque a PA está baixa",
            "why": "A dose de 1 mg em bolus é a dose da parada. Em paciente com pulso, pode causar hipertensão grave e arritmias."
          },
          {
            "text": "Suspender a reposição, porque o pulso voltou",
            "why": "A hipovolemia que causou a parada continua; parar a reposição favorece nova parada."
          }
        ]
      }
    ],
    "atendimento": true,
    "rev": 2
  },
  {
    "id": "pcr_assistolia",
    "track": "pcr",
    "title": "Paciente encontrado sem resposta no quarto",
    "level": "Atendimento simulado",
    "pattern": "assistolia",
    "patient": "Homem, 82 anos, encontrado sem responder no quarto da enfermaria. A equipe não sabe há quanto tempo perdeu a resposta.",
    "sources": [
      "bls",
      "als",
      "education"
    ],
    "sourceNote": "Conferência em 07/10/2026 nas fontes públicas da AHA 2025: Parte 7 (avaliação inicial), Parte 9 (algoritmo, medicações e ritmos) e Parte 12, seção 6.4 (treinamento em equipe). A distribuição específica de funções e as frases de comunicação em alça fechada são exemplos didáticos, não prescrições da Parte 12. Revisão por especialista pendente. Conferir cabos, ganho e derivação é orientação prática didática. O último passo discute decisão multimodal, sem regra automática de encerramento intra-hospitalar.",
    "steps": [
      {
        "kind": "Avaliação da cena",
        "points": 5,
        "noECG": true,
        "vitals": "Você chega ao leito. A pessoa não responde ao chamado. Respiração e pulso ainda não foram avaliados.",
        "context": "Há um colega disponível e o carro de emergência está próximo. Você assume a liderança do atendimento.",
        "prompt": "Qual é sua primeira avaliação?",
        "options": [
          {
            "text": "Confirmar a segurança da cena, avaliar responsividade, chamar ajuda e pedir o desfibrilador; verificar respiração e pulso simultaneamente, sem prolongar a checagem do pulso além de 10 segundos",
            "ok": true,
            "why": "A avaliação inicial identifica a parada e permite começar o cuidado sem demora. Para profissionais, a Parte 7 orienta checagem breve do pulso quando a pessoa não responde e não respira normalmente. Segurança da cena e acionamento da equipe aparecem no algoritmo de suporte básico."
          },
          {
            "text": "Presumir o ritmo pelo motivo da internação e escolher a energia do choque antes de avaliar",
            "why": "A história ajuda no raciocínio, mas não define o ritmo. Primeiro avalie a pessoa; o choque depende do traçado e da situação clínica."
          },
          {
            "text": "Solicitar ECG de 12 derivações e aguardar a impressão antes de avaliar respiração e pulso",
            "why": "Exames não podem atrasar a identificação da parada e o início da RCP."
          },
          {
            "text": "Observar por alguns minutos, pois a falta de resposta pode ser sono",
            "why": "A perda de resposta exige avaliação imediata da respiração e da circulação, sem espera passiva."
          }
        ]
      },
      {
        "kind": "Reconhecimento",
        "points": 10,
        "noECG": true,
        "vitals": "Não responde · sem respiração normal · nenhum pulso definido na checagem breve",
        "prompt": "Com esses achados, qual ordem você dá à equipe?",
        "options": [
          {
            "text": "Reconhecer a parada e iniciar RCP imediatamente; delegar compressões, ventilação com bolsa-máscara e oxigênio e conexão do monitor/desfibrilador, sem esperar exames",
            "ok": true,
            "why": "Ausência de resposta, respiração normal e pulso definido exige RCP. A equipe faz as tarefas em paralelo: compressões, ventilação e monitor para a primeira análise do ritmo."
          },
          {
            "text": "Aguardar o monitor antes de começar as compressões",
            "why": "O monitor é conectado enquanto a RCP já está em andamento."
          },
          {
            "text": "Ventilar primeiro por 2 minutos e depois iniciar as compressões",
            "why": "Compressões não podem esperar pela ventilação. Sem via aérea avançada, a equipe combina compressões e ventilações em 30:2."
          },
          {
            "text": "Tratar como síncope e esperar retorno espontâneo da consciência",
            "why": "Sem pulso definido e sem respiração normal, a conduta é RCP imediata."
          }
        ]
      },
      {
        "kind": "Primeiro ritmo",
        "points": 20,
        "vitals": "Sem pulso · RCP iniciada · monitor conectado",
        "prompt": "Identifique o ritmo do monitor e dê a ordem para este ciclo.",
        "options": [
          {
            "text": "Assistolia: conferir cabos e ganho sem atrasar a RCP; manter RCP e dar adrenalina 1 mg IV/IO o quanto antes; não chocar",
            "ok": true,
            "why": "Assistolia é ritmo não chocável: RCP e adrenalina o quanto antes. Conferir conexões e ganho evita confundir desconexão com linha reta, sem pausar as compressões."
          },
          {
            "text": "Desfibrilar, porque pode ser FV fina",
            "why": "Linha reta não se trata com choque. Confira cabos, ganho e outra derivação; se aparecer FV, aí sim o choque está indicado."
          },
          {
            "text": "Marca-passo transcutâneo",
            "why": "O uso de marca-passo durante a parada estabelecida não é recomendado (classe 3: sem benefício)."
          },
          {
            "text": "Atropina 1 mg a cada 3–5 minutos",
            "why": "Atropina não faz parte do algoritmo da parada e não melhorou a sobrevida nos ritmos não chocáveis."
          }
        ]
      },
      {
        "kind": "Organização da equipe",
        "points": 10,
        "noECG": true,
        "multi": true,
        "selectionHint": "Marque as ações que você delega à equipe enquanto o atendimento continua e confirme.",
        "context": "As ordens iniciais já estão sendo executadas. Organize as tarefas em paralelo, sem atrasar o choque indicado ou interromper a RCP para reunir a equipe.",
        "prompt": "Como você distribui as funções durante o atendimento?",
        "options": [
          {
            "text": "Designar compressões e preparar o revezamento do compressor a cada 2 minutos, ou antes se houver fadiga",
            "ok": true,
            "why": "Planejar a troca evita perda de qualidade e pausas desnecessárias. O intervalo de 2 minutos consta no algoritmo da Parte 9."
          },
          {
            "text": "Designar ventilação e via aérea, evitando ventilação excessiva",
            "ok": true,
            "why": "Ventilação ocorre em paralelo às outras tarefas. A via aérea avançada não deve atrasar compressões e desfibrilação."
          },
          {
            "text": "Designar monitor/desfibrilador e confirmar verbalmente que todos estão afastados antes de cada choque",
            "ok": true,
            "why": "Uma pessoa cuida do equipamento e da segurança do choque. A divisão de tarefas é um exemplo didático de trabalho em equipe, com apoio geral da Parte 12."
          },
          {
            "text": "Designar acesso e medicações, com confirmação da ordem recebida e da administração",
            "ok": true,
            "why": "Ordens dirigidas e confirmação ajudam a evitar omissões e duplicação. Este exemplo de comunicação em alça fechada é orientação didática; a Parte 12 recomenda treinar comunicação e liderança sem prescrever estas frases."
          },
          {
            "text": "Designar o registro dos ciclos, choques e horários das medicações; o líder acompanha as informações da equipe",
            "ok": true,
            "why": "Registrar eventos apoia a decisão do ciclo seguinte e evita repetir medicação antes do intervalo indicado. A distribuição específica é um modelo didático adaptável aos recursos."
          },
          {
            "text": "Parar as compressões para discutir as funções com todos",
            "bad": true,
            "why": "A organização ocorre enquanto a RCP continua. A discussão não justifica uma pausa das compressões."
          },
          {
            "text": "Deixar o mesmo compressor até o final, mesmo com fadiga",
            "why": "A fadiga compromete a qualidade das compressões; prepare o revezamento."
          }
        ]
      },
      {
        "kind": "Qualidade da RCP",
        "points": 15,
        "noECG": true,
        "vitals": "Via aérea avançada colocada por profissional experiente durante o atendimento · capnografia 8 mmHg",
        "prompt": "O que a capnografia baixa indica e o que fazer?",
        "options": [
          {
            "text": "Rever a qualidade da RCP: profundidade de ao menos 5 cm, 100–120 por minuto, retorno completo do tórax, trocar o compressor a cada 2 minutos e evitar ventilar demais",
            "ok": true,
            "why": "Se o CO₂ expirado está baixo ou caindo, a Figura 1 manda reavaliar a qualidade da RCP. Valores de pelo menos 10 mmHg, idealmente 20 ou mais, sugerem compressões mecanicamente adequadas."
          },
          {
            "text": "Encerrar a reanimação: CO₂ baixo significa que não há chance",
            "why": "O CO₂ expirado não deve ser usado isoladamente para encerrar, e cedo no atendimento ele reflete sobretudo a qualidade das compressões."
          },
          {
            "text": "Aumentar a frequência para 140 compressões por minuto",
            "why": "A frequência recomendada é 100–120 por minuto; acima disso a profundidade e o enchimento do coração pioram."
          },
          {
            "text": "Dar adrenalina a cada minuto até o CO₂ subir",
            "why": "A adrenalina é a cada 3–5 minutos; doses mais frequentes não mostraram vantagem."
          }
        ]
      },
      {
        "kind": "O que entra no tratamento",
        "points": 15,
        "multi": true,
        "noECG": true,
        "context": "Assistolia persistente, já intubado, com RCP de boa qualidade.",
        "prompt": "Marque o que faz parte do tratamento neste momento.",
        "options": [
          {
            "text": "RCP com compressões contínuas e 1 ventilação a cada 6 segundos",
            "ok": true,
            "why": "Com via aérea avançada, compressões contínuas e 1 ventilação a cada 6 s (10/min)."
          },
          {
            "text": "Adrenalina 1 mg a cada 3–5 minutos",
            "ok": true,
            "why": "Recomendada na parada, a cada 3–5 minutos."
          },
          {
            "text": "Buscar e tratar causas reversíveis (5 Hs e 5 Ts)",
            "ok": true,
            "why": "Faz parte de todos os ciclos do algoritmo."
          },
          {
            "text": "Desfibrilação",
            "bad": true,
            "why": "Assistolia não é chocável; o choque interrompe a RCP sem benefício."
          },
          {
            "text": "Bicarbonato de sódio de rotina",
            "why": "Não recomendado de rotina na parada (classe 3: sem benefício)."
          },
          {
            "text": "Cálcio de rotina",
            "why": "Não recomendado de rotina na parada (classe 3: sem benefício)."
          },
          {
            "text": "Vasopressina no lugar da adrenalina",
            "why": "Sem vantagem sobre a adrenalina (classe 3: sem benefício)."
          },
          {
            "text": "Marca-passo transcutâneo",
            "why": "Não recomendado durante a parada estabelecida (classe 3: sem benefício)."
          }
        ],
        "selectionHint": "Marque as medidas indicadas neste ciclo e confirme."
      },
      {
        "kind": "Comunicação da equipe",
        "points": 5,
        "noECG": true,
        "context": "Você pede a um colega que prepare a próxima medicação indicada. Ele repete a ordem, mas ninguém informou se ela foi administrada. A RCP continua.",
        "prompt": "Como você fecha essa comunicação?",
        "options": [
          {
            "text": "Dirigir a ordem a uma pessoa, ouvir a confirmação do que foi entendido, confirmar a execução e registrar o horário antes de repetir a dose",
            "ok": true,
            "why": "Na comunicação em alça fechada, a tarefa é dirigida, compreendida e confirmada quando executada. As frases deste exercício são um modelo didático de comunicação e liderança, competências recomendadas pela Parte 12."
          },
          {
            "text": "Presumir que repetir a ordem significa que a medicação já foi administrada",
            "why": "Confirmar entendimento e confirmar execução são momentos diferentes. Falta a confirmação da administração."
          },
          {
            "text": "Pedir a mesma dose a outro colega sem conferir a administração anterior",
            "why": "Pode provocar duplicação. Verifique a execução e o horário com quem recebeu a tarefa."
          },
          {
            "text": "Suspender a RCP até todos relatarem suas tarefas",
            "why": "O líder recebe as informações durante a RCP; a comunicação não justifica uma pausa."
          }
        ]
      },
      {
        "kind": "Encerrar ou continuar",
        "points": 20,
        "noECG": true,
        "vitals": "30 minutos de atendimento · assistolia persistente · intubado · CO₂ expirado < 10 mmHg após 20 minutos de suporte avançado · nenhuma causa reversível identificada",
        "prompt": "Como a equipe deve decidir?",
        "options": [
          {
            "text": "Reavaliar com a equipe o contexto, a resposta, a qualidade da RCP e as causas reversíveis; discutir eventual encerramento por avaliação multimodal e protocolo local, sem decidir apenas pelo CO₂ expirado",
            "ok": true,
            "why": "A Parte 9 admite CO₂ expirado baixo após 20 minutos de suporte avançado no intubado como um componente de avaliação multimodal. Isso não é um gatilho automático. As regras formais de encerramento descritas nessa seção destinam-se à parada extra-hospitalar e não devem ser transpostas como regra automática para a enfermaria."
          },
          {
            "text": "Continuar indefinidamente enquanto houver algum valor de CO₂ expirado",
            "why": "Valores isolados de CO₂, mesmo acima de 20 mmHg em fases tardias, não devem decidir sozinhos a continuação."
          },
          {
            "text": "Encerrar apenas pelo valor da capnografia, sem considerar o resto",
            "why": "O CO₂ expirado não deve ser usado isoladamente para encerrar a reanimação."
          },
          {
            "text": "Encerrar nos primeiros 5 minutos porque o ritmo inicial era assistolia",
            "why": "O ritmo inicial sozinho não define o encerramento; a decisão considera tempo de suporte avançado, resposta e causas reversíveis."
          }
        ]
      }
    ],
    "atendimento": true,
    "rev": 2
  },
  {
    "id": "pcr_torsades",
    "track": "pcr",
    "title": "Colapso durante uma internação por pneumonia",
    "level": "Atendimento simulado",
    "pattern": "torsades",
    "patient": "Mulher, 58 anos, internada por pneumonia, em uso de medicamentos que prolongam o QT e com potássio de 2,9 mEq/L. O ECG da manhã mostrava QT longo. Perde a consciência subitamente.",
    "sources": [
      "bls",
      "als",
      "education"
    ],
    "sourceNote": "Conferência em 07/10/2026 nas fontes públicas da AHA 2025: Parte 7 (avaliação inicial), Parte 9 (algoritmo, medicações e ritmos) e Parte 12, seção 6.4 (treinamento em equipe). A distribuição específica de funções e as frases de comunicação em alça fechada são exemplos didáticos, não prescrições da Parte 12. Revisão por especialista pendente. Magnésio permanece sem dose. O módulo para na passagem aos cuidados pós-PCR; não inclui metas ou prescrições da Parte 11.",
    "steps": [
      {
        "kind": "Avaliação da cena",
        "points": 5,
        "noECG": true,
        "vitals": "Você chega ao leito. A pessoa não responde ao chamado. Respiração e pulso ainda não foram avaliados.",
        "context": "Há um colega disponível e o carro de emergência está próximo. Você assume a liderança do atendimento.",
        "prompt": "Qual é sua primeira avaliação?",
        "options": [
          {
            "text": "Confirmar a segurança da cena, avaliar responsividade, chamar ajuda e pedir o desfibrilador; verificar respiração e pulso simultaneamente, sem prolongar a checagem do pulso além de 10 segundos",
            "ok": true,
            "why": "A avaliação inicial identifica a parada e permite começar o cuidado sem demora. Para profissionais, a Parte 7 orienta checagem breve do pulso quando a pessoa não responde e não respira normalmente. Segurança da cena e acionamento da equipe aparecem no algoritmo de suporte básico."
          },
          {
            "text": "Presumir o ritmo pelo motivo da internação e escolher a energia do choque antes de avaliar",
            "why": "A história ajuda no raciocínio, mas não define o ritmo. Primeiro avalie a pessoa; o choque depende do traçado e da situação clínica."
          },
          {
            "text": "Solicitar ECG de 12 derivações e aguardar a impressão antes de avaliar respiração e pulso",
            "why": "Exames não podem atrasar a identificação da parada e o início da RCP."
          },
          {
            "text": "Observar por alguns minutos, pois a falta de resposta pode ser sono",
            "why": "A perda de resposta exige avaliação imediata da respiração e da circulação, sem espera passiva."
          }
        ]
      },
      {
        "kind": "Reconhecimento",
        "points": 10,
        "noECG": true,
        "vitals": "Não responde · sem respiração normal · nenhum pulso definido na checagem breve",
        "prompt": "Com esses achados, qual ordem você dá à equipe?",
        "options": [
          {
            "text": "Reconhecer a parada e iniciar RCP imediatamente; delegar compressões, ventilação com bolsa-máscara e oxigênio e conexão do monitor/desfibrilador, sem esperar exames",
            "ok": true,
            "why": "Ausência de resposta, respiração normal e pulso definido exige RCP. A equipe faz as tarefas em paralelo: compressões, ventilação e monitor para a primeira análise do ritmo."
          },
          {
            "text": "Aguardar o monitor antes de começar as compressões",
            "why": "O monitor é conectado enquanto a RCP já está em andamento."
          },
          {
            "text": "Ventilar primeiro por 2 minutos e depois iniciar as compressões",
            "why": "Compressões não podem esperar pela ventilação. Sem via aérea avançada, a equipe combina compressões e ventilações em 30:2."
          },
          {
            "text": "Tratar como síncope e esperar retorno espontâneo da consciência",
            "why": "Sem pulso definido e sem respiração normal, a conduta é RCP imediata."
          }
        ]
      },
      {
        "kind": "Primeiro ritmo",
        "points": 25,
        "vitals": "Pás posicionadas · sem pulso",
        "prompt": "Qual é o ritmo e a conduta?",
        "options": [
          {
            "text": "TV polimórfica (torsades de pointes) sem pulso: desfibrilação imediata não sincronizada na energia máxima do fabricante e retomada da RCP",
            "ok": true,
            "why": "A TV polimórfica é sempre instável e deve ser tratada com desfibrilação imediata (Parte 9, mensagens principais e recomendações de TV polimórfica). Sem pulso, segue o algoritmo do ritmo chocável."
          },
          {
            "text": "Cardioversão sincronizada",
            "why": "Na TV polimórfica o aparelho não consegue sincronizar com confiança, e sem pulso o choque é não sincronizado."
          },
          {
            "text": "Amiodarona antes do choque",
            "why": "O choque vem primeiro. Além disso, amiodarona prolonga o QT, o que é indesejável na torsades."
          },
          {
            "text": "Adrenalina antes do primeiro choque",
            "why": "No ritmo chocável, o choque vem primeiro; a adrenalina entra depois que os primeiros choques falham."
          }
        ]
      },
      {
        "kind": "Organização da equipe",
        "points": 10,
        "noECG": true,
        "multi": true,
        "selectionHint": "Marque as ações que você delega à equipe enquanto o atendimento continua e confirme.",
        "context": "As ordens iniciais já estão sendo executadas. Organize as tarefas em paralelo, sem atrasar o choque indicado ou interromper a RCP para reunir a equipe.",
        "prompt": "Como você distribui as funções durante o atendimento?",
        "options": [
          {
            "text": "Designar compressões e preparar o revezamento do compressor a cada 2 minutos, ou antes se houver fadiga",
            "ok": true,
            "why": "Planejar a troca evita perda de qualidade e pausas desnecessárias. O intervalo de 2 minutos consta no algoritmo da Parte 9."
          },
          {
            "text": "Designar ventilação e via aérea, evitando ventilação excessiva",
            "ok": true,
            "why": "Ventilação ocorre em paralelo às outras tarefas. A via aérea avançada não deve atrasar compressões e desfibrilação."
          },
          {
            "text": "Designar monitor/desfibrilador e confirmar verbalmente que todos estão afastados antes de cada choque",
            "ok": true,
            "why": "Uma pessoa cuida do equipamento e da segurança do choque. A divisão de tarefas é um exemplo didático de trabalho em equipe, com apoio geral da Parte 12."
          },
          {
            "text": "Designar acesso e medicações, com confirmação da ordem recebida e da administração",
            "ok": true,
            "why": "Ordens dirigidas e confirmação ajudam a evitar omissões e duplicação. Este exemplo de comunicação em alça fechada é orientação didática; a Parte 12 recomenda treinar comunicação e liderança sem prescrever estas frases."
          },
          {
            "text": "Designar o registro dos ciclos, choques e horários das medicações; o líder acompanha as informações da equipe",
            "ok": true,
            "why": "Registrar eventos apoia a decisão do ciclo seguinte e evita repetir medicação antes do intervalo indicado. A distribuição específica é um modelo didático adaptável aos recursos."
          },
          {
            "text": "Parar as compressões para discutir as funções com todos",
            "bad": true,
            "why": "A organização ocorre enquanto a RCP continua. A discussão não justifica uma pausa das compressões."
          },
          {
            "text": "Deixar o mesmo compressor até o final, mesmo com fadiga",
            "why": "A fadiga compromete a qualidade das compressões; prepare o revezamento."
          }
        ]
      },
      {
        "kind": "Reavaliação",
        "points": 15,
        "pattern": "qt_longo",
        "vitals": "Após o choque e 2 minutos de RCP: pulso presente · PA 102/64 mmHg",
        "context": "Após o choque e o ciclo de RCP, a checagem encontra pulso e o monitor mostra o traçado abaixo.",
        "prompt": "O que fazer?",
        "options": [
          {
            "text": "Retorno da circulação: cuidados pós-PCR, monitorização contínua e tratamento da causa (corrigir potássio e magnésio e suspender os medicamentos que prolongam o QT)",
            "ok": true,
            "why": "Com pulso, segue-se para os cuidados pós-PCR. A causa provável é o QT longo por medicamentos e hipocalemia, que precisa ser revertida para evitar recorrência."
          },
          {
            "text": "Manter os medicamentos que prolongam o QT, já que o ritmo voltou",
            "why": "Mantê-los favorece novos episódios de torsades."
          },
          {
            "text": "Iniciar amiodarona para prevenir recorrência",
            "why": "A Parte 9 cita amiodarona e lidocaína para TV polimórfica recorrente sem QT longo. Aqui o QT é longo, e a amiodarona o prolongaria ainda mais."
          },
          {
            "text": "Dar alta da monitorização, pois o choque resolveu o problema",
            "why": "A causa persiste; a paciente precisa de monitorização contínua."
          }
        ]
      },
      {
        "kind": "Comunicação da equipe",
        "points": 5,
        "noECG": true,
        "context": "Após o retorno da circulação, você pede a um colega que prepare a próxima medicação indicada. Ele repete a ordem, mas ninguém informou se ela foi administrada. A paciente continua monitorizada.",
        "prompt": "Como você fecha essa comunicação?",
        "options": [
          {
            "text": "Dirigir a ordem a uma pessoa, ouvir a confirmação do que foi entendido, confirmar a execução e registrar o horário antes de repetir a dose",
            "ok": true,
            "why": "Na comunicação em alça fechada, a tarefa é dirigida, compreendida e confirmada quando executada. As frases deste exercício são um modelo didático de comunicação e liderança, competências recomendadas pela Parte 12."
          },
          {
            "text": "Presumir que repetir a ordem significa que a medicação já foi administrada",
            "why": "Confirmar entendimento e confirmar execução são momentos diferentes. Falta a confirmação da administração."
          },
          {
            "text": "Pedir a mesma dose a outro colega sem conferir a administração anterior",
            "why": "Pode provocar duplicação. Verifique a execução e o horário com quem recebeu a tarefa."
          },
          {
            "text": "Desligar a monitorização até todos relatarem suas tarefas",
            "why": "A comunicação deve ocorrer com a paciente monitorizada e com continuidade do cuidado."
          }
        ]
      },
      {
        "kind": "Recorrência",
        "points": 20,
        "pattern": "torsades",
        "vitals": "Novos episódios curtos de arritmia; entre os episódios há pulso",
        "prompt": "Como prevenir novos episódios?",
        "options": [
          {
            "text": "Sulfato de magnésio IV, corrigir o potássio, suspender os fármacos que prolongam o QT e desfibrilar imediatamente uma TV polimórfica sustentada, mesmo com pulso, ou se voltar a perder o pulso",
            "ok": true,
            "why": "A Parte 9 admite magnésio nas recorrências de TV polimórfica com QT longo e recomenda choque não sincronizado na forma sustentada, mesmo com pulso. Corrigir eletrólitos e retirar fármacos que prolongam o QT trata a causa. A dose de magnésio não consta nessa parte e não é especificada aqui."
          },
          {
            "text": "Lidocaína ou amiodarona como primeira escolha, sem atenção ao QT",
            "why": "Essas drogas são citadas para TV polimórfica recorrente sem QT longo. Com QT longo, a diretriz cita o magnésio."
          },
          {
            "text": "Sotalol IV",
            "why": "O sotalol prolonga o QT e pioraria a torsades."
          },
          {
            "text": "Magnésio de rotina em toda TV polimórfica, inclusive com QT normal",
            "why": "Com QT normal, o magnésio de rotina não é recomendado (classe 3: sem benefício). Aqui ele é indicado porque o QT é longo."
          }
        ]
      },
      {
        "kind": "Desfecho",
        "points": 10,
        "noECG": true,
        "vitals": "Sem novo episódio após as medidas · pulso presente · equipe de cuidados intensivos disponível",
        "prompt": "Como você conclui esta etapa do atendimento?",
        "options": [
          {
            "text": "Confirmar a passagem para os cuidados pós-PCR, manter monitorização e comunicar à equipe o evento, as medidas realizadas e a causa que ainda exige acompanhamento",
            "ok": true,
            "why": "O retorno da circulação muda a fase do cuidado. A equipe recebe as informações para dar continuidade; o manejo detalhado pós-PCR será abordado em etapa própria."
          },
          {
            "text": "Encerrar a monitorização porque o traçado melhorou",
            "why": "A melhora não elimina o risco de recorrência e a necessidade de cuidados pós-PCR."
          },
          {
            "text": "Reiniciar compressões apenas pelo histórico de parada, mesmo com pulso presente",
            "why": "A situação atual, com circulação presente, exige cuidados pós-PCR."
          },
          {
            "text": "Transferir sem informar o evento e as medicações administradas",
            "why": "A continuidade exige transmitir as informações relevantes à equipe que recebe a pessoa."
          }
        ]
      }
    ],
    "atendimento": true,
    "rev": 2
  }
]);
