"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';

const schema = yup.object().shape({
  customerName: yup.string().required('Customer Name is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required'),
  newAdmission: yup.string().required('Please select if this is a new admission'),
});

type FormData = {
  customerName: string;
  amount: number;
  newAdmission: string; // 'yes' or 'no'
};

function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export default function FormPage() {
  const user = getUser();
  const router = useRouter();
  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('You must be logged in!');
      return;
    }
    await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ogaName: user.name }),
    });
    reset();
    toast.success('Sale submitted!');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md flex justify-end mb-4">
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-gray-200"
      >
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Sales Entry Form</h2>
        <div className="text-gray-700 font-medium mb-2">Logged in as: <span className="font-bold">{user.name}</span></div>
        <label className="text-gray-700 font-medium">Customer Name</label>
        <input {...register('customerName')} placeholder="Customer Name" className="input" />
        <p className="text-red-500 text-xs">{errors.customerName?.message}</p>
        <label className="text-gray-700 font-medium">Amount</label>
        <input {...register('amount')} placeholder="Amount" className="input" />
        <p className="text-red-500 text-xs">{errors.amount?.message}</p>
        <label className="text-gray-700 font-medium">New Admission?</label>
        <div className="flex gap-4">
          <label className="flex text-black items-center gap-2">
            <input type="radio" value="yes" {...register('newAdmission')} /> Yes
          </label>
          <label className="flex text-black items-center gap-2">
            <input type="radio" value="no" {...register('newAdmission')} /> No
          </label>
        </div>
        <p className="text-red-500 text-xs">{errors.newAdmission?.message}</p>
        <button
          type="submit"
          className="mt-2 py-3 rounded-lg bg-gray-800 text-white font-bold text-lg shadow hover:bg-gray-700 transition-colors"
        >
          Submit Sale
        </button>
      </form>
      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.7rem 1rem;
          border-radius: 0.7rem;
          border: 1.5px solid #d1d5db;
          font-size: 1rem;
          margin-bottom: 0.1rem;
          outline: none;
          transition: border 0.2s;
          color: #222;
          background: #f9fafb;
        }
        .input:focus {
          border: 1.5px solid #6366f1;
        }
        .input::placeholder {
          color: #888;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
