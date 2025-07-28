# Resolvedor de Conflitos

⚠️ **Traduzido com IA**

Este projeto fornece scripts utilitários para automatizar a resolução de conflitos de merge durante operações de rebase do Git. Ele usa uma abordagem simplificada de três repositórios para lidar com conflitos de forma eficiente. Construído com Deno e TypeScript para runtime JavaScript moderno e segurança de tipos.

## Visão Geral

O Resolvedor de Conflitos usa uma abordagem de três repositórios para lidar com conflitos de merge de forma eficiente:

1. **Projeto Original** - O repositório principal onde você iniciou o rebase
2. **Repositório Rebase From** - Uma cópia do repositório com checkout na branch de origem
3. **Repositório Rebase Into** - Uma cópia do repositório com checkout na branch de destino

## Scripts

### 1. `prepare-conflicts.ts`
Copia arquivos com conflito do repositório "rebase-from" para o repositório "rebase-into", sobrescrevendo as versões conflitantes com as versões da branch de origem. Por padrão, arquivos existentes são protegidos contra sobrescrita. Use a flag `--overwrite` para forçar a sobrescrita de arquivos existentes.

### 2. `apply-resolutions.ts`
Copia arquivos resolvidos diretamente do repositório "rebase-into" para o projeto original, sobrescrevendo os arquivos conflitantes.

## Configuração

Todos os caminhos dos repositórios são configurados em um único arquivo `config.json`:

```json
{
  "originalProject": "/caminho/para/seu/projeto-original",
  "rebaseFrom": "/caminho/para/seu/repositorio-rebase-from",
  "rebaseInto": "/caminho/para/seu/repositorio-rebase-into"
}
```

## Fluxo de Trabalho

### Configuração
1. **Projeto Original**: Seu repositório principal onde você está realizando o rebase
2. **Repositório Rebase From**: Clone/cópia do seu repositório, com checkout na branch de origem
3. **Repositório Rebase Into**: Clone/cópia do seu repositório, com checkout na branch de destino
4. **Atualizar config.json**: Configure os caminhos corretos para seus repositórios

### Processo de Resolução de Conflitos

1. **Conflito Ocorre**: Durante uma operação de rebase, o Git encontra conflitos de merge
2. **Preparar Conflitos**: Execute `deno task prepare` para copiar arquivos conflitantes da branch de origem para o repositório da branch de destino (arquivos existentes são protegidos por padrão)
3. **Resolver Conflitos**: Resolva manualmente os conflitos no repositório "rebase-into"
4. **Aplicar Resoluções**: Execute `deno task apply` para copiar os arquivos resolvidos diretamente para o projeto original

## Exemplo de Uso

1. **Inicie um rebase** em seu projeto original:
   ```bash
   git rebase feature-branch
   ```

2. **Quando conflitos ocorrerem**, prepare os conflitos:
   ```bash
   # Modo seguro (padrão) - protege arquivos existentes
   deno task prepare
   
   # Modo sobrescrita - força a sobrescrita de arquivos existentes
   deno task prepare:overwrite
   ```

3. **Resolva conflitos** no repositório "rebase-into" usando seu editor preferido

4. **Aplique resoluções** ao projeto original:
   ```bash
   deno task apply
   ```

5. **Continue o rebase**:
   ```bash
   git add .
   git rebase --continue
   ```

## Benefícios

- **Configuração Centralizada**: Todos os caminhos em um arquivo de configuração
- **Resolução de Conflitos Isolada**: Trabalhe em conflitos em um repositório separado sem afetar seu projeto principal
- **Gerenciamento Automatizado de Arquivos**: Scripts lidam com cópia de arquivos e manutenção da estrutura de diretórios
- **Operações Seguras**: O projeto original permanece intocado até você estar pronto para aplicar as resoluções
- **Proteção de Arquivos**: Por padrão, arquivos existentes são protegidos contra sobrescrita acidental
- **Sobrescrita Flexível**: Use a flag `--overwrite` quando precisar forçar a sobrescrita de arquivos existentes

## Requisitos

- Deno (versão mais recente recomendada)
- Repositórios Git com permissões de acesso adequadas
- Caminhos dos repositórios configurados em `config.json`

## Observações

- Certifique-se de atualizar os caminhos dos repositórios em `config.json` antes do uso
- Os scripts criarão diretórios necessários automaticamente
- Todos os scripts fornecem saída no console para acompanhar suas operações
- O fluxo de trabalho agora é simplificado de 5 etapas para 3 etapas
- Construído com TypeScript para melhor segurança de tipos e experiência do desenvolvedor
- Usa APIs modernas do Deno para operações do sistema de arquivos e execução de processos

## Licença

MIT 