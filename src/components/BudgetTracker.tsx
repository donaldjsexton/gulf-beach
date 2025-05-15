'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'

interface BudgetCategory {
  id: string
  name: string
  description: string | null
}

interface Expense {
  id: string
  category_id: string | null
  vendor_id: string | null
  description: string
  amount: number
  due_date: string | null
  status: 'pending' | 'paid' | 'overdue'
  payment_method: string | null
  notes: string | null
  category?: BudgetCategory
  payments: Payment[]
}

interface Payment {
  id: string
  amount: number
  payment_date: string
  payment_method: string
  reference_number: string | null
  notes: string | null
}

interface BudgetTrackerProps {
  weddingId: string
}

export default function BudgetTracker({ weddingId }: BudgetTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'expenses' | 'payments'>('expenses')

  const fetchData = useCallback(async () => {
    try {
      // Fetch expenses with their categories and payments
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          category:budget_categories(*),
          payments(*)
        `)
        .eq('wedding_id', weddingId)
        .order('due_date', { ascending: true })

      if (expensesError) throw expensesError

      // Fetch budget categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError

      setExpenses(expensesData)
      setCategories(categoriesData)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load budget data')
    } finally {
      setIsLoading(false)
    }
  }, [weddingId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddExpense = async () => {
    const description = prompt('Enter expense description:')
    if (!description) return

    const amount = prompt('Enter amount:')
    if (!amount) return

    const categoryId = prompt(
      'Select category ID:\n' +
        categories.map((c) => `${c.id}: ${c.name}`).join('\n')
    )
    if (!categoryId) return

    try {
      const { error } = await supabase.from('expenses').insert([
        {
          wedding_id: weddingId,
          description,
          amount: parseFloat(amount),
          category_id: categoryId,
          status: 'pending',
        },
      ])

      if (error) throw error

      await fetchData()
    } catch (err) {
      console.error('Error adding expense:', err)
      setError('Failed to add expense')
    }
  }

  const handleAddPayment = async (expenseId: string) => {
    const amount = prompt('Enter payment amount:')
    if (!amount) return

    const paymentMethod = prompt('Enter payment method:')
    if (!paymentMethod) return

    try {
      const { error } = await supabase.from('payments').insert([
        {
          expense_id: expenseId,
          amount: parseFloat(amount),
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: paymentMethod,
        },
      ])

      if (error) throw error

      // Update expense status if fully paid
      const expense = expenses.find((e) => e.id === expenseId)
      if (expense) {
        const totalPaid =
          expense.payments.reduce((sum, p) => sum + p.amount, 0) +
          parseFloat(amount)
        if (totalPaid >= expense.amount) {
          await supabase
            .from('expenses')
            .update({ status: 'paid' })
            .eq('id', expenseId)
        }
      }

      await fetchData()
    } catch (err) {
      console.error('Error adding payment:', err)
      setError('Failed to add payment')
    }
  }

  const handleUpdateExpenseStatus = async (
    expenseId: string,
    status: Expense['status']
  ) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status })
        .eq('id', expenseId)

      if (error) throw error

      await fetchData()
    } catch (err) {
      console.error('Error updating expense status:', err)
      setError('Failed to update expense status')
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  const totalBudget = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalPaid = expenses.reduce(
    (sum, e) => sum + e.payments.reduce((pSum, p) => pSum + p.amount, 0),
    0
  )
  const remainingBudget = totalBudget - totalPaid

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'expenses'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Payments
          </button>
        </div>
        <button
          onClick={handleAddExpense}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Expense
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon
                  className="h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Budget
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalBudget.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon
                  className="h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Paid
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalPaid.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon
                  className="h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Remaining
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${remainingBudget.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'expenses' ? (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Due Date
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {expense.description}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {expense.category?.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <select
                      value={expense.status}
                      onChange={(e) =>
                        handleUpdateExpenseStatus(
                          expense.id,
                          e.target.value as Expense['status']
                        )
                      }
                      className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {expense.due_date}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleAddPayment(expense.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <CreditCardIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Add Payment</span>
                      </button>
                      <button
                        onClick={() => {
                          // Implement edit functionality
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          // Implement delete functionality
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Expense
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Method
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Reference
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {expenses.flatMap((expense) =>
                expense.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {expense.description}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {payment.payment_date}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {payment.payment_method}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {payment.reference_number}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            // Implement edit functionality
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            // Implement delete functionality
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 