'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AssessmentSummary } from '@/lib/types';

interface DashboardChartsProps {
    summary: AssessmentSummary;
}

export function DashboardCharts({ summary }: DashboardChartsProps) {
    const data = [
        { name: 'Yes', value: summary.yesCount, color: '#10b981' }, // Emerald 500
        { name: 'No', value: summary.noCount, color: '#f43f5e' }, // Rose 500
        { name: 'N/A', value: summary.naCount, color: '#94a3b8' }, // Slate 400
        { name: 'Needs Attention', value: summary.needsAttentionCount, color: '#f59e0b' }, // Amber 500
    ].filter(item => item.value > 0);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center justify-center h-full">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Compliance Overview</h3>
            <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value, entry: any) => <span className="text-xs font-medium text-slate-600 ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
