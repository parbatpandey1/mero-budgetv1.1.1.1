"use client";
import { Record } from "@/types/Record";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#EF4444"];

const Charts = ({ records }: { records: Record[] }) => {
  // Pie Data (category expenses)
  const pieData = Object.values(
    records
      .filter((r) => r.type === "expense")
      .reduce((acc: any, r) => {
        acc[r.category] = acc[r.category] || { name: r.category, value: 0 };
        acc[r.category].value += r.amount;
        return acc;
      }, {})
  );

  // Monthly trend (by month)
  const monthlyData = Object.values(
    records.reduce((acc: any, r) => {
      const month = new Date(r.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      acc[month] = acc[month] || { month, income: 0, expense: 0 };
      acc[month][r.type] += r.amount;
      return acc;
    }, {})
  );

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
        <h3 className="text-lg font-bold mb-2">Expenses by Category</h3>
        <PieChart width={300} height={300}>
          <Pie
            data={pieData}
            cx={150}
            cy={150}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
        <h3 className="text-lg font-bold mb-2">Monthly Trend</h3>
        <LineChart width={400} height={300} data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#22c55e" />
          <Line type="monotone" dataKey="expense" stroke="#ef4444" />
        </LineChart>
      </div>
    </div>
  );
};

export default Charts;
import React from 'react';