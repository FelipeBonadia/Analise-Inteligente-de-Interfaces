import { Injectable } from '@nestjs/common';
import {GoogleGenAI} from '@google/genai';

@Injectable()
export class AppService {
  private genAI: GoogleGenAI;
  
  constructor() {
    this.genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY || ''});
  }

async analyzeImage(file: Express.Multer.File): Promise<string> {
  try {
    const imageBase64 = file.buffer.toString('base64');

    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: file.mimetype,
        },
      },
    ];

    const prompt =
      'Analise cuidadosamente a imagem fornecida (print de tela de um site) e descreva-a de forma extremamente detalhada, objetiva e estruturada. Limite-se exclusivamente ao que é visível na imagem, sem suposições ou inferências externas. Inclua obrigatoriamente: (1) Estrutura geral da página: tipo de página apenas se claramente identificável pela interface, organização visual (colunas, seções, cabeçalho, rodapé, menus laterais ou superiores) e hierarquia dos elementos na tela; (2) Elementos de interface (UI): campos de formulário (tipo, rótulos, placeholders, obrigatoriedade visível), botões (texto, cor, posição, estado aparente), links visíveis, menus, dropdowns, checkboxes, radio buttons, tabelas, modais e mensagens exibidas (erros, alertas, notificações, banners); (3) Conteúdo textual: transcreva fielmente todo texto legível presente na imagem, destacando textos relacionados a autenticação, permissões, erros, instruções ou mensagens do sistema; (4) Informações técnicas visíveis: URLs visíveis, endpoints aparentes, nomes de campos, identificadores, mensagens de erro técnicas, códigos retornados e tecnologias apenas se explicitamente indicadas na interface; (5) Aspectos visuais e de usabilidade: esquema de cores predominante, tipografia, legibilidade, alinhamento, espaçamentos, consistência visual e indícios de responsividade se visíveis; (6) Elementos sensíveis ou críticos: campos de autenticação, dados pessoais ou financeiros, tokens, chaves, IDs, e-mails, nomes de usuários ou qualquer dado sensível visível, além de indicação de ambiente apenas se explicitamente indicada; (7) Comportamentos aparentes: estados visuais que indiquem ação do usuário, campos preenchidos, botões pressionados, erros após submissão e modais ou pop-ups abertos no momento do print. Formato da resposta: utilize seções numeradas conforme os tópicos acima, seja técnico, detalhado e neutro, não faça análises de segurança, julgamentos ou recomendações e não presuma funcionalidades que não estejam visíveis. Objetivo: gerar uma descrição completa e fiel da interface para permitir análises técnicas e de segurança em etapas posteriores.';

    const response = await this.genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, ...imageParts],
    })

    return response.text || '';
  } catch (error) {
    throw new Error('Gemini API error');
  }
}

async createTestsDescriptions(imageDescription: string): Promise<string> {
  try {
    const prompt = 
      "Você atuará estritamente como um analista de segurança ofensiva (pentester), realizando uma análise estática da interface descrita. Baseie-se EXCLUSIVAMENTE na descrição detalhada da tela fornecida. Não assuma backend, infraestrutura, tecnologias, endpoints ocultos ou regras de negócio que não sejam razoavelmente inferíveis a partir da interface.\n\n" +

      "REGRAS OBRIGATÓRIAS:\n" +
      "1. Não invente endpoints, APIs ou validações internas.\n" +
      "2. Não extrapole para camadas não visíveis.\n" +
      "3. Fundamente todas as conclusões em elementos, fluxos, campos, mensagens ou comportamentos observáveis na interface.\n\n" +

      "ANÁLISE DE VULNERABILIDADES:\n" +
      "Identifique possíveis vulnerabilidades exploráveis por um atacante. Dê foco especial em: falhas de autenticação, autorização, validação de entrada, controle de acesso no frontend, exposição excessiva de informações, mensagens de erro, gerenciamento de sessão, manipulação de parâmetros, uploads, CSRF, XSS, IDOR, rate limiting e configurações inseguras.\n\n" +
      
      "Para CADA vulnerabilidade, utilize EXATAMENTE o seguinte formato:\n" +
      "<Nome técnico curto>\n" +
      "1. Localização da falha: onde a vulnerabilidade ocorre (campo, botão, formulário, fluxo, mensagem, parâmetro visível ou comportamento da interface),\n" +
      "2. Vetor de ataque e exploração prática: tipo de ataque (ex: XSS, CSRF, IDOR, brute force, bypass de autorização, manipulação de parâmetros etc.), pré-condições necessárias, como o atacante interage com a interface ou manipula requisições, e por que a interface permite essa exploração.\n" +
      "3. Impactos potenciais: liste impactos objetivos como acesso não autorizado, vazamento de dados, execução de ações indevidas, escalonamento de privilégios ou comprometimento de contas ou sessões.\n" +
      "4. Mitigação e correção: boas práticas de segurança, validações e controles necessários, e recomendações técnicas alinhadas a padrões reconhecidos (ex: OWASP), sem exigir conhecimento externo à interface.\n\n" +

      "GERAÇÃO DE TESTES DE SEGURANÇA:\n" +
      "Com base APENAS nas vulnerabilidades identificadas na Etapa 1, gere testes de segurança. Para CADA vulnerabilidade, gere ao menos 2 testes, seguindo EXATAMENTE o formato:\n" +
      "<Nome do teste>\n" +
      "• Objetivo do teste: o que o teste busca comprovar ou explorar.\n" +
      "• Pré-condições: estado necessário da aplicação ou do usuário antes do teste.\n" +
      "• Passos de execução: lista numerada e clara de ações que o testador ou atacante deve realizar.\n" +
      "• Dados de entrada maliciosos (se aplicável): exemplos de payloads, valores inválidos ou manipulações possíveis.\n" +
      "• Resultado esperado (com falha): comportamento esperado caso a vulnerabilidade exista.\n" +
      "• Resultado esperado (após correção): comportamento correto esperado após mitigação.\n\n" +

      "INSTRUÇÕES DE FORMATAÇÃO (MARKDOWN):\n" +
      "- Separação: Use duas quebras de linha entre a Etapa 1 e a Etapa 2. Use uma quebra de linha entre cada vulnerabilidade e entre cada teste.\n" +
      "- Hierarquia visual: Para o título de cada Etapa, use Markdown H2 (## **Título**). Para o título de cada Vulnerabilidade ou Teste, use Markdown H3 (### **Título**). Para os itens internos (Localização, Objetivo, etc), use apenas Negrito (**).\n" +
      "- Conteúdo: Não adicione introduções, conclusões, saudações ou qualquer texto explicativo fora das etapas solicitadas.\n" +
      "- Estilo: A resposta deve ser técnica, objetiva, bem estruturada e reutilizável em relatórios, automação de testes ou auditorias de segurança.\n" +
      "- Alinhamento: Justifique todo o texto à esquerda.\n\n" +

      "DESCRIÇÃO DA INTERFACE:\n" + imageDescription;

    const response = await this.genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt],
    })


    return response.text || '';
  } catch (error) {
    throw new Error('Gemini API error');
  }
}
}
