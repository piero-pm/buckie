import { useCallback, useEffect, useState } from 'react'
import {
  expenses as expenseApi,
  incomeEvents as incomeEventApi,
  incomes as incomeApi,
  recurring as recurringApi,
  expectationsApi,
} from '../api/records'
import type { Expectations } from '../domain/expectations'
import type { Expense, Recurring } from '../domain/expense'
import type { IncomeEvent } from '../domain/incomeEvent'
import type { IncomeSource } from '../domain/income'

/** Loads the decrypted workspace once per user and owns the local CRUD state
 * (extracted from HomePage for clean-artifacts sizes, TICKET-020). Every
 * mutation hits the encrypted API first, then updates local state so all
 * views see the change immediately. */
export function useWorkspace(userId: number) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [recurring, setRecurring] = useState<Recurring[]>([])
  const [incomes, setIncomes] = useState<IncomeSource[]>([])
  const [incomeEvents, setIncomeEvents] = useState<IncomeEvent[]>([])
  const [expectations, setExpectations] = useState<Expectations | null>(null)
  const [loadError, setLoadError] = useState('')

  /** Loads (or reloads, e.g. after a backup import) all registers. */
  const reload = useCallback(async () => {
    setLoadError('')
    try {
      const [e, r, i, v, x] = await Promise.all([
        expenseApi.list(userId),
        recurringApi.list(userId),
        incomeApi.list(userId),
        incomeEventApi.list(userId),
        expectationsApi.list(userId),
      ])
      setExpenses(e)
      setRecurring(r)
      setIncomes(i)
      setIncomeEvents(v)
      setExpectations(x[0] ?? null)
    } catch {
      setLoadError('Could not load your data. Try unlocking again.')
    }
  }, [userId])

  useEffect(() => {
    void reload()
  }, [reload])

  const saveExpense = useCallback(
    async (e: Expense) => {
      await expenseApi.save(userId, e)
      setExpenses((prev) => [e, ...prev])
    },
    [userId]
  )
  const updateExpense = useCallback(
    async (e: Expense) => {
      await expenseApi.save(userId, e)
      setExpenses((prev) => prev.map((x) => (x.id === e.id ? e : x)))
    },
    [userId]
  )
  const removeExpense = useCallback(async (id: string) => {
    await expenseApi.remove(id)
    setExpenses((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const saveRecurring = useCallback(
    async (r: Recurring) => {
      await recurringApi.save(userId, r)
      setRecurring((prev) => upsert(prev, r))
    },
    [userId]
  )
  const removeRecurring = useCallback(async (id: string) => {
    await recurringApi.remove(id)
    setRecurring((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const saveIncome = useCallback(
    async (s: IncomeSource) => {
      await incomeApi.save(userId, s)
      setIncomes((prev) => upsert(prev, s))
    },
    [userId]
  )
  const removeIncome = useCallback(async (id: string) => {
    await incomeApi.remove(id)
    setIncomes((prev) => prev.filter((x) => x.id !== id))
  }, [])
  const saveIncomeEvent = useCallback(
    async (v: IncomeEvent) => {
      await incomeEventApi.save(userId, v)
      setIncomeEvents((prev) => upsert(prev, v))
    },
    [userId]
  )
  const removeIncomeEvent = useCallback(async (id: string) => {
    await incomeEventApi.remove(id)
    setIncomeEvents((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const saveExpectations = useCallback(
    async (x: Expectations) => {
      await expectationsApi.save(userId, x)
      setExpectations(x)
    },
    [userId]
  )

  return {
    expenses,
    recurring,
    incomes,
    incomeEvents,
    expectations,
    loadError,
    reload,
    saveExpectations,
    saveExpense,
    updateExpense,
    removeExpense,
    saveRecurring,
    removeRecurring,
    saveIncome,
    removeIncome,
    saveIncomeEvent,
    removeIncomeEvent,
  }
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const i = list.findIndex((x) => x.id === item.id)
  return i >= 0
    ? list.map((x) => (x.id === item.id ? item : x))
    : [item, ...list]
}
