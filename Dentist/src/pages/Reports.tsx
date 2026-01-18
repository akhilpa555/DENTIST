import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    { label: 'Revenue', data: [12000, 15000, 14000, 18000, 22000, 20000], borderColor: '#3b82f6' },
  ],
}

export default function Reports() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Reports</h1>
      <div className="bg-white p-4 rounded shadow">
        <div className="mb-6">
          <h3 className="font-medium mb-2">Revenue per month</h3>
          <Line data={data as any} />
        </div>
      </div>
    </div>
  )
}
