# Erro ao apagar paciente no Supabase (FK em `medications`)

Se você tentar apagar uma linha de `patients` e existir algum registro em `medications` com `patient_id` apontando para esse paciente, o Postgres bloqueia a remoção.

Mensagem típica:

> `Unable to delete rows ... still referenced from table medications`

## O que significa

É uma proteção de integridade referencial (foreign key). Sem regra de `ON DELETE`, o padrão é impedir exclusão do registro pai enquanto houver filhos.

## Como corrigir

### Opção A (recomendada neste app): `ON DELETE CASCADE`

Quando apagar um paciente, apaga automaticamente os registros relacionados em `medications`.

Execute o SQL do arquivo:

- `sql/fix_medications_patient_fk.sql`

### Opção B: `ON DELETE SET NULL`

Mantém os registros de medicação, mas limpa o `patient_id` ao apagar paciente.

```sql
BEGIN;

ALTER TABLE public.medications
  DROP CONSTRAINT IF EXISTS medications_patient_id_fkey;

ALTER TABLE public.medications
  ADD CONSTRAINT medications_patient_id_fkey
  FOREIGN KEY (patient_id)
  REFERENCES public.patients(id)
  ON DELETE SET NULL;

COMMIT;
```

## Observação importante

No frontend deste projeto, a exclusão de paciente já é **soft-delete** (`status = 'deleted'`), justamente para evitar esse tipo de conflito e preservar histórico. O erro aparece quando tenta DELETE físico direto na base.
