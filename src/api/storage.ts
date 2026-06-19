import { supabase } from '../lib/supabase'
import type { Transaction, RecurringTemplate, RecurringInstance } from '../types'

// ── Transactions ──────────────────────────────────────────────

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToTransaction)
}

export async function addTransaction(
  tx: Omit<Transaction, 'id' | 'createdAt'>,
  householdId: string,
): Promise<void> {
  const { error } = await supabase.from('transactions').insert({
    household_id: householdId,
    user_id: tx.userId,
    type: tx.type,
    amount: tx.amount,
    category: tx.category,
    description: tx.description || null,
    date: tx.date,
    ai_analyzed: tx.aiAnalyzed,
  })
  if (error) throw error
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}

export async function updateTransaction(
  id: string,
  tx: Pick<Transaction, 'type' | 'amount' | 'category' | 'description' | 'date'>,
): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description || null,
      date: tx.date,
    })
    .eq('id', id)
  if (error) throw error
}

// ── Recurring templates ───────────────────────────────────────

export async function getRecurringTemplates(): Promise<RecurringTemplate[]> {
  const { data, error } = await supabase
    .from('recurring_templates')
    .select('*')
    .order('due_day', { ascending: true })
  if (error) throw error
  return (data ?? []).map(rowToTemplate)
}

export async function addRecurringTemplate(
  t: Omit<RecurringTemplate, 'id'>,
  householdId: string,
): Promise<void> {
  const { error } = await supabase.from('recurring_templates').insert({
    household_id: householdId,
    user_id: t.userId,
    name: t.name,
    amount: t.amount,
    category: t.category,
    due_day: t.dueDay,
    is_active: t.isActive,
  })
  if (error) throw error
}

export async function deleteRecurringTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('recurring_templates').delete().eq('id', id)
  if (error) throw error
}

// ── Recurring instances ───────────────────────────────────────

export async function getRecurringInstances(): Promise<RecurringInstance[]> {
  const { data, error } = await supabase.from('recurring_instances').select('*')
  if (error) throw error
  return (data ?? []).map(rowToInstance)
}

export async function markRecurringPaid(
  templateId: string,
  year: number,
  month: number,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from('recurring_instances').upsert(
    {
      template_id: templateId,
      year,
      month,
      paid_at: new Date().toISOString(),
      paid_by_user_id: userId,
    },
    { onConflict: 'template_id,year,month' },
  )
  if (error) throw error
}

export async function unmarkRecurringPaid(
  templateId: string,
  year: number,
  month: number,
): Promise<void> {
  const { error } = await supabase
    .from('recurring_instances')
    .delete()
    .eq('template_id', templateId)
    .eq('year', year)
    .eq('month', month)
  if (error) throw error
}

// ── Profiles ──────────────────────────────────────────────────

export async function getHouseholdProfiles(householdId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, color')
    .eq('household_id', householdId)
  if (error) throw error
  return (data ?? []) as { id: string; name: string; color: string }[]
}

export async function updateProfile(userId: string, name: string, color: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ name, color })
    .eq('id', userId)
  if (error) throw error
}

export async function getHouseholdInviteCode(householdId: string): Promise<string | null> {
  const { data } = await supabase
    .from('households')
    .select('invite_code')
    .eq('id', householdId)
    .single()
  return (data as { invite_code: string } | null)?.invite_code ?? null
}

// ── Row mappers ───────────────────────────────────────────────

function rowToTransaction(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    type: r.type as Transaction['type'],
    amount: Number(r.amount),
    category: r.category as Transaction['category'],
    description: (r.description as string) ?? '',
    date: r.date as string,
    aiAnalyzed: Boolean(r.ai_analyzed),
    createdAt: r.created_at as string,
  }
}

function rowToTemplate(r: Record<string, unknown>): RecurringTemplate {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    name: r.name as string,
    amount: Number(r.amount),
    category: r.category as RecurringTemplate['category'],
    dueDay: Number(r.due_day),
    isActive: Boolean(r.is_active),
  }
}

function rowToInstance(r: Record<string, unknown>): RecurringInstance {
  return {
    id: r.id as string,
    templateId: r.template_id as string,
    year: Number(r.year),
    month: Number(r.month),
    paidAt: (r.paid_at as string) ?? undefined,
    paidByUserId: (r.paid_by_user_id as string) ?? undefined,
  }
}
